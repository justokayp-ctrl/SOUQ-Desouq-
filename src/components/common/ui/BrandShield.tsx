import React from 'react';

export interface BrandShieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'responsive';
  variant?: 'burgundy' | 'gold' | 'monochrome' | 'outline';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const BrandShield: React.FC<BrandShieldProps> = ({
  size = 'md',
  variant = 'burgundy',
  showText = false,
  className = '',
  animate = false,
}) => {
  const isResponsive = size === 'responsive';

  const sizeMap = {
    xs: { width: 24, height: 28, fontSize: 'text-xs', cssSize: 'w-6 h-7' },
    sm: { width: 30, height: 35, fontSize: 'text-xs', cssSize: 'w-[30px] h-[35px]' },
    md: { width: 44, height: 51, fontSize: 'text-sm sm:text-base', cssSize: 'w-11 h-[51px]' },
    lg: { width: 62, height: 72, fontSize: 'text-lg', cssSize: 'w-16 h-[72px]' },
    xl: { width: 84, height: 98, fontSize: 'text-xl', cssSize: 'w-21 h-[98px]' },
    '2xl': { width: 112, height: 130, fontSize: 'text-2xl', cssSize: 'w-28 h-[130px]' },
    responsive: { width: 44, height: 51, fontSize: 'text-xs sm:text-base', cssSize: 'w-7 h-[33px] sm:w-11 sm:h-[51px]' },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2.5 select-none group/shield ${className}`}>
      <div
        className={`relative flex items-center justify-center shrink-0 cursor-pointer ${selectedSize.cssSize} ${
          animate ? 'group-hover:scale-108 group-hover/shield:scale-108 transition-all duration-300 transform' : ''
        }`}
      >
        {/* =========================================================================
            GOLD AURA GLOW LAYERS (الهالة الذهبية المشعة التفاعلية)
           ========================================================================= */}
        {/* Layer 1: Outer Atmospheric Gold Halo */}
        <div 
          className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#D4AF37]/0 via-[#FFDF73]/45 to-[#B38B1E]/0 blur-lg sm:blur-xl opacity-0 group-hover:opacity-100 group-hover/shield:opacity-100 transition-all duration-500 ease-out transform scale-75 group-hover:scale-125 group-hover/shield:scale-125 pointer-events-none" 
          aria-hidden="true"
        />

        {/* Layer 2: Concentrated Inner Gold Core Energy Aura */}
        <div 
          className="absolute -inset-1 rounded-full bg-[#D4AF37]/35 blur-md opacity-0 group-hover:opacity-95 group-hover/shield:opacity-95 transition-all duration-300 ease-out transform scale-85 group-hover:scale-110 group-hover/shield:scale-110 pointer-events-none" 
          aria-hidden="true"
        />

        {/* Layer 3: Dynamic Shimmer Sparkle Accents */}
        <div 
          className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-[#FFF9D6] blur-[0.5px] opacity-0 group-hover:opacity-100 group-hover/shield:opacity-100 transition-all duration-300 delay-75 transform scale-0 group-hover:scale-100 group-hover/shield:scale-100 pointer-events-none shadow-[0_0_8px_#FFF2B2]" 
          aria-hidden="true"
        />
        <div 
          className="absolute -bottom-1 -left-0.5 w-1.5 h-1.5 rounded-full bg-[#FFDF73] blur-[0.5px] opacity-0 group-hover:opacity-100 group-hover/shield:opacity-100 transition-all duration-300 delay-100 transform scale-0 group-hover:scale-100 group-hover/shield:scale-100 pointer-events-none shadow-[0_0_6px_#D4AF37]" 
          aria-hidden="true"
        />

        {/* Main Superman Shield Vector (Exact Iconic Geometry in Royal Burgundy & Ivory) */}
        <svg
          viewBox="0 0 100 116"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-md filter transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(212,175,55,0.85)] group-hover/shield:drop-shadow-[0_0_14px_rgba(212,175,55,0.85)]"
        >
          <defs>
            {/* 1. Deep Burgundy Metallic Gradient (العنابي الملكي الفاخر) */}
            <linearGradient id="shieldBurgundyRich" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A81C38" />
              <stop offset="30%" stopColor="#800020" />
              <stop offset="70%" stopColor="#600018" />
              <stop offset="100%" stopColor="#3D0010" />
            </linearGradient>

            {/* 2. Pure Warm Ivory Canvas Gradient (العاجي الناعم الملكي) */}
            <linearGradient id="shieldIvoryPure" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="35%" stopColor="#FAF5E8" />
              <stop offset="75%" stopColor="#F5ECE0" />
              <stop offset="100%" stopColor="#EADECB" />
            </linearGradient>

            {/* 3. Radiant Gold Metallic Trim (الذهبي المشع) */}
            <linearGradient id="shieldGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="25%" stopColor="#E5C158" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="75%" stopColor="#B38B1E" />
              <stop offset="100%" stopColor="#F3DC82" />
            </linearGradient>

            {/* 4. Gold Inner Bevel Accent */}
            <linearGradient id="shieldGoldBevel" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF8D6" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B6508" />
            </linearGradient>

            {/* 5. Subtle 3D Chisel Drop Shadow for the S */}
            <filter id="chiselShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0.8" dy="1.5" stdDeviation="1.2" floodColor="#3D0010" floodOpacity="0.5" />
            </filter>

            {/* 6. Sheen Reflection on Upper Shield */}
            <linearGradient id="sheenGleam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* =========================================================================
              LAYER 1: OUTER PENTAGON SHIELD BEZEL (Thick Burgundy Superman Border)
             ========================================================================= */}
          <polygon
            points="18,4 82,4 97,34 50,113 3,34"
            fill="url(#shieldBurgundyRich)"
            stroke="url(#shieldGoldMetallic)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* Secondary Bevel Line inside Outer Bezel */}
          <polygon
            points="22,7 78,7 93,35 50,108 7,35"
            fill="none"
            stroke="url(#shieldGoldBevel)"
            strokeWidth="1.0"
            strokeLinejoin="round"
          />

          {/* =========================================================================
              LAYER 2: INNER SHIELD CANVAS (Lustrous Ivory Background)
             ========================================================================= */}
          <polygon
            points="24,10 76,10 90,36 50,105 10,36"
            fill="url(#shieldIvoryPure)"
            stroke="#D4AF37"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* Upper Glass Sheen Reflection */}
          <polygon
            points="24,10 76,10 90,36 50,55 10,36"
            fill="url(#sheenGleam)"
            strokeLinejoin="round"
          />

          {/* =========================================================================
              LAYER 3: THE ICONIC SUPERMAN 'S' CREST (Exact DC Geometry)
             ========================================================================= */}
          <g filter="url(#chiselShadow)">
            
            {/* The Main Sweeping Superman 'S' Body */}
            <path
              d="
                M 36 10
                L 74 10
                L 89 36
                L 74 36
                L 62 23
                L 44 23
                C 32 23 24 29 24 38
                C 24 47 33 52 48 56
                C 66 61 78 69 78 83
                C 78 97 64 105 48 105
                C 32 105 20 96 16 83
                L 29 78
                C 33 87 40 92 49 92
                C 59 92 65 87 65 80
                C 65 71 54 67 40 63
                C 24 58 11 50 11 37
                C 11 20 22 10 36 10
                Z
              "
              fill="url(#shieldBurgundyRich)"
              stroke="url(#shieldGoldMetallic)"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />

            {/* 1. Top Right Iconic Superman Diamond / Rhombus Serif Terminal */}
            <polygon
              points="60,10 76,10 90,36 74,36 60,23"
              fill="url(#shieldBurgundyRich)"
              stroke="url(#shieldGoldMetallic)"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />

            {/* 2. Top-Left Ivory Teardrop / Curved Negative Space Window */}
            <path
              d="
                M 42 23
                L 58 23
                C 57 33 46 43 33 43
                C 27 43 25 35 30 27
                C 33 24 37 23 42 23
                Z
              "
              fill="url(#shieldIvoryPure)"
              stroke="url(#shieldGoldMetallic)"
              strokeWidth="0.6"
            />

            {/* 3. Lower-Right Ivory Oval / Teardrop Negative Space Window */}
            <path
              d="
                M 50 67
                C 61 67 66 73 66 80
                C 66 87 58 92 48 92
                C 40 92 37 86 42 77
                C 45 71 47 67 50 67
                Z
              "
              fill="url(#shieldIvoryPure)"
              stroke="url(#shieldGoldMetallic)"
              strokeWidth="0.6"
            />

            {/* 4. Center-Left Sharp Diamond / Notch Inset (Classic Superman Cut) */}
            <polygon
              points="11,37 24,37 18,48 11,46"
              fill="url(#shieldIvoryPure)"
              stroke="url(#shieldGoldMetallic)"
              strokeWidth="0.5"
            />

            {/* 5. Lower-Left Tail Terminal Wedge (Sharp Superman Corner) */}
            <polygon
              points="16,83 29,78 26,87 16,87"
              fill="url(#shieldBurgundyRich)"
              stroke="url(#shieldGoldMetallic)"
              strokeWidth="0.6"
            />

          </g>

          {/* =========================================================================
              LAYER 4: POLISHED CORNER HIGHLIGHT JEWELS
             ========================================================================= */}
          <circle cx="18" cy="4" r="1.3" fill="#FFF2B2" />
          <circle cx="82" cy="4" r="1.3" fill="#FFF2B2" />
          <circle cx="97" cy="34" r="1.3" fill="#FFF2B2" />
          <circle cx="3" cy="34" r="1.3" fill="#FFF2B2" />
          <circle cx="50" cy="113" r="1.3" fill="#FFF2B2" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-black tracking-tight text-[#800020] dark:text-[#D4AF37] leading-tight text-base sm:text-lg">
            سوق دسوق
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500 dark:text-stone-400 -mt-0.5">
            SOUQ DESOQ
          </span>
        </div>
      )}
    </div>
  );
};
