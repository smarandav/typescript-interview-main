import { CreditReport, CreditScore, CreditScoreCategory, InvoiceStatus, creditScoreCategoryMap } from "./types";
import { subMonths } from 'date-fns';

/**
 *
 * @param c the credit report for a user
 * @returns a credit score with a value and category
 * 
 * If there are any unpaid invoices past due, cap category at "poor" or "very poor"

If > N late/unpaid in last 6 months → downgrade by one band

If perfect history in last 12 months → bump up one band (or keep at excellent)
 */

export const getCreditScore = (c: CreditReport, now: Date = new Date()): CreditScore => {

  if (c.paymentHistory.find(s => s.status === InvoiceStatus.UNPAID 
    && s.dueDate <  subMonths(now, 6)))
  {
     return {
      value: 720,
      category: CreditScoreCategory.POOR,
    };
  }

  if (c.paymentHistory.filter(s => s.status === InvoiceStatus.UNPAID 
    && s.dueDate > subMonths(now, 6)).length > 2)
  {
     c.creditUtilisationPercentage += 0.3;
  }

  const x = c.creditUtilisationPercentage;

  var creditCategory = creditScoreCategoryRanges.find(r => x > r.start && x <=r.end);
  if (!creditCategory) {
    var excellentCategory = creditScoreCategoryRanges.find(r => r.category == CreditScoreCategory.EXCELLENT);
    return {
      value: excellentCategory!.value,
      category: excellentCategory!.category,
    };
  }
  return { value : creditCategory.value, category: creditCategory.category};
};

const creditScoreCategoryRanges = [
  { start: 0, end: 0.3, value: creditScoreCategoryMap.get(CreditScoreCategory.EXCELLENT)!, category: CreditScoreCategory.EXCELLENT },
  { start: 0.3, end: 0.5, value: creditScoreCategoryMap.get(CreditScoreCategory.GOOD)!, category: CreditScoreCategory.GOOD },
  { start: 0.5, end: 0.7, value: creditScoreCategoryMap.get(CreditScoreCategory.FAIR)!, category: CreditScoreCategory.FAIR },
  { start: 0.7, end: 0.9, value: creditScoreCategoryMap.get(CreditScoreCategory.POOR)!, category: CreditScoreCategory.POOR },
  { start: 0.9, end: 1, value: creditScoreCategoryMap.get(CreditScoreCategory.VERY_POOR)!, category: CreditScoreCategory.VERY_POOR }
];

/**
 * @param value  value to calculate percentage
 * @param total total value
 * @returns percentage with 2 decimal places. E.g. 0.25
 */
const calculatePercentage = (value: number, total: number) => {
  return Math.round((value / total) * 100) / 100;
};

