import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ في النظام',
  message = 'تعذر تحميل البيانات المطلوبة. يرجى التحقق من اتصال شبكة الإنترنت أو المحاولة مجدداً.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`max-w-md mx-auto my-8 p-6 text-center space-y-4 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-sm text-red-900 dark:text-red-200">
          {title}
        </h4>
        <p className="text-xs text-red-700 dark:text-red-300/80 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-1">
          <Button
            variant="danger"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            إعادة المحاولة
          </Button>
        </div>
      )}
    </div>
  );
};
