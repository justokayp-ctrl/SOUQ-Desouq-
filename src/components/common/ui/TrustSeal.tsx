import React from 'react';
import { BrandShield } from './BrandShield';

export interface TrustSealProps {
  type?: 'law181' | 'verified_merchant' | 'local_desoq' | 'express_24h';
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  className?: string;
}

export const TrustSeal: React.FC<TrustSealProps> = ({
  type = 'law181',
  size = 'md',
  showSubtext = true,
  className = '',
}) => {
  const configs = {
    law181: {
      title: 'ضمان حماية المستهلك المصري',
      subtext: 'معتمد رسمياً بموجب القانون رقم ١٨١ لسنة ٢٠١٨',
      badge: 'قانون ١٨١',
      variant: 'burgundy' as const,
    },
    verified_merchant: {
      title: 'تاجر دسوقي موثق رسمياً',
      subtext: 'سجل تجاري وبطاقة ضريبية معتمدة',
      badge: 'سجل معتمد',
      variant: 'gold' as const,
    },
    local_desoq: {
      title: 'جودة أصلية مضمونة',
      subtext: 'خامات ممتازة وتصاميم مختارة بعناية فائقة',
      badge: 'أصلي ١٠٠٪',
      variant: 'burgundy' as const,
    },
    express_24h: {
      title: 'شحن محلي فوري خلال 24 ساعة',
      subtext: 'مستودعات وشركات شحن مركزية داخل دسوق',
      badge: 'توصيل ٢٤ ساعة',
      variant: 'gold' as const,
    },
  };

  const config = configs[type];

  return (
    <div
      className={`inline-flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-[#800020]/15 dark:border-[#D4AF37]/25 shadow-xs transition-all hover:shadow-md ${className}`}
    >
      <BrandShield
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        variant={config.variant}
        animate
      />

      <div className="flex flex-col text-right">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-xs sm:text-sm text-[#800020] dark:text-[#D4AF37]">
            {config.title}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#800020] dark:text-[#D4AF37] border border-[#D4AF37]/30">
            {config.badge}
          </span>
        </div>
        {showSubtext && (
          <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 leading-snug">
            {config.subtext}
          </p>
        )}
      </div>
    </div>
  );
};
