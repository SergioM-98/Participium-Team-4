"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tag,
  X,
  User,
  Clock,
  AlertCircle,
  Eye
} from "lucide-react";

import OfficerActionPanel from "../app/officer/all-reports/OfficerActionPanel";
import MaintainerActionPanel from "../app/maintainer/my-reports/MaintainerActionPanel";
import ChatPanel, { ChatMessage } from "./ChatPanel";
import { getReportMessages, sendMessage } from "../app/lib/controllers/message.controller";
import dynamic from "next/dist/shared/lib/dynamic";

const LeafletMapFixed = dynamic(() => import("./LeafletMapFixed"), {
  ssr: false,
});

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
    /*| string to remove??*/;
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
  const [isMapOpen, setIsMapOpen] = useState(false);

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

      if (response.success) {
        const newMsg: ChatMessage = {
          id: response.data.id?.toString() || Date.now().toString(),
          senderName: session.user.name || "You",
          senderId: session.user.id,
          senderRole: currentUserRole,
          content: text,
          timestamp: response.data.createdAt ? new Date(response.data.createdAt).toISOString() : new Date().toISOString(),
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
      {/* Header */}
      <div className="flex items-start justify-between px-3 py-2 md:px-6 md:py-5 border-b bg-background flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-base md:text-xl font-bold tracking-tight text-foreground line-clamp-1">{report.title}</h2>
            {getStatusBadge(report.status)}
          </div>
          <div className="flex items-center text-xs md:text-sm text-muted-foreground gap-2 md:gap-4">
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
              {formattedDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Row con 3 colonne: map | menu | chat/officer */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 p-4 md:p-6 overflow-hidden flex-1 min-h-0">
        {/* MAP - sinistra (hidden on mobile; available as overlay via button) */}
        <div className="hidden md:flex md:flex-1 min-h-0 rounded-lg overflow-hidden border border-border bg-muted/5">
          <div className="w-full h-full">
            <LeafletMapFixed report={report} showCloseButton={false} className="w-full h-full" />
          </div>
        </div>
 
         {/* MENU - centro (riempie lo spazio disponibile, scroll interno) */}
         <div className="flex-1 min-h-0 rounded-lg border border-border bg-muted/10 p-3 overflow-auto">
           <div className="space-y-4">
             <div className="p-1 bg-muted/30 rounded-lg border border-border/50">
               <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                 <Tag className="w-3 h-3" /> Category
               </div>
               <div className="font-medium text-sm text-foreground">
                 {formatCategory(report.category)}
               </div>
             </div>
 
             <div className="p-1 bg-muted/30 rounded-lg border border-border/50">
               <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                 <User className="w-3 h-3" /> Reported By
               </div>
               <div className="font-medium text-sm text-foreground">
                 {report.reporterName || "Anonymous"}
               </div>
             </div>
 
             <div className="space-y-2">
               <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 text-primary" /> Problem Description
               </h3>
               <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                 {report.description}
               </p>
             </div>
 
             <div>
               <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                 Evidence Photos <Badge variant="outline" className="ml-2 text-muted-foreground font-normal">{evidencePhotos.length}</Badge>
               </h4>
 
               {evidencePhotos.length > 0 ? (
                 <div className="grid grid-cols-2 gap-2">
                   {evidencePhotos.slice(0,4).map((url, index) => (
                     <div key={index} className="relative aspect-video rounded-md overflow-hidden border bg-muted">
                       <img
                         src={url}
                         alt={`Evidence ${index + 1}`}
                         loading="lazy"
                         className="w-full h-full object-cover"
                         onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                       />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="h-16 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground bg-muted/10 text-xs">
                   No photos attached
                 </div>
               )}
             </div>
           </div>
         </div>
 
        {/* CHAT / OFFICER - destra (riempie lo spazio disponibile) */}
        <div className="flex-[1.3] md:flex-1 min-h-0 rounded-lg border border-border bg-muted/10 overflow-hidden flex">
           {canViewChat ? (
            <div className="w-full h-full">
              <ChatPanel
                reportId={report.id}
                currentUserRole={currentUserRole}
                currentUserId={session?.user?.id || ""}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </div>
           ) : isOfficerMode ? (
            <div className="w-full h-full overflow-auto p-3">
               <OfficerActionPanel
                 reportId={report.id}
                 currentStatus={report.status}
                 currentCategory={report.category}
                 onActionComplete={onOfficerActionComplete}
               />
             </div>
           ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
               Chat non disponibile
             </div>
           )}
         </div>
      </div>
      
      {/* Mobile map overlay (on top of modal) */}
      {isMapOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsMapOpen(false)}
        >
          <div
            className="w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg overflow-hidden bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <LeafletMapFixed report={report} showCloseButton={true} onClose={() => setIsMapOpen(false)} className="w-full h-full" />
             </div>
           </div>
         </div>
      )}

      {/* Mobile footer: view map button (only on small screens) */}
      <div className="md:hidden flex items-center justify-center p-3 border-t bg-background/90">
        <Button variant="secondary" size="sm" onClick={() => setIsMapOpen(true)}>
          <Eye className="w-4 h-4 mr-2" />View map
        </Button>
      </div>
    </div>
  );
}