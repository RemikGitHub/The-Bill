import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;

export interface Settlement {
  id: string;
  name: string;
  description?: string;
  mainCurrencyCode: string;
  expenses: number;
  participants: number;
  permissions: {};
}

export interface Participant {
  id: string;
  name: string;
  spends: Spend[];
  balances: Spend[];
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  currencyCode: string;
  participantId: string;
  debtorsId: string[];
  date?: Timestamp;
  photoUrl?: string;
}

export interface Spend {
  currencyCode: string;
  value: number;
}
