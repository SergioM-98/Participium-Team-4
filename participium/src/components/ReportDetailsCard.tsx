"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  MapPin,
  Tag,
  X,
  Image as ImageIcon,
  User,
  Clock,
  AlertCircle
} from "lucide-react";

import OfficerActionPanel from "../app/officer/all-reports/OfficerActionPanel";
import MaintainerActionPanel from "../app/maintainer/my-reports/MaintainerActionPanel";
import ChatPanel, { ChatMessage } from "./ChatPanel";
import { getReportMessages, sendMessage } from "../app/lib/controllers/message.controller";

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
  citizenId?: string | number;
  officerId?: string | number;
}

interface ReportDetailsCardProps {
  report: Report;
  onClose?: () => void;
  isOfficerMode?: boolean;
  isMaintainerMode?: boolean;
  onOfficerActionComplete?: () => void;
  onMaintainerActionComplete?: () => void;
  showChat?: boolean;
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
  isMaintainerMode = false,
  onOfficerActionComplete,
  onMaintainerActionComplete,
  showChat = false,
}: ReportDetailsCardProps) {
  const { data: session } = useSession();
  
  // show chat only if the user is the report creator or the assigned officer
  const isReportCreator = session?.user?.id && report.citizenId && String(session.user.id) === String(report.citizenId);
  const isAssignedOfficer = session?.user?.id && report.officerId && String(session.user.id) === String(report.officerId);
  const canViewChat = showChat && (isReportCreator || isAssignedOfficer);
  
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

  // Use the actual role from the session
  const currentUserRole = (session?.user as any)?.role === "TECHNICAL_OFFICER" ? "TECHNICAL_OFFICER" : (session?.user as any)?.role === "PUBLIC_RELATIONS_OFFICER" ? "PUBLIC_RELATIONS_OFFICER" : (session?.user as any)?.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ? "EXTERNAL_MAINTAINER_WITH_ACCESS" : "CITIZEN";

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
            senderId: msg.author?.id?.toString() || msg.authorId?.toString() || "",
            senderRole: msg.author?.role === "TECHNICAL_OFFICER" ? "TECHNICAL_OFFICER" : msg.author ?.role === "PUBLIC_RELATIONS_OFFICER" ? "PUBLIC_RELATIONS_OFFICER" : "CITIZEN",
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

    // Polling of messages every second
    const interval = setInterval(loadMessages, 1000);

    return () => clearInterval(interval);
  }, [report.id]);

  const handleSendMessage = async (text: string) => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      setIsSending(true);
      const authorId = session.user.id;
      const reportIdBigInt = BigInt(report.id);

      const response = await sendMessage(text, authorId, reportIdBigInt);

      if (response) {
        const newMsg: ChatMessage = {
          id: response.id?.toString() || Date.now().toString(),
          senderName: session.user.name || "You",
          senderId: session.user.id,
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
      {/* Header fisso */}
      <div className="flex items-start justify-between px-3 py-2 md:px-6 md:py-5 border-b bg-background shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-base md:text-xl font-bold tracking-tight text-foreground line-clamp-1">{report.title}</h2>
            {getStatusBadge(report.status)}
          </div>
          <div className="flex items-center text-xs md:text-sm text-muted-foreground gap-2 md:gap-4">
             <span className="flex items-center gap-1">
               <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5" />
               {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
             </span>
             <span className="w-1 h-1 rounded-full bg-gray-300" />
             <span className="flex items-center gap-1">
               <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
               {formattedDate}
             </span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden items-stretch">
        

        <div className="w-full md:flex-1 md:min-w-0 flex-1 min-h-0 md:p-6 p-4 space-y-6 md:space-y-8 overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                {evidencePhotos.map((url, index) => (
                  <div 
                    key={index} 
                    className="group relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer"
                  >
                     <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-5 md:h-8 w-5 md:w-8 text-muted-foreground/30" />
                     </div>
                     <img 
                       src={url} 
                       alt={`Evidence ${index + 1}`} 
                       loading="lazy"
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                       onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                     />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 md:h-32 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <ImageIcon className="w-5 md:w-8 h-5 md:h-8 mb-2 opacity-20" />
                <span className="text-xs md:text-sm">No photos attached</span>
              </div>
            )}
          </div>
        </div>

        {canViewChat && (
          <div className="w-full md:w-80 h-[50vh] md:h-full border-t md:border-t-0 md:border-l border-border bg-muted/10 flex flex-col overflow-hidden">
            <ChatPanel
              reportId={report.id}
              currentUserRole={currentUserRole}
              currentUserId={session?.user?.id || ""}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}


        {isOfficerMode && !canViewChat && (
          <div className="w-full md:w-80 h-[50vh] md:h-full md:min-h-0 border-t md:border-t-0 md:border-l border-border bg-muted/10 flex flex-col overflow-y-auto p-4 md:p-6">
            <OfficerActionPanel
              reportId={report.id}
              currentStatus={report.status}
              currentCategory={report.category}
              onActionComplete={onOfficerActionComplete}
            />
          </div>
        )}

        {isMaintainerMode && !canViewChat && (
          <div className="w-full md:w-80 h-[50vh] md:h-full md:min-h-0 border-t md:border-t-0 md:border-l border-border bg-muted/10 flex flex-col overflow-y-auto p-4 md:p-6">
            <MaintainerActionPanel
              reportId={report.id}
              currentStatus={report.status}
              onActionComplete={onMaintainerActionComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}