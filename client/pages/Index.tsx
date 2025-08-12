import { useState, useEffect } from 'react';
import { Search, Mail, Filter, RefreshCw, Zap, Clock, User, ExternalLink, LogOut, Brain, CheckCircle, AlertTriangle, Calendar, Target } from 'lucide-react';
import { EmailSummary, EmailsResponse } from '@shared/api';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import SignIn from '../components/SignIn';

type FilterType = 'all' | 'important' | 'unread';

export default function Index() {
  // All hooks must be called before any return!
  const { isAuthenticated, isLoading: authLoading, user, logout, token } = useAuth();
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Fetch emails from API
  const fetchEmails = async (endpoint = '/api/emails') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setError('Gmail authorization expired. Please sign in again.');
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data: EmailsResponse = await response.json();
      setEmails(data.emails);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search emails
  const searchEmails = async (query: string) => {
    if (!query.trim()) {
      setFilteredEmails(emails);
      return;
    }

    try {
      const response = await fetch(`/api/emails/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to search emails');
      }

      const data: EmailsResponse = await response.json();
      setFilteredEmails(data.emails);
    } catch (error) {
      console.error('Error searching emails:', error);
    }
  };

  // Apply filters
  const applyFilter = (filter: FilterType) => {
    setActiveFilter(filter);
    let filtered = [...emails];
    
    switch (filter) {
      case 'important':
        filtered = emails.filter(email => email.importance === 'high');
        break;
      case 'unread':
        filtered = emails.filter(email => email.isUnread);
        break;
      default:
        filtered = emails;
    }
    
    setFilteredEmails(filtered);
  };

  // Handle search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchEmails(searchQuery);
      } else {
        applyFilter(activeFilter);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, emails, activeFilter]);

  // Fetch AI insights
  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/emails/insights', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEmails();
    fetchInsights();
  }, []);

  // Update filtered emails when emails change
  useEffect(() => {
    if (!searchQuery) {
      applyFilter(activeFilter);
    }
  }, [emails, activeFilter]);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high': return <Zap className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      default: return <Mail className="w-3 h-3" />;
    }
  };

  // Now do conditional rendering
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Email Assistant</h1>
                <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </button>
              <button
                onClick={() => {
                  fetchEmails();
                  fetchInsights();
                }}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                <span>Sync</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Emails</p>
                  <p className="text-2xl font-bold text-slate-900">{emails.length}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Important</p>
                  <p className="text-2xl font-bold text-red-600">
                    {emails.filter(e => e.importance === 'high').length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        {showInsights && insights && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">AI Email Assistant Insights</h3>
                <p className="text-sm text-slate-600">Personal recommendations based on your email patterns</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-600" />
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {insights.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-6 pt-6 border-t border-purple-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{insights.stats.clientEmails}</p>
                  <p className="text-xs text-slate-600">Client Emails</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{insights.stats.jobOpportunities}</p>
                  <p className="text-xs text-slate-600">Job Opportunities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{insights.stats.responseRate}</p>
                  <p className="text-xs text-slate-600">Response Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{insights.stats.averageResponseTime}</p>
                  <p className="text-xs text-slate-600">Avg Response Time</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="w-5 h-5 text-slate-600" />
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Emails', count: emails.length },
              { key: 'important', label: 'Important', count: emails.filter(e => e.importance === 'high').length },
              { key: 'unread', label: 'Unread', count: unreadCount }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => applyFilter(filter.key as FilterType)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeFilter === filter.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                )}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Emails</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => fetchEmails()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No emails found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md",
                  email.isUnread ? "border-blue-200 bg-blue-50/30" : "border-slate-200"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{email.sender}</h3>
                      <p className="text-sm text-slate-600">{email.senderEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border",
                      getImportanceColor(email.importance)
                    )}>
                      {getImportanceIcon(email.importance)}
                      <span className="capitalize">{email.importance}</span>
                    </span>
                    {email.isUnread && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>

                <h4 className="text-lg font-medium text-slate-900 mb-2">{email.subject}</h4>
                <p className="text-slate-700 mb-4 leading-relaxed">{email.summary}</p>

                {/* AI Analysis Section */}
                {email.aiAnalysis && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
                    {/* Action Items */}
                    {email.aiAnalysis.actionItems.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                          Action Items
                        </h5>
                        <ul className="space-y-1">
                          {email.aiAnalysis.actionItems.map((item, index) => (
                            <li key={index} className="text-xs text-slate-700 flex items-start">
                              <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Tips */}
                    {email.aiAnalysis.tips.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
                          <Brain className="w-3 h-3 mr-1 text-purple-600" />
                          AI Tips
                        </h5>
                        <ul className="space-y-1">
                          {email.aiAnalysis.tips.slice(0, 2).map((tip, index) => (
                            <li key={index} className="text-xs text-slate-700 flex items-start">
                              <span className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center space-x-3">
                        {email.aiAnalysis.deadline && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {email.aiAnalysis.deadline}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {email.aiAnalysis.estimatedReadTime}
                        </span>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        email.aiAnalysis.sentiment === 'positive' ? "bg-green-100 text-green-700" :
                        email.aiAnalysis.sentiment === 'negative' ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {email.aiAnalysis.sentiment}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {email.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span>{new Date(email.receivedAt).toLocaleDateString()}</span>
                    <a
                      href={email.originalEmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <span>View Original</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
