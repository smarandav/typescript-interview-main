import { expect, describe, it } from "vitest";
import { calculatePercentage, getCreditScore } from "./credit-score";
import { CreditReport, CreditScore, Invoice, InvoiceStatus, CreditScoreCategory, creditScoreCategoryMap } from "./types";
import { subMonths, subDays, addDays, addMonths, subHours, addHours, startOfDay, endOfDay, differenceInDays, isThisYear } from 'date-fns';

describe("getCreditScore", () => {
  it("should throw TypeError if creditUtilisationPercentage is NaN", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: NaN,
    };
    expect(() => getCreditScore(creditReport)).toThrow(TypeError);
  });

  it("should throw TypeError if creditUtilisationPercentage is Infinity", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: Infinity,
    };
    expect(() => getCreditScore(creditReport)).toThrow(TypeError);
  });

  it("should throw TypeError if creditUtilisationPercentage is -Infinity", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: -Infinity,
    };
    expect(() => getCreditScore(creditReport)).toThrow(TypeError);
  });

  it("should throw ValidationError if creditUtilisationPercentage is 0", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0,
    };
    expect(() => getCreditScore(creditReport)).toThrow();
  });

  it("should throw ValidationError if creditUtilisationPercentage is greater than 1", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 1.01,
    };
    expect(() => getCreditScore(creditReport)).toThrow();
  });
  it("should return 560 if the credit utilisation is more than 90%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.95,
    };

    const creditScore = getCreditScore(creditReport);

    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.POOR)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.POOR);
  });

  it("should return 880 if perfect history in last 12 months", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.9,
    };
    const creditScore = getCreditScore(creditReport, new Date());
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.FAIR)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.FAIR);
  });

  it("should return 720 if there are any unpaid invoices past due older than 6 months", () => {
    const creditReport = {
      paymentHistory: [{ dueDate: subMonths(Date.now(), 7), status: InvoiceStatus.UNPAID }] as Invoice[],
      creditUtilisationPercentage: 0.4,
    };
    const creditScore = getCreditScore(creditReport, new Date());
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.POOR)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.POOR);
  });

   it("should return 560 if there are any unpaid invoices past due less than 6 months downgrade by one band", () => {
    const creditReport = {
      paymentHistory: [{ dueDate: subMonths(Date.now(), 4), status: InvoiceStatus.UNPAID },
        { dueDate: subMonths(Date.now(), 3), status: InvoiceStatus.UNPAID },
        { dueDate: subMonths(Date.now(), 2), status: InvoiceStatus.UNPAID }
      ] as Invoice[],
      creditUtilisationPercentage: 0.5,
    };
    const creditScore = getCreditScore(creditReport, new Date());
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.POOR)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.POOR);
  });

   it("should return 720 if there are any unpaid invoices past due less than 6 months and already very poor keep band", () => {
    const creditReport = {
      paymentHistory: [{ dueDate: subMonths(Date.now(), 4), status: InvoiceStatus.UNPAID },
        { dueDate: subMonths(Date.now(), 3), status: InvoiceStatus.UNPAID },
        { dueDate: subMonths(Date.now(), 2), status: InvoiceStatus.UNPAID }
      ] as Invoice[],
      creditUtilisationPercentage: 0.91,
    };
    const creditScore = getCreditScore(creditReport, new Date());
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.VERY_POOR)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.VERY_POOR);
  });

   it("should return 720 if the credit utilisation is between 70% and 90%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.8,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.FAIR)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.FAIR);
  });

  it("should return 880 if the credit utilisation is between 50% and 70%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.6,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.GOOD)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.GOOD);
  });

  it("should return 960 if the credit utilisation is between 30% and 50%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.4,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.EXCELLENT)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.EXCELLENT);
  });

  it("should return 999 if the credit utilisation is less than 30%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.1,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.EXCELLENT)!.value);
    expect(creditScore.category).toBe(CreditScoreCategory.EXCELLENT);
  });
});

describe("calculatePercentage", () => {
  it("returns 0 when total is 0 - avoids devision by 0", () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it("calculates a ratio rounded to two decimals", () => {
    expect(calculatePercentage(1,4)).toBe(0.25);
  });

  it("throws when not a number or infinit values", () => {
    expect(() => calculatePercentage(Number.NaN, 1)).toThrow(TypeError);
    expect(() => calculatePercentage(1, Number.NEGATIVE_INFINITY)).toThrow(TypeError);
  })
});