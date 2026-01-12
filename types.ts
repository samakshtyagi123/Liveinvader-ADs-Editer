export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export enum SendingStatus {
  Idle,
  Sending,
  Error
}

export type UserRole = 'OWNER' | 'ADMIN' | 'TRUSTED_EDITOR' | 'USER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  joinedAt: number;
  lastActiveAt: number;
  totalTimeSpent: number; // in seconds
}

export interface AccessRequest {
  id: string;
  userId: string;
  username: string;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UsageLog {
  id: string;
  userId: string;
  username: string;
  action: 'LOGIN' | 'LOGOUT';
  timestamp: number;
}