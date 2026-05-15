// sessionStorage を使ったペルソナキャッシュ
// キー: 商品情報のハッシュ（JSON文字列をbtoa でBase64エンコード）
// 値: PersonaDetails[] のJSON

import type { ProductInfo, PersonaDetails } from "./types";

const CACHE_PREFIX = "persona_cache_";

/**
 * ProductInfo からキャッシュキーを生成する。
 * JSON.stringify した文字列を btoa でBase64エンコードして軽量ハッシュとして使用。
 */
export function getCacheKey(productData: ProductInfo): string {
  const json = JSON.stringify(productData);
  // btoa は ASCII 範囲外の文字を含む場合にエラーになるため、
  // encodeURIComponent → unescape を経由して安全にBase64化する。
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return CACHE_PREFIX + encoded;
}

/**
 * sessionStorage からペルソナ一覧を取得する。
 * 存在しない場合・パース失敗の場合は null を返す。
 */
export function getCachedPersonas(key: string): PersonaDetails[] | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as PersonaDetails[];
  } catch {
    return null;
  }
}

/**
 * ペルソナ一覧を sessionStorage に保存する。
 * プライベートブラウジング等で書き込み不可な場合は無視する。
 */
export function setCachedPersonas(key: string, personas: PersonaDetails[]): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(personas));
  } catch {
    // プライベートブラウジングなど書き込み不可の場合は何もしない
  }
}
