import { expect, describe, it } from "vitest";
import { getCreditScore } from "./credit-score";
import { CreditReport, CreditScore, Invoice, InvoiceStatus, CreditScoreCategory, creditScoreCategoryMap } from "./types";
import { subMonths, subDays, addDays, addMonths, subHours, addHours, startOfDay, endOfDay, differenceInDays } from 'date-fns';

describe("getCreditScore", () => {
  it("should return 560 if the credit utilisation is more than 90%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.95,
    };

    const creditScore = getCreditScore(creditReport);

    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.VERY_POOR)!);
    expect(creditScore.category).toBe(CreditScoreCategory.VERY_POOR);
  });

  it("should return 720 if there are any unpaid invoices past due older than 6 months", () => {
    const creditReport = {
      paymentHistory: [{ dueDate: subMonths(Date.now(), 7), status: InvoiceStatus.UNPAID }] as Invoice[],
      creditUtilisationPercentage: 0.4,
    };
    const creditScore = getCreditScore(creditReport, new Date());
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.POOR)!);
    expect(creditScore.category).toBe(CreditScoreCategory.POOR);
  });

   it("should return 720 if there are any unpaid invoices past due less than 6 months downgrade by one band", () => {
    const creditReport = {
      paymentHistory: [{ dueDate: subMonths(Date.now(), 4), status: InvoiceStatus.UNPAID },
        { dueDate: subMonths(Date.now(), 3), status: InvoiceStatus.UNPAID },
        { dueDate: subMonths(Date.now(), 2), status: InvoiceStatus.UNPAID }
      ] as Invoice[],
      creditUtilisationPercentage: 0.6,
    };
    const creditScore = getCreditScore(creditReport, new Date());
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.POOR)!);
    expect(creditScore.category).toBe(CreditScoreCategory.POOR);
  });

   it("should return 720 if the credit utilisation is between 70% and 90%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.8,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.POOR)!);
    expect(creditScore.category).toBe(CreditScoreCategory.POOR);
  });

  it("should return 880 if the credit utilisation is between 50% and 70%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.6,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.FAIR)!);
    expect(creditScore.category).toBe(CreditScoreCategory.FAIR);
  });

  it("should return 960 if the credit utilisation is between 30% and 50%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.4,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.GOOD)!);
    expect(creditScore.category).toBe(CreditScoreCategory.GOOD);
  });

  it("should return 999 if the credit utilisation is less than 30%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.2,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore.value).toBe(creditScoreCategoryMap.get(CreditScoreCategory.EXCELLENT)!);
    expect(creditScore.category).toBe(CreditScoreCategory.EXCELLENT);
  });
});
