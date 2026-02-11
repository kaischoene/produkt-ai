import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import NooviLandingPage from './NooviLandingPage';

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

// Icons - Simple SVG components to avoid Lucide React 19 compatibility issues
const Sparkles = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m8-10H4m6.5-7.5L12 2l-1.5 2.5M17.5 8.5L16 10l1.5 1.5M6.5 8.5L8 10 6.5 11.5M17.5 15.5L16 14l1.5-1.5M6.5 15.5L8 14l-1.5-1.5M12 18.5l1.5 2.5L12 22l-1.5-2.5"/></svg>
const ImageIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
const Zap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>
const Crown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
const Star = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>
const Download = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
const CreditCard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
const User = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const LogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
const Palette = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
const Wand2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
const Gallery = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m9 9 3 3 4-6"/></svg>
const Settings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
const CheckCircle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
const AlertTriangle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/></svg>
const Loader2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
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
      console.error('Benutzer konnte nicht geladen werden:', error);
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
      toast.success('Erfolgreich angemeldet!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Anmeldung fehlgeschlagen');
      return false;
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { email, username, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      toast.success('Konto erfolgreich erstellt! Sie haben 12 kostenlose Bilder zum Start.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registrierung fehlgeschlagen');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Erfolgreich abgemeldet');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ProduktAI</h1>
          <p className="text-gray-600">KI-gestützte Produktbild-Generierung</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm auth-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Melden Sie sich an, um weiter zu erstellen' : 'Starten Sie mit 12 kostenlosen Bildern'}
            </CardDescription>
          </CardHeader>
          <CardContent className="auth-form-container">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ihre@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11 auth-input"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Benutzername</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="ihr_benutzername"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="h-11 auth-input"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11 auth-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 auth-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isLogin ? 'Anmelden' : 'Konto erstellen'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                {isLogin ? "Noch kein Konto? Jetzt registrieren" : "Bereits ein Konto? Anmelden"}
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
    height: 1024,
    lighting: 'natural',
    aspectRatio: '1:1',
    cameraAngle: 'front',
    style: 'realistic',
    productImage: null
  });
  const [sceneIdeas, setSceneIdeas] = useState([
    "Luxuriöser Marmor-Hintergrund mit sanftem goldenen Licht",
    "Minimalistisches weißes Studio-Setup mit dramatischen Schatten", 
    "Rustikaler Holztisch mit warmem Umgebungslicht",
    "Moderner Gradient-Hintergrund mit Neon-Akzenten",
    "Natürliche Outdoor-Umgebung mit durch Bäume filterfndem Sonnenlicht",
    "Industrieller Beton-Hintergrund mit stimmungsvoller Beleuchtung",
    "Elegante Stoffdrapierung mit weichem diffusem Licht",
    "Vintage-Lederoberfläche mit warmem Tungsten-Glanz"
  ]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
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
      console.error('Abo-Pläne konnten nicht geladen werden:', error);
    }
  };

  const fetchUserImages = async () => {
    try {
      const response = await axios.get(`${API}/user/images`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGeneratedImages(response.data);
    } catch (error) {
      console.error('Benutzerbilder konnten nicht geladen werden:', error);
    }
  };

  const generateSceneIdeas = async (description) => {
    if (!description.trim()) {
      toast.error('Bitte geben Sie eine Szenenbeschreibung ein');
      return;
    }

    setIsLoadingIdeas(true);
    try {
      // Generate enhanced scene ideas based on description
      const enhancedIdeas = [
        `Professionelle ${description} mit Studio-Beleuchtung und sauberer Komposition`,
        `${description} in einer modernen minimalistischen Umgebung mit weichen Schatten`,
        `Künstlerische Interpretation von ${description} mit dramatischen Lichteffekten`,
        `${description} mit natürlichem Umgebungslicht und organischen Texturen`,
        `Kinematische ${description} mit dynamischen Winkeln und reichen Farben`
      ];
      
      setSceneIdeas(enhancedIdeas);
      document.getElementById('scene-description-input').value = '';
      toast.success('5 neue Szenenideen für Sie generiert!');
    } catch (error) {
      toast.error('Szenenideen konnten nicht generiert werden');
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const getCreditsColor = () => {
    if (user.credits <= 0) return 'text-red-600';
    if (user.credits <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (user.credits < 4) {
      toast.error('Nicht genügend Credits! Sie benötigen 4 Credits für eine Bildgenerierung.');
      setActiveTab('subscription');
      return;
    }

    if (!generationForm.prompt && !generationForm.productImage) {
      toast.error('Bitte geben Sie eine Szenenbeschreibung ein oder laden Sie ein Produktbild hoch.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create enhanced prompt based on form data
      let enhancedPrompt = generationForm.prompt;
      
      if (generationForm.productImage) {
        enhancedPrompt = `Professionelle Produktfotografie des hochgeladenen Produkts in: ${generationForm.prompt || 'einer sauberen, professionellen Umgebung'}`;
      }
      
      // Add style and lighting information
      enhancedPrompt += `. Stil: ${generationForm.style}. Beleuchtung: ${generationForm.lighting}. Kamerawinkel: ${generationForm.cameraAngle}.`;
      
      const requestData = {
        prompt: enhancedPrompt,
        negative_prompt: generationForm.negative_prompt,
        width: generationForm.width,
        height: generationForm.height
      };
      
      const response = await axios.post(`${API}/generate-image`, requestData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { job_id } = response.data;
      toast.success('Bildgenerierung gestartet! 4 professionelle Bilder werden erstellt...');
      
      // Poll for completion
      pollImageStatus(job_id);
      await fetchUser(); // Refresh user credits
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bildgenerierung fehlgeschlagen');
      setIsGenerating(false);
    }
  };

  const pollImageStatus = async (jobId) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        toast.error('Bildgenerierung hat zu lange gedauert. Bitte versuchen Sie es erneut.');
        setIsGenerating(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API}/image-status/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const job = response.data;
        
        if (job.status === 'completed') {
          toast.success('4 Bilder erfolgreich generiert!');
          fetchUserImages();
          setIsGenerating(false);
          setActiveTab('gallery');
        } else if (job.status === 'failed') {
          toast.error(job.error_message || 'Bildgenerierung fehlgeschlagen');
          setIsGenerating(false);
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Bildstatus konnte nicht überprüft werden:', error);
        setIsGenerating(false);
      }
    };
    
    poll();
  };

  const handleSubscription = async (planId) => {
    try {
      const response = await axios.post(`${API}/subscription/checkout?plan_id=${planId}`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      // Redirect to Stripe checkout
      window.location.href = response.data.checkout_url;
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checkout-Sitzung konnte nicht erstellt werden');
    }
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
              <h1 className="text-xl font-bold text-gray-900">ProduktAI</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span className={`font-semibold ${getCreditsColor()}`}>
                  {user.credits} Credits
                </span>
              </div>
              
              <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                {user.subscription_plan || 'Kostenlos'}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Abmelden
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
              <span>Generieren</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Gallery className="w-4 h-4" />
              <span>Galerie</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Abos</span>
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Product Upload */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <ImageIcon className="w-5 h-5" />
                    <span>Ihr Produkt</span>
                  </CardTitle>
                  <CardDescription>
                    Laden Sie Ihr Produktbild hoch, um professionelle Szenen zu generieren
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Product Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                      <div className="space-y-4">
                        {generationForm.productImage ? (
                          <div className="relative">
                            <img 
                              src={URL.createObjectURL(generationForm.productImage)} 
                              alt="Produkt" 
                              className="max-h-48 mx-auto rounded-lg shadow-md"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setGenerationForm(prev => ({ ...prev, productImage: null }))}
                            >
                              Entfernen
                            </Button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-900">Produktbild hochladen</p>
                              <p className="text-sm text-gray-600">Ziehen und ablegen oder klicken zum Durchsuchen</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="product-upload"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setGenerationForm(prev => ({ ...prev, productImage: file }));
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('product-upload').click()}
                            >
                              Datei auswählen
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Lighting Control */}
                    <div className="space-y-2">
                      <Label>Beleuchtung</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
                        value={generationForm.lighting}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, lighting: e.target.value }))}
                      >
                        <option value="natural">Natürliches Licht</option>
                        <option value="studio">Studio-Beleuchtung</option>
                        <option value="dramatic">Dramatische Schatten</option>
                        <option value="soft">Weiches Umgebungslicht</option>
                        <option value="golden">Goldene Stunde</option>
                        <option value="neon">Neon/Modern</option>
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                      <Label>Seitenverhältnis</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {['1:1', '4:3', '16:9', '3:4', '9:16'].map((ratio) => (
                          <Button
                            key={ratio}
                            variant={generationForm.aspectRatio === ratio ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setGenerationForm(prev => ({ ...prev, aspectRatio: ratio }));
                              // Update width/height based on ratio
                              const [w, h] = ratio.split(':').map(Number);
                              const baseSize = 1024;
                              if (w > h) {
                                setGenerationForm(prev => ({ ...prev, width: baseSize, height: Math.round(baseSize * h / w) }));
                              } else {
                                setGenerationForm(prev => ({ ...prev, width: Math.round(baseSize * w / h), height: baseSize }));
                              }
                            }}
                          >
                            {ratio}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Camera Perspective */}
                    <div className="space-y-2">
                      <Label>Kameraperspektive</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
                        value={generationForm.cameraAngle}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, cameraAngle: e.target.value }))}
                      >
                        <option value="front">Frontalansicht</option>
                        <option value="angle">3/4 Winkel</option>
                        <option value="side">Seitenansicht</option>
                        <option value="top">Von oben</option>
                        <option value="low">Niedriger Winkel</option>
                        <option value="high">Hoher Winkel</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Scene Creation */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Palette className="w-5 h-5" />
                    <span>Ihre eigene Szene erstellen</span>
                  </CardTitle>
                  <CardDescription>
                    Beschreiben Sie Ihre ideale Szene oder lassen Sie sich KI-gestützte Vorschläge machen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Manual Scene Description */}
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Szenenbeschreibung</Label>
                      <Textarea
                        id="prompt"
                        placeholder="z.B. Ein sonniger Strand mit Palmen und türkisem Wasser..."
                        value={generationForm.prompt}
                        onChange={(e) => setGenerationForm(prev => ({ ...prev, prompt: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Scene Ideas Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Oder Szenenideen erhalten</Label>
                      </div>
                      
                      {/* From Description */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Aus einer Beschreibung</Label>
                        <p className="text-xs text-gray-600">Beschreiben Sie eine Szenenidee, um einen detaillierten Prompt zu erhalten</p>
                        <div className="flex space-x-2">
                          <Input
                            id="scene-description-input"
                            placeholder="z.B. ein ruhiger Zen-Garten"
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              const input = document.getElementById('scene-description-input');
                              generateSceneIdeas(input.value);
                            }}
                            disabled={isLoadingIdeas}
                          >
                            {isLoadingIdeas ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Ideen erhalten'
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="text-center text-xs text-gray-500 font-medium">ODER</div>

                      {/* From Style Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Aus einem Stilbild</Label>
                        <p className="text-xs text-gray-600">Laden Sie ein Bild hoch, um Vorschläge zu inspirieren</p>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                          <div className="space-y-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-md mx-auto flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-600">Stil hochladen</p>
                            <Button variant="outline" size="sm">
                              Ideen aus Bild erhalten
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Scene Ideas */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Schnelle Szenenideen</Label>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {sceneIdeas.map((idea, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="text-left justify-start h-auto p-3 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg"
                            onClick={() => setGenerationForm(prev => ({ ...prev, prompt: idea }))}
                          >
                            <div className="flex items-start space-x-2">
                              <Star className="w-3 h-3 mt-0.5 text-gray-400" />
                              <span className="text-left leading-relaxed">{idea}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          // Shuffle the existing ideas for variety
                          const shuffled = [...sceneIdeas].sort(() => Math.random() - 0.5);
                          setSceneIdeas(shuffled);
                          toast.success('Szenenideen aktualisiert!');
                        }}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Ideen aktualisieren
                      </Button>
                    </div>

                    {/* Advanced Options */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <Label className="text-sm font-medium">Erweiterte Optionen</Label>
                      
                      {/* Style Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs">Stil</Label>
                        <select
                          className="w-full h-9 px-2 rounded-md border border-gray-300 bg-white text-xs"
                          value={generationForm.style}
                          onChange={(e) => setGenerationForm(prev => ({ ...prev, style: e.target.value }))}
                        >
                          <option value="realistic">Realistisch</option>
                          <option value="artistic">Künstlerisch</option>
                          <option value="minimal">Minimal</option>
                          <option value="vintage">Vintage</option>
                          <option value="modern">Modern</option>
                          <option value="cinematic">Kinematisch</option>
                        </select>
                      </div>

                      {/* What to Avoid */}
                      <div className="space-y-2">
                        <Label htmlFor="negative_prompt" className="text-xs">Was vermieden werden soll (Optional)</Label>
                        <Input
                          id="negative_prompt"
                          placeholder="unscharf, niedrige Qualität, dunkel..."
                          value={generationForm.negative_prompt}
                          onChange={(e) => setGenerationForm(prev => ({ ...prev, negative_prompt: e.target.value }))}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Button 
                    onClick={handleGenerate}
                    className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" 
                    disabled={isGenerating || user.credits < 4}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ImageIcon className="w-5 h-5 mr-2" />
                    )}
                    {isGenerating ? 'Ihre 4 Szenen werden generiert...' : `4 Bilder generieren (${user.credits} Credits verbleibend)`}
                  </Button>

                  {user.credits < 4 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 text-orange-700">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Nicht genügend Credits</span>
                      </div>
                      <p className="text-orange-600 text-sm mt-1">
                        Sie benötigen 4 Credits für eine Bildgenerierung (4 Bilder). Bitte kaufen Sie ein Abonnement.
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={66} className="w-full" />
                      <p className="text-sm text-gray-600">Ihre 4 professionellen Bilder werden generiert...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gallery className="w-5 h-5" />
                  <span>Ihre Kreationen</span>
                </CardTitle>
                <CardDescription>
                  Betrachten, herunterladen und verwalten Sie Ihre generierten Bilder
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Noch keine Bilder</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Generieren Sie Ihre ersten professionellen Produktbilder, um sie hier zu sehen. 
                          Sie haben 12 kostenlose Credits für 3 Generierungen (je 4 Bilder).
                        </p>
                        <Button 
                          onClick={() => setActiveTab('generate')}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Erstellen beginnen
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Gallery Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="text-sm">
                          {generatedImages.length} Bilder generiert
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {user.monthly_credits_used} Credits diesen Monat verwendet
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Alle herunterladen
                        </Button>
                        <Button variant="outline" size="sm">
                          Galerie exportieren
                        </Button>
                      </div>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {generatedImages.map((image) => (
                        <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200">
                          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                            {/* ECHTES BILD ANZEIGEN */}
                            {image.image_url ? (
                              <img 
                                src={`${BACKEND_URL}${image.image_url}`}
                                alt={image.prompt}
                                className="w-full h-full object-cover rounded-t-lg"
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            
                            {/* Fallback Placeholder (only shown if image fails to load) */}
                            <div className={`absolute inset-0 flex items-center justify-center ${image.image_url ? 'hidden' : ''}`}>
                              <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto">
                                  <ImageIcon className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-sm text-gray-700 font-medium">
                                  {image.status === 'processing' ? 'Wird generiert...' : 'Generiertes Bild'}
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  {image.width}×{image.height}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => {
                                    if (image.image_url) {
                                      // Download the image
                                      const link = document.createElement('a');
                                      link.href = `${BACKEND_URL}${image.image_url}`;
                                      link.download = `produktai_${image.id}.png`;
                                      link.click();
                                    }
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary">
                                  Teilen
                                </Button>
                                <Button size="sm" variant="secondary">
                                  Bearbeiten
                                </Button>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-3 left-3">
                              <Badge 
                                variant={image.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs capitalize"
                              >
                                {image.status === 'completed' ? 'Abgeschlossen' : 
                                 image.status === 'processing' ? 'Wird verarbeitet' : 
                                 image.status === 'pending' ? 'Wartend' : 'Fehlgeschlagen'}
                              </Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-4 space-y-3">
                            {/* Prompt Preview */}
                            <div>
                              <p className="text-sm text-gray-800 line-clamp-2 font-medium">
                                {image.prompt}
                              </p>
                              {image.negative_prompt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Vermieden: {image.negative_prompt}
                                </p>
                              )}
                            </div>
                            
                            {/* Image Details */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{new Date(image.created_at).toLocaleDateString('de-DE')}</span>
                              <div className="flex items-center space-x-2">
                                <span>{image.width}×{image.height}</span>
                                <span>•</span>
                                <span className="capitalize">
                                  {image.status === 'completed' ? 'Abgeschlossen' : 
                                   image.status === 'processing' ? 'Verarbeitung' : 
                                   image.status === 'pending' ? 'Wartend' : 'Fehlgeschlagen'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs"
                                onClick={() => {
                                  if (image.image_url) {
                                    const link = document.createElement('a');
                                    link.href = `${BACKEND_URL}${image.image_url}`;
                                    link.download = `produktai_${image.id}.png`;
                                    link.click();
                                  }
                                }}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Herunterladen
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 text-xs">
                                Neu generieren
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Load More */}
                    {generatedImages.length >= 9 && (
                      <div className="text-center pt-4">
                        <Button variant="outline">
                          Weitere Bilder laden
                        </Button>
                      </div>
                    )}
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
                  <span>Abonnement-Pläne</span>
                </CardTitle>
                <CardDescription>
                  Wählen Sie den perfekten Plan für Ihre kreativen Bedürfnisse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(subscriptionPlans).map(([planId, plan]) => (
                    <Card key={planId} className={`relative ${user.subscription_plan === planId ? 'ring-2 ring-indigo-500' : ''}`}>
                      {planId === 'premium' && (
                        <Badge className="absolute -top-2 left-4 bg-indigo-600">
                          <Star className="w-3 h-3 mr-1" />
                          Beliebt
                        </Badge>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-indigo-600">
                          €{plan.price}
                          <span className="text-sm text-gray-500 font-normal">/Monat</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {plan.monthly_credits}
                          </div>
                          <div className="text-sm text-gray-600">Bilder pro Monat</div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Hochwertige Generierung</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Benutzerdefinierte Dimensionen</span>
                          </div>
                          {planId !== 'basic' && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Priorisierte Verarbeitung</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full"
                          variant={user.subscription_plan === planId ? 'secondary' : 'default'}
                          onClick={() => handleSubscription(planId)}
                          disabled={user.subscription_plan === planId}
                        >
                          {user.subscription_plan === planId ? 'Aktueller Plan' : 'Plan wählen'}
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
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<NooviLandingPage />} />
      <Route path="/app" element={user ? <Dashboard /> : <AuthPage />} />
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
        toast.error('Zahlungsverifizierung abgelaufen. Bitte kontaktieren Sie den Support.');
        return;
      }

      try {
        const response = await axios.get(`${API}/subscription/status/${sessionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.payment_status === 'paid') {
          await fetchUser();
          setIsProcessing(false);
          toast.success('Abonnement erfolgreich aktiviert!');
        } else if (response.data.status === 'expired') {
          setIsProcessing(false);
          toast.error('Zahlungssitzung abgelaufen.');
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        setIsProcessing(false);
        toast.error('Zahlungsstatus konnte nicht verifiziert werden.');
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
              <h2 className="text-xl font-semibold mb-2">Zahlung wird verarbeitet...</h2>
              <p className="text-gray-600">Bitte warten Sie, während wir Ihr Abonnement aktivieren.</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">Abonnement aktiviert!</h2>
              <p className="text-gray-600 mb-4">Ihr Abonnement wurde erfolgreich aktiviert.</p>
              <Button onClick={() => window.location.href = '/'}>
                Zum Dashboard
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
          <h2 className="text-xl font-semibold mb-2">Zahlung abgebrochen</h2>
          <p className="text-gray-600 mb-4">Ihre Zahlung wurde abgebrochen. Sie können es jederzeit erneut versuchen.</p>
          <Button onClick={() => window.location.href = '/'}>
            Zurück zum Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;