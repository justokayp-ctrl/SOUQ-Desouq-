import React from 'react';
import { 
  Crown, 
  Sparkles, 
  Flame, 
  Zap, 
  Baby, 
  Shirt, 
  Gem, 
  Briefcase, 
  Coffee, 
  Moon, 
  Award, 
  Feather, 
  ShieldCheck, 
  HeartHandshake, 
  Scissors, 
  Footprints, 
  Watch, 
  Flower2, 
  PartyPopper,
  GraduationCap,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { DepartmentRealmId, OccasionType } from '../../types';

interface CategoryIconProps {
  categoryId: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = "w-4 h-4" }) => {
  switch (categoryId) {
    case 'men_fashion':
    case 'cat-fashion-men':
      return <Scissors className={className} />;
    case 'women_fashion':
    case 'cat-fashion-women':
      return <Gem className={className} />;
    case 'perfumes_fragrances':
    case 'cat-perfumes':
      return <Sparkles className={className} />;
    case 'watches_accessories':
    case 'cat-watches':
      return <Watch className={className} />;
    case 'shoes_bags':
    case 'cat-shoes-bags':
      return <ShoppingBag className={className} />;
    case 'kids_wear':
    case 'cat-fashion-kids':
      return <Baby className={className} />;
    default:
      return <Shirt className={className} />;
  }
};

interface RealmIconProps {
  realmId: DepartmentRealmId;
  className?: string;
}

export const RealmIcon: React.FC<RealmIconProps> = ({ realmId, className = "w-5 h-5" }) => {
  switch (realmId) {
    case 'gentleman':
      return <Crown className={className} />;
    case 'sanctuary':
      return <Gem className={className} />;
    case 'vanguard':
      return <Zap className={className} />;
    case 'little_royals':
      return <Baby className={className} />;
    default:
      return <Crown className={className} />;
  }
};

interface OccasionIconProps {
  occasion: OccasionType | string;
  className?: string;
}

export const OccasionIcon: React.FC<OccasionIconProps> = ({ occasion, className = "w-4 h-4" }) => {
  switch (occasion) {
    case 'royal_wedding':
      return <Crown className={className} />;
    case 'formal_business':
      return <Briefcase className={className} />;
    case 'daily_casual':
      return <Coffee className={className} />;
    case 'festive_celebration':
      return <Sparkles className={className} />;
    case 'university_daily':
      return <GraduationCap className={className} />;
    case 'newborn_celebration':
      return <Baby className={className} />;
    case 'family_gatherings':
      return <HeartHandshake className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

interface SubWingIconProps {
  wingId: string;
  className?: string;
}

export const SubWingIcon: React.FC<SubWingIconProps> = ({ wingId, className = "w-5 h-5" }) => {
  switch (wingId) {
    case 'tailored_suits':
      return <Scissors className={className} />;
    case 'cotton_shirts':
      return <Shirt className={className} />;
    case 'leather_footwear':
    case 'orthopedic_shoes':
    case 'kids_ortho_shoes':
      return <Footprints className={className} />;
    case 'watches_accessories':
      return <Watch className={className} />;
    case 'oud_perfumes':
    case 'niche_fragrance':
      return <Feather className={className} />;
    case 'evening_gowns':
      return <Gem className={className} />;
    case 'luxury_abayas':
      return <Sparkles className={className} />;
    case 'modest_casual':
      return <Flower2 className={className} />;
    case 'silks_scarves':
      return <Feather className={className} />;
    case 'oversized_hoodies':
      return <Flame className={className} />;
    case 'sneakers_street':
      return <Zap className={className} />;
    case 'caps_crossbody':
      return <Award className={className} />;
    case 'newborn_cotton':
      return <Baby className={className} />;
    case 'little_gentlemen':
      return <Crown className={className} />;
    case 'princess_dresses':
      return <Gem className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
