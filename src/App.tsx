import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Shield } from "lucide-react";
import { router } from "@/router/AppRouter";
import ErrorBoundary from "@/components/ErrorBoundary";

function SplashScreen() {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-primary"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-3"
      >
        <div className="h-14 w-14 rounded-2xl bg-brand-accent flex items-center justify-center shadow-lg shadow-black/20">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <span className="font-display font-bold text-white tracking-tight">VehicleInsure</span>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 550);
    return () => clearTimeout(t);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AnimatePresence>{booting && <SplashScreen />}</AnimatePresence>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </MotionConfig>
  );
}
