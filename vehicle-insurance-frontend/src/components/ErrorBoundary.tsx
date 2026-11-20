import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it in the tree.
 * Without this, an uncaught error unmounts the whole React tree and leaves
 * the user staring at a blank page with no way to recover except manually
 * editing the URL back to "/".
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("Unhandled error caught by ErrorBoundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.hash = "#/dashboard";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-sm">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-lg font-semibold text-foreground mb-1.5">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This page ran into an unexpected error. Try reloading — your data hasn't been lost.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCcw className="h-4 w-4" /> Reload
              </Button>
              <Button onClick={this.handleReset}>
                <Home className="h-4 w-4" /> Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
