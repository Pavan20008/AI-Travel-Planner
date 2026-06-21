export interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: string;
}

export interface ItineraryDay {
  dayNumber: number;
  activities: Activity[];
}

export interface Hotel {
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
}

export interface PackingItem {
  _id?: string;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

export interface EstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  packingList: PackingItem[];
  estimatedBudget: EstimatedBudget;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateTripPayload {
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
}
