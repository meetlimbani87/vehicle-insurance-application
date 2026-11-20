import { Link } from "react-router";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary/5 via-background to-brand-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Shield className="h-16 w-16 text-brand-primary mx-auto mb-4 opacity-30" />
        <h1 className="text-6xl font-bold text-brand-primary mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Page not found</p>
        <Link to="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
