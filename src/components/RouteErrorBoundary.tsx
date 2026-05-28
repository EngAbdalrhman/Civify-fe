"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface RouteErrorBoundaryProps {
  children: ReactNode;
  /** Short label for support (e.g. "Upload", "Resume Builder") */
  routeName?: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[RouteErrorBoundary${this.props.routeName ? `: ${this.props.routeName}` : ""}]`,
      error,
      info.componentStack,
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const label = this.props.routeName ?? "This page";
      return (
        <div
          className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-center"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {label} ran into an unexpected error. You can try again or reload the
            page. If this keeps happening, disable browser translation extensions
            for this site.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="outline" onClick={this.handleRetry}>
              Try again
            </Button>
            <Button type="button" onClick={this.handleReload}>
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
