/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenLine, 
  History, 
  Settings, 
  ChevronRight, 
  Sparkles, 
  Loader2,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  MoreVertical,
  Download,
  Trash2,
  CreditCard,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

import { CONTENT_TYPES, TONES } from './constants';
import { ContentType, WritingConfig, GeneratedContent, SubscriptionPlan } from './types';
import { generateWriting, refineWriting } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full fill-brand-primary">
        <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-brand-primary" />
        <path d="M30,70 Q50,40 70,70" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-brand-secondary" />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="font-serif text-2xl font-bold leading-none tracking-tight text-ink">MODO</span>
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary leading-none mt-1">AI Writer</span>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'history' | 'subscription'>('write');
  const [subscription, setSubscription] = useState<SubscriptionPlan>('free');
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [copied, setCopied] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const [config, setConfig] = useState<WritingConfig>({
    type: 'blog',
    topic: '',
    tone: 'Professional',
    length: 'medium',
    additionalInstructions: ''
  });

  const handleGenerate = async () => {
    if (!config.topic) return;
    setIsGenerating(true);
    try {
      const result = await generateWriting(config);
      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || 'Untitled',
        body: result.body || '',
        type: config.type,
        createdAt: Date.now()
      };
      setGeneratedContent(newContent);
      setHistory(prev => [newContent, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInput || !generatedContent) return;
    setIsRefining(true);
    try {
      const newBody = await refineWriting(generatedContent.body, refineInput);
      const updatedContent = { ...generatedContent, body: newBody || generatedContent.body };
      setGeneratedContent(updatedContent);
      setRefineInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-ink/5 flex flex-col z-20">
        <div className="p-8">
          <Logo />
          
          <nav className="mt-12 space-y-2">
            <button 
              onClick={() => { setActiveTab('write'); setSelectedType(null); setGeneratedContent(null); }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                activeTab === 'write' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-ink/40 hover:bg-brand-primary/5 hover:text-brand-primary"
              )}
            >
              <PenLine className="w-4 h-4" />
              Write New
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                activeTab === 'history' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-ink/40 hover:bg-brand-primary/5 hover:text-brand-primary"
              )}
            >
              <History className="w-4 h-4" />
              Archive
            </button>
            <button 
              onClick={() => setActiveTab('subscription')}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                activeTab === 'subscription' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-ink/40 hover:bg-brand-primary/5 hover:text-brand-primary"
              )}
            >
              <CreditCard className="w-4 h-4" />
              Subscription
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-ink/5">
          <div className="bg-brand-primary/5 p-4 rounded-2xl mb-6 border border-brand-primary/10">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-primary mb-2">
              <Sparkles className="w-3 h-3" />
              AI Credits
            </div>
            <div className="h-1.5 w-full bg-brand-primary/10 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-brand-primary rounded-full" />
            </div>
            <div className="mt-2 text-[11px] font-medium text-brand-primary/60">750 / 1000 words left</div>
          </div>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-ink/40 hover:bg-ink/5 hover:text-ink transition-all">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-ink/5 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl font-medium">
              {activeTab === 'write' ? 'Studio' : activeTab === 'history' ? 'Archive' : 'Subscription'}
            </h1>
            {activeTab === 'write' && selectedType && !generatedContent && (
              <>
                <ChevronRight className="w-4 h-4 text-ink/20" />
                <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
                  {CONTENT_TYPES.find(t => t.type === selectedType)?.label}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {subscription !== 'free' && (
              <div className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-secondary/20">
                {subscription} Plan
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink/40">Gemini 3.0 Flash</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 border border-ink/5" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'write' ? (
                <motion.div
                  key="write-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  {!selectedType && !generatedContent ? (
                    <div className="space-y-12">
                      <div className="max-w-2xl">
                        <h2 className="font-serif text-5xl font-medium leading-tight mb-4">What shall we craft today?</h2>
                        <p className="text-lg text-ink/40 font-serif italic">Select a medium to begin your creative journey.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CONTENT_TYPES.map((item, idx) => (
                          <motion.button
                            key={item.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                              setSelectedType(item.type);
                              setConfig(prev => ({ ...prev, type: item.type }));
                            }}
                            className="group relative bg-white p-8 rounded-[32px] border border-ink/5 hover:border-brand-primary/20 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all text-left overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-5 h-5 text-brand-primary/20" />
                            </div>
                            <div className="w-14 h-14 bg-paper rounded-2xl border border-ink/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                              <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-serif text-xl font-medium mb-2 group-hover:text-brand-primary transition-colors">{item.label}</h3>
                            <p className="text-sm text-ink/40 leading-relaxed font-medium">
                              {item.description}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      {/* Left Side: Controls */}
                      <div className="lg:col-span-4 space-y-6 sticky top-24">
                        <button 
                          onClick={() => setGeneratedContent(null)}
                          className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-ink/40 hover:text-brand-primary transition-colors mb-4"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          New Draft
                        </button>

                        <div className="bg-white p-8 rounded-[32px] border border-ink/5 shadow-sm space-y-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                              <Sparkles className="w-3.5 h-3.5" />
                              Refinement
                            </div>
                            <textarea 
                              value={refineInput}
                              onChange={(e) => setRefineInput(e.target.value)}
                              placeholder="e.g., 'Make it more poetic', 'Add a professional summary'..."
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

                          <div className="pt-8 border-t border-ink/5 space-y-3">
                            <button 
                              onClick={copyToClipboard}
                              className="w-full flex items-center justify-between px-6 py-4 bg-paper border border-ink/5 rounded-2xl text-sm font-bold hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
                            >
                              <span className="flex items-center gap-3">
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-ink/40" />}
                                {copied ? 'Copied to Clipboard' : 'Copy Content'}
                              </span>
                            </button>
                            <button className="w-full flex items-center justify-between px-6 py-4 bg-paper border border-ink/5 rounded-2xl text-sm font-bold hover:bg-brand-primary/5 hover:text-brand-primary transition-all">
                              <span className="flex items-center gap-3">
                                <Download className="w-4 h-4 text-ink/40" />
                                Export as PDF
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Content */}
                      <div className="lg:col-span-8">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-[40px] border border-ink/5 shadow-2xl shadow-ink/[0.02] overflow-hidden min-h-[800px] flex flex-col"
                        >
                          <div className="p-12 border-b border-ink/5 bg-paper/50">
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/40 mb-6">
                              <div className="w-8 h-[1px] bg-brand-primary/20" />
                              Draft Manuscript
                            </div>
                            <h2 className="font-serif text-5xl font-medium leading-tight tracking-tight text-ink">{generatedContent.title}</h2>
                          </div>
                          <div className="p-12 flex-1">
                            <div className="markdown-body max-w-2xl mx-auto">
                              <Markdown>{generatedContent.body}</Markdown>
                            </div>
                          </div>
                          <div className="p-10 border-t border-ink/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-ink/20">
                            <span>MODO Editorial Studio</span>
                            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => setSelectedType(null)}
                            className="w-12 h-12 bg-white border border-ink/5 rounded-2xl flex items-center justify-center hover:bg-brand-primary/5 hover:text-brand-primary transition-all"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div>
                            <h2 className="font-serif text-3xl font-medium">
                              {CONTENT_TYPES.find(t => t.type === selectedType)?.label}
                            </h2>
                            <p className="text-sm font-medium text-ink/40">Define the parameters of your piece.</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-12 rounded-[40px] border border-ink/5 shadow-xl shadow-ink/[0.02] space-y-10">
                        <div className="space-y-4">
                          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">The Subject</label>
                          <textarea 
                            value={config.topic}
                            onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                            placeholder="What is the core message or story you wish to convey?"
                            className="w-full h-40 bg-paper border border-ink/5 rounded-3xl p-6 text-lg font-serif focus:ring-1 focus:ring-brand-primary/20 transition-all resize-none placeholder:italic"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">Tone & Voice</label>
                            <div className="relative">
                              <select 
                                value={config.tone}
                                onChange={(e) => setConfig(prev => ({ ...prev, tone: e.target.value }))}
                                className="w-full bg-paper border border-ink/5 rounded-2xl px-6 py-4 text-sm font-bold appearance-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
                              >
                                {TONES.map(tone => (
                                  <option key={tone} value={tone}>{tone}</option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/20 rotate-90 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">Scope</label>
                            <div className="flex bg-paper border border-ink/5 p-1.5 rounded-2xl">
                              {(['short', 'medium', 'long'] as const).map((l) => (
                                <button
                                  key={l}
                                  onClick={() => setConfig(prev => ({ ...prev, length: l }))}
                                  className={cn(
                                    "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                                    config.length === l ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-ink/30 hover:text-ink/60"
                                  )}
                                >
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">Nuance & Context</label>
                          <input 
                            type="text"
                            value={config.additionalInstructions}
                            onChange={(e) => setConfig(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                            placeholder="Any specific nuances or constraints?"
                            className="w-full bg-paper border border-ink/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-1 focus:ring-brand-primary/20 transition-all"
                          />
                        </div>

                        <button 
                          onClick={handleGenerate}
                          disabled={isGenerating || !config.topic}
                          className="w-full py-6 bg-brand-primary text-white rounded-[24px] font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/20"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Crafting Manuscript...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-6 h-6" />
                              Begin Synthesis
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'history' ? (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-serif text-4xl font-medium">Your Archive</h2>
                    <div className="text-sm font-bold text-ink/40 uppercase tracking-widest">{history.length} Entries</div>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-ink/5">
                      <History className="w-16 h-16 text-ink/5 mx-auto mb-6" />
                      <h3 className="font-serif text-2xl font-medium mb-2">The archive is empty</h3>
                      <p className="text-ink/40 font-medium max-w-xs mx-auto">Your creative history will be preserved here for future reference.</p>
                      <button 
                        onClick={() => setActiveTab('write')}
                        className="mt-8 px-8 py-3 bg-brand-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
                      >
                        Create First Entry
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {history.map((item) => (
                        <motion.div 
                          layout
                          key={item.id}
                          onClick={() => {
                            setGeneratedContent(item);
                            setActiveTab('write');
                          }}
                          className="bg-white p-8 rounded-[32px] border border-ink/5 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/[0.02] transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-8">
                            <div className="w-14 h-14 bg-paper rounded-2xl border border-ink/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                              {CONTENT_TYPES.find(t => t.type === item.type)?.icon && (
                                React.createElement(CONTENT_TYPES.find(t => t.type === item.type)!.icon, { className: "w-6 h-6" })
                              )}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary/40 mb-1">
                                {CONTENT_TYPES.find(t => t.type === item.type)?.label}
                              </div>
                              <h3 className="font-serif text-xl font-medium group-hover:text-brand-primary transition-colors">{item.title}</h3>
                              <p className="text-[11px] font-bold text-ink/20 mt-1 uppercase tracking-widest">
                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={(e) => deleteFromHistory(item.id, e)}
                              className="p-3 rounded-xl text-ink/20 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-full border border-ink/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="subscription-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="max-w-2xl">
                    <h2 className="font-serif text-5xl font-medium leading-tight mb-4">Choose your creative power.</h2>
                    <p className="text-lg text-ink/40 font-serif italic">Unlock advanced features and higher limits to fuel your writing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Plan */}
                    <div className={cn(
                      "bg-white p-10 rounded-[40px] border border-ink/5 flex flex-col transition-all",
                      subscription === 'free' && "ring-2 ring-brand-primary ring-offset-4 ring-offset-paper"
                    )}>
                      <div className="mb-8">
                        <h3 className="font-serif text-2xl font-medium mb-2">Free</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">₹0</span>
                          <span className="text-ink/40 text-sm font-medium">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          1,000 words / month
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Standard AI models
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Basic history
                        </li>
                      </ul>
                      <button 
                        disabled={subscription === 'free'}
                        onClick={() => setSubscription('free')}
                        className={cn(
                          "w-full py-4 rounded-2xl font-bold text-sm transition-all",
                          subscription === 'free' ? "bg-ink/5 text-ink/40 cursor-default" : "bg-paper border border-ink/5 hover:bg-ink/5"
                        )}
                      >
                        {subscription === 'free' ? 'Current Plan' : 'Downgrade'}
                      </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={cn(
                      "bg-white p-10 rounded-[40px] border border-brand-primary/20 flex flex-col relative transition-all shadow-2xl shadow-brand-primary/5",
                      subscription === 'pro' && "ring-2 ring-brand-primary ring-offset-4 ring-offset-paper"
                    )}>
                      <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-brand-primary/20">
                        Most Popular
                      </div>
                      <div className="mb-8">
                        <h3 className="font-serif text-2xl font-medium mb-2">Pro</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">₹250</span>
                          <span className="text-ink/40 text-sm font-medium">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Unlimited words
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Premium AI models
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Advanced refinement
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Priority support
                        </li>
                      </ul>
                      <button 
                        disabled={subscription === 'pro'}
                        onClick={() => setSubscription('pro')}
                        className={cn(
                          "w-full py-4 rounded-2xl font-bold text-sm transition-all",
                          subscription === 'pro' ? "bg-ink/5 text-ink/40 cursor-default" : "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:opacity-90"
                        )}
                      >
                        {subscription === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                      </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className={cn(
                      "bg-white p-10 rounded-[40px] border border-ink/5 flex flex-col transition-all",
                      subscription === 'enterprise' && "ring-2 ring-brand-primary ring-offset-4 ring-offset-paper"
                    )}>
                      <div className="mb-8">
                        <h3 className="font-serif text-2xl font-medium mb-2">Enterprise</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">₹800</span>
                          <span className="text-ink/40 text-sm font-medium">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-10 flex-1">
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Custom AI training
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Team collaboration
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          API Access
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-ink/60">
                          <Check className="w-4 h-4 text-emerald-500" />
                          Dedicated account manager
                        </li>
                      </ul>
                      <button 
                        disabled={subscription === 'enterprise'}
                        onClick={() => setSubscription('enterprise')}
                        className={cn(
                          "w-full py-4 rounded-2xl font-bold text-sm transition-all",
                          subscription === 'enterprise' ? "bg-ink/5 text-ink/40 cursor-default" : "bg-paper border border-ink/5 hover:bg-ink/5"
                        )}
                      >
                        {subscription === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-brand-primary/5 p-12 rounded-[40px] border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                      <h3 className="font-serif text-2xl font-medium">Secure & Trusted</h3>
                      <p className="text-sm text-ink/40 font-medium">All transactions are encrypted and processed securely via Stripe.</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-brand-primary/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Secure</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Zap className="w-8 h-8 text-brand-primary/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Instant</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
