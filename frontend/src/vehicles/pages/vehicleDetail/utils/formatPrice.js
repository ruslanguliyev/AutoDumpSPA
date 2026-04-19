import { getCurrencySymbol } from "./currency";
import { formatInt } from "./formatInt";

export const formatPrice = (value, currency) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${formatInt(n)}`;
};
