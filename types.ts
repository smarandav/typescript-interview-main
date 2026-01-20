

export enum CreditScoreCategory {
  Fair = "fair",
  Good = "good",
  Excellent = "excellent",
  Poor = "poor",
  VeryPoor = "very poor"
}

export type Invoice = {
  dueDate: Date;
  status: InvoiceStatus;
};

export enum InvoiceStatus {
  Paid = "PAID",
  Unpaid = "UNPAID"
} 

export type CreditReport = {
  paymentHistory: Invoice[];
  creditUtilisationPercentage: number; // percentage 0.2, 0.5
};
