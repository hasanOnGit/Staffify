import React from "react";
import { AlertCircle, RotateCcw, Home, ShieldAlert } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Staffify Mobile ErrorBoundary caught exception]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F4F5F7] dark:bg-[#090D14]">
          <div className="w-full max-w-sm bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-3xl bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] flex items-center justify-center mx-auto border border-[#DE350B]/20">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFEBE6] text-[#DE350B] text-[10px] font-extrabold uppercase tracking-wider">
                Module Recovery
              </span>
              <h2 className="text-base font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                View Failed to Render
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] leading-relaxed">
                A runtime exception occurred in this module view. You can reload or return to Home.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-2.5 bg-[#EBECF0]/60 dark:bg-[#151B26] rounded-xl text-left overflow-x-auto border border-[#DFE1E6] dark:border-[#263042]">
                <p className="text-[10px] font-mono text-[#DE350B] dark:text-rose-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#0052CC] text-white text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-white dark:bg-[#151B26] border border-[#DFE1E6] dark:border-[#263042] text-[#172B4D] dark:text-[#F1F5F9] text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
