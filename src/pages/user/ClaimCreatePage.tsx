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
import { useCreateClaim } from "@/hooks/useClaims";
import { usePolicies } from "@/hooks/usePolicies";
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
  const [photos, setPhotos] = useState<string[]>([]);
  const [docs, setDocs] = useState<string[]>([]);
  const navigate = useNavigate();
  const createClaim = useCreateClaim();
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
      onSuccess: (data) => navigate(ROUTES.CLAIM_DETAIL(data.id)),
    });
  };

  const selectedPolicy = policies?.find((p) => p.id === form.policyId);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">File a Claim</h1>
      <p className="text-muted-foreground mb-4">Submit your insurance claim in 5 easy steps</p>

      <div className="mb-6">
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
                <label className="text-sm font-medium mb-1.5 block">Select Policy</label>
                <Select
                  value={form.policyId}
                  onChange={(e) => updateField("policyId", e.target.value)}
                  placeholder="Choose a policy"
                  options={(policies || []).filter((p) => p.status === "Active").map((p) => ({
                    value: p.id,
                    label: `${p.policyNumber} — ${p.vehicleMake} ${p.vehicleModel}`,
                  }))}
                />
                {errors.policyId && <p className="text-sm text-destructive mt-1">{errors.policyId}</p>}
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
                  <label className="text-sm font-medium mb-1.5 block">Accident Date</label>
                  <Input type="date" value={form.accidentDate} onChange={(e) => updateField("accidentDate", e.target.value)} />
                  {errors.accidentDate && <p className="text-sm text-destructive mt-1">{errors.accidentDate}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Location</label>
                  <Input placeholder="e.g. Mumbai, Western Express Highway" value={form.location} onChange={(e) => updateField("location", e.target.value)} />
                  {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea placeholder="Describe what happened in detail (min 20 chars)..." rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-secondary transition-colors cursor-pointer"
                  onClick={() => setPhotos([...photos, `damage_photo_${photos.length + 1}.jpg`])}
                >
                  <Image className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Upload damage photos</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to add photos (minimum 1)</p>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((p, i) => (
                      <div key={i} className="relative border rounded-lg p-3 bg-muted/30 flex items-center gap-2">
                        <Image className="h-4 w-4 text-brand-secondary" />
                        <span className="text-xs truncate flex-1">{p}</span>
                        <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer">
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
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-secondary transition-colors cursor-pointer"
                  onClick={() => setDocs([...docs, `document_${docs.length + 1}.pdf`])}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Upload supporting documents</p>
                  <p className="text-xs text-muted-foreground mt-1">FIR, Driving License, etc.</p>
                </div>
                {docs.length > 0 && (
                  <div className="space-y-2">
                    {docs.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-brand-secondary" />
                          <span className="text-sm">{d}</span>
                        </div>
                        <button onClick={() => setDocs(docs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer">
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
              <Button onClick={handleSubmit} disabled={createClaim.isPending}>
                {createClaim.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
