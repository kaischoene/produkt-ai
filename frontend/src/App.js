import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Shadcn UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// Icons
import { 
  Sparkles, 
  Image as ImageIcon, 
  Zap, 
  Crown, 
  Star, 
  Download, 
  CreditCard,
  User,
  LogOut,
  Palette,
  Wand2,
  Gallery,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { email, username, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      toast.success('Account created successfully! You have 3 free images to start.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth Components
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.username, formData.password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PixelHub</h1>
          <p className="text-gray-600">AI-Powered Image Generation Platform</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to continue creating' : 'Start with 3 free images'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Dashboard
const Dashboard = () => {
  const { user, logout, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const [generationForm, setGenerationForm] = useState({
    prompt: '',
    negative_prompt: '',
    width: 1024,
    height: 1024
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState({});

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchUserImages();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get(`${API}/subscription/plans`);
      setSubscriptionPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
    }
  };

  const fetchUserImages = async () => {
    try {
      const response = await axios.get(`${API}/user/images`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGeneratedImages(response.data);
    } catch (error) {
      console.error('Failed to fetch user images:', error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (user.credits <= 0) {
      toast.error('Insufficient credits! Please purchase a subscription to continue.');
      setActiveTab('subscription');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await axios.post(`${API}/generate-image`, generationForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { job_id } = response.data;
      toast.success('Image generation started! Please wait...');
      
      // Poll for completion
      pollImageStatus(job_id);
      await fetchUser(); // Refresh user credits
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Image generation failed');
      setIsGenerating(false);
    }
  };

  const pollImageStatus = async (jobId) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        toast.error('Image generation timed out. Please try again.');
        setIsGenerating(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API}/image-status/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const job = response.data;
        
        if (job.status === 'completed') {
          toast.success('Image generated successfully!');
          fetchUserImages();
          setIsGenerating(false);
          setActiveTab('gallery');
        } else if (job.status === 'failed') {
          toast.error(job.error_message || 'Image generation failed');
          setIsGenerating(false);
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Failed to check image status:', error);
        setIsGenerating(false);
      }
    };
    
    poll();
  };

  const handleSubscription = async (planId) => {
    try {
      const response = await axios.post(`${API}/subscription/checkout`, 
        { plan_id: planId }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      // Redirect to Stripe checkout
      window.location.href = response.data.checkout_url;
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create checkout session');
    }
  };

  const getCreditsColor = () => {
    if (user.credits <= 0) return 'text-red-600';
    if (user.credits <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PixelHub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span className={`font-semibold ${getCreditsColor()}`}>
                  {user.credits} credits
                </span>
              </div>
              
              <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                {user.subscription_plan || 'Free'}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="generate" className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4" />
              <span>Generate</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Gallery className="w-4 h-4" />
              <span>Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Plans</span>
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Create Your Image</span>
                </CardTitle>
                <CardDescription>
                  Describe what you want to create and our AI will generate it for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Image Description</Label>
                    <Textarea
                      id="prompt"
                      placeholder="A majestic mountain landscape at sunset with golden light..."
                      value={generationForm.prompt}
                      onChange={(e) => setGenerationForm(prev => ({ ...prev, prompt: e.target.value }))}
                      required
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negative_prompt">What to Avoid (Optional)</Label>
                    <Input
                      id="negative_prompt"
                      placeholder="blurry, low quality, dark..."
                      value={generationForm.negative_prompt}
                      onChange={(e) => setGenerationForm(prev => ({ ...prev, negative_prompt: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        min="512"
                        max="2048"
                        step="64"
                        value={generationForm.width}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        min="512"
                        max="2048"
                        step="64"
                        value={generationForm.height}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                    disabled={isGenerating || user.credits <= 0}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? 'Generating...' : `Generate Image (${user.credits} credits left)`}
                  </Button>

                  {user.credits <= 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 text-orange-700">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">No credits remaining</span>
                      </div>
                      <p className="text-orange-600 text-sm mt-1">
                        Please purchase a subscription to continue generating images.
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gallery className="w-5 h-5" />
                  <span>Your Creations</span>
                </CardTitle>
                <CardDescription>
                  View and manage your generated images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
                    <p className="text-gray-600 mb-4">Generate your first image to see it here</p>
                    <Button onClick={() => setActiveTab('generate')}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Start Creating
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm">Image Preview</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {image.width}×{image.height}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Subscription Plans</span>
                </CardTitle>
                <CardDescription>
                  Choose the perfect plan for your creative needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(subscriptionPlans).map(([planId, plan]) => (
                    <Card key={planId} className={`relative ${user.subscription_plan === planId ? 'ring-2 ring-indigo-500' : ''}`}>
                      {planId === 'premium' && (
                        <Badge className="absolute -top-2 left-4 bg-indigo-600">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-indigo-600">
                          €{plan.price}
                          <span className="text-sm text-gray-500 font-normal">/month</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {plan.monthly_credits}
                          </div>
                          <div className="text-sm text-gray-600">images per month</div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>High-quality generation</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Custom dimensions</span>
                          </div>
                          {planId !== 'basic' && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Priority processing</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full"
                          variant={user.subscription_plan === planId ? 'secondary' : 'default'}
                          onClick={() => handleSubscription(planId)}
                          disabled={user.subscription_plan === planId}
                        >
                          {user.subscription_plan === planId ? 'Current Plan' : 'Choose Plan'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AppContent />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <AuthPage />} />
      <Route path="/subscription/success" element={<SubscriptionSuccess />} />
      <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Subscription Success/Cancel Pages
const SubscriptionSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { fetchUser } = useAuth();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, []);

  const pollPaymentStatus = async (sessionId) => {
    const maxAttempts = 10;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsProcessing(false);
        toast.error('Payment verification timed out. Please contact support.');
        return;
      }

      try {
        const response = await axios.get(`${API}/subscription/status/${sessionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.payment_status === 'paid') {
          await fetchUser();
          setIsProcessing(false);
          toast.success('Subscription activated successfully!');
        } else if (response.data.status === 'expired') {
          setIsProcessing(false);
          toast.error('Payment session expired.');
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        setIsProcessing(false);
        toast.error('Failed to verify payment status.');
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
              <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
              <p className="text-gray-600">Please wait while we activate your subscription.</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">Subscription Activated!</h2>
              <p className="text-gray-600 mb-4">Your subscription has been activated successfully.</p>
              <Button onClick={() => window.location.href = '/'}>
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SubscriptionCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h2 className="text-xl font-semibold mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-4">Your payment was cancelled. You can try again anytime.</p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;