import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  HelpCircle,
  Truck
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const LiveActivityPulse: React.FC = () => {
  const { setActiveView, setRole } = useMarketplace();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-40 flex flex-col items-start gap-2 select-none">
      {/* Expanded Quick Help Menu */}
      {isHelpOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border-2 border-[#800020]/30 shadow-2xl w-60 text-right space-y-2 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-2">
            <span className="text-xs font-black text-[#800020] dark:text-[#D4AF37]">
              مركز مساعدة سوق دسوق
            </span>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setRole('customer'); setActiveView('orders'); setIsHelpOpen(false); }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FAF6EE] dark:bg-zinc-800 hover:bg-[#FAF6EE]/80 text-xs font-bold text-stone-800 dark:text-zinc-200 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#800020]" />
              <span>تتبع طلبي وشحنتي</span>
            </span>
          </button>

          <a
            href="tel:19000"
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#800020] text-white text-xs font-bold cursor-pointer hover:bg-[#66001A] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>اتصل بنا: 19000 (مجاناً)</span>
            </span>
          </a>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsHelpOpen(!isHelpOpen)}
        className="bg-[#800020] hover:bg-[#66001A] text-[#FAF6EE] px-3.5 py-2.5 rounded-full shadow-xl border-2 border-[#D4AF37] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
        aria-label="المساعدة وخدمة العملاء"
      >
        <HelpCircle className="w-4 h-4 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-black hidden sm:inline">
          خدمة العملاء 24h
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>
    </div>
  );
};
