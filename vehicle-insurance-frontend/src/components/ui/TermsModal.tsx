import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, CheckCircle2 } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "terms" | "privacy";
  onAgree?: () => void;
}

export default function TermsModal({ open, onOpenChange, type = "terms", onAgree }: TermsModalProps) {
  const isPrivacy = type === "privacy";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
          {isPrivacy ? <Shield className="h-5 w-5 text-brand-primary" /> : <FileCheck className="h-5 w-5 text-brand-primary" />}
          {isPrivacy ? "VehicleInsure Privacy Policy" : "VehicleInsure Terms & Conditions"}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
          {isPrivacy
            ? "IRDAI compliant data privacy, AES-256 encryption & user data protection policy"
            : "Platform usage terms, policy coverage rules, installment schedules & AI claim settlement guidelines"}
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1 text-xs text-muted-foreground leading-relaxed my-2">
        {!isPrivacy ? (
          <>
            <div className="p-3 rounded-xl border bg-muted/30 text-foreground space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> IRDAI Registered Platform Terms
              </p>
              <p className="text-[11px] text-muted-foreground">
                By accessing VehicleInsure, applying for motor insurance policies, or submitting accident claims, you agree to abide by these Terms & Conditions.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">1. Policy Issuance & Coverage Terms</h4>
              <p>
                Motor insurance policies issued on VehicleInsure provide comprehensive own-damage and third-party liability coverage in accordance with Indian Motor Tariff guidelines. Coverage is active during the effective policy period specified on your policy schedule.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">2. Payment Schedule & Policy Continuity</h4>
              <p>
                Policy premiums are payable in full or split into regular installments (monthly, quarterly, half-yearly, annually). Keeping premium installments current guarantees continuous policy active status and 100% claim eligibility.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">3. AI Vision Damage Assessment & Claims Settlement</h4>
              <p>
                Our AI Smart Claim Engine processes uploaded damage photos, surveyor inspection telemetry, and policy terms to estimate repair costs. Pre-claim approval scores represent automated pre-evaluations. Final payout settlements follow physical surveyor inspection and deductible rules.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">4. Annual & Monthly Claim Frequency Caps</h4>
              <p>
                Standard policies permit up to 2 claims per policy year and 1 claim per month. Excess claim requests above frequency limits require underwriter review and manual clearance.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">5. Fraud Prevention & Honest Intimation</h4>
              <p>
                Intentionally uploading non-vehicle images, fraudulent damage claims, or misleading incident descriptions will result in immediate claim rejection, policy cancellation, and regulatory reporting under IRDAI guidelines.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-xl border bg-muted/30 text-foreground space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs">
                <Shield className="h-4 w-4 text-brand-primary shrink-0" /> Bank-Grade AES-256 Data Vault Encryption
              </p>
              <p className="text-[11px] text-muted-foreground">
                Your personal details, vehicle registration numbers, driving licenses, and payment logs are encrypted and never shared with unauthorized third parties.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">1. Collection of Vehicle & Personal Data</h4>
              <p>
                We collect your name, email address, phone number, vehicle registration number, and uploaded claim documentation solely to provide insurance coverage, issue policy certificates, and process claim settlements.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">2. Use of AI Model Processing</h4>
              <p>
                Uploaded policy PDF documents and damage inspection photos are analyzed using encrypted AI vision models to perform automated extraction of policy terms and damage cost estimations.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground text-xs">3. Data Retention & Security Standards</h4>
              <p>
                All data is stored in ISO-27001 certified cloud data centers with automated multi-region backups, strict role-based access control, and 24/7 intrusion monitoring.
              </p>
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button
          size="sm"
          onClick={() => {
            onAgree?.();
            onOpenChange(false);
          }}
          className="bg-brand-primary text-white text-xs font-bold px-5 cursor-pointer"
        >
          I Understand & Agree
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
