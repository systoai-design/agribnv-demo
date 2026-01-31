import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const { user } = useAuth();

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a conversation by contacting a host from a property page</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30">
      {conversations.map((convo, index) => {
        const displayName = convo.other_user?.full_name || convo.property?.name || 'Unknown';
        const avatarUrl = convo.other_user?.avatar_url || convo.property?.images?.[0]?.image_url;
        const isSelected = selectedId === convo.id;
        const lastMessageTime = convo.last_message?.created_at
          ? formatDistanceToNow(new Date(convo.last_message.created_at), { addSuffix: true })
          : formatDistanceToNow(new Date(convo.created_at), { addSuffix: true });
        const isOwnMessage = convo.last_message?.sender_id === user?.id;

        return (
          <motion.button
            key={convo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect(convo.id)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
              isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
            }`}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`font-medium truncate ${convo.unread_count > 0 ? 'text-primary font-semibold' : 'text-foreground'}`}>
                  {displayName}
                </h3>
                <span className="text-xs text-muted-foreground shrink-0">
                  {lastMessageTime}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {convo.property?.name}
              </p>
              {convo.last_message && (
                <p className={`text-sm truncate mt-0.5 ${convo.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {isOwnMessage ? 'You: ' : ''}{convo.last_message.content}
                </p>
              )}
            </div>

            {convo.unread_count > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-xs text-primary-foreground font-medium">
                  {convo.unread_count > 9 ? '9+' : convo.unread_count}
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
