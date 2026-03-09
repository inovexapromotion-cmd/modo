/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Music, 
  Mic2, 
  Zap, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  Layout,
  Plus,
  ChevronRight, 
  Sparkles, 
  Loader2,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Download,
  Trash2,
  CreditCard,
  ShieldCheck,
  Menu,
  X,
  Upload,
  Image as ImageIcon,
  Play,
  Share2,
  Globe,
  Volume2,
  Monitor,
  Type,
  Palette,
  FileVideo,
  Pencil,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

import { AD_STYLES, VIDEO_DURATIONS, RESOLUTIONS, EXPORT_FORMATS, SOCIAL_PLATFORMS, CONTENT_TYPES, TONES } from './constants';
import { AdConfig, GeneratedAd, AppSettings, ContentType, WritingConfig, GeneratedContent } from './types';
import { generateAdScript, generateWriting, refineWriting } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Logo = ({ customLogo }: { customLogo?: string }) => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-brand-primary/20 rounded-xl rotate-6" />
      <div className="relative bg-brand-primary text-white p-2 rounded-xl overflow-hidden">
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </div>
    </div>
    <div className="flex flex-col">
      <span className="font-serif text-xl font-bold leading-none tracking-tight text-ink">MODO</span>
      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-primary leading-none mt-1">AI Ad Studio</span>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'settings'>('create');
  const [createMode, setCreateMode] = useState<'ad' | 'writing' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<(GeneratedAd | GeneratedContent)[]>([]);
  const [copied, setCopied] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [adConfig, setAdConfig] = useState<AdConfig>({
    productName: '',
    description: '',
    price: '',
    brand: '',
    targetAudience: '',
    style: 'modern',
    duration: '15s',
  });

  const [writingConfig, setWritingConfig] = useState<WritingConfig>({
    type: 'blog',
    topic: '',
    tone: 'Professional',
    length: 'medium',
    additionalInstructions: ''
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('modo_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return {
      language: 'English',
      voiceStyle: 'Professional Male',
      resolution: '1080p',
      animationIntensity: 50,
      subtitles: true,
      musicVolume: 70,
      brandColor: '#F27D26',
      exportFormat: 'MP4',
    };
  });

  useEffect(() => {
    localStorage.setItem('modo_settings', JSON.stringify(settings));
  }, [settings]);

  const handleGenerateAd = async () => {
    if (!adConfig.productName || !adConfig.description) return;
    setIsGenerating(true);
    try {
      setError(null);
      const result = await generateAdScript(adConfig, settings.apiKey);
      const newAd: GeneratedAd = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || 'Untitled Ad',
        script: result.script || '',
        config: { ...adConfig },
        createdAt: Date.now()
      };
      setGeneratedAd(newAd);
      setHistory(prev => [newAd, ...prev]);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Failed to generate ad script';
      if (msg.includes('API key not valid')) {
        msg = 'The Gemini API key is invalid. Please check your Settings or the server environment variables.';
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWriting = async () => {
    if (!writingConfig.topic) return;
    setIsGenerating(true);
    try {
      setError(null);
      const result = await generateWriting(writingConfig, settings.apiKey);
      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || 'Untitled',
        body: result.body || '',
        type: writingConfig.type,
        createdAt: Date.now()
      };
      setGeneratedContent(newContent);
      setHistory(prev => [newContent, ...prev]);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Failed to generate content';
      if (msg.includes('API key not valid')) {
        msg = 'The Gemini API key is invalid. Please check your Settings or the server environment variables.';
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInput || !generatedContent) return;
    setIsRefining(true);
    try {
      setError(null);
      const newBody = await refineWriting(generatedContent.body, refineInput, settings.apiKey);
      const updatedContent = { ...generatedContent, body: newBody || generatedContent.body };
      setGeneratedContent(updatedContent);
      setRefineInput('');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Failed to refine content';
      if (msg.includes('API key not valid')) {
        msg = 'The Gemini API key is invalid. Please check your Settings or the server environment variables.';
      }
      setError(msg);
    } finally {
      setIsRefining(false);
    }
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: 'dashboard' | 'create' | 'settings', icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
      className={cn(
        "flex flex-col md:flex-row items-center gap-1 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-2xl text-[10px] md:text-sm font-semibold transition-all flex-1 md:flex-none",
        activeTab === tab 
          ? "text-brand-primary md:bg-brand-primary md:text-white md:shadow-lg md:shadow-brand-primary/20" 
          : "text-ink/40 hover:text-brand-primary md:hover:bg-brand-primary/5"
      )}
    >
      <Icon className="w-5 h-5 md:w-4 md:h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 bg-card border-r border-ink/5 flex-col z-20 sticky top-0 h-screen">
        <div className="p-8">
          <Logo customLogo={settings.logoWatermark} />
          <nav className="mt-12 space-y-2">
            <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem tab="create" icon={Plus} label="Create Ad" />
            <NavItem tab="settings" icon={SettingsIcon} label="Settings" />
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-ink/5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-ink/40 hover:text-brand-primary hover:bg-brand-primary/5 mb-4"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-card border-b border-ink/5 flex items-center justify-between px-6 sticky top-0 z-30">
        <Logo customLogo={settings.logoWatermark} />
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-ink/40 hover:text-brand-primary transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 md:pb-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-10">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    {error}
                  </div>
                  <button onClick={() => setError(null)} className="text-red-500/40 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="bg-card p-8 rounded-[32px] border border-ink/5 shadow-sm">
                    <h2 className="font-serif text-3xl font-medium mb-4">Welcome to MODO AI Studio</h2>
                    <p className="text-ink/60 leading-relaxed mb-4">
                      Our app offers powerful AI writing services for blogs, articles, advertisements, product descriptions, social media content, emails, and more. Designed for creators, businesses, students, and marketers, it helps users generate high-quality, engaging, and original content in seconds.
                    </p>
                    <p className="text-ink/60 leading-relaxed">
                      With intelligent AI technology, the app understands your topic, tone, and purpose to deliver well-structured and professional writing. Whether you need persuasive ad copy, informative articles, creative blogs, or clear product descriptions, the app saves time and boosts productivity.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-3xl md:text-4xl font-medium">Your Projects</h2>
                      <p className="text-sm text-ink/40 font-medium">Manage your generated advertisements and content.</p>
                    </div>
                    <button onClick={() => { setActiveTab('create'); setCreateMode(null); }} className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 flex items-center gap-2 w-fit">
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-[32px] border border-ink/5">
                      <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Video className="w-8 h-8 text-ink/10" />
                      </div>
                      <h3 className="font-serif text-xl font-medium mb-2">No projects yet</h3>
                      <p className="text-sm text-ink/40 max-w-xs mx-auto">Start by creating your first AI-powered advertisement or writing piece.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {history.map(item => (
                        <div 
                          key={item.id} 
                          className="bg-card rounded-[24px] border border-ink/5 overflow-hidden group hover:shadow-xl transition-all cursor-pointer" 
                          onClick={() => { 
                            if ('script' in item) {
                              setGeneratedAd(item);
                              setCreateMode('ad');
                            } else {
                              setGeneratedContent(item);
                              setCreateMode('writing');
                            }
                            setActiveTab('create'); 
                          }}
                        >
                          <div className="aspect-video bg-paper relative flex items-center justify-center">
                            {'script' in item ? (
                              <Play className="w-10 h-10 text-ink/10 group-hover:scale-110 transition-transform" />
                            ) : (
                              <FileText className="w-10 h-10 text-ink/10 group-hover:scale-110 transition-transform" />
                            )}
                            {'config' in item && (
                              <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">{item.config.duration}</div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                                {'config' in item ? item.config.style : item.type}
                              </span>
                              <span className="text-[10px] text-ink/20">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-serif text-lg font-medium mb-4 line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-2">
                              <button className="flex-1 py-2 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-primary/5 hover:text-brand-primary transition-colors">View</button>
                              <button className="p-2 text-ink/20 hover:text-rose-500 transition-colors" onClick={(e) => deleteFromHistory(item.id, e)}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'create' && (
                <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {!createMode && !generatedAd && !generatedContent ? (
                    <div className="space-y-12">
                      <div className="text-center md:text-left">
                        <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-4">What shall we craft today?</h2>
                        <p className="text-lg text-ink/40 font-serif italic">Select your creative path.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button 
                          onClick={() => setCreateMode('ad')}
                          className="group bg-card p-10 rounded-[40px] border border-ink/5 hover:border-brand-primary/20 hover:shadow-2xl transition-all text-left relative overflow-hidden"
                        >
                          <div className="absolute top-6 right-6 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[8px] font-bold uppercase tracking-widest rounded-full">
                            Video Generator Coming Soon
                          </div>
                          <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                            <Video className="w-8 h-8" />
                          </div>
                          <h3 className="font-serif text-2xl font-medium mb-4">Video Advertisement</h3>
                          <p className="text-ink/40 leading-relaxed">Generate professional marketing scripts and video concepts for social media.</p>
                        </button>

                        <button 
                          onClick={() => setCreateMode('writing')}
                          className="group bg-card p-10 rounded-[40px] border border-ink/5 hover:border-brand-primary/20 hover:shadow-2xl transition-all text-left"
                        >
                          <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                            <Pencil className="w-8 h-8" />
                          </div>
                          <h3 className="font-serif text-2xl font-medium mb-4">AI Writing Services</h3>
                          <p className="text-ink/40 leading-relaxed">Craft blogs, articles, product descriptions, emails, and more in seconds.</p>
                        </button>
                      </div>
                    </div>
                  ) : createMode === 'ad' ? (
                    !generatedAd ? (
                      <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-12">
                          <button onClick={() => setCreateMode(null)} className="p-3 bg-card border border-ink/5 rounded-2xl hover:bg-brand-primary/5 hover:text-brand-primary transition-all">
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div className="flex items-center gap-3">
                            <h2 className="font-serif text-3xl font-medium">Video Ad Generator</h2>
                            <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-bold uppercase tracking-widest rounded-full">Beta</span>
                          </div>
                        </div>

                        <div className="bg-card p-12 md:p-20 rounded-[40px] border border-ink/5 shadow-xl shadow-ink/[0.02] text-center space-y-8 relative overflow-hidden">
                          <div className="absolute inset-0 bg-brand-primary/5 opacity-50 blur-3xl -z-10" />
                          <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Video className="w-10 h-10" />
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-serif text-4xl font-medium">Coming Soon</h3>
                            <p className="text-ink/40 max-w-md mx-auto leading-relaxed">
                              We're currently fine-tuning our AI video engine to deliver cinematic marketing videos in seconds. 
                              Stay tuned for the official launch!
                            </p>
                          </div>
                          <div className="pt-8">
                            <button 
                              onClick={() => setCreateMode(null)}
                              className="px-8 py-4 bg-ink text-white rounded-2xl font-bold text-sm hover:bg-brand-primary transition-all"
                            >
                              Back to Dashboard
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* ... existing Ad Result UI ... */}
                        <div className="lg:col-span-7 space-y-8">
                          <button onClick={() => setGeneratedAd(null)} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-ink/40 hover:text-brand-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Input
                          </button>

                          <div className="bg-card rounded-[40px] border border-ink/5 shadow-2xl overflow-hidden">
                            <div className="aspect-video bg-black relative flex items-center justify-center group">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                              <div className="z-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                                  <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">AI Video Preview</p>
                              </div>
                              
                              {/* Coming Soon Overlays */}
                              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                <div className="px-3 py-1 bg-brand-primary text-white text-[8px] font-bold uppercase tracking-widest rounded-full">AI Video Generator (Coming Soon)</div>
                              </div>
                            </div>
                            
                            <div className="p-8 md:p-12">
                              <div className="flex items-center justify-between mb-8">
                                <h2 className="font-serif text-3xl font-medium">{generatedAd.title}</h2>
                                <div className="flex items-center gap-2">
                                  <button className="p-3 bg-paper rounded-xl text-ink/40 hover:text-brand-primary transition-colors"><Download className="w-5 h-5" /></button>
                                  <button className="p-3 bg-paper rounded-xl text-ink/40 hover:text-brand-primary transition-colors"><Share2 className="w-5 h-5" /></button>
                                </div>
                              </div>
                              <div className="markdown-body text-sm md:text-base leading-relaxed">
                                <Markdown>{generatedAd.script}</Markdown>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: AI Tools (Coming Soon) */}
                        <div className="lg:col-span-5 space-y-6 sticky top-24">
                          <div className="bg-card p-8 rounded-[32px] border border-ink/5 shadow-sm space-y-8">
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                                  <Mic2 className="w-4 h-4" />
                                  AI Voiceover
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest bg-paper px-2 py-1 rounded-lg text-ink/20">Coming Soon</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 opacity-40 grayscale pointer-events-none">
                                <button className="py-3 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-wider border border-ink/5">Male Voice</button>
                                <button className="py-3 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-wider border border-ink/5">Female Voice</button>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                                  <Music className="w-4 h-4" />
                                  AI Music
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest bg-paper px-2 py-1 rounded-lg text-ink/20">Coming Soon</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 opacity-40 grayscale pointer-events-none">
                                <button className="py-3 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-wider border border-ink/5">Corporate</button>
                                <button className="py-3 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-wider border border-ink/5">Energetic</button>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                                  <Zap className="w-4 h-4" />
                                  Animation
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest bg-paper px-2 py-1 rounded-lg text-ink/20">Coming Soon</span>
                              </div>
                              <div className="h-1.5 w-full bg-paper rounded-full overflow-hidden opacity-40 grayscale pointer-events-none">
                                <div className="h-full w-1/2 bg-brand-primary rounded-full" />
                              </div>
                            </div>

                            <button className="w-full py-4 bg-brand-primary/10 text-brand-primary rounded-2xl font-bold text-sm hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3">
                              <FileVideo className="w-4 h-4" />
                              Export Final Video
                            </button>
                          </div>

                          <div className="bg-brand-primary/5 p-6 rounded-[24px] border border-brand-primary/10">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-2">Social Media Export</h4>
                            <div className="flex gap-4">
                              {SOCIAL_PLATFORMS.map(p => (
                                <p.icon key={p.id} className="w-5 h-5 text-brand-primary/40 hover:text-brand-primary cursor-pointer transition-colors" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    !generatedContent ? (
                      <div className="max-w-3xl mx-auto space-y-10">
                        <div className="flex items-center gap-4 mb-8">
                          <button onClick={() => setCreateMode(null)} className="p-3 bg-card border border-ink/5 rounded-2xl hover:bg-brand-primary/5 hover:text-brand-primary transition-all">
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <h2 className="font-serif text-3xl font-medium">AI Writing Studio</h2>
                        </div>

                        <div className="bg-card p-12 rounded-[40px] border border-ink/5 shadow-xl shadow-ink/[0.02] space-y-10">
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">Content Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {CONTENT_TYPES.map(type => (
                                <button 
                                  key={type.type}
                                  onClick={() => setWritingConfig({...writingConfig, type: type.type})}
                                  className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                    writingConfig.type === type.type ? "bg-brand-primary text-white border-brand-primary" : "bg-paper border-ink/5 text-ink/40 hover:border-brand-primary/20"
                                  )}
                                >
                                  <type.icon className="w-5 h-5" />
                                  <span className="text-[9px] font-bold uppercase tracking-widest">{type.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">The Subject</label>
                            <textarea 
                              value={writingConfig.topic}
                              onChange={(e) => setWritingConfig(prev => ({ ...prev, topic: e.target.value }))}
                              placeholder="What is the core message or story you wish to convey?"
                              className="w-full h-40 bg-paper border border-ink/5 rounded-3xl p-6 text-lg font-serif focus:ring-1 focus:ring-brand-primary/20 transition-all resize-none placeholder:italic"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">Tone & Voice</label>
                              <select 
                                value={writingConfig.tone}
                                onChange={(e) => setWritingConfig(prev => ({ ...prev, tone: e.target.value }))}
                                className="w-full bg-paper border border-ink/5 rounded-2xl px-6 py-4 text-sm font-bold appearance-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
                              >
                                {TONES.map(tone => (
                                  <option key={tone} value={tone}>{tone}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">Scope</label>
                              <div className="flex bg-paper border border-ink/5 p-1.5 rounded-2xl">
                                {(['short', 'medium', 'long'] as const).map((l) => (
                                  <button
                                    key={l}
                                    onClick={() => setWritingConfig(prev => ({ ...prev, length: l }))}
                                    className={cn(
                                      "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                                      writingConfig.length === l ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-ink/30 hover:text-ink/60"
                                    )}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={handleGenerateWriting}
                            disabled={isGenerating || !writingConfig.topic}
                            className="w-full py-6 bg-brand-primary text-white rounded-[24px] font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/20"
                          >
                            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                            {isGenerating ? 'Crafting Manuscript...' : 'Begin Synthesis'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-4 space-y-6 sticky top-24">
                          <button onClick={() => setGeneratedContent(null)} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-ink/40 hover:text-brand-primary transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            New Draft
                          </button>
                          <div className="bg-card p-8 rounded-[32px] border border-ink/5 shadow-sm space-y-8">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                                <Sparkles className="w-3.5 h-3.5" />
                                Refinement
                              </div>
                              <textarea 
                                value={refineInput}
                                onChange={(e) => setRefineInput(e.target.value)}
                                placeholder="e.g., 'Make it more poetic'..."
                                className="w-full h-32 bg-paper border border-ink/5 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-brand-primary/20 transition-all resize-none font-medium"
                              />
                              <button 
                                onClick={handleRefine}
                                disabled={isRefining || !refineInput}
                                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20"
                              >
                                {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Refine Content
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-8">
                          <div className="bg-card rounded-[40px] border border-ink/5 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
                            <div className="p-12 border-b border-ink/5 bg-paper/50">
                              <h2 className="font-serif text-5xl font-medium leading-tight tracking-tight text-ink">{generatedContent.title}</h2>
                            </div>
                            <div className="p-12 flex-1">
                              <div className="markdown-body max-w-2xl mx-auto">
                                <Markdown>{generatedContent.body}</Markdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto space-y-10">
                  <div>
                    <h2 className="font-serif text-3xl md:text-4xl font-medium">Settings</h2>
                    <p className="text-sm text-ink/40 font-medium">Customize your AI Ad Studio experience.</p>
                  </div>

                  <div className="bg-card p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-ink/5 shadow-sm space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Globe className="w-3 h-3" />
                          Language Preference
                        </label>
                        <select 
                          value={settings.language}
                          onChange={e => setSettings({...settings, language: e.target.value})}
                          className="w-full bg-paper border border-ink/5 rounded-xl px-4 py-3 text-xs font-bold appearance-none"
                        >
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Mic2 className="w-3 h-3" />
                          Voice Style
                        </label>
                        <select 
                          value={settings.voiceStyle}
                          onChange={e => setSettings({...settings, voiceStyle: e.target.value})}
                          className="w-full bg-paper border border-ink/5 rounded-xl px-4 py-3 text-xs font-bold appearance-none"
                        >
                          <option>Professional Male</option>
                          <option>Professional Female</option>
                          <option>Casual Friendly</option>
                          <option>Luxury Deep</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Monitor className="w-3 h-3" />
                          Video Resolution
                        </label>
                        <div className="flex bg-paper border border-ink/5 p-1 rounded-xl">
                          {RESOLUTIONS.map(r => (
                            <button 
                              key={r}
                              onClick={() => setSettings({...settings, resolution: r})}
                              className={cn(
                                "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                settings.resolution === r ? "bg-brand-primary text-white" : "text-ink/30 hover:text-ink/60"
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Zap className="w-3 h-3" />
                          Animation Intensity
                        </label>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={settings.animationIntensity}
                          onChange={e => setSettings({...settings, animationIntensity: parseInt(e.target.value)})}
                          className="w-full h-1.5 bg-paper rounded-full appearance-none cursor-pointer accent-brand-primary"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-ink/20 uppercase tracking-widest">
                          <span>Subtle</span>
                          <span>Dynamic</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Type className="w-3 h-3" />
                          Subtitles
                        </label>
                        <button 
                          onClick={() => setSettings({...settings, subtitles: !settings.subtitles})}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors",
                            settings.subtitles ? "bg-brand-primary" : "bg-paper border border-ink/5"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                            settings.subtitles ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Volume2 className="w-3 h-3" />
                          Music Volume
                        </label>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={settings.musicVolume}
                          onChange={e => setSettings({...settings, musicVolume: parseInt(e.target.value)})}
                          className="w-full h-1.5 bg-paper rounded-full appearance-none cursor-pointer accent-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <Palette className="w-3 h-3" />
                          Brand Color
                        </label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="color" 
                            value={settings.brandColor}
                            onChange={e => setSettings({...settings, brandColor: e.target.value})}
                            className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent"
                          />
                          <span className="text-xs font-mono text-ink/40 uppercase">{settings.brandColor}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <ImageIcon className="w-3 h-3" />
                          Logo Watermark
                        </label>
                        {settings.logoWatermark ? (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-paper rounded-xl border border-ink/5 p-2 flex items-center justify-center">
                              <img src={settings.logoWatermark} alt="Logo" className="max-w-full max-h-full object-contain" />
                            </div>
                            <button 
                              onClick={() => setSettings({...settings, logoWatermark: undefined})}
                              className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="w-full py-3 bg-paper border border-dashed border-ink/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-ink/40 flex items-center justify-center">
                            No Logo Set
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <ShieldCheck className="w-3 h-3" />
                        Gemini API Key (Optional if set in environment)
                      </label>
                      <input 
                        type="password"
                        value={settings.apiKey || ''}
                        onChange={e => setSettings({...settings, apiKey: e.target.value})}
                        placeholder="Enter your Gemini API Key..."
                        className="w-full bg-paper border border-ink/5 rounded-xl px-4 py-3 text-xs font-medium focus:ring-1 focus:ring-brand-primary/20 transition-all"
                      />
                      <p className="text-[9px] text-ink/30 uppercase tracking-widest">
                        Your key is stored locally in your browser and used only for requests.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <Download className="w-3 h-3" />
                        Default Export Format
                      </label>
                      <div className="flex bg-paper border border-ink/5 p-1 rounded-xl">
                        {EXPORT_FORMATS.map(f => (
                          <button 
                            key={f}
                            onClick={() => setSettings({...settings, exportFormat: f})}
                            className={cn(
                              "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                              settings.exportFormat === f ? "bg-brand-primary text-white" : "text-ink/30 hover:text-ink/60"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-ink/5 flex items-center justify-around px-2 z-40 pb-4">
        <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem tab="create" icon={Plus} label="Create" />
        <NavItem tab="settings" icon={SettingsIcon} label="Settings" />
      </nav>
    </div>
  );
}
