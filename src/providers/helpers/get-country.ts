export const COUNTRY_REGEX = /\b(USA|US|America|UK|GB|AU|Australia)\b/i;
export const COUNTRY_MAP = new Map<string, string>([
  ["USA", "US"],
  ["AMERICA", "US"],
  ["GB", "UK"],
  ["AUSTRALIA", "AU"],
]);

export const getCountry = (name: string) => {
  const match = COUNTRY_REGEX.exec(name);
  if (match) {
    const alias = match[1].toUpperCase();
    return COUNTRY_MAP.get(alias) || alias;
  }
};
