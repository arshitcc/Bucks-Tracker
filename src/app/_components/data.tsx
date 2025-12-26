import {  WalletIcon, TargetIcon, SparklesIcon,BellIcon, TrendingUpIcon } from "lucide-react";

const features = [
  {
    title: "Smart Wallets",
    description:
      "Organize your finances with multiple wallets. Track spending across different accounts and categories effortlessly.",
    icon: <WalletIcon className="h-6 w-6 text-primary" />,
  },
  {
    title: "Goal Setting",
    description:
      "Set financial goals and track your progress. Stay motivated with visual insights and milestone celebrations.",
    icon: <TargetIcon className="h-6 w-6 text-primary" />,
  },
  {
    title: "Budget Management",
    description:
      "Create custom budgets for any category. Get alerts when you're approaching your limits to stay on track.",
    icon: <TargetIcon className="h-6 w-6 text-primary" />,
  },
  {
    title: "AI Receipt Scanner",
    description:
      "Scan receipts instantly with AI-powered recognition. No more manual entry, just snap and go.",
    icon: <SparklesIcon className="h-6 w-6 text-primary" />,
  },
  {
    title: "Email Alerts",
    description:
      "Stay informed with smart notifications. Get timely updates about your spending and budget status.",
    icon: <BellIcon className="h-6 w-6 text-primary" />,
  },
  {
    title: "Smart Insights",
    description:
      "Receive personalized recommendations to optimize your spending and reach your financial goals faster.",
    icon: <TrendingUpIcon className="h-6 w-6 text-primary" />,
  },
];

const testimonials = [
  {
    quote:
      "Bucks Tracker has completely transformed how I manage my money. The AI receipt scanner alone saves me hours every month!",
    name: "Sarah Johnson",
    role: "Small Business Owner",
  },
  {
    quote:
      "I've tried many expense trackers, but this is by far the most intuitive and powerful. The budget alerts keep me accountable.",
    name: "Michael Chen",
    role: "Financial Consultant",
  },
  {
    quote:
      "The goal-setting feature helped me save for my dream vacation. I love seeing my progress visualized so clearly!",
    name: "Emily Rodriguez",
    role: "Marketing Manager",
  },
];

const freeFeatures = [
  "General wallets",
  "Set goals",
  "Set budgets for categories",
  "Visualize transactions",
  "Basic expense tracking",
  "Mobile app access",
];

const premiumFeatures = [
  "Everything in Free",
  "AI Receipt Scanner",
  "Email alerts & notifications",
  "Manage up to 10 goals",
  "Create up to 20 wallets",
  "Manage up to 100 budgets",
  "Personalized expense recommendations",
  "Priority support",
];

export { features, testimonials, freeFeatures, premiumFeatures };
