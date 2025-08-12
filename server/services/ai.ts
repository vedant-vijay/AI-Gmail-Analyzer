import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';
// import Groq from 'groq-sdk';

interface EmailAnalysis {
  summary: string;
  actionItems: string[];
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  suggestedResponse?: string;
  deadline?: string;
  category: 'client_work' | 'job_opportunity' | 'payment' | 'meeting' | 'marketing' | 'personal' | 'other';
  tips: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  estimatedReadTime: string;
}

class AIService {
  private hf?: HfInference;
  private openai?: OpenAI;
  // private groq?: Groq;

  constructor() {
    // Initialize AI services based on available API keys
    if (process.env.HUGGINGFACE_API_KEY) {
      this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // if (process.env.GROQ_API_KEY) {
    //   this.groq = new Groq({
    //     apiKey: process.env.GROQ_API_KEY,
    //   });
    // }
  }

  /**
   * Analyze email content and provide intelligent insights
   */
  async analyzeEmail(
    subject: string,
    content: string,
    senderEmail: string,
    senderName: string
  ): Promise<EmailAnalysis> {
    const emailText = `Subject: ${subject}\nFrom: ${senderName} <${senderEmail}>\nContent: ${content}`;
    
    try {
      // Try different AI services in order of preference
      if (this.openai) {
        return await this.analyzeWithOpenAI(emailText, subject, senderEmail);
      } else if (this.hf) {
        return await this.analyzeWithHuggingFace(emailText, subject, senderEmail);
      } else {
        // Fallback to rule-based analysis
        return this.analyzeWithRules(subject, content, senderEmail, senderName);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to rule-based analysis
      return this.analyzeWithRules(subject, content, senderEmail, senderName);
    }
  }

  /**
   * Analyze with OpenAI GPT
   */
  private async analyzeWithOpenAI(emailText: string, subject: string, senderEmail: string): Promise<EmailAnalysis> {
    const prompt = `You are an AI assistant specialized in helping freelancers manage their emails. Analyze this email and provide structured insights:

${emailText}

Please analyze this email and respond with a JSON object containing:
1. summary: A concise 1-2 sentence summary
2. actionItems: Array of specific action items (max 3)
3. urgencyLevel: critical/high/medium/low
4. suggestedResponse: Brief suggested response if action needed
5. deadline: Extract any mentioned deadlines (YYYY-MM-DD format or "none")
6. category: client_work/job_opportunity/payment/meeting/marketing/personal/other
7. tips: Array of 2-3 actionable tips for the freelancer
8. sentiment: positive/neutral/negative
9. estimatedReadTime: "X min read"

Focus on freelancing context - clients, projects, payments, deadlines, opportunities.`;

    const response = await this.openai!.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    try {
      const analysis = JSON.parse(response.choices[0].message.content!);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return this.analyzeWithRules(subject, emailText, senderEmail, 'Unknown');
    }
  }

  /**
   * Analyze with Hugging Face models
   */
  private async analyzeWithHuggingFace(emailText: string, subject: string, senderEmail: string): Promise<EmailAnalysis> {
    try {
      // Use a free summarization model
      const summaryResponse = await this.hf!.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: emailText.slice(0, 1000), // Limit input length
      });

      const summary = summaryResponse.summary_text || emailText.slice(0, 150);
      
      // Use sentiment analysis
      const sentimentResponse = await this.hf!.textClassification({
        model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        inputs: subject + ' ' + emailText.slice(0, 500),
      });

      const sentimentLabel = sentimentResponse[0]?.label?.toLowerCase();
      const sentiment = sentimentLabel?.includes('positive') ? 'positive' : 
                       sentimentLabel?.includes('negative') ? 'negative' : 'neutral';

      // Combine with rule-based analysis for structure
      const ruleBasedAnalysis = this.analyzeWithRules(subject, emailText, senderEmail, 'Unknown');
      
      return {
        ...ruleBasedAnalysis,
        summary,
        sentiment: sentiment as 'positive' | 'neutral' | 'negative',
      };
    } catch (error) {
      console.error('Hugging Face analysis error:', error);
      return this.analyzeWithRules(subject, emailText, senderEmail, 'Unknown');
    }
  }

  /**
   * Rule-based analysis as fallback
   */
  private analyzeWithRules(subject: string, content: string, senderEmail: string, senderName: string): EmailAnalysis {
    const textToAnalyze = `${subject} ${content}`.toLowerCase();
    const domain = senderEmail.split('@')[1]?.toLowerCase() || '';
    
    // Determine category
    let category: EmailAnalysis['category'] = 'other';
    if (domain.includes('upwork') || domain.includes('freelancer') || domain.includes('fiverr')) {
      category = 'client_work';
    } else if (textToAnalyze.includes('job') || textToAnalyze.includes('opportunity') || domain.includes('linkedin')) {
      category = 'job_opportunity';
    } else if (textToAnalyze.includes('payment') || textToAnalyze.includes('invoice') || textToAnalyze.includes('paid')) {
      category = 'payment';
    } else if (textToAnalyze.includes('meeting') || textToAnalyze.includes('call') || textToAnalyze.includes('zoom')) {
      category = 'meeting';
    }

    // Determine urgency
    let urgencyLevel: EmailAnalysis['urgencyLevel'] = 'low';
    if (textToAnalyze.includes('urgent') || textToAnalyze.includes('asap') || textToAnalyze.includes('emergency')) {
      urgencyLevel = 'critical';
    } else if (textToAnalyze.includes('important') || textToAnalyze.includes('deadline') || textToAnalyze.includes('tomorrow')) {
      urgencyLevel = 'high';
    } else if (textToAnalyze.includes('soon') || textToAnalyze.includes('this week')) {
      urgencyLevel = 'medium';
    }

    // Extract action items
    const actionItems: string[] = [];
    if (textToAnalyze.includes('respond') || textToAnalyze.includes('reply')) {
      actionItems.push('Respond to this email');
    }
    if (textToAnalyze.includes('review') || textToAnalyze.includes('check')) {
      actionItems.push('Review the attached documents or links');
    }
    if (textToAnalyze.includes('schedule') || textToAnalyze.includes('meeting')) {
      actionItems.push('Schedule a meeting or call');
    }
    if (textToAnalyze.includes('payment') || textToAnalyze.includes('invoice')) {
      actionItems.push('Handle payment or invoicing');
    }

    // Generate tips based on category
    const tips: string[] = [];
    switch (category) {
      case 'client_work':
        tips.push('Respond within 24 hours to maintain good client relationships');
        tips.push('Keep detailed records of project communications');
        tips.push('Clarify project scope and deadlines upfront');
        break;
      case 'job_opportunity':
        tips.push('Research the company before responding');
        tips.push('Tailor your response to highlight relevant experience');
        tips.push('Follow up if you don\'t hear back within a week');
        break;
      case 'payment':
        tips.push('Track payment due dates in your calendar');
        tips.push('Send friendly reminders for overdue payments');
        tips.push('Keep detailed invoice records');
        break;
      case 'meeting':
        tips.push('Prepare an agenda before the meeting');
        tips.push('Confirm meeting details 24 hours prior');
        tips.push('Follow up with meeting notes and action items');
        break;
      default:
        tips.push('Process emails in batches to improve efficiency');
        tips.push('Set up filters to automatically organize similar emails');
        tips.push('Use templates for common responses');
    }

    // Extract deadline
    let deadline = 'none';
    const deadlinePatterns = [
      /by (\w+ \d{1,2})/i,
      /deadline[:\s]+(\w+ \d{1,2})/i,
      /due[:\s]+(\w+ \d{1,2})/i,
    ];
    
    for (const pattern of deadlinePatterns) {
      const match = textToAnalyze.match(pattern);
      if (match) {
        deadline = match[1];
        break;
      }
    }

    // Generate summary
    const summary = content.length > 150 ? 
      `${content.slice(0, 150)}...` : 
      content || `Email from ${senderName} regarding: ${subject}`;

    // Suggested response
    let suggestedResponse = '';
    if (category === 'client_work') {
      suggestedResponse = 'Thank you for your email. I\'ll review this and get back to you within [timeframe].';
    } else if (category === 'job_opportunity') {
      suggestedResponse = 'Thank you for considering me for this opportunity. I\'m interested and would like to learn more.';
    } else if (category === 'meeting') {
      suggestedResponse = 'Thank you for the meeting invitation. I\'m available and will prepare accordingly.';
    }

    return {
      summary,
      actionItems: actionItems.slice(0, 3),
      urgencyLevel,
      suggestedResponse: suggestedResponse || undefined,
      deadline: deadline !== 'none' ? deadline : undefined,
      category,
      tips: tips.slice(0, 3),
      sentiment: 'neutral',
      estimatedReadTime: `${Math.ceil(content.length / 1000)} min read`,
    };
  }

  /**
   * Analyze email patterns and provide proactive advice
   */
  async analyzeEmailPatterns(emails: any[]): Promise<{
    insights: string[];
    recommendations: string[];
    stats: {
      totalEmails: number;
      urgentEmails: number;
      clientEmails: number;
      jobOpportunities: number;
      responseRate: string;
      averageResponseTime: string;
    };
  }> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    const totalEmails = emails.length;
    const urgentEmails = emails.filter(e => e.importance === 'high').length;
    const clientEmails = emails.filter(e => 
      e.senderEmail.includes('upwork') || 
      e.senderEmail.includes('freelancer') || 
      e.tags.includes('client')
    ).length;
    const jobOpportunities = emails.filter(e => e.tags.includes('job offer')).length;

    // Generate insights
    if (urgentEmails > totalEmails * 0.3) {
      insights.push(`You have ${urgentEmails} urgent emails - consider setting up priority filters`);
      recommendations.push('Create email rules to automatically flag urgent messages');
    }

    if (clientEmails > 0) {
      insights.push(`${clientEmails} client-related emails detected this week`);
      recommendations.push('Set up dedicated folders for each client to stay organized');
    }

    if (jobOpportunities > 0) {
      insights.push(`${jobOpportunities} new job opportunities found`);
      recommendations.push('Respond to job opportunities within 24 hours for better chances');
    }

    const unreadEmails = emails.filter(e => e.isUnread).length;
    if (unreadEmails > 10) {
      insights.push(`You have ${unreadEmails} unread emails`);
      recommendations.push('Schedule daily email processing time to avoid overwhelm');
    }

    return {
      insights,
      recommendations,
      stats: {
        totalEmails,
        urgentEmails,
        clientEmails,
        jobOpportunities,
        responseRate: '85%', // Placeholder - would calculate from actual data
        averageResponseTime: '4.2 hours', // Placeholder
      },
    };
  }
}

export { AIService, EmailAnalysis };
