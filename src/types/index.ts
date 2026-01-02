export type TransactionType = "Income" | "Expense";

export type Category =
  | "Bar"
  | "Cafe"
  | "Groceries"
  | "Restaurant"
  | "Fast_Food"
  | "Clothes"
  | "Shoes"
  | "Electronics"
  | "Gifts"
  | "Stationary"
  | "Tools"
  | "Books"
  | "Rent"
  | "Energy"
  | "Utilities"
  | "Maintenance"
  | "Business_Trips"
  | "Public_Transport"
  | "Taxi"
  | "Fuel"
  | "Leasing"
  | "Rental"
  | "Vehicle_Insurance"
  | "Vehicle_Maintenance";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  walletName: string;
  currentBalance: number;
  dateTime: string;
  description: string;
}

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  deadline: string;
  currentSaved: number;
  targetAmount: number;
  completed: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  isDefault?: boolean;
}

export interface SpendData {
  name: string;
  value: number;
}

export interface OverviewData {
  spendAnalytics: {
    daily: { date: string; amount: number }[];
    weekly: { week: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    yearly: { year: string; amount: number }[];
  };
  categorySpends: { category: string; amount: number; fill: string }[];
}
