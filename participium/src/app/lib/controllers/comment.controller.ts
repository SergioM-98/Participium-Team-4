"use server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CommentService from "../services/comment.service";

export async function createComment(
  content: string,
  reportId: bigint
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized: No session found" };
  }

  if (session.user.role !== "TECHNICAL_OFFICER") {
    return { success: false, error: "Unauthorized: Only technical officers can create comments" };
  }

  try {
    const commentService = CommentService.getInstance();
    const comment = await commentService.createComment(content, session.user.id, reportId);
    return { success: true, data: comment };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create comment";
    return { success: false, error: errorMessage };
  }
}

export async function getReportComments(reportId: bigint) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { success: false, error: "Unauthorized: No session found" };
  }

  if (session.user.role !== "TECHNICAL_OFFICER") {
    return { success: false, error: "Unauthorized: Only technical officers can view comments" };
  }

  try {
    const commentService = CommentService.getInstance();
    const comments = await commentService.getCommentsByReport(reportId);
    return { success: true, data: comments };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to retrieve comments";
    return { success: false, error: errorMessage };
  }
}
