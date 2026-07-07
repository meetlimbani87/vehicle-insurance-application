import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ZodError } from "zod";
import { ArrowLeft, ArrowRight, Upload, File, X, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { vehicleStepSchema, policyStepSchema, type CreatePolicyInput } from "@/schemas/policySchemas";
import { useCreatePolicy } from "@/hooks/usePolicies";
import { ROUTES } from "@/constants/routes";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const steps = ["Vehicle Details", "Policy Details", "Documents"];

export default function PolicyCreatePage() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<string[]>([]);
  const navigate = useNavigate();
  const createPolicy = useCreatePolicy();

  const [form, setForm] = useState<CreatePolicyInput>({
    vehicleMake: "", vehicleModel: "", vehicleYear: "", registrationNo: "",
    vehicleType: "car", policyNumber: "", insuranceCompany: "",
    startDate: "", endDate: "", coverageType: "comprehensive",
  });

  const updateField = (field: keyof CreatePolicyInput, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const validateStep = () => {
    try {
      if (step === 0) vehicleStepSchema.parse(form);
      if (step === 1) policyStepSchema.parse(form);
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
    if (step < 2 && validateStep()) setStep(step + 1);
  };

  const handleSubmit = () => {
    createPolicy.mutate(form, {
      onSuccess: (data) => navigate(ROUTES.POLICY_DETAIL(data.id)),
    });
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create New Policy</h1>
      <p className="text-muted-foreground mb-4">Complete the steps below to register your vehicle insurance</p>

      {/* Progress */}
      <div className="mb-6">
        <Progress value={((step + 1) / steps.length) * 100} />
        <div className="flex justify-between mt-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-brand-accent text-white" : i === step ? "bg-brand-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Vehicle Make</label>
                    <Input placeholder="e.g. Maruti" value={form.vehicleMake} onChange={(e) => updateField("vehicleMake", e.target.value)} />
                    {errors.vehicleMake && <p className="text-sm text-destructive mt-1">{errors.vehicleMake}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Vehicle Model</label>
                    <Input placeholder="e.g. Swift" value={form.vehicleModel} onChange={(e) => updateField("vehicleModel", e.target.value)} />
                    {errors.vehicleModel && <p className="text-sm text-destructive mt-1">{errors.vehicleModel}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Year</label>
                    <Input placeholder="2024" value={form.vehicleYear} onChange={(e) => updateField("vehicleYear", e.target.value)} />
                    {errors.vehicleYear && <p className="text-sm text-destructive mt-1">{errors.vehicleYear}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Registration No</label>
                    <Input placeholder="GJ01AB1234" value={form.registrationNo} onChange={(e) => updateField("registrationNo", e.target.value)} />
                    {errors.registrationNo && <p className="text-sm text-destructive mt-1">{errors.registrationNo}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Vehicle Type</label>
                  <Select
                    value={form.vehicleType}
                    onChange={(e) => updateField("vehicleType", e.target.value)}
                    options={[
                      { value: "car", label: "Car" },
                      { value: "suv", label: "SUV" },
                      { value: "two-wheeler", label: "Two Wheeler" },
                      { value: "commercial", label: "Commercial" },
                    ]}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Policy Number</label>
                    <Input placeholder="POL-2024-006" value={form.policyNumber} onChange={(e) => updateField("policyNumber", e.target.value)} />
                    {errors.policyNumber && <p className="text-sm text-destructive mt-1">{errors.policyNumber}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Insurance Company</label>
                    <Input placeholder="HDFC Ergo" value={form.insuranceCompany} onChange={(e) => updateField("insuranceCompany", e.target.value)} />
                    {errors.insuranceCompany && <p className="text-sm text-destructive mt-1">{errors.insuranceCompany}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Start Date</label>
                    <Input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
                    {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">End Date</label>
                    <Input type="date" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
                    {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Coverage Type</label>
                  <Select
                    value={form.coverageType}
                    onChange={(e) => updateField("coverageType", e.target.value)}
                    options={[
                      { value: "comprehensive", label: "Comprehensive" },
                      { value: "third-party", label: "Third Party" },
                      { value: "own-damage", label: "Own Damage" },
                    ]}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-brand-secondary transition-colors cursor-pointer"
                  onClick={() => setFiles([...files, `document_${files.length + 1}.pdf`])}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click to upload documents</p>
                  <p className="text-xs text-muted-foreground mt-1">RC, PUC, Previous Policy (PDF, JPG)</p>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-brand-secondary" />
                          <span className="text-sm">{f}</span>
                        </div>
                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createPolicy.isPending}>
                {createPolicy.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Policy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
