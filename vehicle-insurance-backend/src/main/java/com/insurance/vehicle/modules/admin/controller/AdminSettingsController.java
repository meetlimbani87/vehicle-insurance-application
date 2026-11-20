package com.insurance.vehicle.modules.admin.controller;

import com.insurance.vehicle.modules.ai.service.AiKeyConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/settings/ai-key")
public class AdminSettingsController {

    private final AiKeyConfigService aiKeyConfigService;

    public AdminSettingsController(AiKeyConfigService aiKeyConfigService) {
        this.aiKeyConfigService = aiKeyConfigService;
    }

    /**
     * GET /api/admin/settings/ai-key
     * Returns ONLY masked info - NEVER the raw secret key.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAiKeyStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("configured", aiKeyConfigService.isConfigured());
        response.put("maskedKey", aiKeyConfigService.getMaskedKey());
        response.put("provider", aiKeyConfigService.getProvider());
        response.put("model", aiKeyConfigService.getModel());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/settings/ai-key
     * Accepts a new API key, saves it securely in memory/service, and returns masked info.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> updateAiKey(@RequestBody Map<String, String> body) {
        String apiKey = body.get("apiKey");
        String provider = body.getOrDefault("provider", "OpenAI");
        String model = body.getOrDefault("model", "gpt-4o");

        if (apiKey != null && !apiKey.isBlank()) {
            aiKeyConfigService.setApiKey(apiKey, provider, model);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "AI API Key configured securely.");
        response.put("configured", aiKeyConfigService.isConfigured());
        response.put("maskedKey", aiKeyConfigService.getMaskedKey());
        response.put("provider", aiKeyConfigService.getProvider());
        response.put("model", aiKeyConfigService.getModel());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/settings/ai-key
     * Clears key and reverts to free built-in engine.
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearAiKey() {
        aiKeyConfigService.clearApiKey();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "AI API Key removed. System reverted to free built-in smart AI engine.");
        response.put("configured", aiKeyConfigService.isConfigured());
        response.put("maskedKey", null);
        response.put("provider", aiKeyConfigService.getProvider());
        response.put("model", aiKeyConfigService.getModel());
        return ResponseEntity.ok(response);
    }
}
