import { REPUTATION_DECIMAL_POINTS } from "../types"

export const convertToReputationFloat = (r: number) => {
  return parseFloat(r.toFixed(REPUTATION_DECIMAL_POINTS))
}

export const getYearDifference = (timestamp1: string, timestamp2: string): number => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const timeDifference = Math.abs(date2.getTime() - date1.getTime());
  const yearDifference = timeDifference / (1000 * 3600 * 24 * 365);

  return Math.floor(yearDifference);
};