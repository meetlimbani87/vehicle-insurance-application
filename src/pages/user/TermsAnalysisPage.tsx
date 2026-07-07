import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const mockAnalysis = {
  coverage: [
    "Accidental damage to own vehicle",
    "Third-party bodily injury",
    "Third-party property damage",
    "Fire and theft coverage",
    "Personal accident cover for owner-driver",
    "Roadside assistance (24/7)",
  ],
  exclusions: [
    "Damage from drunk driving",
    "Mechanical or electrical breakdown",
    "Wear and tear / depreciation",
    "Damage from war or nuclear risk",
    "Consequential loss",
  ],
  limits: [
    "IDV capped at ₹5,00,000",
    "Deductible: ₹1,000 per claim",
    "Personal accident: ₹15,00,000",
    "No-claim bonus: up to 50%",
    "Garage limit: network only",
  ],
};

export default function TermsAnalysisPage() {
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1500);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Terms & Conditions Analysis</h1>
        <p className="text-muted-foreground">AI-powered analysis of your insurance terms</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" /> Upload or Paste T&C
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your insurance terms and conditions here..."
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button className="mt-3" onClick={handleAnalyze} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Analyzing..." : "Analyze Terms"}
          </Button>
        </CardContent>
      </Card>

      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success" className="text-sm px-3 py-1">Accepted on Jan 1, 2024</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="h-5 w-5" /> Coverage Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockAnalysis.coverage.map((c, i) => (
                    <Badge key={i} variant="success">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" /> Exclusions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockAnalysis.exclusions.map((e, i) => (
                    <Badge key={i} variant="destructive">{e}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" /> Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockAnalysis.limits.map((l, i) => (
                    <Badge key={i} variant="warning">{l}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
