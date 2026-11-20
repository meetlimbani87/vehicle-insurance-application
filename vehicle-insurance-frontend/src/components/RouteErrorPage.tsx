import { Link, useNavigate, useRouteError } from "react-router";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error("Route error:", error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-1.5">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn't load this page. Go back and try again.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Link to="/dashboard">
            <Button>
              <RefreshCcw className="h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
