import { createContext, ReactNode, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface NotificationsContextValue {
  unreadMessageCount: number;
  refetchUnread: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadMessageCount: 0,
  refetchUnread: async () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { unreadCount, refetch } = useUnreadMessages((message, conversationId) => {
    if (location.pathname.startsWith('/inbox')) return;

    const preview = message.content.length > 80
      ? `${message.content.slice(0, 80)}…`
      : message.content;

    toast.message('New message', {
      description: preview,
      action: {
        label: 'Open',
        onClick: () => navigate(`/inbox?conversation=${conversationId}`),
      },
    });
  });

  return (
    <NotificationsContext.Provider
      value={{ unreadMessageCount: unreadCount, refetchUnread: refetch }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
