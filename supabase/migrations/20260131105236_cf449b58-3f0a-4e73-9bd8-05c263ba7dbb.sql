-- Create conversations table (links guest, host, and property)
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL,
    host_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(property_id, guest_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies: users can only see their own conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (guest_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Participants can update conversation"
ON public.conversations
FOR UPDATE
USING (guest_id = auth.uid() OR host_id = auth.uid());

-- Messages policies: users can only see messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
    conversation_id IN (
        SELECT id FROM public.conversations
        WHERE guest_id = auth.uid() OR host_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
        SELECT id FROM public.conversations
        WHERE guest_id = auth.uid() OR host_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (sender_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_conversations_guest_id ON public.conversations(guest_id);
CREATE INDEX idx_conversations_host_id ON public.conversations(host_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Trigger to update conversation timestamp when new message arrives
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;