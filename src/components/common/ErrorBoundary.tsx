import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF7F2] text-[#1F2421] text-right" dir="rtl">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-center text-red-900">حدث خطأ أثناء تحميل الصفحة</h2>
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              حدث خطأ غير متوقع في واجهة المتجر. اضغط أدناه لإعادة تشغيل الصفحة بسلاسة.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full bg-[#800020] text-white py-2.5 rounded-full text-xs font-bold hover:bg-[#600018] transition-colors cursor-pointer"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
