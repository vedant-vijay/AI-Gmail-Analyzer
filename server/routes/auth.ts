import { RequestHandler } from "express";
import jwt from 'jsonwebtoken';
import { GmailService } from "../services/gmail";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface UserTokens {
  access_token: string;
  refresh_token?: string;
  email: string;
  name: string;
}

// In-memory token storage (use Redis/Database in production)
const userTokens = new Map<string, UserTokens>();

/**
 * GET /api/auth/google - Initiate Google OAuth flow
 */
export const handleGoogleAuth: RequestHandler = (req, res) => {
  try {
    const gmailService = new GmailService();
    const authUrl = gmailService.getAuthUrl();
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

/**
 * GET /api/auth/google/callback - Handle OAuth callback
 */
export const handleGoogleCallback: RequestHandler = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const gmailService = new GmailService();
    
    // Exchange code for tokens
    const tokens = await gmailService.getTokens(code);
    gmailService.setCredentials(tokens);
    
    // Get user profile
    const userProfile = await gmailService.getUserProfile();
    
    // Store tokens (use database in production)
    const userTokensData: UserTokens = {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token,
      email: userProfile.email!,
      name: userProfile.name!
    };
    
    userTokens.set(userProfile.email!, userTokensData);
    
    // Generate JWT for frontend
    const jwtToken = jwt.sign(
      { 
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`/?token=${jwtToken}&email=${userProfile.email}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * POST /api/auth/verify - Verify JWT token
 */
export const handleVerifyToken: RequestHandler = (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * POST /api/auth/logout - Logout user
 */
export const handleLogout: RequestHandler = (req, res) => {
  try {
    const { email } = req.body;
    
    if (email && userTokens.has(email)) {
      userTokens.delete(email);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Middleware to authenticate requests
 */
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    
    // Set Gmail credentials for this request
    const userTokensData = userTokens.get(decoded.email);
    if (userTokensData) {
      (req as any).gmailTokens = userTokensData;
    }
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Export the userTokens map for use in other routes
export { userTokens };
