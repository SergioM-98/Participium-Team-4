"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface ChatMessage {
  id: string;
  senderName: string;
  senderId: string;
  senderRole: "CITIZEN" | "OFFICER";
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  reportId: string;
  currentUserRole: "CITIZEN" | "OFFICER";
  currentUserId: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export default function ChatPanel({
  reportId,
  currentUserRole,
  currentUserId,
  messages,
  onSendMessage,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    // Scrolla solo se ci sono nuovi messaggi (numero di messaggi aumentato)
    if (messages.length > prevMessageCountRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Report Discussion
        </h4>
        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border">
          {messages.length} messages
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col gap-4 p-4 pr-3 min-h-full justify-between">
          {messages.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No messages yet. Start the conversation.
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 w-full ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-8 w-8 mt-1 border bg-background">
                  <AvatarFallback
                    className={
                      msg.senderRole === "OFFICER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {msg.senderRole === "OFFICER" ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col max-w-[80%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-foreground">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white dark:bg-muted text-foreground border rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-background flex gap-2 items-end">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[120px] resize-none focus-visible:ring-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
