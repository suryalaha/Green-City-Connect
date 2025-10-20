import { GoogleGenAI } from "@google/genai";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  householdId: string;
  profilePicture?: string;
  subscription: UserSubscription;
  role: 'user';
  status: 'active' | 'restricted' | 'blocked';
}

export interface Admin {
  id: string;
  name: string;
  mobile: string;
  password: string;
  role: 'admin';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface AdminMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  read: boolean;
  sender: 'admin';
}


export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  binSize: 'Small (60L)' | 'Medium (120L)' | 'Large (240L)';
  frequency: 'Weekly' | 'Bi-Weekly';
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'paused' | 'cancelled';
  nextRenewalDate: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface Payment {
  id:string;
  userId: string;
  date: string;
  amount: number;
  status: 'pending' | 'verified' | 'failed' | 'rejected';
  screenshotUrl?: string;
}

export interface WasteLog {
  type: 'wet' | 'dry' | 'mixed';
  timestamp: number;
  fined: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  date: string;
  time: string;
  notes: string;
  reminderEnabled: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  amount?: number;
  paymentStatus?: 'unpaid' | 'paid' | 'failed';
}

export interface Pickup {
  type: 'recycling' | 'compost' | 'general';
  date: string;
}

export interface Complaint {
  id: string;
  userId: string;
  issueType: 'missed-pickup' | 'service-issue' | 'other';
  description: string;
  photo?: string;
  status: 'submitted' | 'in-progress' | 'resolved';
  date: string;
}