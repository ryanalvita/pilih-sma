import raw from "./snbp.json";
import universityDirectory from "./universities.json";
import webometricsRanking from "./webometrics-2026.json";

export interface SchoolRecord {
  school: string;
  schoolNumber: string | null;
  year: number;
  track: string;
  accepted: number | null;
  universities: Record<string, number>;
  hasBreakdown: boolean;
  source: string | null;
  note: string | null;
}

export interface School {
  name: string;
  slug: string;
  schoolNumber: string | null;
  type: "negeri" | "swasta";
}

const data = raw as {
  universities: string[];
  schools: School[];
  records: SchoolRecord[];
};

export const ALL_UNIVERSITIES = data.universities;
export const ALL_SCHOOLS = data.schools;
export const ALL_RECORDS = data.records;

export const YEARS = [2024, 2025, 2026];

export function recordsForSchool(slug: string): SchoolRecord[] {
  const school = ALL_SCHOOLS.find((s) => s.slug === slug);
  if (!school) return [];
  return ALL_RECORDS.filter((r) => r.school === school.name).sort(
    (a, b) => b.year - a.year,
  );
}

export function schoolBySlug(slug: string): School | undefined {
  return ALL_SCHOOLS.find((s) => s.slug === slug);
}

/** accepted total, per school, per year -> number|null */
export function acceptedByYear(
  schoolName: string,
): Record<number, number | null> {
  const out: Record<number, number | null> = {};
  for (const y of YEARS) out[y] = null;
  for (const r of ALL_RECORDS) {
    if (r.school === schoolName) out[r.year] = r.accepted;
  }
  return out;
}

/** accepted total to one university, per school, per year -> number|null (null = breakdown unknown, not zero) */
export function universityAcceptedByYear(
  schoolName: string,
  university: string,
): Record<number, number | null> {
  const out: Record<number, number | null> = {};
  for (const y of YEARS) out[y] = null;
  for (const r of ALL_RECORDS) {
    if (r.school === schoolName && r.hasBreakdown)
      out[r.year] = r.universities[university] ?? 0;
  }
  return out;
}

/** ITB-accepted total, per school, per year -> number|null (only when breakdown known) */
export function itbByYear(schoolName: string): Record<number, number | null> {
  return universityAcceptedByYear(schoolName, "ITB");
}

export function topUniversities(
  records: SchoolRecord[],
  limit = 8,
): [string, number][] {
  const totals: Record<string, number> = {};
  for (const r of records) {
    for (const [uni, count] of Object.entries(r.universities)) {
      totals[uni] = (totals[uni] ?? 0) + count;
    }
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

/**
 * Every university that appears in at least one record, ordered for the
 * homepage filter dropdown: ranked ones first (by Webometrics 2026 Indonesia
 * rank, best first), then the rest — universities Webometrics doesn't cover
 * (mostly vocational/regional institutes) — ordered by how many local
 * students got in, same heuristic as `topUniversities`.
 */
export function rankedUniversities(): string[] {
  const byPopularity = topUniversities(
    ALL_RECORDS,
    ALL_UNIVERSITIES.length,
  ).map(([name]) => name);
  const ranked: string[] = [];
  const unranked: string[] = [];
  for (const u of byPopularity) {
    (universityWebometricsRank(u) != null ? ranked : unranked).push(u);
  }
  ranked.sort(
    (a, b) => universityWebometricsRank(a)! - universityWebometricsRank(b)!,
  );
  return [...ranked, ...unranked];
}

export interface SchoolSummary extends School {
  accepted: Record<number, number | null>;
  itb: Record<number, number | null>;
  latestYear: number | null;
}

export function schoolSummaries(): SchoolSummary[] {
  return ALL_SCHOOLS.map((s) => {
    const accepted = acceptedByYear(s.name);
    const itb = itbByYear(s.name);
    const latestYear =
      YEARS.filter((y) => accepted[y] != null).sort((a, b) => b - a)[0] ?? null;
    return { ...s, accepted, itb, latestYear };
  });
}

// --- University metadata --------------------------------------------------
//
// `universities.json` is the full PTN (public university) roster under
// Kemendikbudristek — sourced from Wikipedia's "Daftar perguruan tinggi
// negeri di Indonesia" — kept independent of snbp.json so it isn't tied to
// Bandung and can be reused as coverage expands to other cities.
//
// The `universities` strings inside snbp.json are its `abbreviation` values
// directly (raw_data.tsv's columns are named to match this roster exactly),
// so lookup is a plain key match — no alias/fuzzy-matching layer needed. A
// handful of raw_data.tsv columns legitimately have no entry here because
// they're outside Kemendikbudristek's PTN scope (Kemenag for the two UIN
// entries, Kemenkes, Kementerian ESDM) or are a private university
// (Universitas Tarumanegara) — universityInfo returns undefined for those.
export interface UniversityInfo {
  name: string;
  abbreviation: string;
  type: "universitas" | "institut" | "politeknik" | "akademi-komunitas";
  foundedYear: number;
  province: string;
  accreditation: string;
}

export const UNIVERSITY_DIRECTORY = universityDirectory as UniversityInfo[];

/** looks up a university string (as stored in snbp.json) against the PTN roster */
export function universityInfo(name: string): UniversityInfo | undefined {
  return UNIVERSITY_DIRECTORY.find((u) => u.abbreviation === name);
}

// Full names for the handful of abbreviations that fall outside
// universities.json's Kemendikbudristek-only scope (see comment above) but
// still need a readable label. `Universitas Tarumanegara` isn't listed here
// because its abbreviation in snbp.json already *is* the full name.
const ABBREVIATION_NAME_OVERRIDES: Record<string, string> = {
  "UIN SGD": "Universitas Islam Negeri Sunan Gunung Djati",
  "UIN MALIKI": "Universitas Islam Negeri Maulana Malik Ibrahim",
  "PEM Akamigas": "Politeknik Energi dan Mineral Akamigas",
  "Poltekkes Bandung": "Politeknik Kesehatan Kemenkes Bandung",
};

/** full name for a university string (as stored in snbp.json), falling back to the string itself */
export function universityFullName(name: string): string {
  return (
    universityInfo(name)?.name ?? ABBREVIATION_NAME_OVERRIDES[name] ?? name
  );
}

/** display label: "Full Official Name - ABBR" when a full name is known, else the raw string as-is */
export function universityLabel(name: string): string {
  const fullName = universityFullName(name);
  return fullName === name ? name : `${fullName} - ${name}`;
}

// --- Webometrics ranking ----------------------------------------------------
//
// `webometrics-2026.json` is the "Daftar Universitas Terbaik di Indonesia
// versi Webometrics 2026" table, deduplicated by name (a few institutions —
// ITB, IPB, ITS — appear twice under slightly different names/ranks; we keep
// the better rank). It's independent of `raw_data.tsv`/`universities.json`,
// so it stays valid as coverage expands beyond Bandung. Universities outside
// the top 100 (or outside Webometrics' scope, e.g. some Kemenag/vocational
// institutes) simply have no entry — `universityWebometricsRank` returns
// undefined for those rather than a fabricated rank.
const WEBOMETRICS_RANK_BY_NAME = new Map<string, number>(
  (webometricsRanking as { rank: number; name: string }[]).map((w) => [
    w.name,
    w.rank,
  ]),
);

/** Webometrics 2026 Indonesia rank for a university string (as stored in snbp.json), or undefined if unranked */
export function universityWebometricsRank(name: string): number | undefined {
  return WEBOMETRICS_RANK_BY_NAME.get(universityFullName(name));
}
