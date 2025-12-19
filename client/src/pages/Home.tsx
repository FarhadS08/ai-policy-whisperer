import { useAuth, SignedIn, SignedOut } from "@/contexts/ClerkContext";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceButton } from "@/components/VoiceButton";
import { useVoiceAgent, TranscriptEntry } from "@/hooks/useVoiceAgent";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, 
  Sun,
  ChevronRight,
  Sparkles,
  User,
  Bot,
  History,
  ArrowRight,
  Check,
  Quote
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "wouter";
import { useState, useCallback, useRef } from "react";
import * as supabaseService from "@/services/supabaseService";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [displayMessages, setDisplayMessages] = useState<TranscriptEntry[]>([]);
  
  // Use refs to track conversation state to avoid async state issues
  const conversationIdRef = useRef<string | null>(null);
  const savedMessagesCountRef = useRef<number>(0);
  const isCreatingConversationRef = useRef<boolean>(false);

  const handleTranscriptUpdate = useCallback(async (transcript: TranscriptEntry[]) => {
    console.log('[Home] handleTranscriptUpdate called, transcript length:', transcript.length);
    console.log('[Home] User:', user?.id, 'isAuthenticated:', isAuthenticated);
    console.log('[Home] Current conversationId:', conversationIdRef.current);
    console.log('[Home] Saved messages count:', savedMessagesCountRef.current);
    
    if (!isAuthenticated || !user) {
      console.log('[Home] Not authenticated, skipping save');
      return;
    }
    
    if (transcript.length === 0) {
      console.log('[Home] Empty transcript, skipping');
      return;
    }

    // Update display messages
    setDisplayMessages([...transcript]);

    // Get the new messages that haven't been saved yet
    const newMessagesStartIndex = savedMessagesCountRef.current;
    const newMessages = transcript.slice(newMessagesStartIndex);
    
    console.log('[Home] New messages to save:', newMessages.length);

    if (newMessages.length === 0) {
      console.log('[Home] No new messages to save');
      return;
    }

    // Create conversation if needed (only once)
    if (!conversationIdRef.current && !isCreatingConversationRef.current) {
      isCreatingConversationRef.current = true;
      console.log('[Home] Creating new conversation...');
      
      try {
        const firstMessage = transcript[0];
        const title = firstMessage.content.slice(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
        
        const conv = await supabaseService.createConversation(user.id, title);
        
        if (conv) {
          console.log('[Home] Conversation created:', conv.id);
          conversationIdRef.current = conv.id;
        } else {
          console.error('[Home] Failed to create conversation - returned null');
          isCreatingConversationRef.current = false;
          return;
        }
      } catch (error) {
        console.error('[Home] Error creating conversation:', error);
        isCreatingConversationRef.current = false;
        return;
      }
    }

    // Wait for conversation to be created if it's in progress
    if (isCreatingConversationRef.current && !conversationIdRef.current) {
      console.log('[Home] Waiting for conversation to be created...');
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!conversationIdRef.current) {
        console.log('[Home] Still no conversation ID, skipping save');
        return;
      }
    }

    // Save all new messages
    const convId = conversationIdRef.current;
    if (!convId) {
      console.error('[Home] No conversation ID available');
      return;
    }

    for (const entry of newMessages) {
      console.log('[Home] Saving message:', entry.role, entry.content.substring(0, 50));
      try {
        const msg = await supabaseService.addMessage(convId, entry.role, entry.content);
        if (msg) {
          console.log('[Home] Message saved successfully:', msg.id);
          savedMessagesCountRef.current++;
        } else {
          console.error('[Home] Failed to save message - returned null');
        }
      } catch (error) {
        console.error('[Home] Error saving message:', error);
      }
    }
  }, [isAuthenticated, user]);

  const { status, isSessionActive, transcript, error, toggleSession, clearTranscript } = useVoiceAgent(handleTranscriptUpdate);

  const handleNewConversation = useCallback(() => {
    console.log('[Home] Starting new conversation');
    clearTranscript();
    conversationIdRef.current = null;
    savedMessagesCountRef.current = 0;
    isCreatingConversationRef.current = false;
    setDisplayMessages([]);
  }, [clearTranscript]);

  const features = [
    {
      icon: "/images/icon-conversation.png",
      title: "Natural Conversations",
      description: "Ask questions about AI policies in plain language and get clear, contextual explanations.",
    },
    {
      icon: "/images/icon-shield.png",
      title: "Policy Expertise",
      description: "Access comprehensive knowledge about AI platform policies and regulatory rules.",
    },
    {
      icon: "/images/icon-lightning.png",
      title: "Real-time Research",
      description: "When information isn't available, our system automatically researches and retrieves it.",
    },
    {
      icon: "/images/icon-history.png",
      title: "Conversation History",
      description: "All your conversations are saved and easily accessible for future reference.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Sign Up & Connect",
      description: "Create your account in seconds and get instant access to our AI policy assistant."
    },
    {
      step: "02",
      title: "Ask Your Question",
      description: "Use your voice or text to ask about any AI platform policy, regulation, or guideline."
    },
    {
      step: "03",
      title: "Get Expert Answers",
      description: "Receive clear, contextual explanations backed by real-time research when needed."
    }
  ];

  const testimonials = [
    {
      quote: "AI Policy Whisperer has transformed how our team navigates complex AI regulations. It's like having a policy expert on call 24/7.",
      author: "Sarah Chen",
      role: "Head of Compliance, TechCorp",
      avatar: "SC"
    },
    {
      quote: "The voice interface makes it so easy to get quick answers while I'm working on other tasks. Highly recommend for any AI developer.",
      author: "Marcus Johnson",
      role: "Senior AI Engineer, DataFlow",
      avatar: "MJ"
    },
    {
      quote: "Finally, a tool that explains AI policies in plain language. Our legal team uses it daily for quick policy checks.",
      author: "Elena Rodriguez",
      role: "Legal Counsel, InnovateTech",
      avatar: "ER"
    }
  ];

  const policyAreas = [
    { title: "AI Ethics", description: "Fairness, transparency, and accountability guidelines" },
    { title: "Data Privacy", description: "GDPR, CCPA, and data protection regulations" },
    { title: "Platform Terms", description: "OpenAI, Google, Meta, and more" },
    { title: "Content Policies", description: "Acceptable use and content moderation" },
    { title: "Safety Standards", description: "AI safety and risk management" },
    { title: "Industry Regulations", description: "Healthcare, finance, and sector-specific rules" },
  ];

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">AI Policy Whisperer</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <SignedIn>
              <Link href="/history">
                <Button variant="ghost" className="gap-2">
                  <History className="w-4 h-4" />
                  History
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="gap-2 btn-gradient rounded-full px-6">
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16">
        <section className="container min-h-[calc(100vh-6rem)] flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Voice-Powered AI Assistant</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Navigate AI Policies with{" "}
                <span className="gradient-text">Confidence</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Ask questions about AI platform policies, regulatory rules, and constraints. 
                Get clear, contextual explanations through natural voice conversations.
              </p>

              <SignedOut>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto gap-2 btn-gradient rounded-full px-8 h-12 text-base">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </SignUpButton>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-base glass">
                    Learn More
                  </Button>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/history">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 rounded-full px-8 h-12 text-base glass">
                      <History className="w-4 h-4" />
                      View History
                    </Button>
                  </Link>
                </div>
              </SignedIn>
            </motion.div>

            {/* Right Column - Hero Image & Voice Interface */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center relative"
            >
              {/* Floating orbs for decoration */}
              <div className="absolute -top-10 -right-10 w-24 h-24 animate-float-slow opacity-60">
                <img src="/images/floating-orb.png" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-5 -left-10 w-16 h-16 animate-float-delayed opacity-50">
                <img src="/images/floating-orb.png" alt="" className="w-full h-full object-contain" />
              </div>

              {/* Hero 3D Image */}
              <motion.div 
                className="mb-6 animate-float"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <img 
                  src="/images/hero-3d.png" 
                  alt="AI Policy Assistant" 
                  className="w-full max-w-sm mx-auto drop-shadow-2xl"
                />
              </motion.div>

              {/* Voice Interface Card */}
              <Card className="w-full max-w-md glass-strong border-0 overflow-hidden rounded-2xl shadow-elevated">
                <CardContent className="p-6">
                  {/* Voice Button */}
                  <div className="flex flex-col items-center py-4">
                    <VoiceButton
                      status={status}
                      isSessionActive={isSessionActive}
                      onClick={isAuthenticated ? toggleSession : undefined}
                      disabled={!isAuthenticated}
                    />
                    
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-sm text-destructive text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                    
                    <SignedOut>
                      <p className="mt-4 text-sm text-muted-foreground text-center">
                        <SignInButton mode="modal">
                          <button className="text-primary hover:underline font-medium">Sign in</button>
                        </SignInButton>
                        {" "}to start a voice conversation
                      </p>
                    </SignedOut>
                  </div>

                  {/* Conversation Area */}
                  <SignedIn>
                    <div className="border-t border-border/50 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Conversation</h3>
                        {displayMessages.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={handleNewConversation} className="text-xs">
                            New Chat
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-48 rounded-xl bg-background/30 p-3">
                        {displayMessages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            <div className="text-center">
                              <p>Your conversation will appear here.</p>
                              <p className="text-xs mt-1 opacity-70">Press the microphone to start.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <AnimatePresence>
                              {displayMessages.map((msg, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  {msg.role === 'assistant' && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                      <Bot className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                      msg.role === 'user'
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                                        : 'glass'
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                  {msg.role === 'user' && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                      <User className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </SignedIn>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">AI Policy Whisperer</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform helps you navigate the complex world of AI policies with ease and confidence.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass border-0 hover:shadow-elevated transition-all duration-300 h-full rounded-2xl group">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <img src={feature.icon} alt="" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <Card className="glass border-0 rounded-2xl h-full">
                  <CardContent className="p-8">
                    <div className="text-5xl font-bold gradient-text mb-4">{item.step}</div>
                    <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Policy Areas Section */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Policy Areas We <span className="gradient-text">Cover</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive coverage of AI policies across multiple domains and platforms.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {policyAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="glass border-0 rounded-xl hover:shadow-elevated transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:from-violet-500/30 group-hover:to-purple-600/30 transition-colors">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{area.title}</h3>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by <span className="gradient-text">Professionals</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what industry leaders are saying about AI Policy Whisperer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass border-0 rounded-2xl h-full">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-strong border-0 rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-600/10" />
              <CardContent className="p-12 md:p-16 text-center relative">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Navigate AI Policies with <span className="gradient-text">Confidence</span>?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join thousands of professionals who trust AI Policy Whisperer for their policy questions. 
                  Start free, no credit card required.
                </p>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="gap-2 btn-gradient rounded-full px-10 h-14 text-lg">
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button size="lg" className="gap-2 btn-gradient rounded-full px-10 h-14 text-lg" onClick={toggleSession}>
                    Start Voice Session
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </SignedIn>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 glass-nav">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">AI Policy Whisperer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AI Policy Whisperer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
