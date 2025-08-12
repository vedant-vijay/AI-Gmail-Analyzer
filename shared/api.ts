/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Email types for the AI Email Assistant
 */
export interface EmailSummary {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  summary: string;
  originalEmailUrl: string;
  importance: 'high' | 'medium' | 'low';
  tags: string[];
  receivedAt: string;
  isUnread: boolean;
  accountEmail: string;
  aiAnalysis?: {
    actionItems: string[];
    urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
    suggestedResponse?: string;
    deadline?: string;
    category: 'client_work' | 'job_opportunity' | 'payment' | 'meeting' | 'marketing' | 'personal' | 'other';
    tips: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    estimatedReadTime: string;
  };
}

export interface EmailsResponse {
  emails: EmailSummary[];
  total: number;
  unreadCount: number;
}

export interface SearchEmailsRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface EmailAccount {
  email: string;
  name: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface AccountsResponse {
  accounts: EmailAccount[];
}
