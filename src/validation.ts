import type { ProductInfo } from "./types";
import {
  FamilyType, PetOwnership, FinancialAssets, HousingType,
} from "./types";

// ============================================================
// 型ガード
// ============================================================

const FAMILY_TYPES: FamilyType[] = ['', '単身', '夫婦のみ', '夫婦+子', 'ひとり親', '三世代同居'];
const PET_TYPES: PetOwnership[] = ['', 'なし', '犬', '猫', '両方', 'その他'];
const FINANCIAL_ASSETS: FinancialAssets[] = ['', '~100万', '100~500万', '500~1000万', '1000~3000万', '3000万以上'];
const HOUSING_TYPES: HousingType[] = ['', '賃貸', '持ち家(マンション)', '持ち家(戸建て)'];

export function toFamilyType(v: string): FamilyType {
  return FAMILY_TYPES.includes(v as FamilyType) ? (v as FamilyType) : '';
}
export function toPetOwnership(v: string): PetOwnership {
  return PET_TYPES.includes(v as PetOwnership) ? (v as PetOwnership) : '';
}
export function toFinancialAssets(v: string): FinancialAssets {
  return FINANCIAL_ASSETS.includes(v as FinancialAssets) ? (v as FinancialAssets) : '';
}
export function toHousingType(v: string): HousingType {
  return HOUSING_TYPES.includes(v as HousingType) ? (v as HousingType) : '';
}

// ============================================================
// テキストサニタイズ（プロンプトインジェクション対策）
// ============================================================

const DANGEROUS_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions?/gi,
  /system\s*prompt/gi,
  /<\|.*?\|>/g,       // special tokens
  /\[\[.*?\]\]/g,     // injection brackets
];

export function sanitizeText(text: string): string {
  let result = text.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result;
}

// ============================================================
// フォームバリデーション
// ============================================================

export interface ValidationErrors {
  [key: string]: string;
}

const LIMITS = {
  productName:          { max: 100, label: '商品名' },
  category:             { max: 50,  label: 'カテゴリー' },
  salesChannels:        { max: 200, label: '販売チャネル' },
  featuresAppearance:   { max: 300, label: '外観' },
  featuresFunction:     { max: 500, label: '主な機能・特徴' },
  featuresConcept:      { max: 300, label: 'コンセプト' },
  customerHypothesis:   { max: 500, label: '顧客仮説' },
  assumedNeeds:         { max: 500, label: '想定ニーズ' },
  solutionHypothesis:   { max: 500, label: 'ソリューション仮説' },
};

export function validateProductForm(data: ProductInfo): ValidationErrors {
  const errors: ValidationErrors = {};

  // 必須チェック
  if (!data.productName.trim()) {
    errors.productName = '商品名は必須です';
  } else if (data.productName.length > LIMITS.productName.max) {
    errors.productName = `${LIMITS.productName.label}は${LIMITS.productName.max}文字以内で入力してください`;
  }

  if (!data.category) {
    errors.category = 'カテゴリーを選択してください';
  }

  if (data.price === 0) {
    errors.price = '価格帯を選択してください';
  }

  if (!data.salesChannels) {
    errors.salesChannels = '販売チャネルを選択してください';
  }

  if (!data.features.function.trim()) {
    errors.features = '製品の主な特徴は必須です';
  } else if (data.features.function.length > LIMITS.featuresFunction.max) {
    errors.features = `製品の主な特徴は${LIMITS.featuresFunction.max}文字以内で入力してください`;
  }

  // 文字数チェック（任意フィールド）
  if (data.features.appearance.length > LIMITS.featuresAppearance.max) {
    errors.featuresAppearance = `外観は${LIMITS.featuresAppearance.max}文字以内で入力してください`;
  }
  if (data.features.concept.length > LIMITS.featuresConcept.max) {
    errors.featuresConcept = `コンセプトは${LIMITS.featuresConcept.max}文字以内で入力してください`;
  }
  if (data.customerHypothesis.length > LIMITS.customerHypothesis.max) {
    errors.customerHypothesis = `顧客仮説は${LIMITS.customerHypothesis.max}文字以内で入力してください`;
  }

  // 年齢範囲チェック
  if (data.targetAgeMin >= data.targetAgeMax) {
    errors.ageRange = '最小年齢は最大年齢より小さくしてください';
  }

  return errors;
}
