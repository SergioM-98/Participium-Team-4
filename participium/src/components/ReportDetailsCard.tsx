"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tag,
  X,
  User,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  Menu,
  StickyNote,
  ShieldAlert
} from "lucide-react";

import OfficerActionPanel from "@/app/officer/all-reports/OfficerActionPanel";
import MaintainerActionPanel from "@/app/maintainer/my-reports/MaintainerActionPanel";
import ChatPanel, { ChatMessage } from "./ChatPanel";
import dynamic from "next/dynamic";
import OfficerReportMenu from "./OfficerReportMenu";
import { is } from "zod/v4/locales";
import InternalNotesPanel from "./InternalNotesPanel";

const LeafletMapFixed = dynamic(() => import("./LeafletMapFixed"), {
  ssr: false,
});

export interface Report {
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
  companyId: string | null;
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
  setRefreshFlag?: Dispatch<SetStateAction<boolean>>;
  setReport?: Dispatch<SetStateAction<any>>;
  showToast?: (type: 'success' | 'error', text: string) => void;
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
      return (
        <Badge variant="secondary">{normalizedStatus.replaceAll(/_/g, " ")}</Badge>
      );
  }
};

export default function ReportDetailsCard({
  report,
  onClose,
  isOfficerMode = false,
  isMaintainerMode = false,
  onOfficerActionComplete,
  showChat = false,
  setRefreshFlag,
  setReport,
  showToast,
  onMaintainerActionComplete,
}: Readonly<ReportDetailsCardProps>) {
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

  const [isSending, setIsSending] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // 1. Determine Role cleanly based on DTO
  const currentUserRole =
    isReportCreator
      ? "CITIZEN"
      : isAssignedOfficer
        ? "TECHNICAL_OFFICER"
        : isMaintainerMode
          ? "EXTERNAL_MAINTAINER_WITH_ACCESS"
          : "PUBLIC_RELATIONS_OFFICER";

  const [seeOfficerChat, setSeeOfficerChat] = useState(1);


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

      {/* Row with 3 columns: map | menu | chat/officer */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 p-4 md:p-6 overflow-hidden flex-1 min-h-0">
        {/* MAP - left (hidden on mobile; available as overlay via button) */}
        {(isOfficerMode || isAssignedOfficer || isMaintainerMode) && (<div className="hidden md:flex md:flex-1 min-h-0 rounded-lg overflow-hidden border border-border bg-muted/5">
          <div className="w-full h-full">
            <LeafletMapFixed
              report={{
                id: report.id,
                latitude: report.latitude,
                longitude: report.longitude,
                title: report.title,
                category: report.category,
                status: report.status,
                citizenId: report.citizenId !== undefined ? String(report.citizenId) : undefined
              }}
              showCloseButton={false}
              className="w-full h-full"
            />
          </div>
        </div>)}
 
         {/* MENU - center (fills the available space, internal scroll) */}
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
 
        {/* CHAT / OFFICER - right (fills the available space) */}
        <div className="flex-[1.3] md:flex-1 min-h-0 rounded-lg border border-border bg-muted/10 overflow-hidden flex flex-col relative">
          {/* Header / Toggle (in-flow, non overlaid) */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/5 flex-shrink-0">
            {/* CASE 1: canViewChat && isAssignedOfficer - show tabs */}
            {((canViewChat && isAssignedOfficer)|| isMaintainerMode) && (
              <div className="flex items-center gap-1 bg-muted/10 p-0 rounded-md">
                {!isMaintainerMode && (<button
                  onClick={() => setSeeOfficerChat(1)}
                  aria-pressed={seeOfficerChat === 1}
                  className={`flex items-center gap-2 px-1 py-1 rounded text-xs transition-colors ${seeOfficerChat === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20"}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden xl:inline">Chat</span>
                </button>)}

                {isMaintainerMode && (<button
                  onClick={() => setSeeOfficerChat(1)}
                  aria-pressed={seeOfficerChat === 1}
                  className={`flex items-center gap-2 px-1 py-1 rounded text-xs transition-colors ${seeOfficerChat === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20"}`}
                >
                  <Menu className="w-4 h-4" />
                  <span className="hidden xl:inline">Menu</span>
                </button>)}

                <button
                  onClick={() => setSeeOfficerChat(2)}
                  aria-pressed={seeOfficerChat === 2}
                  className={`flex items-center gap-2 px-1 py-1 rounded text-xs transition-colors ${seeOfficerChat === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20"}`}
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="hidden xl:inline">Internal Notes</span>
                </button>

                {!isMaintainerMode && (<button
                  onClick={() => setSeeOfficerChat(3)}
                  aria-pressed={seeOfficerChat === 3}
                  className={`flex items-center gap-2 px-1 py-1 rounded text-xs transition-colors ${seeOfficerChat === 3 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/20"}`}
                >
                  <Menu className="w-4 h-4" />
                  <span className="hidden xl:inline">Menu</span>
                </button>)}
              </div>
            )}

            {/* CASE 2: canViewChat && !isAssignedOfficer - empty space */}
            {canViewChat && !isAssignedOfficer && (
              <div className="text-xs text-muted-foreground"> </div>
            )}

            {/* CASE 3: !canViewChat - empty space */}
            {!canViewChat && (
              <div className="text-xs text-muted-foreground"> </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 min-h-0 overflow-auto p-3">
            {/* CASE 1: canViewChat && isAssignedOfficer && seeOfficerChat === 1 (Chat) */}
            {canViewChat && isAssignedOfficer && seeOfficerChat === 1 && (
              <ChatPanel
                reportId={report.id}
                currentUserRole={currentUserRole}
                currentUserId={session?.user?.id || ""}
              />
            )}

            {/* CASE 2: canViewChat && isAssignedOfficer && seeOfficerChat === 2 (Internal Notes) */}
            {canViewChat && seeOfficerChat === 2 && (
              <InternalNotesPanel reportId={report.id} />
            )}

            {/* CASE 3: canViewChat && isAssignedOfficer && seeOfficerChat === 3 (Menu) */}
            {canViewChat && isAssignedOfficer && seeOfficerChat === 3 && (
              <OfficerReportMenu
                reportId={report.id}
                reportTitle={report.title}
                status={report.status}
                companyId={report.companyId || ""}
                setRefreshFlag={setRefreshFlag!}
                setReport={setReport!}
                showToast={showToast!}
              />
            )}

            {/* CASE 4: canViewChat && !isAssignedOfficer (Regular user - only Chat) */}
            {canViewChat && !isAssignedOfficer && (
              <ChatPanel
                reportId={report.id}
                currentUserRole={currentUserRole}
                currentUserId={session?.user?.id || ""}
              />
            )}

            {/* CASE 5: !canViewChat && isOfficerMode (Officer Action Panel) */}
            {!canViewChat && isOfficerMode && (
              <OfficerActionPanel
                reportId={report.id}
                currentStatus={report.status}
                currentCategory={report.category}
                onActionComplete={onOfficerActionComplete}
              />
            )}
            
            {/* CASE 7: isMaintainerMode (Maintainer Action Panel) */}
            {isMaintainerMode && seeOfficerChat===1 && (
              <MaintainerActionPanel
                reportId={report.id}
                currentStatus={report.status}
                onActionComplete={onMaintainerActionComplete}
              />
            )}
            {/* CASE 8: isMaintainerMode (Maintainer Action Panel) */}
            {
              isMaintainerMode && seeOfficerChat===2 && (
                <InternalNotesPanel reportId={report.id} />
              )
            }

          </div>
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
              <LeafletMapFixed
                report={{
                  id: report.id,
                  latitude: report.latitude,
                  longitude: report.longitude,
                  title: report.title,
                  category: report.category,
                  status: report.status,
                  citizenId: report.citizenId !== undefined ? String(report.citizenId) : undefined
                }}
                showCloseButton={true}
                onClose={() => setIsMapOpen(false)}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile footer: view map button (only on small screens) */}
      {isOfficerMode  && (<div className="md:hidden flex items-center justify-center p-3 border-t bg-background/90">
        <Button variant="secondary" size="sm" onClick={() => setIsMapOpen(true)}>
          <Eye className="w-4 h-4 mr-2" />View map
        </Button>
      </div>)}
    </div>
  );
}