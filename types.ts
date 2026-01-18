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

export type CreditScoreCategoryRange = {
  value : number;
  start: number;
  end: number;
}

export const creditScoreCategoryMap: Map<CreditScoreCategory, CreditScoreCategoryRange> = new Map([
  [CreditScoreCategory.EXCELLENT, { value : 999, start : 0, end :0.3}],
  [CreditScoreCategory.GOOD, {value : 960, start : 0.3, end :0.5}],
  [CreditScoreCategory.FAIR, {value : 880, start : 0.5, end :0.7}],
  [CreditScoreCategory.POOR, {value : 720, start : 0.7, end :0.9}],
  [CreditScoreCategory.VERY_POOR, {value : 560, start : 0.9, end :1}]
]);

