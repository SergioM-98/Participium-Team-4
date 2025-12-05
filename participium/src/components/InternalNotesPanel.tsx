"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { StickyNote, Lock } from "lucide-react";
import { getReportComments, createComment } from "@/app/lib/controllers/comment.controller";

// You can move this interface to a shared types file later
export interface InternalNote {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface InternalNotesPanelProps {
  reportId: string;
}

export default function InternalNotesPanel({
  reportId,
}: InternalNotesPanelProps) {
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  
  useEffect(() => {
    async function fetchNotes() {
      const res = await getReportComments(BigInt(reportId));
      if (res.success && Array.isArray(res.data)) {
        setInternalNotes(
          res.data.map((c) => ({
            id: c.id.toString(),
            authorName: c.author.firstName + " " + c.author.lastName,
            authorRole: c.author.role,
            content: c.content,
            createdAt: c.createdAt,
          }))
        );
      } else {
        setInternalNotes([]);
      }
    }
    fetchNotes();
  }, [reportId]);

  const handleAddInternalNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    const res = await createComment(newNote, BigInt(reportId));
    if (res.success && res.data) {
      const c = res.data;
      const note: InternalNote = {
        id: c.id.toString(),
        authorName: c.author.firstName + " " + c.author.lastName,
        authorRole: c.author.role,
        content: c.content,
        createdAt: c.createdAt,
      };
      setInternalNotes((prev) => [...prev, note]);
      setNewNote("");
    }
    setIsSubmittingNote(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-yellow-50/30 dark:bg-yellow-900/5">
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {internalNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
            <StickyNote className="w-12 h-12 mb-2 stroke-1" />
            <p className="text-sm">No internal notes yet.</p>
            <p className="text-xs">
              Use this space for internal team coordination.
            </p>
          </div>
        ) : (
          internalNotes.map((note) => (
            <div
              key={note.id}
              className="bg-background border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {note.authorName}
                  </span>
                  {/* Role badge removed as requested */}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString()}{" "}
                  {new Date(note.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Note Input */}
      <div className="p-3 bg-background border-t border-yellow-100 dark:border-yellow-900/20">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
          <Lock className="w-3 h-3" /> Private Internal Note
        </label>
        <div className="flex flex-col gap-2">
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Write a note for the technical team..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddInternalNote}
              disabled={!newNote.trim() || isSubmittingNote}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isSubmittingNote ? "Saving..." : "Add Note"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
