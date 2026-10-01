import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ROLE_NAVIGATION_REGISTRY, RouteMeta } from '../../theme/navigationRegistry';
import { Button } from './ui';

export interface PageHeaderProps {
  routeId?: string;
  customTitle?: string;
  customDescription?: string;
  badge?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    isLoading?: boolean;
    variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'danger' | 'shield';
  };
  secondaryActions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  customBreadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  routeId,
  customTitle,
  customDescription,
  badge,
  primaryAction,
  secondaryActions,
  customBreadcrumbs,
  children,
  className = '',
}) => {
  const { role, lang, setActiveView, setRole } = useMarketplace();
  const isRtl = lang === 'ar';
  const roleConfig = ROLE_NAVIGATION_REGISTRY[role];

  // Find Route Metadata from Registry if routeId provided
  let routeMeta: RouteMeta | undefined;
  if (routeId && roleConfig) {
    for (const group of roleConfig.navGroups) {
      const match = group.routes.find(r => r.id === routeId);
      if (match) {
        routeMeta = match;
        break;
      }
    }
  }

  const title = customTitle || (routeMeta ? (isRtl ? routeMeta.titleAr : routeMeta.titleEn) : '');
  const description = customDescription || (routeMeta ? (isRtl ? routeMeta.descriptionAr : routeMeta.descriptionEn) : '');
  const activeBadge = badge || routeMeta?.badge;

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className={`bg-white dark:bg-zinc-900 border-b border-stone-200/80 dark:border-zinc-800 transition-colors select-none ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
        
        {/* 1. Context Breadcrumb Navigation ("Where am I?") */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 mb-3 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setActiveView('catalog');
            }}
            className="flex items-center gap-1 hover:text-[#800020] dark:hover:text-[#D4AF37] transition-colors cursor-pointer shrink-0 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isRtl ? 'سوق دسوق' : 'Souq Desoq'}</span>
          </button>

          {role !== 'customer' && (
            <>
              <ChevronIcon className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="font-bold text-[#800020] dark:text-[#D4AF37] shrink-0">
                {isRtl ? roleConfig?.roleTitleAr : roleConfig?.roleTitleEn}
              </span>
            </>
          )}

          {customBreadcrumbs ? (
            customBreadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronIcon className="w-3 h-3 text-stone-400 shrink-0" />
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-[#800020] dark:hover:text-[#D4AF37] transition-colors cursor-pointer shrink-0"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-stone-800 dark:text-zinc-200 font-bold shrink-0">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))
          ) : routeMeta ? (
            <>
              <ChevronIcon className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="text-stone-900 dark:text-zinc-100 font-bold shrink-0">
                {isRtl ? routeMeta.titleAr : routeMeta.titleEn}
              </span>
            </>
          ) : null}
        </nav>

        {/* 2. Main Title Row & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif font-black text-xl sm:text-2xl md:text-3xl text-stone-900 dark:text-zinc-100 tracking-tight leading-tight">
                {title}
              </h1>
              {activeBadge && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#800020] dark:text-[#D4AF37] border border-[#D4AF37]/35 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>{activeBadge}</span>
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                {description}
              </p>
            )}
          </div>

          {/* 3. Primary & Secondary Actions ("What is the primary action?") */}
          {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap pt-2 md:pt-0">
              {secondaryActions?.map((action, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  size="sm"
                  onClick={action.onClick}
                  leftIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}

              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'primary'}
                  size="md"
                  onClick={primaryAction.onClick}
                  leftIcon={primaryAction.icon}
                  isLoading={primaryAction.isLoading}
                  className="shadow-md"
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Optional Custom Slot (e.g. Sub-Tabs or Filter Rails) */}
        {children && <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">{children}</div>}
      </div>
    </div>
  );
};
