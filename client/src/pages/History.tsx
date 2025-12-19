import { useAuth, SignedIn, SignedOut } from "@/contexts/ClerkContext";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MessageSquare, 
  Trash2, 
  Clock, 
  User, 
  Bot,
  Sparkles,
  Moon,
  Sun,
  ChevronRight,
  Loader2,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as supabaseService from "@/services/supabaseService";

export default function History() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedConversation, setSelectedConversation] = useState<supabaseService.Conversation | null>(null);
  const [conversations, setConversations] = useState<supabaseService.Conversation[]>([]);
  const [messages, setMessages] = useState<supabaseService.Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch conversations when authenticated
  useEffect(() => {
    async function fetchConversations() {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const convs = await supabaseService.getConversations(user.id);
        setConversations(convs);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [isAuthenticated, user]);

  // Fetch messages when a conversation is selected
  const handleSelectConversation = async (conversation: supabaseService.Conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    setSidebarOpen(false); // Close sidebar on mobile when selecting
    
    try {
      const result = await supabaseService.getConversationWithMessages(conversation.id);
      if (result) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteId) return;
    
    try {
      const success = await supabaseService.deleteConversation(deleteId);
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== deleteId));
        if (selectedConversation?.id === deleteId) {
          setSelectedConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeleteId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'long' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col">
      <SignedOut>
        {/* Header for signed out state */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Conversation History</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-8 container flex-1">
          <Card className="glass-strong border-0 max-w-md mx-auto rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign in to view history</h2>
              <p className="text-muted-foreground mb-6">
                Access your conversation history by signing in to your account.
              </p>
              <SignInButton mode="modal">
                <Button className="w-full gap-2 btn-gradient rounded-full">
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </main>
      </SignedOut>

      <SignedIn>
        <div className="flex h-screen overflow-hidden">
          {/* Mobile Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <aside
            className={`
              fixed lg:relative inset-y-0 left-0 z-50 w-72 lg:w-80
              bg-background/95 backdrop-blur-xl border-r border-border/50
              transform transition-transform duration-300 ease-in-out
              lg:transform-none
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">Conversations</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-full"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* New Conversation Button */}
              <div className="p-3">
                <Link href="/">
                  <Button className="w-full gap-2 btn-gradient rounded-xl">
                    <Plus className="w-4 h-4" />
                    New Conversation
                  </Button>
                </Link>
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No conversations yet</p>
                    <p className="text-xs mt-1 opacity-70">Start a voice session to create one</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                          group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
                          transition-all duration-200
                          ${selectedConversation?.id === conv.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted/50'
                          }
                        `}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${selectedConversation?.id === conv.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conv.title || 'Untitled Conversation'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(conv.updated_at)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(conv.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <UserButton afterSignOutUrl="/" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <header className="flex items-center gap-3 p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <Link href="/" className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              {selectedConversation ? (
                <div className="flex-1 min-w-0">
                  <h1 className="font-semibold truncate">
                    {selectedConversation.title || 'Untitled Conversation'}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedConversation.created_at).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ) : (
                <div className="flex-1">
                  <h1 className="font-semibold">Conversation History</h1>
                  <p className="text-xs text-muted-foreground">Select a conversation to view</p>
                </div>
              )}

              <div className="hidden lg:flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              {selectedConversation ? (
                <ScrollArea className="h-full">
                  <div className="max-w-3xl mx-auto p-4 space-y-6">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No messages in this conversation</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                            ${message.role === 'user' 
                              ? 'bg-gradient-to-br from-violet-500 to-purple-600' 
                              : 'bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600'
                            }
                          `}>
                            {message.role === 'user' 
                              ? <User className="w-4 h-4 text-white" />
                              : <Bot className="w-4 h-4 text-white" />
                            }
                          </div>
                          
                          <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                            <div
                              className={`
                                inline-block rounded-2xl px-4 py-3 text-left
                                ${message.role === 'user'
                                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                                  : 'bg-muted/50 dark:bg-muted/30'
                                }
                              `}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-1.5 text-muted-foreground`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-600/10 flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-primary/30" />
                    </div>
                    <p className="font-medium mb-1">Select a conversation</p>
                    <p className="text-sm opacity-70">Choose from the sidebar or start a new one</p>
                    <Link href="/">
                      <Button className="mt-4 gap-2 btn-gradient rounded-full">
                        <Plus className="w-4 h-4" />
                        New Conversation
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </SignedIn>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-strong border-0 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={handleDeleteConversation}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
