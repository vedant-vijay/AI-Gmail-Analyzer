import { useState } from 'react';
import { Mail, Shield, Zap, Users, ChevronRight, RefreshCw } from 'lucide-react';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Get auth URL from backend
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Email Assistant</h1>
            <p className="text-sm text-slate-600">Smart freelancing email management</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Never Miss Another 
                <span className="text-blue-600"> Important Email</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                AI-powered email assistant that tracks your freelancing opportunities, client communications, and urgent messages across all your Gmail accounts.
              </p>
            </div>

            {/* Problem statement */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-amber-900 mb-2">Solve Your Email Chaos</h3>
              <p className="text-amber-800">
                Stop missing important client emails, job offers, and project deadlines buried in your cluttered inbox. 
                Get AI-powered summaries and smart filtering for Upwork, Freelancer, LinkedIn, and all your professional communications.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Smart Prioritization</h4>
                  <p className="text-sm text-slate-600">Automatically identifies urgent emails from clients, job platforms, and important contacts.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">AI Summaries</h4>
                  <p className="text-sm text-slate-600">Get instant summaries of long emails to quickly understand what needs your attention.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Multi-Account Support</h4>
                  <p className="text-sm text-slate-600">Connect multiple Gmail accounts and manage all your professional communications in one place.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Secure & Private</h4>
                  <p className="text-sm text-slate-600">Your emails are processed securely with OAuth2. No storage of sensitive data.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign in form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Gmail</h3>
                  <p className="text-slate-600">
                    Securely connect your Gmail account to start getting AI-powered email insights
                  </p>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3 group"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Sign in with Google</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    By signing in, you agree to our secure handling of your email data. 
                    We only read email metadata and content for AI processing. 
                    <br />
                    <span className="font-medium">Your emails are never stored or shared.</span>
                  </p>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 text-center text-sm text-slate-600">
                <p className="mb-2">Trusted by freelancers using:</p>
                <div className="flex justify-center items-center space-x-4 opacity-60">
                  <span className="font-medium">Upwork</span>
                  <span>•</span>
                  <span className="font-medium">Freelancer</span>
                  <span>•</span>
                  <span className="font-medium">LinkedIn</span>
                  <span>•</span>
                  <span className="font-medium">Fiverr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
