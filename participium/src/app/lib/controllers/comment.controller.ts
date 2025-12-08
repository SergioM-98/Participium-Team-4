"use server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CommentService from "../services/comment.service";
import {
  CreateCommentResponse,
  GetReportCommentsResponse,
} from "../dtos/comment.dto";

export async function createComment(
  content: string,
  reportId: bigint,
): Promise<CreateCommentResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized: No session found" };
  }

  if (
    !session.user.role.includes("TECHNICAL_OFFICER") &&
    !session.user.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS")
  ) {
    return {
      success: false,
      error:
        "Unauthorized: Only technical officers and external maintainers with access can create comments",
    };
  }

  try {
    const commentService = CommentService.getInstance();
    const comment = await commentService.createComment(
      content,
      session.user.id,
      reportId,
    );
    return { success: true, data: comment };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create comment";
    return { success: false, error: errorMessage };
  }
}

export async function getReportComments(
  reportId: bigint,
): Promise<GetReportCommentsResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized: No session found" };
  }

  if (
    !session.user.role.includes("TECHNICAL_OFFICER") &&
    !session.user.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS")
  ) {
    return {
      success: false,
      error:
        "Unauthorized: Only technical officers and external maintainers with access can view comments",
    };
  }

  try {
    const commentService = CommentService.getInstance();
    const comments = await commentService.getCommentsByReport(reportId);
    return { success: true, data: comments };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve comments";
    return { success: false, error: errorMessage };
  }
}
