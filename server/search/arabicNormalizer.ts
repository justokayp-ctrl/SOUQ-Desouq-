/**
 * Arabic Linguistic Normalizer & Typo-Tolerance Tokenizer
 * Specialized for Egyptian Marketplace terminology and Desoq heritage products
 */

export class ArabicNormalizer {
  // Common Arabic diacritics / Tashkeel unicode range
  private static readonly TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g;

  // Tatweel / Kashida
  private static readonly TATWEEL_REGEX = /\u0640/g;

  // Common Arabic prefixes in Egyptian e-commerce searches (ال التعريف، حروف العطف والجر)
  private static readonly ATTACHED_PREFIXES = ['ال', 'و', 'ف', 'ب', 'ك', 'ل', 'لل'];

  // Curated Desoq Marketplace Dictionary for Typo Correction
  private static readonly DESOQ_VOCABULARY: Array<{ canonical: string; type: string; boost: number }> = [
    { canonical: 'فستان', type: 'product', boost: 2.5 },
    { canonical: 'فستان سواريه', type: 'product', boost: 2.8 },
    { canonical: 'عطر', type: 'product', boost: 2.5 },
    { canonical: 'مسك', type: 'product', boost: 2.2 },
    { canonical: 'عود', type: 'product', boost: 2.2 },
    { canonical: 'بخور', type: 'product', boost: 2.0 },
    { canonical: 'حقيبة', type: 'product', boost: 2.3 },
    { canonical: 'شنطة', type: 'product', boost: 2.3 },
    { canonical: 'حذاء', type: 'product', boost: 2.4 },
    { canonical: 'شوز', type: 'product', boost: 2.0 },
    { canonical: 'كعب عالي', type: 'product', boost: 2.0 },
    { canonical: 'سنيكرز', type: 'product', boost: 2.0 },
    { canonical: 'بدلة', type: 'product', boost: 2.4 },
    { canonical: 'بدلة رجالي', type: 'product', boost: 2.6 },
    { canonical: 'قميص', type: 'product', boost: 2.0 },
    { canonical: 'بنطلون', type: 'product', boost: 2.0 },
    { canonical: 'عباية', type: 'product', boost: 2.4 },
    { canonical: 'عبايات خليجي', type: 'product', boost: 2.6 },
    { canonical: 'طرحة', type: 'product', boost: 2.0 },
    { canonical: 'حجاب', type: 'product', boost: 2.0 },
    { canonical: 'فضة', type: 'product', boost: 2.4 },
    { canonical: 'مجوهرات', type: 'product', boost: 2.3 },
    { canonical: 'خاتم', type: 'product', boost: 2.0 },
    { canonical: 'سلسلة', type: 'product', boost: 2.0 },
    { canonical: 'ساعة', type: 'product', boost: 2.4 },
    { canonical: 'ساعات يد', type: 'product', boost: 2.5 },
    { canonical: 'نظارة', type: 'product', boost: 2.2 },
    { canonical: 'نظارات شمسية', type: 'product', boost: 2.3 },
    { canonical: 'مكياج', type: 'product', boost: 2.3 },
    { canonical: 'مستحضرات تجميل', type: 'product', boost: 2.2 },
    { canonical: 'ملابس أطفال', type: 'product', boost: 2.3 },
    { canonical: 'أقمشة', type: 'product', boost: 2.5 },
    { canonical: 'أقمشة ومنسوجات', type: 'product', boost: 2.4 },
    { canonical: 'قطن مصري', type: 'product', boost: 2.2 },
    { canonical: 'دسوق', type: 'city', boost: 3.0 },
    { canonical: 'كفر الشيخ', type: 'governorate', boost: 2.0 },
    { canonical: 'بوتيك ليدي رويال', type: 'seller', boost: 2.5 },
    { canonical: 'قصر العطور الشرقية', type: 'seller', boost: 2.5 },
    { canonical: 'مان مودرن', type: 'seller', boost: 2.5 },
    { canonical: 'إكسسوارات جولدن كوين', type: 'seller', boost: 2.5 },
    { canonical: 'أحذية ستيب إن ستايل', type: 'seller', boost: 2.5 },
    { canonical: 'بيبي كيدز', type: 'seller', boost: 2.5 },
  ];

  /**
   * Deep normalization of Arabic text for consistent indexing and querying:
   * 1. Remove Tashkeel (Fatha, Damma, Kasra, Sukun, Shadda, Tanween)
   * 2. Remove Tatweel (Kashida)
   * 3. Normalize Alef variants (أ, إ, آ, ٱ) -> ا
   * 4. Normalize Taa Marbuta (ة) -> ه
   * 5. Normalize Yaa / Alef Maksura (ى) -> ي
   * 6. Normalize Hamza variants (ؤ -> و, ئ -> ي)
   * 7. Lowercase English letters and strip excessive punctuation
   */
  public static normalize(text: string | null | undefined): string {
    if (!text) return '';

    return text
      .trim()
      .toLowerCase()
      // Remove diacritics
      .replace(ArabicNormalizer.TASHKEEL_REGEX, '')
      // Remove Tatweel
      .replace(ArabicNormalizer.TATWEEL_REGEX, '')
      // Alef normalization
      .replace(/[أإآٱ]/g, 'ا')
      // Taa Marbuta normalization
      .replace(/ة/g, 'ه')
      // Alef Maksura to Yaa
      .replace(/ى/g, 'ي')
      // Hamzas
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      // Replace punctuation with spaces
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, ' ')
      // Collapse multiple whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Splits normalized text into discrete searchable tokens
   */
  public static tokenize(text: string): string[] {
    const norm = ArabicNormalizer.normalize(text);
    if (!norm) return [];

    return norm
      .split(' ')
      .filter(token => token.length > 0);
  }

  /**
   * Generates candidate stems by removing common attached Arabic prefixes (ال, و, ف, etc.)
   */
  public static getStemsAndVariants(token: string): string[] {
    const variants = new Set<string>();
    const norm = ArabicNormalizer.normalize(token);
    if (!norm) return [];

    variants.add(norm);

    // If starts with "ال" (Definite Article) and remaining length >= 3
    if (norm.startsWith('ال') && norm.length >= 4) {
      const stripped = norm.substring(2);
      variants.add(stripped);

      // Handle prefixes combined with ال (e.g. والـ, بالـ, كالـ, للـ)
    } else if (norm.startsWith('لل') && norm.length >= 4) {
      variants.add(norm.substring(2));
      variants.add('ال' + norm.substring(2));
    } else if ((norm.startsWith('و') || norm.startsWith('ف') || norm.startsWith('ب') || norm.startsWith('ك')) && norm.length >= 4) {
      const stripped = norm.substring(1);
      variants.add(stripped);
      if (stripped.startsWith('ال') && stripped.length >= 4) {
        variants.add(stripped.substring(2));
      }
    }

    return Array.from(variants);
  }

  /**
   * Computes standard Levenshtein edit distance between two strings
   */
  public static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Typo-tolerance check: finds the closest canonical vocabulary word if the user made a typo
   * E.g. "فستانن" -> "فستان", "عططر" -> "عطر", "فضهه" -> "فضة"
   */
  public static findTypoCorrection(rawQuery: string): { correctedText: string; isCorrected: boolean } {
    const tokens = ArabicNormalizer.tokenize(rawQuery);
    if (tokens.length === 0) return { correctedText: rawQuery, isCorrected: false };

    let isCorrected = false;
    const correctedTokens = tokens.map(token => {
      // If exact token exists in vocab, no correction needed
      const exactMatch = ArabicNormalizer.DESOQ_VOCABULARY.find(
        v => ArabicNormalizer.normalize(v.canonical) === token
      );
      if (exactMatch) return token;

      // Check stems
      const stems = ArabicNormalizer.getStemsAndVariants(token);
      for (const stem of stems) {
        const stemMatch = ArabicNormalizer.DESOQ_VOCABULARY.find(
          v => ArabicNormalizer.normalize(v.canonical) === stem
        );
        if (stemMatch) return token; // Valid word with prefix
      }

      // Look for closest match with edit distance <= 1 (for length >= 3) or <= 2 (for length >= 6)
      const maxAllowedDist = token.length >= 6 ? 2 : (token.length >= 4 ? 1 : 0);
      if (maxAllowedDist === 0) return token;

      let bestCandidate = token;
      let minDistance = 999;

      for (const vocab of ArabicNormalizer.DESOQ_VOCABULARY) {
        const vocabNorm = ArabicNormalizer.normalize(vocab.canonical);
        const dist = ArabicNormalizer.levenshteinDistance(token, vocabNorm);

        if (dist <= maxAllowedDist && dist < minDistance) {
          minDistance = dist;
          bestCandidate = vocabNorm;
          isCorrected = true;
        }
      }

      return bestCandidate;
    });

    return {
      correctedText: correctedTokens.join(' '),
      isCorrected: isCorrected && correctedTokens.join(' ') !== tokens.join(' ')
    };
  }

  /**
   * Returns curated vocabulary suggestions matching a prefix
   */
  public static getPrefixSuggestions(prefix: string, limit: number = 5): Array<{ text: string; type: string; boost: number }> {
    const norm = ArabicNormalizer.normalize(prefix);
    if (!norm || norm.length < 2) return [];

    return ArabicNormalizer.DESOQ_VOCABULARY
      .filter(v => ArabicNormalizer.normalize(v.canonical).includes(norm))
      .sort((a, b) => b.boost - a.boost)
      .slice(0, limit)
      .map(v => ({ text: v.canonical, type: v.type, boost: v.boost }));
  }
}
