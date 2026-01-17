import { CreditReport, CreditScore } from "./types";

/**
 *
 * @param c the credit report for a user
 * @returns a credit score with a value and category
 */
export const getCreditScore = (c: CreditReport): CreditScore => {
  const x = c.creditUtilisationPercentage;

  if (x > 0.3 && x <= 0.5) {
    return {
      value: 960,
      category: "good",
    };
  } else if (x > 0.5 && x <= 0.7) {
    return {
      value: 880,
      category: "fair",
    };
  } else if (x > 0.7 && x <= 0.9) {
    return {
      value: 720,
      category: "poor",
    };
  } else if (x > 0.9) {
    return {
      value: 560,
      category: "very poor",
    };
  }

  return {
    value: 999,
    category: "excellent",
  };
};

/**
 * @param value  value to calculate percentage
 * @param total total value
 * @returns percentage with 2 decimal places. E.g. 0.25
 */
const calculatePercentage = (value: number, total: number) => {
  return Math.round((value / total) * 100) / 100;
};
