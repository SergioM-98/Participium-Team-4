"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Tag,
  X,
  Image as ImageIcon,
  MessageSquare,
  User,
  Clock,
  AlertCircle
} from "lucide-react";

import OfficerActionPanel from "../app/officer/all-reports/OfficerActionPanel";
import ChatPanel, { ChatMessage } from "./ChatPanel";
import { getReportMessages, sendMessage } from "@/app/lib/controllers/message.controller";

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status:
    | "pending_approval"
    | "assigned"
    | "in_progress"
    | "suspended"
    | "rejected"
    | "resolved"
    | string;
  latitude: number;
  longitude: number;
  reporterName: string;
  createdAt: string;
  photoUrls?: string[];
  photos?: string[];
}

interface ReportDetailsCardProps {
  report: Report;
  onClose?: () => void;
  isOfficerMode?: boolean;
  onOfficerActionComplete?: () => void;
}

const formatCategory = (category: string) => {
  if (!category) return "Uncategorized";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getStatusBadge = (status: Report["status"]) => {
  const normalizedStatus = status ? status.toLowerCase() : "unknown";
  switch (normalizedStatus) {
    case "pending_approval":
    case "pending":
      return <Badge variant="secondary">Pending Approval</Badge>;
    case "assigned":
      return <Badge className="bg-yellow-500 hover:bg-yellow-500/90">Assigned</Badge>;
    case "in_progress":
      return <Badge className="bg-orange-500 hover:bg-orange-500/90">In Progress</Badge>;
    case "suspended":
      return <Badge className="bg-gray-500 hover:bg-gray-500/90">Suspended</Badge>;
    case "rejected":
      return <Badge className="bg-red-500 hover:bg-red-500/90">Rejected</Badge>;
    case "resolved":
      return <Badge className="bg-blue-500 hover:bg-blue-500/90">Resolved</Badge>;
    default:
      return <Badge variant="secondary">{normalizedStatus.replace(/_/g, " ")}</Badge>;
  }
};

export default function ReportDetailsCard({
  report,
  onClose,
  isOfficerMode = false,
  onOfficerActionComplete,
}: ReportDetailsCardProps) {
  const { data: session } = useSession();
  
  const evidencePhotos = report.photoUrls || report.photos || [];
  const validDate = report.createdAt || new Date().toISOString();
  
  const formattedDate = new Date(validDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const currentUserRole = isOfficerMode ? "OFFICER" : "CITIZEN";

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const reportIdBigInt = BigInt(report.id);
        const response = await getReportMessages(reportIdBigInt);
        
        if (response && Array.isArray(response)) {
          const transformedMessages: ChatMessage[] = response.map((msg: any) => ({
            id: msg.id.toString(),
            senderName: msg.author?.firstName && msg.author?.lastName 
              ? `${msg.author.firstName} ${msg.author.lastName}`
              : msg.author?.username || "Unknown",
            senderRole: msg.author?.role === "OFFICER" ? "OFFICER" : "CITIZEN",
            content: msg.content,
            timestamp: msg.createdAt,
          }));
          setMessages(transformedMessages);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [report.id]);

  const handleSendMessage = async (text: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsSending(true);
      const authorId = BigInt(session.user.id);
      const reportIdBigInt = BigInt(report.id);

      const response = await sendMessage(text, authorId, reportIdBigInt);

      if (response) {
        const newMsg: ChatMessage = {
          id: response.id?.toString() || Date.now().toString(),
          senderName: session.user.name || "You",
          senderRole: currentUserRole,
          content: text,
          timestamp: response.createdAt ? new Date(response.createdAt).toISOString() : new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-hidden">
      <div className="flex items-start justify-between px-6 py-5 border-b sticky top-0 bg-background z-20 flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{report.title}</h2>
            {getStatusBadge(report.status)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-4">
             <span className="flex items-center gap-1">
               <MapPin className="w-3.5 h-3.5" />
               {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
             </span>
             <span className="w-1 h-1 rounded-full bg-gray-300" />
             <span className="flex items-center gap-1">
               <Clock className="w-3.5 h-3.5" />
               {formattedDate}
             </span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="-mt-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto min-h-0">
        <div className="lg:col-span-8 p-6 space-y-8 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5" /> Category
              </div>
              <div className="font-semibold text-base text-foreground">
                {formatCategory(report.category)}
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5" /> Reported By
              </div>
              <div className="font-semibold text-base text-foreground">
                {report.reporterName || "Anonymous"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" /> 
              Problem Description
            </h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {report.description}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Evidence Photos
                <Badge variant="outline" className="ml-2 text-muted-foreground font-normal">
                  {evidencePhotos.length}
                </Badge>
              </h3>
            </div>
            
            {evidencePhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {evidencePhotos.map((url, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer"
                  >
                     <div className="absolute inset-0 flex items-center justify-center z-0">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                     </div>
                     <img 
                       src={url} 
                       alt={`Evidence ${index + 1}`} 
                       loading="lazy"
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                       onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                     />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm">No photos attached</span>
              </div>
            )}
          </div>

          <Separator />

          {isOfficerMode && (
            <OfficerActionPanel
              reportId={report.id}
              currentStatus={report.status}
              currentCategory={report.category}
              onActionComplete={onOfficerActionComplete}
            />
          )}
        </div>

        <div className="lg:col-span-4 border-l border-border bg-muted/10 flex flex-col min-h-0 overflow-hidden">
          <ChatPanel
            reportId={report.id}
            currentUserRole={currentUserRole}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
