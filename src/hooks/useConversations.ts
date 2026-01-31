import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  property_id: string;
  guest_id: string;
  host_id: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    name: string;
    images?: { image_url: string }[];
  };
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch conversations with property info
      const { data: convos, error } = await supabase
        .from('conversations')
        .select(`
          *,
          property:properties(id, name, property_images(image_url))
        `)
        .or(`guest_id.eq.${user.id},host_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For each conversation, fetch the other user's profile and last message
      const enrichedConvos = await Promise.all(
        (convos || []).map(async (convo) => {
          const otherUserId = convo.guest_id === user.id ? convo.host_id : convo.guest_id;

          // Fetch other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Fetch last message
          const { data: messages } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...convo,
            property: convo.property ? {
              id: convo.property.id,
              name: convo.property.name,
              images: convo.property.property_images,
            } : undefined,
            other_user: profile,
            last_message: messages?.[0],
            unread_count: count || 0,
          };
        })
      );

      setConversations(enrichedConvos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateConversation = async (propertyId: string, hostId: string) => {
    if (!user) return null;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('guest_id', user.id)
      .single();

    if (existing) return existing.id;

    // Create new conversation
    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({
        property_id: propertyId,
        guest_id: user.id,
        host_id: hostId,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return newConvo.id;
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    isLoading,
    refetch: fetchConversations,
    getOrCreateConversation,
  };
}
