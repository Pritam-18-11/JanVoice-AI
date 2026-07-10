import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// Phase 4 — catches any unexpected render crash (e.g. a bad AI API response,
// a network hiccup mid-demo) so the whole app doesn't go white-screen in
// front of judges. Shows a calm recovery screen instead.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('JanVoice AI — caught a render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 grid-bg px-4">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-2xl text-center space-y-6 bg-white/80">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Something went sideways</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                JanVoice AI hit an unexpected error. This is usually temporary — often an AI service or network hiccup. Your data is safe.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}