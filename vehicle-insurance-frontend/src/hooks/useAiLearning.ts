import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface AiLearningEvent {
  id: string;
  claimId: string;
  claimNumber: string;
  aiConfidence: number;
  aiEstimatedCost: number;
  humanDecision: "Approved" | "Rejected";
  humanApprovedCost: number;
  confidenceDelta: number; // Penalty or boost applied
  costVariancePercent: number; // Percentage shift in estimate
  timestamp: string;
  reason?: string;
}

const STORAGE_KEY = "vehicleinsure_ai_learning_model_v1";

export function useAiLearning() {
  const [learningLogs, setLearningLogs] = useState<AiLearningEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }

    // Default initial historical learning events (Simulated machine learning history)
    return [
      {
        id: "learn-101",
        claimId: "c2",
        claimNumber: "CLM-2024-002",
        aiConfidence: 92,
        aiEstimatedCost: 45000,
        humanDecision: "Rejected",
        humanApprovedCost: 0,
        confidenceDelta: -16,
        costVariancePercent: -100,
        timestamp: "2026-07-28",
        reason: "Overturned high AI score due to unverified secondary impact pattern.",
      },
      {
        id: "learn-102",
        claimId: "c4",
        claimNumber: "CLM-2024-004",
        aiConfidence: 88,
        aiEstimatedCost: 18000,
        humanDecision: "Approved",
        humanApprovedCost: 15300,
        confidenceDelta: 0,
        costVariancePercent: -15,
        timestamp: "2026-07-30",
        reason: "Cost variance adjustment: Adjusted labor rate multiplier.",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(learningLogs));
    } catch {
      // Quota handler
    }
  }, [learningLogs]);

  // Calculate dynamic model calibration parameters
  const highConfidenceRejections = learningLogs.filter(
    (log) => log.aiConfidence >= 75 && log.humanDecision === "Rejected"
  );

  // Confidence penalty: Each high-confidence rejection adds a -7% calibration penalty (capped at -25%)
  const confidencePenalty = Math.min(25, highConfidenceRejections.length * 7);

  // Cost multiplier: Mean ratio of (humanApproved / aiEstimated) for approved items
  const approvedVariances = learningLogs.filter((log) => log.humanDecision === "Approved" && log.aiEstimatedCost > 0);
  const costRatioSum = approvedVariances.reduce(
    (acc, log) => acc + log.humanApprovedCost / log.aiEstimatedCost,
    0
  );
  const meanCostMultiplier = approvedVariances.length > 0 ? costRatioSum / approvedVariances.length : 0.88; // default 88% factor

  /**
   * Record human decision to calibrate AI engine
   */
  const recordAssessorFeedback = ({
    claimId,
    claimNumber,
    aiConfidence,
    aiEstimatedCost,
    humanDecision,
    humanApprovedCost,
    reason,
  }: {
    claimId: string;
    claimNumber: string;
    aiConfidence: number;
    aiEstimatedCost: number;
    humanDecision: "Approved" | "Rejected";
    humanApprovedCost?: number;
    reason?: string;
  }) => {
    const finalApprovedCost = humanDecision === "Approved" ? (humanApprovedCost ?? aiEstimatedCost) : 0;
    
    // Calculate deltas
    let confidenceDelta = 0;
    if (aiConfidence >= 75 && humanDecision === "Rejected") {
      confidenceDelta = -14; // High confidence rejection penalty
    }

    const costVariancePercent = aiEstimatedCost > 0 
      ? Math.round(((finalApprovedCost - aiEstimatedCost) / aiEstimatedCost) * 100)
      : 0;

    const newEvent: AiLearningEvent = {
      id: `learn-${Date.now()}`,
      claimId,
      claimNumber,
      aiConfidence,
      aiEstimatedCost,
      humanDecision,
      humanApprovedCost: finalApprovedCost,
      confidenceDelta,
      costVariancePercent,
      timestamp: new Date().toISOString().split("T")[0],
      reason: reason || (humanDecision === "Rejected" ? "Human Assessor Rejection Override" : "Human Settlement Adjustment"),
    };

    setLearningLogs((prev) => [newEvent, ...prev]);

    // User Feedback Notification
    if (aiConfidence >= 75 && humanDecision === "Rejected") {
      toast.success(
        `🧠 AI Engine Calibrated: Learned from rejection of high-confidence (${aiConfidence}%) claim #${claimNumber}. Future risk weights adjusted!`,
        { duration: 5000 }
      );
    } else if (costVariancePercent !== 0 && humanDecision === "Approved") {
      toast.success(
        `🧠 AI Engine Calibrated: Learned from ${costVariancePercent > 0 ? '+' : ''}${costVariancePercent}% cost estimate variance on claim #${claimNumber}.`,
        { duration: 5000 }
      );
    } else {
      toast.info(`🧠 AI Learning Model updated based on claim #${claimNumber} decision.`);
    }
  };

  /**
   * Compute calibrated score & cost estimate for any claim
   */
  const getCalibratedAssessment = (rawConfidence: number = 88, rawCost: number = 45000, claimId?: string) => {
    // Check if this specific claim has an existing feedback override
    const existingLog = learningLogs.find((l) => l.claimId === claimId || l.claimNumber === claimId);

    let confidenceOffset = -confidencePenalty;
    if (existingLog && existingLog.humanDecision === "Rejected") {
      confidenceOffset -= 15; // Additional specific penalty for this claim
    }

    const calibratedConfidence = Math.max(35, Math.min(99, rawConfidence + confidenceOffset));
    const calibratedCost = Math.round(rawCost * meanCostMultiplier);
    const costOffsetPercent = Math.round((meanCostMultiplier - 1) * 100);

    return {
      rawConfidence,
      calibratedConfidence,
      confidenceOffset,
      rawCost,
      calibratedCost,
      costOffsetPercent,
      hasHistoricalOverrides: highConfidenceRejections.length > 0 || approvedVariances.length > 0,
      overrideCount: highConfidenceRejections.length,
      existingLog,
    };
  };

  const resetLearningModel = () => {
    setLearningLogs([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("AI Learning calibration weights reset to factory defaults.");
  };

  return {
    learningLogs,
    recordAssessorFeedback,
    getCalibratedAssessment,
    resetLearningModel,
    confidencePenalty,
    meanCostMultiplier,
    rejectionCount: highConfidenceRejections.length,
  };
}
