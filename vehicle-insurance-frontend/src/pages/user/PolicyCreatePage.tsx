import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ZodError } from "zod";
import { ArrowLeft, ArrowRight, Upload, File, X, Loader2, Sparkles, AlertTriangle, CheckCircle2, Shield, Car, Bike, Truck, CarFront, FileText, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { vehicleStepSchema, policyStepSchema, type CreatePolicyInput } from "@/schemas/policySchemas";
import { useCreatePolicy, useUploadPolicyDocuments } from "@/hooks/usePolicies";
import { useExtractPolicyDocumentPreview } from "@/hooks/useAiAnalysis";
import { validateFiles } from "@/lib/fileValidation";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { DatePicker } from "@/components/ui/date-picker";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const steps = ["Vehicle Details", "Policy Details", "Documents & Review"];

// Helper to sanitize extracted string values
const sanitizeField = (value: string | null | undefined, maxLen: number, alphaNumericOnly = false): string => {
  if (!value) return "";
  let clean = value.trim();
  if (alphaNumericOnly) {
    clean = clean.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase();
  }
  clean = clean.replace(/(?:Manufacturing|Year|Vehicle|Type|Reg|Chassis|Engine|Policy).*/i, "").trim();
  if (clean.length > maxLen) {
    clean = clean.substring(0, maxLen).trim();
  }
  return clean;
};

// Intelligent vehicle type detection
const detectVehicleType = (make?: string | null, model?: string | null, rawType?: string | null): "car" | "suv" | "two-wheeler" | "commercial" => {
  const combined = `${rawType || ""} ${make || ""} ${model || ""}`.toLowerCase().trim();

  const twoWheelerKeywords = [
    "two", "2-wheeler", "2 wheeler", "bike", "motorcycle", "scooter", "scooty", "moped",
    "yamaha", "royal enfield", "hero", "tvs", "bajaj", "pulsar", "activa", "splendor",
    "jupiter", "access", "apache", "ntorq", "vespa", "ktm", "duke", "kawasaki", "ninja",
    "harley", "ola", "ather", "triumph", "fz", "bullet", "classic 350", "himalayan", "hunter",
    "meteor", "r15", "mt-15", "xpulse", "platina", "ct100", "avenger", "burgman", "ronin"
  ];
  if (twoWheelerKeywords.some((k) => combined.includes(k))) return "two-wheeler";

  const suvKeywords = [
    "suv", "crossover", "creta", "seltos", "fortuner", "scorpio", "thar", "harrier", "safari",
    "nexon", "xuv", "brezza", "compass", "hector", "innova", "kiger", "magnite", "taisor",
    "punch", "grand vitara", "urban cruiser", "duster", "alcazar", "carens"
  ];
  if (suvKeywords.some((k) => combined.includes(k))) return "suv";

  const commercialKeywords = [
    "commercial", "truck", "tempo", "van", "bus", "lorry", "eicher", "ashok leyland",
    "bharatbenz", "tata ace", "bolero pickup", "goods"
  ];
  if (commercialKeywords.some((k) => combined.includes(k))) return "commercial";

  return "car";
};

function getVehicleIcon(type?: string) {
  if (type === "two-wheeler") return Bike;
  if (type === "suv") return CarFront;
  if (type === "commercial") return Truck;
  return Car;
}

export default function PolicyCreatePage() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);

  const navigate = useNavigate();
  const createPolicy = useCreatePolicy();
  const uploadDocuments = useUploadPolicyDocuments();
  const extractPreview = useExtractPolicyDocumentPreview();

  const [form, setForm] = useState<CreatePolicyInput>({
    vehicleMake: "", vehicleModel: "", vehicleYear: "", registrationNo: "",
    vehicleType: "car", policyNumber: "", insuranceCompany: "",
    startDate: "", endDate: "", coverageType: "comprehensive",
    paymentInterval: "one-time", firstPaymentDate: "",
    maxClaimsPerYear: "2", maxClaimsPerMonth: "1",
  });

  // Calculate Total Amount & Per-Installment Amount dynamically
  const { totalAmount, installmentAmount, installmentCount } = useMemo(() => {
    let base = 14500;
    if (form.vehicleType === "two-wheeler") base = 8400;
    else if (form.vehicleType === "suv") base = 22000;
    else if (form.vehicleType === "commercial") base = 32000;

    let mult = 1.0;
    if (form.coverageType === "own-damage") mult = 0.8;
    else if (form.coverageType === "third-party") mult = 0.5;

    const total = Math.round(base * mult);

    let count = 1;
    if (form.paymentInterval === "monthly") count = 12;
    else if (form.paymentInterval === "quarterly") count = 4;
    else if (form.paymentInterval === "half-yearly") count = 2;

    const perInst = Math.round(total / count);

    return { totalAmount: total, installmentAmount: perInst, installmentCount: count };
  }, [form.vehicleType, form.coverageType, form.paymentInterval]);

  const updateField = (field: keyof CreatePolicyInput, value: string) => {
    let cleanVal = value;
    if (field === "registrationNo") {
      cleanVal = value.replaceAll(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);
    }
    const newForm = { ...form, [field]: cleanVal };
    
    if (field === "vehicleMake" || field === "vehicleModel") {
      const autoType = detectVehicleType(
        field === "vehicleMake" ? value : newForm.vehicleMake,
        field === "vehicleModel" ? value : newForm.vehicleModel,
        null
      );
      if (autoType && autoType !== newForm.vehicleType) {
        newForm.vehicleType = autoType;
      }
    }

    setForm(newForm);

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateFormStep = (stepIdx: number, currentForm: CreatePolicyInput): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    try {
      if (stepIdx === 0) vehicleStepSchema.parse(currentForm);
      if (stepIdx === 1) policyStepSchema.parse(currentForm);
    } catch (err) {
      if (err instanceof ZodError) {
        err.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
      }
    }
    return fieldErrors;
  };

  const handleDocumentAutoFill = (selectedFile: File) => {
    if (!files.some((f) => f.name === selectedFile.name)) {
      setFiles((prev) => [...prev, selectedFile]);
    }

    extractPreview.mutate(selectedFile, {
      onSuccess: (extracted) => {
        setAutoFilled(true);
        if (extracted.confidence) setConfidence(extracted.confidence);

        let covType = form.coverageType;
        if (extracted.coverage?.coverageType) {
          const lower = extracted.coverage.coverageType.toLowerCase();
          if (lower.includes("third")) covType = "third-party";
          else if (lower.includes("own")) covType = "own-damage";
          else covType = "comprehensive";
        }

        const extMake = sanitizeField(extracted.vehicle?.make, 40) || form.vehicleMake;
        const extModel = sanitizeField(extracted.vehicle?.model, 40) || form.vehicleModel;
        const vType = detectVehicleType(extMake, extModel, extracted.vehicle?.vehicleType);

        let payInterval = form.paymentInterval;
        if (extracted.payment?.paymentInterval) {
          const lower = extracted.payment.paymentInterval.toLowerCase();
          if (lower.includes("month")) payInterval = "monthly";
          else if (lower.includes("quarter")) payInterval = "quarterly";
          else if (lower.includes("half")) payInterval = "half-yearly";
          else if (lower.includes("annual")) payInterval = "annually";
          else payInterval = "one-time";
        }

        const preFilledForm: CreatePolicyInput = {
          vehicleMake: extMake,
          vehicleModel: extModel,
          vehicleYear: String(extracted.vehicle?.year || form.vehicleYear || new Date().getFullYear()),
          registrationNo: sanitizeField(extracted.vehicle?.registrationNo, 11, true) || form.registrationNo,
          vehicleType: vType,
          policyNumber: sanitizeField(extracted.policyNumber, 30, true) || form.policyNumber || `POL-2024-${Math.floor(1000 + Math.random() * 9000)}`,
          insuranceCompany: sanitizeField(extracted.insuranceCompany, 80) || form.insuranceCompany || "HDFC Ergo",
          startDate: extracted.coverage?.startDate || form.startDate || new Date().toISOString().split("T")[0],
          endDate: extracted.coverage?.endDate || form.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          coverageType: covType,
          paymentInterval: payInterval,
          firstPaymentDate: extracted.payment?.nextPaymentDate || form.firstPaymentDate || form.startDate || new Date().toISOString().split("T")[0],
          maxClaimsPerYear: "2",
          maxClaimsPerMonth: "1",
        };

        setForm(preFilledForm);
        setErrors({});
        toast.success("AI pre-filled policy form details!");
      },
    });
  };

  const handleNext = () => {
    const fieldErrors = validateFormStep(step, form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Please fill in all required fields before proceeding.");
      return;
    }
    setErrors({});
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    setErrors({});
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const fieldErrors = validateFormStep(1, form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Please fix policy fields before submitting.");
      return;
    }

    try {
      const created = await createPolicy.mutateAsync(form);
      if (files.length > 0) {
        await uploadDocuments.mutateAsync({ id: created.id, files });
      }
      toast.success("Policy created successfully!");
      navigate(ROUTES.POLICY_DETAIL(created.id));
    } catch {
      // Error handled by hook
    }
  };

  const VehicleIcon = getVehicleIcon(form.vehicleType);
  const activeStepErrorsCount = Object.keys(errors).length;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Apply for New Policy"
        description="Fill in vehicle details, configure policy coverage & claim allowance caps, and upload documents"
      />

      {/* AI Document Auto-fill Banner */}
      <Card className="border-brand-accent/20 bg-brand-accent/5 shadow-2xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-brand-accent/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Upload Policy PDF or RC to Auto-Fill Form
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Our AI reads your document, extracts vehicle specs, policy numbers & limits, and populates the form automatically.
                </p>
              </div>
            </div>

            <label className="shrink-0 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    const { accepted, rejectedMessages } = validateFiles([selected], files.length);
                    if (accepted.length > 0) handleDocumentAutoFill(accepted[0]);
                    rejectedMessages.forEach((msg) => toast.error(msg));
                    e.target.value = "";
                  }
                }}
              />
              <Button size="sm" type="button" disabled={extractPreview.isPending} className="pointer-events-none shadow-xs font-bold text-xs bg-brand-primary">
                {extractPreview.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                ) : (
                  <Upload className="h-3.5 w-3.5 mr-2" />
                )}
                {extractPreview.isPending ? "Reading..." : "Upload Policy PDF"}
              </Button>
            </label>
          </div>

          {autoFilled && (
            <div className="mt-3 pt-3 border-t border-brand-accent/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-brand-accent font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Form pre-filled by AI from uploaded document. Review and edit any field below.
              </span>
              {confidence != null && (
                <Badge variant="outline" className="text-[11px] border-brand-accent/30 bg-brand-accent/10 text-brand-accent font-bold">
                  Confidence: {Math.round(confidence * 100)}%
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Wizard (7 cols) */}
        <div className="lg:col-span-7 space-y-5">

          {/* Validation Warnings */}
          {activeStepErrorsCount > 0 && (
            <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 flex items-start gap-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Required fields before proceeding:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {Object.entries(errors).map(([field, msg]) => (
                    <li key={field}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Step Progress Bar */}
          <Card className="border shadow-2xs">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Step {step + 1} of {steps.length}: {steps[step]}</span>
                <span className="text-muted-foreground font-semibold">{Math.round(((step + 1) / steps.length) * 100)}% Completed</span>
              </div>
              <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
              <div className="flex justify-between pt-1">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i < step ? "bg-brand-accent text-white" : i === step ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs hidden sm:inline ${i === step ? "font-bold text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Step Cards */}
          <Card className="border shadow-xs">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>{steps[step]}</span>
                {autoFilled && (
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    AI Pre-filled
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                
                {/* STEP 0: VEHICLE DETAILS */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="policy-vehicle-make" className="text-xs font-bold text-foreground mb-1.5 block">Vehicle Make</label>
                        <Input id="policy-vehicle-make" placeholder="e.g. Maruti" maxLength={40} value={form.vehicleMake} onChange={(e) => updateField("vehicleMake", e.target.value)} className="text-xs" aria-invalid={!!errors.vehicleMake} />
                        {errors.vehicleMake && <p className="text-[11px] text-destructive mt-1">{errors.vehicleMake}</p>}
                      </div>
                      <div>
                        <label htmlFor="policy-vehicle-model" className="text-xs font-bold text-foreground mb-1.5 block">Vehicle Model</label>
                        <Input id="policy-vehicle-model" placeholder="e.g. Swift" maxLength={40} value={form.vehicleModel} onChange={(e) => updateField("vehicleModel", e.target.value)} className="text-xs" aria-invalid={!!errors.vehicleModel} />
                        {errors.vehicleModel && <p className="text-[11px] text-destructive mt-1">{errors.vehicleModel}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="policy-vehicle-year" className="text-xs font-bold text-foreground mb-1.5 block">Year of Manufacture</label>
                        <Input id="policy-vehicle-year" placeholder="2024" maxLength={4} inputMode="numeric" value={form.vehicleYear} onChange={(e) => updateField("vehicleYear", e.target.value.replace(/\D/g, ""))} className="text-xs" aria-invalid={!!errors.vehicleYear} />
                        {errors.vehicleYear && <p className="text-[11px] text-destructive mt-1">{errors.vehicleYear}</p>}
                      </div>
                      <div>
                        <label htmlFor="policy-registration-no" className="text-xs font-bold text-foreground mb-1.5 block">Registration Number</label>
                        <Input id="policy-registration-no" placeholder="GJ01AB1234" maxLength={11} value={form.registrationNo} onChange={(e) => updateField("registrationNo", e.target.value)} className="text-xs font-mono uppercase" aria-invalid={!!errors.registrationNo} />
                        {errors.registrationNo && <p className="text-[11px] text-destructive mt-1">{errors.registrationNo}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="policy-vehicle-type" className="text-xs font-bold text-foreground mb-1.5 block">Vehicle Category</label>
                      <Select
                        id="policy-vehicle-type"
                        value={form.vehicleType}
                        onChange={(e) => updateField("vehicleType", e.target.value)}
                        options={[
                          { value: "car", label: "Car / Sedan / Hatchback" },
                          { value: "suv", label: "SUV / Crossover" },
                          { value: "two-wheeler", label: "Two Wheeler / Bike" },
                          { value: "commercial", label: "Commercial Vehicle / Truck" },
                        ]}
                        className="text-xs bg-background"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 1: POLICY DETAILS & CLAIM ALLOWANCE */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="policy-number" className="text-xs font-bold text-foreground mb-1.5 block">Policy Number</label>
                        <Input id="policy-number" placeholder="POL-2024-006" maxLength={30} value={form.policyNumber} onChange={(e) => updateField("policyNumber", e.target.value)} className="text-xs font-mono" aria-invalid={!!errors.policyNumber} />
                        {errors.policyNumber && <p className="text-[11px] text-destructive mt-1">{errors.policyNumber}</p>}
                      </div>
                      <div>
                        <label htmlFor="policy-insurance-company" className="text-xs font-bold text-foreground mb-1.5 block">Insurance Company</label>
                        <Input id="policy-insurance-company" placeholder="HDFC Ergo" maxLength={80} value={form.insuranceCompany} onChange={(e) => updateField("insuranceCompany", e.target.value)} className="text-xs" aria-invalid={!!errors.insuranceCompany} />
                        {errors.insuranceCompany && <p className="text-[11px] text-destructive mt-1">{errors.insuranceCompany}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="policy-start-date" className="text-xs font-bold text-foreground mb-1.5 block">Coverage Start Date</label>
                        <DatePicker id="policy-start-date" value={form.startDate} onChange={(val) => updateField("startDate", val)} aria-invalid={!!errors.startDate} />
                        {errors.startDate && <p className="text-[11px] text-destructive mt-1">{errors.startDate}</p>}
                      </div>
                      <div>
                        <label htmlFor="policy-end-date" className="text-xs font-bold text-foreground mb-1.5 block">Coverage Expiry Date</label>
                        <DatePicker id="policy-end-date" min={form.startDate || undefined} value={form.endDate} onChange={(val) => updateField("endDate", val)} aria-invalid={!!errors.endDate} />
                        {errors.endDate && <p className="text-[11px] text-destructive mt-1">{errors.endDate}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="policy-coverage-type" className="text-xs font-bold text-foreground mb-1.5 block">Coverage Protection Type</label>
                        <Select
                          id="policy-coverage-type"
                          value={form.coverageType}
                          onChange={(e) => updateField("coverageType", e.target.value)}
                          options={[
                            { value: "comprehensive", label: "Comprehensive (Full Damage + 3rd Party)" },
                            { value: "third-party", label: "Third Party Only" },
                            { value: "own-damage", label: "Own Damage Only" },
                          ]}
                          className="text-xs bg-background"
                        />
                      </div>
                      <div>
                        <label htmlFor="policy-payment-interval" className="text-xs font-bold text-foreground mb-1.5 block">Payment Interval</label>
                        <Select
                          id="policy-payment-interval"
                          value={form.paymentInterval}
                          onChange={(e) => updateField("paymentInterval", e.target.value)}
                          options={[
                            { value: "one-time", label: "One-time (pay in full)" },
                            { value: "monthly", label: "Monthly (12 installments)" },
                            { value: "quarterly", label: "Quarterly (4 installments)" },
                            { value: "half-yearly", label: "Half-Yearly (2 installments)" },
                            { value: "annually", label: "Annually (1 installment)" },
                          ]}
                          className="text-xs bg-background"
                        />
                      </div>
                    </div>

                    {/* Claim Allowance Cap Selection */}
                    <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Shield className="h-4 w-4 text-brand-primary" /> Policy Claim Allowance & Frequency Cap
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="policy-max-claims-year" className="text-xs font-bold text-foreground mb-1 block">Max Claims Allowed Per Year</label>
                          <Select
                            id="policy-max-claims-year"
                            value={form.maxClaimsPerYear || "2"}
                            onChange={(e) => updateField("maxClaimsPerYear", e.target.value)}
                            options={[
                              { value: "1", label: "1 Claim / Year (Basic Policy Cap)" },
                              { value: "2", label: "2 Claims / Year (Standard Policy Cap)" },
                              { value: "3", label: "3 Claims / Year (Premium Policy Cap)" },
                              { value: "5", label: "5 Claims / Year (Commercial Cap)" },
                            ]}
                            className="text-xs bg-background"
                          />
                        </div>

                        <div>
                          <label htmlFor="policy-max-claims-month" className="text-xs font-bold text-foreground mb-1 block">Max Claims Allowed Per Month</label>
                          <Select
                            id="policy-max-claims-month"
                            value={form.maxClaimsPerMonth || "1"}
                            onChange={(e) => updateField("maxClaimsPerMonth", e.target.value)}
                            options={[
                              { value: "1", label: "1 Claim / Month Cap" },
                              { value: "2", label: "2 Claims / Month Cap" },
                            ]}
                            className="text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DOCUMENTS & REVIEW */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-brand-primary/5 rounded-xl text-xs space-y-2 border border-brand-primary/20">
                      <p className="font-bold text-foreground text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-brand-primary" /> Ready for Verification & Submission
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground pt-1">
                        <p>• <strong>Vehicle:</strong> {form.vehicleMake} {form.vehicleModel} ({form.registrationNo || "Reg N/A"})</p>
                        <p>• <strong>Policy No:</strong> {form.policyNumber}</p>
                        <p>• <strong>Insurer:</strong> {form.insuranceCompany}</p>
                        <p>• <strong>Claim Allowance:</strong> Max {form.maxClaimsPerYear || "2"} Claims/Year ({form.maxClaimsPerMonth || "1"} Claim/Month Cap)</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground mb-2 block">Attached Supporting Policy Documents ({files.length})</label>
                      <label
                        htmlFor="policy-documents-input"
                        className="block border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-primary transition-colors cursor-pointer bg-muted/20"
                      >
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs font-bold text-foreground">Click to attach supporting files</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Upload RC, PUC certificate, previous policy PDF, or images</p>
                        <input
                          id="policy-documents-input"
                          type="file"
                          accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files) {
                              const selectedFiles = Array.from(e.target.files);
                              const { accepted, rejectedMessages } = validateFiles(selectedFiles, files.length);
                              setFiles((prev) => [...prev, ...accepted]);
                              rejectedMessages.forEach((msg) => toast.error(msg));
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>

                      {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border bg-background text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <File className="h-4 w-4 text-brand-primary shrink-0" />
                                <span className="truncate font-medium">{file.name}</span>
                                <span className="text-[10px] text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </CardContent>

            {/* Navigation Buttons Footer */}
            <div className="border-t p-4 flex items-center justify-between gap-3 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={step === 0}
                className="text-xs h-9 px-4 font-bold cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>

              {step < steps.length - 1 ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="text-xs h-9 px-5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold cursor-pointer"
                >
                  Next Step <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={createPolicy.isPending || uploadDocuments.isPending}
                  className="text-xs h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {createPolicy.isPending || uploadDocuments.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting Policy...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Policy Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Digital Policy Preview & AI Assistant Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Digital Policy Pass Card */}
          <Card className="border bg-gradient-to-br from-card via-card to-brand-primary/5 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shrink-0">
                  <VehicleIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Digital Policy Preview</p>
                  <p className="text-[10px] text-muted-foreground">Live Form Verification Pass</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-brand-primary border-brand-primary/30">
                {form.coverageType || "Comprehensive"}
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vehicle Spec:</span>
                <span className="font-semibold text-foreground">{form.vehicleMake || "Make"} {form.vehicleModel || "Model"} ({form.vehicleYear || "2024"})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Registration No:</span>
                <span className="font-mono font-bold text-foreground">{form.registrationNo || "GJ01AB1234"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Policy Number:</span>
                <span className="font-mono font-bold text-brand-primary">{form.policyNumber || "POL-2024-XXX"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Insurer Name:</span>
                <span className="font-semibold text-foreground">{form.insuranceCompany || "HDFC Ergo / Insurer"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-semibold text-foreground">{form.startDate || "Start"} → {form.endDate || "End"}</span>
              </div>
            </div>

            {/* Claim Frequency Cap Gauge */}
            <div className="p-3.5 rounded-xl border bg-background space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-brand-primary" /> Claim Frequency Cap
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 font-bold border-emerald-500/30 bg-emerald-500/10">
                  Active Limit
                </Badge>
              </div>
              <p className="text-xs font-extrabold text-brand-primary mt-1">
                Max {form.maxClaimsPerYear || "2"} Claims / Year ({form.maxClaimsPerMonth || "1"} Claim / Month Cap)
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Protects zero-depreciation coverage and No-Claim-Bonus (NCB).
              </p>
            </div>

            {/* Financial Schedule */}
            <div className="p-3.5 rounded-xl border bg-brand-primary/5 border-brand-primary/20 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground font-semibold">Total Premium</span>
                <span className="text-lg font-extrabold text-foreground">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs pt-1 border-t">
                <span className="text-muted-foreground">Scheduled Payment</span>
                <span className="font-bold text-brand-primary">₹{installmentAmount.toLocaleString()} {form.paymentInterval === "monthly" ? "/ mo" : "/ installment"}</span>
              </div>
            </div>
          </Card>

          {/* AI Assistant Help Card */}
          <Card className="border bg-muted/30 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-brand-accent font-bold">
              <Sparkles className="h-4 w-4" /> AI Document Guidance
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {step === 0 && "Uploading your vehicle registration certificate (RC) or policy PDF automatically detects vehicle type, make, model, and registration number with high precision."}
              {step === 1 && "Configure the claim frequency cap suited for your driving profile. Standard policies permit up to 2 claims per year with 1 claim per month cap."}
              {step === 2 && "Attaching RC, PUC, or previous policy PDFs ensures faster AI verification and instant policy approval."}
            </p>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}
