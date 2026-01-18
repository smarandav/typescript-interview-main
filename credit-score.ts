import { CreditReport, CreditScore, CreditScoreCategory, InvoiceStatus, creditScoreCategoryMap } from "./types";
import { ValidationError } from "./types";
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

  creditScoreCategoryArray.sort(t => t.start);
    const start = Math.min(...creditScoreCategoryArray.map(item => item.start));
    const end = Math.max(...creditScoreCategoryArray.map(item => item.end));

  if (c.creditUtilisationPercentage > 1 || c.creditUtilisationPercentage <= 0)
  {
    throw new ValidationError(`Credit Utilisation Percentage is not within 
                                the accepted range start ${start} and end ${end}`, 
                                "creditUtilisationPercentage", c.creditUtilisationPercentage);
  }

  if (c.paymentHistory.find(s => s.status === InvoiceStatus.UNPAID 
    && s.dueDate <  subMonths(now, 6)))
  {
     return {
      value: 720,
      category: CreditScoreCategory.POOR,
    };
  }

  if (c.creditUtilisationPercentage < creditScoreCategoryMap.get(CreditScoreCategory.VERY_POOR)!.start &&
      c.paymentHistory.filter(s => s.status === InvoiceStatus.UNPAID && s.dueDate > subMonths(now, 6)).length > 2)
  {
     c.creditUtilisationPercentage += 0.21;
  }

  if (c.creditUtilisationPercentage >= creditScoreCategoryMap.get(CreditScoreCategory.EXCELLENT)!.end &&
      c.paymentHistory.filter(s => s.status === InvoiceStatus.UNPAID && 
        s.dueDate > subMonths(now, 6)).length === 0 &&
      c.paymentHistory.filter(s => s.status === InvoiceStatus.PAID &&
        s.dueDate > subMonths(now, 12)).length >= 0)
  {
     c.creditUtilisationPercentage -= 0.2;
  }

  const x = c.creditUtilisationPercentage;

  var creditCategory = creditScoreCategoryArray.find(r => x > r.start && x <=r.end);
  if (!creditCategory) {
    throw new ValidationError(`Credit Utilisation Percentage is not within 
                                the accepted ranges of start ${start} and end ${end}`, 
                                "creditUtilisationPercentage", c.creditUtilisationPercentage);
  }
  return { value : creditCategory.value, category: creditCategory.category};
};

export const creditScoreCategoryArray = Array.from(creditScoreCategoryMap.entries()).map(
  ([category, { start, end, value }]) => ({
    start,
    end,
    value,
    category
  })
);

/**
 * @param value  value to calculate percentage
 * @param total total value
 * @returns percentage with 2 decimal places. E.g. 0.25
 */
const calculatePercentage = (value: number, total: number) => {
  return Math.round((value / total) * 100) / 100;
};

