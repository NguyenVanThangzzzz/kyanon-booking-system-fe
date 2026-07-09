import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/common/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <div className="mb-6 text-6xl">⚠️</div>
            <h1 className="mb-2 text-2xl font-bold text-secondary-900">Something went wrong</h1>
            <p className="mb-6 text-secondary-500">
              An unexpected error occurred. Please try again.
            </p>
            {this.state.error && (
              <details className="mb-6 rounded-lg bg-secondary-50 p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-secondary-700">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-error-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex justify-center gap-3">
              <Button onClick={this.handleReset}>Try again</Button>
              <Button variant="outline" onClick={() => window.location.assign('/')}>
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
