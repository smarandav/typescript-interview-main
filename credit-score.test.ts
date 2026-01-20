import { expect, describe, it } from "vitest";
import { getCreditScore, _bandMap, calculatePercentage, CreditScore } from "./credit-score";
import { CreditScoreCategory, InvoiceStatus } from "./types";
import { subMonths, addMonths } from 'date-fns';

describe("getCreditScore", () => {
  it("should return very poor if there are at least two overdue unpaid invoices in past 6 months", () => {
    const creditReport = {
      paymentHistory: [ {dueDate : addMonths(new Date(), -1), status: InvoiceStatus.Unpaid},
        {dueDate : addMonths(new Date(), -5), status: InvoiceStatus.Unpaid}
      ],
      creditUtilisationPercentage: 0.3,
    };

    expect(getCreditScore(creditReport)).toEqual(CreditScore.fromCategory(CreditScoreCategory.VeryPoor));
  });

  it("should return poor if there is any overdue unpaid invoice", () => {
    const creditReport = {
      paymentHistory: [ {dueDate : addMonths(new Date(), -1), status: InvoiceStatus.Unpaid}],
      creditUtilisationPercentage: 0.3,
    };

    expect(getCreditScore(creditReport)).toEqual(CreditScore.fromCategory(CreditScoreCategory.Poor));
  });

  it("should return very poor if creditUtilisationPercentage is over 90% and there is any overdue unpaid invoice", () => {
    const creditReport = {
      paymentHistory: [ {dueDate : addMonths(new Date(), -1), status: InvoiceStatus.Unpaid}],
      creditUtilisationPercentage: 0.95,
    };

    expect(getCreditScore(creditReport)).toEqual(CreditScore.fromCategory(CreditScoreCategory.VeryPoor));
  });

  it("showd throw type error when creditUtilisationPercentage is not a finite number")
  {
    expect(() => getCreditScore(
      { paymentHistory: [], creditUtilisationPercentage: Number.NaN})).toThrow(TypeError);
  }

  it("should return very poor if the credit utilisation is more than 90%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.95,
    };

    const creditScore = getCreditScore(creditReport);

    expect(creditScore).toEqual(CreditScore.fromCategory(CreditScoreCategory.VeryPoor));
  });

  it("should return poor if the credit utilisation is between 70% and 90%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.8,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore).toEqual(CreditScore.fromCategory(CreditScoreCategory.Poor));
    expect(getCreditScore({ paymentHistory: [], creditUtilisationPercentage: 0.9}))
      .toEqual(CreditScore.fromCategory(CreditScoreCategory.Poor));
  });

  it("should return fair if the credit utilisation is between 50% and 70%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.6,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore).toEqual(CreditScore.fromCategory(CreditScoreCategory.Fair));
  });

  it("should return good if the credit utilisation is between 30% and 50%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.4,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore).toEqual(CreditScore.fromCategory(CreditScoreCategory.Good));
  });

  it("should return excellent if the credit utilisation is less than 30%", () => {
    const creditReport = {
      paymentHistory: [],
      creditUtilisationPercentage: 0.2,
    };
    const creditScore = getCreditScore(creditReport);
    expect(creditScore).toEqual(CreditScore.fromCategory(CreditScoreCategory.Excellent));
  });
});

describe("calculatePercentage", () => {
  it("should return 0 when total is 0", () => {
    expect(calculatePercentage(1, 0)).toBe(0);
  });

  it("should throw TypeError when NEGATIVE_INFINITY", () => {
    expect(() => calculatePercentage(1, Number.NEGATIVE_INFINITY)).toThrow(TypeError);
  });
});
