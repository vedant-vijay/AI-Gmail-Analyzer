import { RequestHandler } from "express";
import { EmailsResponse } from "@shared/api";
import { GmailService } from "../services/gmail";
import { AIService } from "../services/ai";
import { authenticateToken, userTokens } from "./auth";

/**
 * GET /api/emails - Get all emails with summaries
 */
export const handleGetEmails: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const gmailTokens = (req as any).gmailTokens;
    
    if (!gmailTokens) {
      return res.status(401).json({ error: 'Gmail not connected' });
    }

    const gmailService = new GmailService();
    gmailService.setCredentials({
      access_token: gmailTokens.access_token,
      refresh_token: gmailTokens.refresh_token
    });
    
    const emails = await gmailService.getEmails();
    const unreadCount = emails.filter(email => email.isUnread).length;
    
    // Update emails with actual user email
    const updatedEmails = emails.map(email => ({
      ...email,
      accountEmail: user.email
    }));
    
    const response: EmailsResponse = {
      emails: updatedEmails,
      total: updatedEmails.length,
      unreadCount
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching emails:', error);
    
    if (error.message?.includes('invalid_grant') || error.message?.includes('unauthorized')) {
      return res.status(401).json({ error: 'Gmail authorization expired. Please sign in again.' });
    }
    
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

/**
 * GET /api/emails/important - Get only important emails
 */
export const handleGetImportantEmails: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const gmailTokens = (req as any).gmailTokens;
    
    if (!gmailTokens) {
      return res.status(401).json({ error: 'Gmail not connected' });
    }

    const gmailService = new GmailService();
    gmailService.setCredentials({
      access_token: gmailTokens.access_token,
      refresh_token: gmailTokens.refresh_token
    });
    
    const allEmails = await gmailService.getEmails();
    const importantEmails = allEmails.filter(email => email.importance === 'high');
    const unreadCount = importantEmails.filter(email => email.isUnread).length;
    
    // Update emails with actual user email
    const updatedEmails = importantEmails.map(email => ({
      ...email,
      accountEmail: user.email
    }));
    
    const response: EmailsResponse = {
      emails: updatedEmails,
      total: updatedEmails.length,
      unreadCount
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching important emails:', error);
    
    if (error.message?.includes('invalid_grant') || error.message?.includes('unauthorized')) {
      return res.status(401).json({ error: 'Gmail authorization expired. Please sign in again.' });
    }
    
    res.status(500).json({ error: 'Failed to fetch important emails' });
  }
};

/**
 * GET /api/emails/search?q=keyword - Search emails
 */
export const handleSearchEmails: RequestHandler = async (req, res) => {
  try {
    const query = req.query.q as string;
    const user = (req as any).user;
    const gmailTokens = (req as any).gmailTokens;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    if (!gmailTokens) {
      return res.status(401).json({ error: 'Gmail not connected' });
    }

    const gmailService = new GmailService();
    gmailService.setCredentials({
      access_token: gmailTokens.access_token,
      refresh_token: gmailTokens.refresh_token
    });
    
    const emails = await gmailService.searchEmails(query);
    const unreadCount = emails.filter(email => email.isUnread).length;
    
    // Update emails with actual user email
    const updatedEmails = emails.map(email => ({
      ...email,
      accountEmail: user.email
    }));
    
    const response: EmailsResponse = {
      emails: updatedEmails,
      total: updatedEmails.length,
      unreadCount
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error searching emails:', error);
    
    if (error.message?.includes('invalid_grant') || error.message?.includes('unauthorized')) {
      return res.status(401).json({ error: 'Gmail authorization expired. Please sign in again.' });
    }
    
    res.status(500).json({ error: 'Failed to search emails' });
  }
};

/**
 * GET /api/accounts - Get connected email accounts
 */
export const handleGetAccounts: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    const response = {
      accounts: [{
        email: user.email,
        name: user.name,
        isConnected: true,
        lastSync: new Date().toISOString()
      }]
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

/**
 * POST /api/emails/sync - Trigger email sync
 */
export const handleSyncEmails: RequestHandler = async (req, res) => {
  try {
    // For Gmail, sync happens automatically when fetching emails
    // This endpoint can be used to trigger cache refresh in the future

    res.json({
      success: true,
      message: 'Email sync completed successfully'
    });
  } catch (error) {
    console.error('Error syncing emails:', error);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
};

/**
 * GET /api/emails/insights - Get AI-powered email insights and recommendations
 */
export const handleGetEmailInsights: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const gmailTokens = (req as any).gmailTokens;

    if (!gmailTokens) {
      return res.status(401).json({ error: 'Gmail not connected' });
    }

    const gmailService = new GmailService();
    gmailService.setCredentials({
      access_token: gmailTokens.access_token,
      refresh_token: gmailTokens.refresh_token
    });

    // Get recent emails for analysis
    const emails = await gmailService.getEmails(100); // Get more emails for better insights

    const aiService = new AIService();
    const insights = await aiService.analyzeEmailPatterns(emails);

    res.json(insights);
  } catch (error) {
    console.error('Error getting email insights:', error);

    if (error.message?.includes('invalid_grant') || error.message?.includes('unauthorized')) {
      return res.status(401).json({ error: 'Gmail authorization expired. Please sign in again.' });
    }

    res.status(500).json({ error: 'Failed to get email insights' });
  }
};

// Apply authentication middleware to all email routes
export const authenticatedGetEmails = [authenticateToken, handleGetEmails];
export const authenticatedGetImportantEmails = [authenticateToken, handleGetImportantEmails];
export const authenticatedSearchEmails = [authenticateToken, handleSearchEmails];
export const authenticatedGetAccounts = [authenticateToken, handleGetAccounts];
export const authenticatedSyncEmails = [authenticateToken, handleSyncEmails];
export const authenticatedGetEmailInsights = [authenticateToken, handleGetEmailInsights];
