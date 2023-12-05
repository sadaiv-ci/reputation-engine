import { REPUTATION_DECIMAL_POINTS, REPUTATION_EXPIRATION_TIME } from "../types"

export const convertToReputationFloat = (r: number) => {
  return parseFloat(r.toFixed(REPUTATION_DECIMAL_POINTS))
}

export const getOneYearAgoTimestamp = (): string => {
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);
  const formattedDate = oneYearAgo.toISOString();
  return formattedDate;
};

export const getTodayTimestamp = (): string => {
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentDate.getFullYear());
  oneYearAgo.setHours(0, 0, 0, 0);
  const formattedDate = oneYearAgo.toISOString();
  return formattedDate;
};

export const calculateWeeksDifference = (dateDifference: number): number => {
  // Convert milliseconds to weeks
  const weeksDifference = dateDifference / (1000 * 60 * 60 * 24 * 7);

  // Round to the nearest whole number of weeks
  return Math.round(weeksDifference);
}

export const getYearDifference = (timestamp1: string, timestamp2: string): number => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const timeDifference = Math.abs(date2.getTime() - date1.getTime());
  const yearDifference = timeDifference / (1000 * 3600 * 24 * 365);

  return Math.floor(yearDifference);
};

export const denominateAndScale = (originalReputation: number, totalReputationParameters: number): number => {
  const denominatedReputation = convertToReputationFloat(originalReputation / totalReputationParameters)

  // Scaling the reputation value.
  const scalingFactor = 5
  const multiplier = 1000

  const r = multiplier * Math.pow(scalingFactor, denominatedReputation)

  return convertToReputationFloat(r)
}

export const getExpirationTime = (inPast?: boolean): Date => {
  const currentDate = new Date();
  const newDate = new Date(currentDate);

  // 2 weeks (14 days) from the current date
  if (inPast) {
    newDate.setDate(currentDate.getDate() - REPUTATION_EXPIRATION_TIME);
  } else {
    newDate.setDate(currentDate.getDate() + REPUTATION_EXPIRATION_TIME);
  }

  return newDate;
};