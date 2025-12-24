"use client";

import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Send, User, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useSession } from "next-auth/react";
import { sendMessage } from "@/app/lib/controllers/message.controller";

type SenderRole = "CITIZEN" | 'TECHNICAL_OFFICER' | 'PUBLIC_RELATIONS_OFFICER' | 'EXTERNAL_MAINTAINER_WITH_ACCESS';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  reportId: string;
  currentUserRole: SenderRole;
  currentUserId: string;
}

export default function ChatPanel({
  reportId,
  currentUserRole,
  currentUserId,
}: Readonly<ChatPanelProps>) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const socketRef = useRef<Socket | null>(null);
  const isMountedRef = useRef(true);

  const transformMessages = (messages: any[]): ChatMessage[] => {
    return messages.map((msg: any) => {
      let senderRole: SenderRole = "CITIZEN";
      if (msg.author?.role === "TECHNICAL_OFFICER") senderRole = "TECHNICAL_OFFICER";
      else if (msg.author?.role === "PUBLIC_RELATIONS_OFFICER") senderRole = "PUBLIC_RELATIONS_OFFICER";
      else if (msg.author?.role === "EXTERNAL_MAINTAINER_WITH_ACCESS") senderRole = "EXTERNAL_MAINTAINER_WITH_ACCESS";

      return {
        id: msg.id?.toString() || Date.now().toString(),
        senderName:
          msg.author?.firstName && msg.author?.lastName
            ? `${msg.author.firstName} ${msg.author.lastName}`
            : msg.author?.username || "Unknown",
        senderId: msg.author?.id?.toString() || msg.authorId?.toString() || "",
        senderRole,
        content: msg.content,
        timestamp: msg.createdAt,
      };
    });
  };

  // Load initial messages and setup WebSocket
  useEffect(() => {
    isMountedRef.current = true;

    const fetchInitialMessages = async () => {
      try {
        setIsInitialLoading(true);
        const res = await fetch(`/api/messages?reportId=${reportId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        if (isMountedRef.current && Array.isArray(data)) {
          setMessages(transformMessages(data));
        }
      } catch (error) {
        if (isMountedRef.current) console.error("Failed to load messages:", error);
      } finally {
        if (isMountedRef.current) setIsInitialLoading(false);
      }
    };

    fetchInitialMessages();

    // Setup WebSocket connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:${process.env.NEXT_PUBLIC_WS_PORT || 4000}`;
    const socket = io(wsUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join", reportId.toString());

    socket.on("chat-message", (incoming: ChatMessage) => {
      if (isMountedRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      }
    });

    return () => {
      isMountedRef.current = false;
      socket.off("chat-message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [reportId]);

  // Auto-scroll on new messages
  useEffect(() => {
    // Scrolla solo se ci sono nuovi messaggi (numero di messaggi aumentato)
    if (messages.length > prevMessageCountRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSendMessage = async (text: string) => {
    if (!session?.user?.id || !socketRef.current) {
      console.error("User not authenticated or socket not ready");
      return;
    }

    setIsSending(true);
    try {
      const authorId = session.user.id;
      const reportIdBigInt = BigInt(reportId);
      const response = await sendMessage(text, authorId, reportIdBigInt);

      let newMsg: ChatMessage;
      if (response.success) {
        newMsg = {
          id: response.data.id?.toString() || Date.now().toString(),
          senderName: session.user.name || "You",
          senderId: session.user.id,
          senderRole: currentUserRole,
          content: text,
          timestamp: response.data.createdAt
            ? new Date(response.data.createdAt).toISOString()
            : new Date().toISOString(),
        };
      } else {
        newMsg = {
          id: Date.now().toString(),
          senderName: session.user.name || "You",
          senderId: session.user.id,
          senderRole: currentUserRole,
          content: text,
          timestamp: new Date().toISOString(),
        };
        console.error("Error saving message:", response.error);
      }

      // Add locally and broadcast via socket
      setMessages((prev) => [...prev, newMsg]);
      socketRef.current.emit("chat-message", {
        roomId: reportId.toString(),
        message: newMsg,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    handleSendMessage(newMessage);
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
          {isInitialLoading && messages.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Loading messages...
            </div>
          )}
          {!isInitialLoading && messages.length === 0 && (
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
                      msg.senderRole === "PUBLIC_RELATIONS_OFFICER" || msg.senderRole === "TECHNICAL_OFFICER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {msg.senderRole === "PUBLIC_RELATIONS_OFFICER" || msg.senderRole === "TECHNICAL_OFFICER" ? (
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
          onFocus={(e) => e.target.select()} // Keeps focus on the input box
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isInitialLoading || isSending}
          className="min-h-[40px] max-h-[120px] resize-none focus-visible:ring-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending || isInitialLoading}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
