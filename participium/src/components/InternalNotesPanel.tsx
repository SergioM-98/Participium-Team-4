"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { StickyNote, Lock } from "lucide-react";

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
  currentUserRole: string;
  currentUserName: string;
}

export default function InternalNotesPanel({
  reportId,
  currentUserRole,
  currentUserName,
}: InternalNotesPanelProps) {
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Mock Loading Internal Notes
  useEffect(() => {
    // TODO: Replace with actual fetch: const notes = await getInternalNotes(reportId);

    // Mock data
    setInternalNotes([
      {
        id: "1",
        authorName: "System Admin",
        authorRole: "TECHNICAL_OFFICER",
        content:
          "Internal Note: Please check the jurisdiction of this location.",
        createdAt: new Date(Date.now() - 10000000).toISOString(),
      },
    ]);
  }, [reportId]);

  const handleAddInternalNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);

    // TODO: Connect to backend API: await addInternalNote(reportId, newNote);

    // Simulating API success
    setTimeout(() => {
      const note: InternalNote = {
        id: Date.now().toString(),
        authorName: currentUserName,
        authorRole: currentUserRole,
        content: newNote,
        createdAt: new Date().toISOString(),
      };
      setInternalNotes((prev) => [...prev, note]);
      setNewNote("");
      setIsSubmittingNote(false);
    }, 500);
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
