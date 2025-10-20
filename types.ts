import { GoogleGenAI } from "@google/genai";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  householdId: string;
  profilePicture?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface Payment {
  id:string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

export interface WasteLog {
  type: 'wet' | 'dry' | 'mixed';
  timestamp: number;
  fined: boolean;
}

export interface Booking {
  id: string;
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
  issueType: 'missed-pickup' | 'service-issue' | 'other';
  description: string;
  photo?: string;
  status: 'submitted' | 'in-progress' | 'resolved';
  date: string;
}