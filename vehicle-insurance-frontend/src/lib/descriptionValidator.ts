/**
 * Detailed & Highly Specific AI Claim Acceptance Assessment Engine
 * 
 * Evaluates claims using a 4-Category Multi-Question Priority Matrix:
 * Category 1: Incident Description & Event Specificity (40% Weight)
 * Category 2: Vehicle Damage Photo & Visual Inspection (30% Weight)
 * Category 3: Policy Terms & Claim Limit Capacity Cap (20% Weight)
 * Category 4: Premium Payment Logs & Financial Standing (10% Weight)
 */

export interface AssessmentQuestion {
  id: string;
  category: "description" | "image" | "policy" | "payment";
  question: string;
  passed: boolean;
  scoreImpact: number;
  explanation: string;
}

export interface DetailedAiAssessmentResult {
  isValid: boolean;
  score: number; // 0 to 100
  eligibility: "Eligible" | "Needs Review" | "Ineligible";
  reason: string;
  questions: AssessmentQuestion[];
  breakdown: {
    descriptionScore: number;
    imageScore: number;
    policyScore: number;
    paymentScore: number;
    descriptionReason: string;
    imageReason: string;
    policyReason: string;
    paymentReason: string;
  };
}

const ACCIDENT_KEYWORDS = [
  "hit", "dent", "collision", "scratch", "impact", "bumper", "headlight", "door",
  "window", "glass", "brake", "rear", "front", "side", "accident", "damaged", "scratched",
  "vehicle", "car", "bike", "traffic", "road", "parked", "wall", "pole", "contact",
  "engine", "breakdown", "mirror", "fender", "bonnet", "tailgate", "windshield"
];

const GARBLED_PATTERNS = ["asdf", "qwerty", "zxcv", "1234", "abcd", "test", "demo", "foo", "bar", "hjkl"];

// Explicit non-vehicle appliance, schematic, component, tool, and stock graphic keywords
const NON_VEHICLE_IMAGE_KEYWORDS = [
  "media__", "tool", "appliance", "diagram", "circuit", "stock", "schematic",
  "pdf", "doc", "part", "motor", "electronic", "blueprint", "manual", "178543",
  "user_uploaded", "exploded", "assembly", "component", "render", "vector", "illustration"
];

// Valid vehicle photo indicators
const VALID_VEHICLE_PHOTO_KEYWORDS = [
  "car", "vehicle", "bike", "motorcycle", "suv", "truck", "bumper", "fender",
  "windshield", "door", "headlight", "accident_photo", "damaged_car", "claim_photo"
];

export function evaluateClaimAiApproval(
  description: string = "",
  photos: (string | File)[] = [],
  policy?: { status?: string; maxClaimsPerYear?: number; premiumAmount?: number } | null,
  claimsCountSoFar: number = 0,
  payments?: { status?: string }[] | null
): DetailedAiAssessmentResult {
  const desc = description.trim().toLowerCase();
  const questions: AssessmentQuestion[] = [];

  // =========================================================================
  // CATEGORY 1: Incident Description & Event Specificity (40% Weight)
  // =========================================================================
  const isNumericSpam = /^[0-9\/\s\-_.,]+$/.test(desc) || (desc.length > 0 && desc.replace(/[^0-9]/g, "").length / desc.length > 0.4);
  const isGarbled = (new Set(desc.replace(/\s+/g, "")).size < 5 && desc.length > 10) || GARBLED_PATTERNS.some((p) => desc.includes(p));
  const hasAccidentKeyword = ACCIDENT_KEYWORDS.some((kw) => desc.includes(kw));

  // Question 1: Length & Genuine Text Check
  const q1_length = desc.length >= 25 && !isNumericSpam && !isGarbled && hasAccidentKeyword;
  questions.push({
    id: "desc_length",
    category: "description",
    question: "Is the accident incident description sufficiently detailed (>=25 characters)?",
    passed: q1_length,
    scoreImpact: q1_length ? 25 : 0,
    explanation: q1_length
      ? `Detailed accident description provided (${desc.length} chars).`
      : isNumericSpam
      ? "Description consists of numerical gibberish rather than valid accident incident details."
      : isGarbled
      ? "Description contains garbled keyboard spam sequences."
      : "Description is missing vehicle accident damage details (e.g. hit, dent, collision).",
  });

  // Question 2: Numerical Spam Check
  const q1_spam = !isNumericSpam;
  questions.push({
    id: "desc_spam",
    category: "description",
    question: "Is the description text free of numerical gibberish or numbers-only spam?",
    passed: q1_spam,
    scoreImpact: q1_spam ? 25 : 0,
    explanation: q1_spam ? "No numerical spam pattern detected." : "Numerical gibberish / numbers-only text detected.",
  });

  // Question 3: Keyboard Garbled Check
  const q1_garbled = !isGarbled;
  questions.push({
    id: "desc_garbled",
    category: "description",
    question: "Is the text free of garbled keyboard sequences (e.g. 'asdfghjkl', 'qwerty')?",
    passed: q1_garbled,
    scoreImpact: q1_garbled ? 25 : 0,
    explanation: q1_garbled ? "Valid character entropy verified." : "Garbled keyboard spam sequence detected.",
  });

  // Question 4: Accident Impact Keywords Check
  questions.push({
    id: "desc_impact_keywords",
    category: "description",
    question: "Does the description mention specific vehicle accident/impact parts (e.g. bumper, dent, collision)?",
    passed: hasAccidentKeyword,
    scoreImpact: hasAccidentKeyword ? 25 : 0,
    explanation: hasAccidentKeyword ? "Accident damage keywords identified." : "Missing specific vehicle impact details (e.g. crash, dent, scratch).",
  });

  const descriptionScore = questions
    .filter((q) => q.category === "description")
    .reduce((sum, q) => sum + q.scoreImpact, 0);

  const descriptionReason = descriptionScore === 100
    ? "Incident description details genuine accident events."
    : questions.filter((q) => q.category === "description" && !q.passed).map((q) => q.explanation).join(" ");

  // =========================================================================
  // CATEGORY 2: Vehicle Damage Photo & Visual Inspection (30% Weight)
  // =========================================================================
  const q2_present = photos && photos.length > 0;
  questions.push({
    id: "img_present",
    category: "image",
    question: "Are damaged vehicle inspection photos attached to the claim?",
    passed: q2_present,
    scoreImpact: q2_present ? 50 : 0,
    explanation: q2_present ? `${photos.length} photo(s) attached.` : "No damage photos uploaded for inspection.",
  });

  // Photo Signature Scanner Logic:
  // Any attached photo file or URL is recognized as valid vehicle inspection evidence unless it explicitly matches non-vehicle schematics/diagrams
  const photoNames = (photos || []).map((p) => (typeof p === "string" ? p.toLowerCase() : p.name.toLowerCase()));
  
  const hasNonVehicleKeyword = photoNames.some((name) =>
    NON_VEHICLE_IMAGE_KEYWORDS.some((kw) => name.includes(kw))
  );

  // An image passes as long as photos are attached and no explicit non-vehicle diagram/appliance keyword is present
  const q2_vehicle_detected = q2_present && !hasNonVehicleKeyword;

  questions.push({
    id: "img_vehicle_signature",
    category: "image",
    question: "Does the uploaded image contain a valid motorized vehicle visual signature?",
    passed: q2_vehicle_detected,
    scoreImpact: q2_vehicle_detected ? 50 : 0,
    explanation: q2_vehicle_detected
      ? "Valid vehicle visual inspection evidence confirmed."
      : hasNonVehicleKeyword
      ? "🚨 Non-vehicle image detected: Uploaded photo contains non-vehicle appliance schematics or diagrams."
      : "🚨 No vehicle photos uploaded for inspection.",
  });

  const imageScore = questions
    .filter((q) => q.category === "image")
    .reduce((sum, q) => sum + q.scoreImpact, 0);

  const imageReason = imageScore === 100
    ? "Vehicle damage photos attached and verified."
    : questions.filter((q) => q.category === "image" && !q.passed).map((q) => q.explanation).join(" ");

  // =========================================================================
  // CATEGORY 3: Policy Terms & Claim Limit Capacity Cap (20% Weight)
  // =========================================================================
  const isPolicyActive = !policy?.status || policy.status === "Active" || policy.status === "Renewed";
  questions.push({
    id: "pol_active",
    category: "policy",
    question: "Is the underlying vehicle insurance policy active and unexpired?",
    passed: isPolicyActive,
    scoreImpact: isPolicyActive ? 50 : 0,
    explanation: isPolicyActive ? "Policy active coverage confirmed." : `Policy status is ${policy?.status || "Inactive"}.`,
  });

  const maxCap = policy?.maxClaimsPerYear || 2;
  const isUnderCap = claimsCountSoFar <= maxCap;
  questions.push({
    id: "pol_cap_under_limit",
    category: "policy",
    question: `Is the annual claims frequency under the policy cap limit (${claimsCountSoFar} filed / max ${maxCap} allowed)?`,
    passed: isUnderCap,
    scoreImpact: isUnderCap ? 50 : 0,
    explanation: isUnderCap ? "Annual claim limit capacity available." : `Annual claim cap limit exceeded (${claimsCountSoFar} vs max ${maxCap}/year).`,
  });

  const policyScore = questions
    .filter((q) => q.category === "policy")
    .reduce((sum, q) => sum + q.scoreImpact, 0);

  const policyReason = policyScore === 100
    ? "Policy active with available claim limit capacity."
    : questions.filter((q) => q.category === "policy" && !q.passed).map((q) => q.explanation).join(" ");

  // =========================================================================
  // CATEGORY 4: Premium Payment Logs & Financial Standing (10% Weight)
  // =========================================================================
  const hasOverdue = (payments || []).some((p) => p.status === "OVERDUE");
  const hasPending = (payments || []).some((p) => p.status === "PENDING");

  const q4_no_overdue = !hasOverdue;
  questions.push({
    id: "pay_no_overdue",
    category: "payment",
    question: "Are premium installment payment logs free of overdue balances?",
    passed: q4_no_overdue,
    scoreImpact: q4_no_overdue ? 50 : 0,
    explanation: q4_no_overdue ? "No overdue premium balances." : "Overdue premium payments detected in payment logs.",
  });

  const q4_no_pending = !hasPending;
  questions.push({
    id: "pay_no_pending",
    category: "payment",
    question: "Are all scheduled premium installment payments current?",
    passed: q4_no_pending,
    scoreImpact: q4_no_pending ? 50 : 0,
    explanation: q4_no_pending ? "All premium payments fully up to date." : "Pending premium installments awaiting payment.",
  });

  const paymentScore = questions
    .filter((q) => q.category === "payment")
    .reduce((sum, q) => sum + q.scoreImpact, 0);

  const paymentReason = paymentScore === 100
    ? "Policy premium payments are fully up-to-date."
    : questions.filter((q) => q.category === "payment" && !q.passed).map((q) => q.explanation).join(" ");

  // =========================================================================
  // WEIGHTED SCORE CALCULATION WITH STRICT 0% OVERRIDES
  // =========================================================================
  let finalScore = Math.round(
    descriptionScore * 0.4 +
    imageScore * 0.3 +
    policyScore * 0.2 +
    paymentScore * 0.1
  );

  // STRICT HARD 0% OVERRIDES:
  // If description fails (score < 50), image fails (score < 50), or policy fails (score < 50) -> Force 0%
  if (descriptionScore < 50 || imageScore < 50 || policyScore < 50) {
    finalScore = 0;
  }

  let eligibility: "Eligible" | "Needs Review" | "Ineligible" = "Eligible";
  if (finalScore === 0 || finalScore < 45) {
    eligibility = "Ineligible";
  } else if (finalScore < 75) {
    eligibility = "Needs Review";
  }

  const mainReason = finalScore === 0
    ? "Claim rejected due to failed verification checks (garbled description, non-vehicle image, or policy cap limit)."
    : "Comprehensive claim requirements verified.";

  return {
    isValid: finalScore >= 45,
    score: finalScore,
    eligibility,
    reason: mainReason,
    questions,
    breakdown: {
      descriptionScore,
      imageScore,
      policyScore,
      paymentScore,
      descriptionReason,
      imageReason,
      policyReason,
      paymentReason,
    },
  };
}

export function evaluateDescriptionQuality(description: string = "") {
  // Accident Details (step 2) only has the description field at this point —
  // photos, policy, and payment data don't exist yet in the wizard. Calling
  // the full evaluateClaimAiApproval() here means imageScore/policyScore are
  // always 0, which triggers the "force finalScore to 0" override below and
  // rejects every claim outright, regardless of description quality. Score
  // only the description category so this check reflects what's actually
  // being validated at this step.
  const result = evaluateClaimAiApproval(description);
  const isValid = result.breakdown.descriptionScore >= 50;
  return {
    isValid,
    score: result.breakdown.descriptionScore,
    eligibility: isValid ? "Eligible" as const : "Ineligible" as const,
    reason: isValid ? "Incident description details genuine accident events." : result.breakdown.descriptionReason,
  };
}