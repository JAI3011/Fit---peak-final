import React from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/"; // Force a clean start from the dashboard/home
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-lg glass-panel p-10 border border-red-500/20 relative overflow-hidden text-center">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 blur-[50px] rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>

              <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Something went wrong</h1>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                An unexpected error occurred in the component tree. Don't worry, your progress has been safely stored locally.
              </p>

              {this.state.error && (
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-8 text-left overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Error Details</p>
                  <p className="text-xs font-mono text-red-400/80 break-words leading-relaxed">
                    {this.state.error?.message || "Unknown Runtime Error"}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <button
                  onClick={this.handleReload}
                  className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleReset}
                  className="w-full sm:w-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </button>
              </div>

              <p className="text-zinc-500 text-[10px] mt-10 uppercase font-bold tracking-[0.2em]">
                FitPeak System Recovery Mode
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
