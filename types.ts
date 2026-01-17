export type CreditScore = {
  value: number;
  category: CreditScoreCategory;
};

export enum CreditScoreCategory {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  VERY_POOR = "very poor"
}

export type Invoice = {
  dueDate: Date;
  status: InvoiceStatus;
};

export enum InvoiceStatus {
  PAID = "PAID",
  UNPAID = "UNPAID"
}

export type CreditReport = {
  paymentHistory: Invoice[];
  creditUtilisationPercentage: number; // percentage 0.2, 0.5
};

export const creditScoreCategoryMap: Map<CreditScoreCategory, number> = new Map([
  [CreditScoreCategory.EXCELLENT, 999],
  [CreditScoreCategory.GOOD, 960],
  [CreditScoreCategory.FAIR, 880],
  [CreditScoreCategory.POOR, 720],
  [CreditScoreCategory.VERY_POOR, 560]
]);
