import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailSummary } from '@shared/api';
import { AIService, EmailAnalysis } from './ai';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/auth/google/callback';

const IMPORTANT_KEYWORDS = [
  'urgent', 'interview', 'client', 'job offer', 'project', 'deadline',
  'payment', 'invoice', 'contract', 'meeting', 'important', 'asap',
  'proposal', 'milestone', 'freelance', 'upwork', 'freelancer'
];

const IMPORTANT_DOMAINS = [
  'upwork.com', 'freelancer.com', 'linkedin.com', 'indeed.com',
  'glassdoor.com', 'angel.co', 'stackoverflow.com', 'fiverr.com',
  'guru.com', '99designs.com', 'toptal.com', 'peopleperhour.com'
];

export class GmailService {
  private oauth2Client: OAuth2Client;
  private aiService: AIService;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    this.aiService = new AIService();
  }

  /**
   * Get OAuth2 authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get user profile information
   */
  async getUserProfile() {
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
  }

  /**
   * Determine email importance based on keywords and sender domain
   */
  private determineImportance(subject: string, senderEmail: string, snippet: string): 'high' | 'medium' | 'low' {
    const textToAnalyze = `${subject} ${snippet}`.toLowerCase();
    const domain = senderEmail.split('@')[1]?.toLowerCase() || '';
    
    // Check for important keywords in subject or snippet
    const hasImportantKeywords = IMPORTANT_KEYWORDS.some(keyword => 
      textToAnalyze.includes(keyword)
    );
    
    // Check for important domains
    const isImportantDomain = IMPORTANT_DOMAINS.some(importantDomain => 
      domain.includes(importantDomain)
    );
    
    if (hasImportantKeywords || isImportantDomain) {
      return 'high';
    }
    
    // Check for medium importance indicators
    if (textToAnalyze.includes('notification') || textToAnalyze.includes('update') || textToAnalyze.includes('reminder')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Extract tags from email content
   */
  private extractTags(subject: string, senderEmail: string, snippet: string): string[] {
    const tags: string[] = [];
    const textToAnalyze = `${subject} ${snippet}`.toLowerCase();
    const domain = senderEmail.split('@')[1]?.toLowerCase() || '';
    
    // Add keyword-based tags
    IMPORTANT_KEYWORDS.forEach(keyword => {
      if (textToAnalyze.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Add domain-based tags
    if (domain.includes('linkedin')) tags.push('career');
    if (domain.includes('github')) tags.push('development');
    if (domain.includes('upwork') || domain.includes('freelancer') || domain.includes('fiverr')) {
      tags.push('freelance');
    }
    if (domain.includes('bank') || textToAnalyze.includes('payment') || textToAnalyze.includes('invoice')) {
      tags.push('finance');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Extract email body from Gmail message
   */
  private extractEmailBody(messageData: any): string {
    try {
      const payload = messageData.payload;

      if (payload.body && payload.body.data) {
        // Single part message
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }

      if (payload.parts) {
        // Multi-part message - find text/plain or text/html
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }

        // Fallback to HTML part
        for (const part of payload.parts) {
          if (part.mimeType === 'text/html' && part.body && part.body.data) {
            const htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
            // Strip HTML tags (basic)
            return htmlContent.replace(/<[^>]*>/g, '').slice(0, 1000);
          }
        }
      }

      return messageData.snippet || '';
    } catch (error) {
      console.error('Error extracting email body:', error);
      return messageData.snippet || '';
    }
  }

  /**
   * Map AI urgency level to importance
   */
  private mapUrgencyToImportance(urgencyLevel: string): 'high' | 'medium' | 'low' {
    switch (urgencyLevel) {
      case 'critical':
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Generate AI summary (placeholder for actual LLM integration)
   */
  private generateAISummary(subject: string, snippet: string, sender: string): string {
    // In production, integrate with:
    // - Hugging Face Inference API (free tier)
    // - OpenAI API
    // - Local LLM like BART/T5
    // - Google's Gemini API (free tier)
    
    const keyPoints = [];
    const lowerSnippet = snippet.toLowerCase();
    
    if (lowerSnippet.includes('deadline') || lowerSnippet.includes('urgent')) {
      keyPoints.push('⚡ Time-sensitive matter requiring immediate attention');
    }
    if (lowerSnippet.includes('payment') || lowerSnippet.includes('invoice')) {
      keyPoints.push('💰 Financial/payment related');
    }
    if (lowerSnippet.includes('interview') || lowerSnippet.includes('job')) {
      keyPoints.push('💼 Career opportunity');
    }
    if (lowerSnippet.includes('project') || lowerSnippet.includes('client')) {
      keyPoints.push('📋 Project/client work');
    }
    
    if (keyPoints.length > 0) {
      return `${keyPoints.join(', ')}. ${snippet.slice(0, 150)}...`;
    }
    
    return snippet.length > 150 ? `${snippet.slice(0, 150)}...` : snippet;
  }

  /**
   * Fetch and process emails from Gmail
   */
  async getEmails(maxResults: number = 50): Promise<EmailSummary[]> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Get list of messages
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox' // Only inbox emails
      });

      if (!listResponse.data.messages) {
        return [];
      }

      // Get detailed message data
      const emailPromises = listResponse.data.messages.map(async (message) => {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });

        const messageData = messageResponse.data;
        const headers = messageData.payload?.headers || [];
        
        // Extract email metadata
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();
        
        // Parse sender info
        const senderMatch = from.match(/^(.+?)\s*<(.+?)>$/) || from.match(/^(.+)$/);
        const senderName = senderMatch ? senderMatch[1].replace(/"/g, '').trim() : 'Unknown';
        const senderEmail = senderMatch && senderMatch[2] ? senderMatch[2] : from;
        
        // Get email snippet and body
        const snippet = messageData.snippet || '';
        const emailBody = this.extractEmailBody(messageData) || snippet;

        // Determine if email is unread
        const isUnread = messageData.labelIds?.includes('UNREAD') || false;

        // Process with enhanced AI analysis
        const aiAnalysis = await this.aiService.analyzeEmail(subject, emailBody, senderEmail, senderName);
        const importance = this.mapUrgencyToImportance(aiAnalysis.urgencyLevel);
        const tags = this.extractTags(subject, senderEmail, snippet);

        // Enhanced tags from AI analysis
        if (aiAnalysis.category !== 'other') {
          tags.push(aiAnalysis.category.replace('_', ' '));
        }
        aiAnalysis.actionItems.forEach(item => {
          if (item.toLowerCase().includes('respond')) tags.push('needs response');
          if (item.toLowerCase().includes('review')) tags.push('needs review');
          if (item.toLowerCase().includes('schedule')) tags.push('scheduling');
        });
        
        const emailSummary: EmailSummary = {
          id: message.id!,
          sender: senderName,
          senderEmail: senderEmail,
          subject,
          summary: aiAnalysis.summary,
          originalEmailUrl: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
          importance,
          tags: [...new Set(tags)], // Remove duplicates
          receivedAt: new Date(date).toISOString(),
          isUnread,
          accountEmail: 'user@gmail.com', // Will be updated with actual user email
          // Enhanced AI fields
          aiAnalysis: {
            actionItems: aiAnalysis.actionItems,
            urgencyLevel: aiAnalysis.urgencyLevel,
            suggestedResponse: aiAnalysis.suggestedResponse,
            deadline: aiAnalysis.deadline,
            category: aiAnalysis.category,
            tips: aiAnalysis.tips,
            sentiment: aiAnalysis.sentiment,
            estimatedReadTime: aiAnalysis.estimatedReadTime
          }
        };

        return emailSummary;
      });

      const emails = await Promise.all(emailPromises);
      
      // Sort by date (newest first)
      return emails.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
      
    } catch (error) {
      console.error('Error fetching emails from Gmail:', error);
      throw new Error('Failed to fetch emails from Gmail');
    }
  }

  /**
   * Search emails
   */
  async searchEmails(query: string, maxResults: number = 20): Promise<EmailSummary[]> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: `in:inbox ${query}`
      });

      if (!listResponse.data.messages) {
        return [];
      }

      // Process messages similar to getEmails but with search query
      const emailPromises = listResponse.data.messages.map(async (message) => {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });

        const messageData = messageResponse.data;
        const headers = messageData.payload?.headers || [];
        
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString();
        
        const senderMatch = from.match(/^(.+?)\s*<(.+?)>$/) || from.match(/^(.+)$/);
        const senderName = senderMatch ? senderMatch[1].replace(/"/g, '').trim() : 'Unknown';
        const senderEmail = senderMatch && senderMatch[2] ? senderMatch[2] : from;
        
        const snippet = messageData.snippet || '';
        const isUnread = messageData.labelIds?.includes('UNREAD') || false;
        
        const importance = this.determineImportance(subject, senderEmail, snippet);
        const tags = this.extractTags(subject, senderEmail, snippet);
        const summary = this.generateAISummary(subject, snippet, senderName);
        
        return {
          id: message.id!,
          sender: senderName,
          senderEmail: senderEmail,
          subject,
          summary,
          originalEmailUrl: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
          importance,
          tags,
          receivedAt: new Date(date).toISOString(),
          isUnread,
          accountEmail: 'user@gmail.com'
        } as EmailSummary;
      });

      const emails = await Promise.all(emailPromises);
      return emails.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
      
    } catch (error) {
      console.error('Error searching emails in Gmail:', error);
      throw new Error('Failed to search emails in Gmail');
    }
  }
}
