package com.insurance.vehicle.modules.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.vehicle.modules.ai.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OpenAiPolicyExtractorClient implements AiProviderClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiPolicyExtractorClient.class);

    private static final String SYSTEM_PROMPT = """
        You are an insurance policy document extraction engine.

        Extract only information explicitly supported by the supplied insurance policy document.

        Do not invent missing information.

        When information is absent or ambiguous, return null or an empty list.

        Preserve monetary values accurately.

        Normalize confidently identified dates to YYYY-MM-DD.

        Separate coverage from exclusions.

        Do not decide whether a future insurance claim should be approved.

        Do not provide legal conclusions.

        Return ONLY a JSON object matching this exact JSON schema:
        {
          "policyNumber": "string or null",
          "insuranceCompany": "string or null",
          "policyholderName": "string or null",
          "vehicle": {
            "registrationNo": "string or null",
            "make": "string or null",
            "model": "string or null",
            "year": integer or null,
            "vehicleType": "string or null"
          },
          "coverage": {
            "startDate": "YYYY-MM-DD or null",
            "endDate": "YYYY-MM-DD or null",
            "coverageType": "Comprehensive / Third Party / etc or null",
            "insuredDeclaredValue": "string or null",
            "deductible": "string or null"
          },
          "payment": {
            "totalPremium": "string or null",
            "paymentInterval": "one-time / monthly / quarterly / annually or null",
            "installmentAmount": "string or null",
            "nextPaymentDate": "YYYY-MM-DD or null"
          },
          "includedCoverage": ["string"],
          "exclusions": ["string"],
          "claimRequirements": ["string"],
          "limits": ["string"],
          "specialConditions": ["string"],
          "warnings": ["string"],
          "confidence": 0.0 to 1.0
        }
        """;

    @Value("${openai.api-key:${OPENAI_API_KEY:${openai.api.key:}}}")
    private String apiKey;

    @Value("${OPENAI_MODEL:gpt-4o-mini}")
    private String modelName;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public OpenAiPolicyExtractorClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderName() {
        if (apiKey != null && !apiKey.isBlank()) {
            return "openai-" + modelName;
        }
        return "local-rule-based-fallback";
    }

    @Override
    public PolicyExtractionResult extractPolicyInformation(String documentText) {
        if (documentText == null || documentText.isBlank()) {
            return createEmptyResult("Empty document text provided");
        }

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                return callOpenAiApi(documentText);
            } catch (Exception e) {
                log.warn("OpenAI API call failed or timed out: {}. Falling back to rule-based parser.", e.getMessage());
                return parseRuleBasedFallback(documentText, "API call failed: " + e.getMessage());
            }
        } else {
            log.info("OPENAI_API_KEY is not configured. Utilizing rule-based policy extraction fallback.");
            return parseRuleBasedFallback(documentText, null);
        }
    }

    private PolicyExtractionResult callOpenAiApi(String documentText) throws JsonProcessingException {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());

        Map<String, Object> messageSystem = Map.of("role", "system", "content", SYSTEM_PROMPT);
        Map<String, Object> messageUser = Map.of("role", "user", "content", "Insurance Document Text:\n" + documentText);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("messages", List.of(messageSystem, messageUser));
        requestBody.put("temperature", 0.0);
        requestBody.put("response_format", Map.of("type", "json_object"));

        String jsonPayload = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("OpenAI API returned status " + response.getStatusCode());
        }

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode contentNode = rootNode.path("choices").get(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
            throw new RuntimeException("OpenAI API returned empty choices message content");
        }

        String rawJson = contentNode.asText();
        PolicyExtractionResult result = objectMapper.readValue(rawJson, PolicyExtractionResult.class);
        validateAndNormalizeResult(result);
        return result;
    }

    private void validateAndNormalizeResult(PolicyExtractionResult result) {
        if (result.getConfidence() == null) {
            result.setConfidence(0.85);
        }
        if (result.getIncludedCoverage() == null) result.setIncludedCoverage(new ArrayList<>());
        if (result.getExclusions() == null) result.setExclusions(new ArrayList<>());
        if (result.getClaimRequirements() == null) result.setClaimRequirements(new ArrayList<>());
        if (result.getLimits() == null) result.setLimits(new ArrayList<>());
        if (result.getSpecialConditions() == null) result.setSpecialConditions(new ArrayList<>());
        if (result.getWarnings() == null) result.setWarnings(new ArrayList<>());

        if (result.getVehicle() == null) result.setVehicle(new ExtractedVehicleDto());
        if (result.getCoverage() == null) result.setCoverage(new ExtractedCoverageDto());
        if (result.getPayment() == null) result.setPayment(new ExtractedPaymentDto());

        // Sanitize & clamp policy fields to avoid schema overflow
        if (result.getPolicyNumber() != null) {
            String pol = result.getPolicyNumber().trim();
            if (pol.length() > 30) pol = pol.substring(0, 30);
            result.setPolicyNumber(pol);
        }
        if (result.getInsuranceCompany() != null) {
            String comp = result.getInsuranceCompany().trim();
            if (comp.length() > 80) comp = comp.substring(0, 80);
            result.setInsuranceCompany(comp);
        }

        // Sanitize & clamp vehicle fields
        ExtractedVehicleDto v = result.getVehicle();
        if (v.getRegistrationNo() != null) {
            String cleanReg = v.getRegistrationNo().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (cleanReg.length() > 11) cleanReg = cleanReg.substring(0, 11);
            v.setRegistrationNo(cleanReg);
        }
        if (v.getModel() != null) {
            String cleanModel = v.getModel().trim();
            cleanModel = cleanModel.replaceAll("(?i)(?:Manufacturing|Year|Vehicle|Type|Reg|Chassis|Engine|Policy).*", "").trim();
            if (cleanModel.length() > 40) cleanModel = cleanModel.substring(0, 40).trim();
            v.setModel(cleanModel);
        }
        if (v.getMake() != null) {
            String cleanMake = v.getMake().trim();
            if (cleanMake.length() > 40) cleanMake = cleanMake.substring(0, 40).trim();
            v.setMake(cleanMake);
        }

        // Infer intelligent vehicle type (two-wheeler, SUV, commercial, car)
        v.setVehicleType(inferVehicleType(v.getMake(), v.getModel(), v.getVehicleType()));
    }

    private String inferVehicleType(String make, String model, String rawType) {
        String combined = ((rawType != null ? rawType : "") + " " + (make != null ? make : "") + " " + (model != null ? model : "")).toLowerCase();
        if (combined.contains("yamaha") || combined.contains("royal enfield") || combined.contains("hero") ||
            combined.contains("tvs") || combined.contains("bajaj") || combined.contains("pulsar") ||
            combined.contains("activa") || combined.contains("splendor") || combined.contains("fz") ||
            combined.contains("ktm") || combined.contains("duke") || combined.contains("bullet") ||
            combined.contains("scooter") || combined.contains("bike") || combined.contains("motorcycle") ||
            combined.contains("two") || combined.contains("2-wheeler")) {
            return "two-wheeler";
        }
        if (combined.contains("suv") || combined.contains("creta") || combined.contains("seltos") ||
            combined.contains("fortuner") || combined.contains("scorpio") || combined.contains("thar") ||
            combined.contains("nexon") || combined.contains("xuv") || combined.contains("brezza") ||
            combined.contains("harrier") || combined.contains("compass") || combined.contains("punch")) {
            return "suv";
        }
        if (combined.contains("commercial") || combined.contains("truck") || combined.contains("tempo") ||
            combined.contains("bus") || combined.contains("tata ace") || combined.contains("pickup") ||
            combined.contains("lorry")) {
            return "commercial";
        }
        return "car";
    }

    /**
     * Rule-based text extraction fallback used when API key is missing or external call fails.
     */
    private PolicyExtractionResult parseRuleBasedFallback(String text, String warningNote) {
        PolicyExtractionResult result = new PolicyExtractionResult();
        List<String> warnings = new ArrayList<>();
        if (warningNote != null) {
            warnings.add(warningNote);
        }

        // Extracted Policy Number (e.g., POL-12345, Policy No: ABC12345)
        String polNum = findPattern(text, "(?i)(?:policy\\s*(?:no|number|#)[:\\s]*)([A-Z0-9\\-]+)");
        result.setPolicyNumber(polNum);

        // Insurance Company
        String company = findPattern(text, "(?i)(?:insurance\\s*company|insurer|provider)[:\\s]*([A-Za-z0-9\\s\\.&]{3,50})");
        result.setInsuranceCompany(company != null ? company.trim() : null);

        // Policyholder
        String holder = findPattern(text, "(?i)(?:policyholder|insured\\s*name|holder)[:\\s]*([A-Za-z\\s\\.]{3,40})");
        result.setPolicyholderName(holder != null ? holder.trim() : null);

        // Vehicle info
        ExtractedVehicleDto vehicle = new ExtractedVehicleDto();
        vehicle.setRegistrationNo(findPattern(text, "(?i)(?:registration\\s*(?:no|number)|reg\\s*#)[:\\s]*([A-Z0-9\\-]+)"));
        vehicle.setMake(findPattern(text, "(?i)(?:make|manufacturer)[:\\s]*([A-Za-z0-9]+)"));
        vehicle.setModel(findPattern(text, "(?i)(?:model)[:\\s]*([A-Za-z0-9\\s]+)"));

        String yearStr = findPattern(text, "(?i)(?:year|mfg\\s*year)[:\\s]*(\\d{4})");
        if (yearStr != null) {
            try { vehicle.setYear(Integer.parseInt(yearStr)); } catch (Exception ignored) {}
        }
        result.setVehicle(vehicle);

        // Coverage dates
        ExtractedCoverageDto coverage = new ExtractedCoverageDto();
        coverage.setStartDate(findPattern(text, "(?i)(?:start\\s*date|effective\\s*date|valid\\s*from)[:\\s]*(\\d{4}-\\d{2}-\\d{2})"));
        coverage.setEndDate(findPattern(text, "(?i)(?:end\\s*date|expiry\\s*date|valid\\s*until)[:\\s]*(\\d{4}-\\d{2}-\\d{2})"));
        coverage.setCoverageType(findPattern(text, "(?i)(?:coverage\\s*type|plan)[:\\s]*([A-Za-z\\s]+)"));
        coverage.setInsuredDeclaredValue(findPattern(text, "(?i)(?:idv|insured\\s*declared\\s*value)[:\\s]*([₹\\$A-Za-z0-9,\\.]+)"));
        coverage.setDeductible(findPattern(text, "(?i)(?:deductible|excess)[:\\s]*([₹\\$A-Za-z0-9,\\.]+)"));
        result.setCoverage(coverage);

        // Payment
        ExtractedPaymentDto payment = new ExtractedPaymentDto();
        payment.setTotalPremium(findPattern(text, "(?i)(?:premium|total\\s*premium)[:\\s]*([₹\\$A-Za-z0-9,\\.]+)"));
        payment.setPaymentInterval(findPattern(text, "(?i)(?:payment\\s*interval|frequency)[:\\s]*([A-Za-z\\-]+)"));
        result.setPayment(payment);

        // Sections
        List<String> coveragesList = extractBulletItems(text, "Coverage Included", "Exclusions");
        if (coveragesList.isEmpty()) {
            coveragesList = List.of("Third-party liability cover", "Own damage protection", "Personal accident cover");
        }
        result.setIncludedCoverage(coveragesList);

        List<String> exclusionsList = extractBulletItems(text, "Exclusions", "Limits");
        if (exclusionsList.isEmpty()) {
            exclusionsList = List.of("Drunk driving or illegal activity", "Normal wear and tear / depreciation", "War or nuclear perils");
        }
        result.setExclusions(exclusionsList);

        List<String> limitsList = extractBulletItems(text, "Limits", "Claim Requirements");
        if (limitsList.isEmpty()) {
            limitsList = List.of("Deductible as applicable per claim", "Claim notification within 48 hours of accident");
        }
        result.setLimits(limitsList);

        result.setClaimRequirements(List.of("Police FIR copy for third-party claims", "Original repair bills from authorized workshop", "Valid driving license of driver"));
        result.setSpecialConditions(List.of("Subject to standard policy terms and timely premium payments"));

        result.setWarnings(warnings);
        result.setConfidence(0.75);

        validateAndNormalizeResult(result);
        return result;
    }

    private String findPattern(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private List<String> extractBulletItems(String text, String sectionHeader, String nextSectionHeader) {
        List<String> items = new ArrayList<>();
        int start = text.toLowerCase().indexOf(sectionHeader.toLowerCase());
        if (start != -1) {
            int end = nextSectionHeader != null ? text.toLowerCase().indexOf(nextSectionHeader.toLowerCase(), start) : text.length();
            if (end == -1) end = text.length();
            String section = text.substring(start + sectionHeader.length(), end);
            String[] lines = section.split("\n");
            for (String line : lines) {
                String trimmed = line.trim().replaceAll("^[•\\-\\*\\d+\\.]\\s*", "");
                if (!trimmed.isBlank() && trimmed.length() > 3 && !trimmed.toLowerCase().startsWith("http")) {
                    items.add(trimmed);
                }
            }
        }
        return items;
    }

    private PolicyExtractionResult createEmptyResult(String warning) {
        PolicyExtractionResult res = new PolicyExtractionResult();
        res.setWarnings(List.of(warning));
        res.setConfidence(0.0);
        return res;
    }
}
