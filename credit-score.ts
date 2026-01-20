import { CreditReport, CreditScoreCategory, InvoiceStatus } from "./types";
import { subMonths, addMonths } from 'date-fns';


export type Band = {
  value: number;
  category: CreditScoreCategory,
  min: number,
  max: number
}

export const _bands: Band[] = [
  {
    value: 999,
    category: CreditScoreCategory.Excellent,
    min: Number.NEGATIVE_INFINITY,
    max: 0.3
  },
  {
    value: 960,
    category: CreditScoreCategory.Good,
    min: 0.3,
    max: 0.5
  },
  {
    value: 880,
    category: CreditScoreCategory.Fair,
    min: 0.5,
    max: 0.7
  },
  {
    value: 720,
    category: CreditScoreCategory.Poor,
    min: 0.7,
    max: 0.9
  },
  {
    value: 560,
    category: CreditScoreCategory.VeryPoor,
    min: 0.9,
    max: Number.POSITIVE_INFINITY
  }];

export const _bandMap: Map<CreditScoreCategory, Band> =
  new Map(_bands.map((band: Band) => [band.category, band]));



export class CreditScore {
  constructor(
    public value: number,
    public category: CreditScoreCategory
  ) {}

  static fromCategory(category: CreditScoreCategory): CreditScore {
    const band = _bandMap.get(category);
    if (!band) {
      throw new RangeError(`No band found for CreditScoreCategory ${category}`);
    }
    return new CreditScore(band.value, category);
  }
}

/**
 *
 * @param c the credit report for a user
 * @returns a credit score with a value and category
 */
export const getCreditScore = (c: CreditReport): CreditScore => {
  const x = c.creditUtilisationPercentage;

  if (!Number.isFinite(x)){
    throw new TypeError("creditUtilisationPercentage must be a finite number");
  }

  var overdueInvoicesInPast6Months = c.paymentHistory.filter(p => p.status == InvoiceStatus.Unpaid && 
      p.dueDate < new Date() && p.dueDate > addMonths(new Date(), -6));
  if (overdueInvoicesInPast6Months.length >= 2)
  {
    return CreditScore.fromCategory(CreditScoreCategory.VeryPoor);
  }

  var band = _bands.find(b => x > b.min && x<=b.max);
  if (band!.value > 720) { 
    var overdueInvoice = c.paymentHistory.find(p => p.status == InvoiceStatus.Unpaid && 
      p.dueDate < new Date());

    if (overdueInvoice)
    {
      return CreditScore.fromCategory(CreditScoreCategory.Poor);
    }
  }

  return new CreditScore(band!.value, band!.category);
};

/**
 * @param value  value to calculate percentage
 * @param total total value
 * @returns percentage with 2 decimal places. E.g. 0.25
 */
export const calculatePercentage = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total)) {
    throw new TypeError('value and total must be finite numbers');
  }

  if (total === 0)
  {
    return 0;
  }

  return Math.round((value / total) * 100) / 100;
};
