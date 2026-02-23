import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center p-6 text-center"
          data-testid="error-boundary-fallback"
        >
          <AlertTriangle className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {this.props.fallbackMessage ||
              "Something went wrong in this panel. The rest of the app is unaffected."}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
