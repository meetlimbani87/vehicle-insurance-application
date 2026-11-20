import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { ZodError } from "zod";
import { ArrowLeft, ArrowRight, Upload, Image, File, X, Loader2, Check, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createClaimSchema, type CreateClaimInput } from "@/schemas/claimSchemas";
import { useCreateClaim, useUploadClaimPhotos, useUploadClaimDocuments } from "@/hooks/useClaims";
import { usePolicies } from "@/hooks/usePolicies";
import { validateFiles } from "@/lib/fileValidation";
import { evaluateDescriptionQuality } from "@/lib/descriptionValidator";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { DatePicker } from "@/components/ui/date-picker";
import { ROUTES } from "@/constants/routes";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const steps = ["Select Policy", "Accident Details", "Damage Photos", "Documents", "Review"];

export default function ClaimCreatePage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const navigate = useNavigate();
  const createClaim = useCreateClaim();
  const uploadPhotos = useUploadClaimPhotos();
  const uploadDocuments = useUploadClaimDocuments();
  const { data: policies } = usePolicies();

  const [form, setForm] = useState<CreateClaimInput>({
    policyId: searchParams.get("policyId") || "",
    accidentDate: "",
    location: "",
    description: "",
  });

  const updateField = (field: keyof CreateClaimInput, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = () => {
    try {
      if (step === 0) {
        if (!form.policyId) { setErrors({ policyId: "Select a policy" }); return false; }
      }
      if (step === 1) {
        createClaimSchema.parse(form);
        const descQuality = evaluateDescriptionQuality(form.description);
        if (!descQuality.isValid) {
          setErrors({ description: descQuality.reason });
          toast.error(descQuality.reason);
          return false;
        }
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = () => {
    createClaim.mutate(form, {
      onSuccess: async (data) => {
        // Claim exists now (has an id) — upload the real files against it.
        // Best-effort: if an upload fails, the claim itself is still filed;
        // the person lands on the detail page either way and can retry there.
        if (photos.length > 0) {
          await uploadPhotos.mutateAsync({ id: data.id, files: photos }).catch(() => {});
        }
        if (docs.length > 0) {
          await uploadDocuments.mutateAsync({ id: data.id, files: docs }).catch(() => {});
        }
        navigate(ROUTES.CLAIM_DETAIL(data.id));
      },
    });
  };

  const isSubmitting = createClaim.isPending || uploadPhotos.isPending || uploadDocuments.isPending;

  const selectedPolicy = policies?.find((p) => p.id === form.policyId);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-2xl mx-auto">
      <PageHeader title="File a Claim" description="Submit your insurance claim in 5 easy steps" className="mb-4" />

      <div className="mb-6" role="group" aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}>
        <Progress value={((step + 1) / steps.length) * 100} />
        <div className="flex justify-between mt-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-brand-accent text-white" : i === step ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-xs hidden md:inline ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {step === 0 && (
              <div>
                <label htmlFor="claim-policy" className="text-sm font-medium mb-1.5 block">Select Policy</label>
                <Select
                  id="claim-policy"
                  value={form.policyId}
                  onChange={(e) => updateField("policyId", e.target.value)}
                  placeholder="Choose a policy"
                  options={(policies || []).filter((p) => p.status === "Active").map((p) => ({
                    value: p.id,
                    label: `${p.policyNumber} — ${p.vehicleMake} ${p.vehicleModel}`,
                  }))}
                  aria-invalid={!!errors.policyId}
                  aria-describedby={errors.policyId ? "claim-policy-error" : undefined}
                />
                {errors.policyId && <p id="claim-policy-error" role="alert" className="text-sm text-destructive mt-1">{errors.policyId}</p>}
                {selectedPolicy && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">{selectedPolicy.vehicleMake} {selectedPolicy.vehicleModel} ({selectedPolicy.vehicleYear})</p>
                    <p className="text-xs text-muted-foreground">{selectedPolicy.registrationNo} • {selectedPolicy.insuranceCompany}</p>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="claim-accident-date" className="text-sm font-medium mb-1.5 block">Accident Date</label>
                  <DatePicker
                    id="claim-accident-date"
                    max={new Date().toISOString().split("T")[0]}
                    value={form.accidentDate}
                    onChange={(val) => updateField("accidentDate", val)}
                    aria-invalid={!!errors.accidentDate}
                    aria-describedby={errors.accidentDate ? "claim-accident-date-error" : undefined}
                  />
                  {errors.accidentDate && <p id="claim-accident-date-error" role="alert" className="text-sm text-destructive mt-1">{errors.accidentDate}</p>}
                </div>
                <div>
                  <label htmlFor="claim-location" className="text-sm font-medium mb-1.5 block">Location</label>
                  <Input id="claim-location" placeholder="e.g. Mumbai, Western Express Highway" value={form.location} onChange={(e) => updateField("location", e.target.value)} aria-invalid={!!errors.location} aria-describedby={errors.location ? "claim-location-error" : undefined} />
                  {errors.location && <p id="claim-location-error" role="alert" className="text-sm text-destructive mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label htmlFor="claim-description" className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea id="claim-description" placeholder="Describe what happened in detail (min 20 chars)..." rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} aria-invalid={!!errors.description} aria-describedby={errors.description ? "claim-description-error" : undefined} />
                  {errors.description && <p id="claim-description-error" role="alert" className="text-sm text-destructive mt-1">{errors.description}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label
                  htmlFor="claim-photos-input"
                  className="block border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-secondary transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                >
                  <Image className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Upload damage photos</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to choose photos (minimum 1)</p>
                  <input
                    id="claim-photos-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    aria-label="Upload damage photos, minimum 1 required"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const { accepted, rejectedMessages } = validateFiles(files, photos.length);
                      if (accepted.length > 0) setPhotos([...photos, ...accepted]);
                      rejectedMessages.forEach((msg) => toast.error(msg));
                      e.target.value = "";
                    }}
                  />
                </label>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((p, i) => (
                      <div key={i} className="relative border rounded-lg p-3 bg-muted/30 flex items-center gap-2">
                        <Image className="h-4 w-4 text-brand-secondary" />
                        <span className="text-xs truncate flex-1">{p.name}</span>
                        <button aria-label={`Remove ${p.name}`} onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label
                  htmlFor="claim-docs-input"
                  className="block border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-secondary transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Upload supporting documents</p>
                  <p className="text-xs text-muted-foreground mt-1">FIR, Driving License, etc.</p>
                  <input
                    id="claim-docs-input"
                    type="file"
                    multiple
                    className="sr-only"
                    aria-label="Upload supporting documents such as FIR or driving license"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const { accepted, rejectedMessages } = validateFiles(files, docs.length);
                      if (accepted.length > 0) setDocs([...docs, ...accepted]);
                      rejectedMessages.forEach((msg) => toast.error(msg));
                      e.target.value = "";
                    }}
                  />
                </label>
                {docs.length > 0 && (
                  <div className="space-y-2">
                    {docs.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-brand-secondary" />
                          <span className="text-sm">{d.name}</span>
                        </div>
                        <button aria-label={`Remove ${d.name}`} onClick={() => setDocs(docs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2"><Eye className="h-4 w-4" /> Review Your Claim</h3>
                <div className="space-y-3 border rounded-lg p-4">
                  <ReviewRow label="Policy" value={selectedPolicy ? `${selectedPolicy.policyNumber} — ${selectedPolicy.vehicleMake} ${selectedPolicy.vehicleModel}` : ""} />
                  <ReviewRow label="Accident Date" value={form.accidentDate} />
                  <ReviewRow label="Location" value={form.location} />
                  <ReviewRow label="Description" value={form.description} />
                  <ReviewRow label="Photos" value={`${photos.length} file(s)`} />
                  <ReviewRow label="Documents" value={`${docs.length} file(s)`} />
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Claim
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
