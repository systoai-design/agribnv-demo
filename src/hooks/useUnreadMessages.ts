import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/hooks/useMessages';

type OnNewMessage = (message: Message, conversationId: string) => void;

export function useUnreadMessages(onNewMessage?: OnNewMessage) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const callbackRef = useRef<OnNewMessage | undefined>(onNewMessage);
  callbackRef.current = onNewMessage;

  const refetch = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { data: convos } = await supabase
      .from('conversations')
      .select('id')
      .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`);

    if (!convos || convos.length === 0) {
      setUnreadCount(0);
      return;
    }

    const convoIds = convos.map((c) => c.id);
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convoIds)
      .neq('sender_id', user.id)
      .is('read_at', null);

    setUnreadCount(count ?? 0);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-unread:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const msg = payload.new as Message;
          if (!msg || msg.sender_id === user.id) return;

          const { data: convo } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', msg.conversation_id)
            .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
            .maybeSingle();

          if (!convo) return;

          setUnreadCount((prev) => prev + 1);
          callbackRef.current?.(msg, msg.conversation_id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  return { unreadCount, refetch };
}
