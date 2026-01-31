import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessageThread } from '@/components/messaging/MessageThread';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Inbox() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const conversationId = searchParams.get('conversation');
  const [selectedId, setSelectedId] = useState<string | null>(conversationId);
  
  const { conversations, isLoading: loadingConvos, refetch } = useConversations();
  const { messages, isLoading: loadingMessages, sendMessage } = useMessages(selectedId);

  const selectedConversation = conversations.find(c => c.id === selectedId) || null;

  // Sync URL with selection
  useEffect(() => {
    if (conversationId && conversationId !== selectedId) {
      setSelectedId(conversationId);
    }
  }, [conversationId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSearchParams({ conversation: id });
  };

  const handleBack = () => {
    setSelectedId(null);
    setSearchParams({});
    refetch();
  };

  const handleSend = async (content: string) => {
    const result = await sendMessage(content);
    if (result) {
      refetch(); // Refresh conversation list to update last message
    }
    return result;
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your messages</h1>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sign in to view your messages with farm hosts.
            </p>
            <Link to="/auth">
              <Button size="lg">Sign in</Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Mobile: Show either list or thread
  if (isMobile) {
    if (selectedId) {
      return (
        <Layout hideNav>
          <div className="h-[100dvh] flex flex-col">
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              isLoading={loadingMessages}
              onSend={handleSend}
              onBack={handleBack}
            />
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background px-4 py-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <Link to="/">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 -ml-2"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </motion.button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Inbox</h1>
          </div>
        </div>

        <div className="pb-4">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a conversation by contacting a host
              </p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}
        </div>
      </Layout>
    );
  }

  // Desktop: Split view
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Messages</h1>
        
        <div className="flex border border-border rounded-xl overflow-hidden h-[calc(100vh-200px)] min-h-[500px]">
          {/* Conversation List */}
          <div className="w-80 border-r border-border bg-card overflow-y-auto">
            {loadingConvos ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}
          </div>

          {/* Message Thread */}
          <div className="flex-1 bg-background">
            <MessageThread
              conversation={selectedConversation}
              messages={messages}
              isLoading={loadingMessages}
              onSend={handleSend}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
