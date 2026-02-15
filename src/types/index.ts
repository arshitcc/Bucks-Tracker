export type TransactionType = "INCOME" | "EXPENSE";

export type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type ExpenseGroup =
  | "FOOD_AND_DRINKS"
  | "SHOPPING"
  | "HOUSING"
  | "TRANSPORTATION"
  | "VEHICLE"
  | "ENTERTAINMENT"
  | "INVESTMENTS"
  | "INCOME"
  | "LIFE_AND_ENTERTAINMENT"
  | "HEALTH"
  | "EDUCATION"
  | "PERSONAL"
  | "MISCELLANEOUS"
  | "OTHER";

export type ExpenseCategory =
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
  | "Maintainance"
  | "Business_Trips"
  | "Public_Transport"
  | "Taxi"
  | "Fuel"
  | "Leasing"
  | "Rental"
  | "Vehicle_Insurance"
  | "Vehicle_Maintenance";

export type WalletType = "DEFAULT" | "CUSTOM";

export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED" | "PAUSED";

export type GoalTransactionType = "DEPOSIT" | "WITHDRAW";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "TRIALING"
  | "PENDING";

export type PlanType = "FREE" | "PREMIUM";

export interface Transaction {
  id: string;
  walletID: string;
  userID: string;
  type: TransactionType;
  group: ExpenseGroup;
  category: ExpenseCategory;
  receipts: string[];
  description?: string;
  amount: number;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  nextRecurringAt?: string;
  lastProcessedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  userID: string;
  group: ExpenseGroup;
  category: ExpenseCategory;
  limit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userID: string;
  // user : any;
  name: string;
  targetAmount: number;
  savedAmount: number;
  status: GoalStatus;
  deadline: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  amount: number;
  currency: Currency;
  userID: string;
  user: User;
  planType: PlanType;
  status: SubscriptionStatus;
  payments: Payment[];
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Currency {
  INR: "INR";
  USD: "USD";
  EUR: "EUR";
  AED: "AED";
}

export interface PaymentProvider {
  STRIPE: "STRIPE";
  RAZORPAY: "RAZORPAY";
  ZAAKPAY: "ZAAKPAY";
  UNKNOWN: "UNKNOWN";
}

export interface PaymentMethod {
  DEBIT_CARD: "DEBIT_CARD";
  UPI: "UPI";
  CREDIT_CARD: "CREDIT_CARD";
  CASH: "CASH";
  NET_BANKING: "NET_BANKING";
}

export interface Payment {
  id: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  amount: Number;
  currency: Currency;
  txnDetails: object;
  subscriptionID: string;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
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

export interface User {
  id: string;
  clerkUserID: string;
  email: string;
  name: string;
  wallets: Wallet[];
  subscriptions: Subscription[];
  plan: PlanType;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBudget extends Budget {
  spent : number
}