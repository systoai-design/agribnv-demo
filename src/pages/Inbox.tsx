import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock messages for demo
const MOCK_MESSAGES = [
  {
    id: '1',
    farmName: 'Sunset Valley Farm',
    farmImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100',
    lastMessage: 'Thank you for your booking! We look forward to hosting you...',
    timestamp: '2h ago',
    unread: true,
  },
  {
    id: '2',
    farmName: 'Green Meadows Ranch',
    farmImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100',
    lastMessage: 'Your check-in details have been confirmed for...',
    timestamp: '1d ago',
    unread: false,
  },
  {
    id: '3',
    farmName: 'Tropical Orchard Estate',
    farmImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=100',
    lastMessage: 'Hi! Just wanted to remind you about the fruit picking...',
    timestamp: '3d ago',
    unread: false,
  },
];

export default function Inbox() {
  const { user } = useAuth();
  const [messages] = useState(MOCK_MESSAGES);

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

      <div className="px-4 py-4">
        {/* Section Header */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          All Messages
        </h2>

        {/* Message List */}
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to="#" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-card hover:bg-muted/50 transition-colors">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={message.farmImage} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {message.farmName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-semibold text-primary truncate ${message.unread ? '' : 'font-normal text-foreground'}`}>
                          {message.farmName}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${message.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {message.lastMessage}
                      </p>
                    </div>
                    {message.unread && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
