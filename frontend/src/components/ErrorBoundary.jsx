import React from "react";
import { AlertTriangle, RotateCcw, LayoutDashboard, ShieldAlert } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[Staffify ErrorBoundary caught an unhandled exception]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#F4F5F7] dark:bg-[#090D14] transition-colors">
          <div className="max-w-md w-full bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] rounded-xl shadow-lg p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] flex items-center justify-center mx-auto border border-[#DE350B]/20">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFEBE6] text-[#DE350B] text-[10px] font-extrabold uppercase tracking-wider">
                Module Render Notice
              </span>
              <h2 className="text-lg font-bold text-[#172B4D] dark:text-[#F1F5F9]">
                Unable to load this module
              </h2>
              <p className="text-xs text-[#6B778C] dark:text-[#94A3B8] leading-relaxed">
                An unexpected exception occurred while rendering this module view. You can reload this view or navigate back to your workspace dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#EBECF0]/60 dark:bg-[#151B26] rounded-lg text-left overflow-x-auto border border-[#DFE1E6] dark:border-[#263042]">
                <p className="text-[11px] font-mono text-[#DE350B] dark:text-rose-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Module</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-[#151B26] hover:bg-[#EBECF0] dark:hover:bg-[#1C2331] text-[#172B4D] dark:text-[#F1F5F9] border border-[#DFE1E6] dark:border-[#263042] text-xs font-semibold transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
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
