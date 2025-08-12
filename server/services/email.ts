import { EmailSummary, EmailAccount } from '@shared/api';

// Mock data for development - in production this would connect to Gmail API
const MOCK_EMAILS: EmailSummary[] = [
  {
    id: '1',
    sender: 'John Smith',
    senderEmail: 'john@techcorp.com',
    subject: 'Urgent: Project deadline moved up',
    summary: 'Project deadline has been moved from next Friday to this Wednesday due to client requirements. Need immediate action on remaining tasks.',
    originalEmailUrl: 'https://mail.google.com/mail/u/0/#inbox/1',
    importance: 'high',
    tags: ['urgent', 'project', 'deadline'],
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isUnread: true,
    accountEmail: 'user@gmail.com'
  },
  {
    id: '2',
    sender: 'LinkedIn Jobs',
    senderEmail: 'jobs@linkedin.com',
    subject: 'Senior Frontend Developer position at Meta',
    summary: 'New job opportunity matching your profile. Senior Frontend Developer role at Meta, remote-friendly with competitive salary package.',
    originalEmailUrl: 'https://mail.google.com/mail/u/0/#inbox/2',
    importance: 'high',
    tags: ['job offer', 'career'],
    receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isUnread: true,
    accountEmail: 'user@gmail.com'
  },
  {
    id: '3',
    sender: 'Sarah Wilson',
    senderEmail: 'sarah@upwork.com',
    subject: 'Interview scheduled for React project',
    summary: 'Interview scheduled for tomorrow at 2 PM for the React e-commerce project. Please confirm availability and prepare portfolio examples.',
    originalEmailUrl: 'https://mail.google.com/mail/u/0/#inbox/3',
    importance: 'high',
    tags: ['interview', 'client', 'react'],
    receivedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isUnread: true,
    accountEmail: 'user@gmail.com'
  },
  {
    id: '4',
    sender: 'GitHub',
    senderEmail: 'noreply@github.com',
    subject: 'Your pull request was merged',
    summary: 'Pull request #124 for feature/user-authentication has been successfully merged into the main branch.',
    originalEmailUrl: 'https://mail.google.com/mail/u/0/#inbox/4',
    importance: 'medium',
    tags: ['development', 'github'],
    receivedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isUnread: false,
    accountEmail: 'user@gmail.com'
  },
  {
    id: '5',
    sender: 'Freelancer Support',
    senderEmail: 'support@freelancer.com',
    subject: 'Payment received for Web Development project',
    summary: 'Payment of $2,500 has been successfully processed for the completed web development project. Funds will be available in 1-2 business days.',
    originalEmailUrl: 'https://mail.google.com/mail/u/0/#inbox/5',
    importance: 'medium',
    tags: ['payment', 'project'],
    receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isUnread: false,
    accountEmail: 'user@gmail.com'
  },
  {
    id: '6',
    sender: 'Netflix',
    senderEmail: 'info@netflix.com',
    subject: 'Your monthly subscription renewal',
    summary: 'Your Netflix subscription has been renewed for another month. Next billing date is December 15th.',
    originalEmailUrl: 'https://mail.google.com/mail/u/0/#inbox/6',
    importance: 'low',
    tags: ['subscription', 'billing'],
    receivedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isUnread: false,
    accountEmail: 'user@gmail.com'
  }
];

const IMPORTANT_KEYWORDS = [
  'urgent', 'interview', 'client', 'job offer', 'project', 'deadline',
  'payment', 'invoice', 'contract', 'meeting', 'important', 'asap'
];

const IMPORTANT_DOMAINS = [
  'upwork.com', 'freelancer.com', 'linkedin.com', 'indeed.com',
  'glassdoor.com', 'angel.co', 'stackoverflow.com'
];

export class EmailService {
  /**
   * Determine email importance based on keywords and sender domain
   */
  private static determineImportance(subject: string, senderEmail: string): 'high' | 'medium' | 'low' {
    const subjectLower = subject.toLowerCase();
    const domain = senderEmail.split('@')[1]?.toLowerCase() || '';
    
    // Check for important keywords
    const hasImportantKeywords = IMPORTANT_KEYWORDS.some(keyword => 
      subjectLower.includes(keyword)
    );
    
    // Check for important domains
    const isImportantDomain = IMPORTANT_DOMAINS.some(importantDomain => 
      domain.includes(importantDomain)
    );
    
    if (hasImportantKeywords || isImportantDomain) {
      return 'high';
    }
    
    // Check for medium importance indicators
    if (subjectLower.includes('notification') || subjectLower.includes('update')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Extract tags from email content
   */
  private static extractTags(subject: string, senderEmail: string): string[] {
    const tags: string[] = [];
    const subjectLower = subject.toLowerCase();
    const domain = senderEmail.split('@')[1]?.toLowerCase() || '';
    
    // Add keyword-based tags
    IMPORTANT_KEYWORDS.forEach(keyword => {
      if (subjectLower.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Add domain-based tags
    if (domain.includes('linkedin')) tags.push('career');
    if (domain.includes('github')) tags.push('development');
    if (domain.includes('upwork') || domain.includes('freelancer')) tags.push('freelance');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Simulate AI summarization (in production, use actual LLM)
   */
  private static generateSummary(subject: string, content?: string): string {
    // This is a mock implementation. In production, you would:
    // 1. Use a local LLM like BART or T5
    // 2. Or use a free API like Hugging Face Inference API
    // 3. Or integrate with OpenAI/Anthropic APIs
    
    const summaries = [
      `${subject} - Important update requiring immediate attention.`,
      `${subject} - Action required within the specified timeframe.`,
      `${subject} - Information shared for your review and response.`,
      `${subject} - Notification about recent activity or changes.`,
      `${subject} - Follow-up communication regarding ongoing matters.`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  /**
   * Get all emails with summaries
   */
  static async getAllEmails(): Promise<EmailSummary[]> {
    // In production, this would:
    // 1. Connect to Gmail API using OAuth2
    // 2. Fetch unread emails from all connected accounts
    // 3. Process each email through AI summarization
    // 4. Apply importance detection
    
    return MOCK_EMAILS;
  }

  /**
   * Get only important emails
   */
  static async getImportantEmails(): Promise<EmailSummary[]> {
    const allEmails = await this.getAllEmails();
    return allEmails.filter(email => email.importance === 'high');
  }

  /**
   * Search emails by query
   */
  static async searchEmails(query: string): Promise<EmailSummary[]> {
    const allEmails = await this.getAllEmails();
    const queryLower = query.toLowerCase();
    
    return allEmails.filter(email => 
      email.subject.toLowerCase().includes(queryLower) ||
      email.sender.toLowerCase().includes(queryLower) ||
      email.summary.toLowerCase().includes(queryLower) ||
      email.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Get connected email accounts
   */
  static async getAccounts(): Promise<EmailAccount[]> {
    return [
      {
        email: 'user@gmail.com',
        name: 'Primary Account',
        isConnected: true,
        lastSync: new Date().toISOString()
      }
    ];
  }

  /**
   * Sync emails from all accounts
   */
  static async syncEmails(): Promise<{ success: boolean; message: string }> {
    // In production, this would trigger a full sync from Gmail API
    return {
      success: true,
      message: 'Email sync completed successfully'
    };
  }
}
