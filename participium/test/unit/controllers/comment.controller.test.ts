jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

jest.mock("@/app/lib/services/comment.service", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(),
    },
  };
});

import { getServerSession } from "next-auth/next";
import CommentService from "@/app/lib/services/comment.service";
import {
  createComment,
  getReportComments,
} from "@/app/lib/controllers/comment.controller";

describe("CommentController", () => {
  const mockCommentService = {
    createComment: jest.fn(),
    getCommentsByReport: jest.fn(),
  };

  // Test session objects for different roles
  const citizenSession = {
    user: {
      id: "2",
      name: "Citizen User",
      role: ["CITIZEN"],
    },
    expires: "2026-12-31T23:59:59.999Z",
  };

  const technicalOfficerSession = {
    user: {
      id: "2",
      name: "Officer User",
      role: ["TECHNICAL_OFFICER"],
    },
    expires: "2026-12-31T23:59:59.999Z",
  };

  const publicRelationsOfficerSession = {
    user: {
      id: "3",
      name: "Public Relations Officer",
      role: ["PUBLIC_RELATIONS_OFFICER"],
    },
    expires: "2026-12-31T23:59:59.999Z",
  };

  const adminSession = {
    user: {
      id: "4",
      name: "Admin User",
      role: ["ADMIN"],
    },
    expires: "2026-12-31T23:59:59.999Z",
  };

  const externalMaintainerWithAccessSession = {
    user: {
      id: "5",
      name: "External Maintainer User",
      role: "EXTERNAL_MAINTAINER_WITH_ACCESS",
    },
    expires: "2026-12-31T23:59:59.999Z",
  };

  const externalMaintainerWithoutAccessSession = {
    user: {
      id: "6",
      name: "External Maintainer User",
      role: "EXTERNAL_MAINTAINER_WITHOUT_ACCESS",
    },
    expires: "2026-12-31T23:59:59.999Z",
  };

  const mockCommentData = {
    id: BigInt(1),
    content: "Test comment",
    authorId: "2",
    reportId: BigInt(1),
    createdAt: new Date("2025-12-06"),
    updatedAt: new Date("2025-12-06"),
    author: {
      id: "2",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      username: "johndoe",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (CommentService.getInstance as jest.Mock).mockReturnValue(
      mockCommentService,
    );
  });

  describe("createComment", () => {
    const testContent = "This is a test comment";
    const testReportId = BigInt(1);

    describe("Success scenarios", () => {
      it("should successfully create a comment when user is a TECHNICAL_OFFICER", async () => {
        mockCommentService.createComment.mockResolvedValue(mockCommentData);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockCommentData);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          testContent,
          technicalOfficerSession.user.id,
          testReportId,
        );
        expect(CommentService.getInstance).toHaveBeenCalled();
      });

      it("should pass correct parameters to service", async () => {
        mockCommentService.createComment.mockResolvedValue(mockCommentData);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        await createComment(testContent, testReportId);

        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          testContent,
          "2",
          testReportId,
        );
      });

      it("should successfully create a comment when user is a EXTERNAL_MAINTAINER_WITH_ACCESS", async () => {
        mockCommentService.createComment.mockResolvedValue(mockCommentData);
        (getServerSession as jest.Mock).mockResolvedValue(
          externalMaintainerWithAccessSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockCommentData);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          testContent,
          externalMaintainerWithAccessSession.user.id,
          testReportId,
        );
        expect(CommentService.getInstance).toHaveBeenCalled();
      });

      it("should pass correct parameters to service", async () => {
        mockCommentService.createComment.mockResolvedValue(mockCommentData);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        await createComment(testContent, testReportId);

        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          testContent,
          "2",
          testReportId,
        );
      });

      it("should handle empty comment content", async () => {
        const emptyComment = mockCommentData;
        mockCommentService.createComment.mockResolvedValue(emptyComment);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment("", testReportId);

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          "",
          technicalOfficerSession.user.id,
          testReportId,
        );
      });

      it("should handle large BigInt report IDs", async () => {
        const largeReportId = BigInt("9223372036854775807"); // Max int64
        mockCommentService.createComment.mockResolvedValue({
          ...mockCommentData,
          reportId: largeReportId,
        });
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(testContent, largeReportId);

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          testContent,
          technicalOfficerSession.user.id,
          largeReportId,
        );
      });
    });

    describe("Authorization failures", () => {
      it("should return error when user is not authenticated (no session)", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Unauthorized: No session found");
        expect(mockCommentService.createComment).not.toHaveBeenCalled();
      });

      it("should return error when session exists but user is not present", async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
          expires: "2026-12-31T23:59:59.999Z",
        });

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Unauthorized: No session found");
        expect(mockCommentService.createComment).not.toHaveBeenCalled();
      });

      it("should reject CITIZEN role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can create comments",
        );
        expect(mockCommentService.createComment).not.toHaveBeenCalled();
      });

      it("should reject PUBLIC_RELATIONS_OFFICER role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          publicRelationsOfficerSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can create comments",
        );
        expect(mockCommentService.createComment).not.toHaveBeenCalled();
      });

      it("should reject ADMIN role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(adminSession);

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can create comments",
        );
        expect(mockCommentService.createComment).not.toHaveBeenCalled();
      });

      it("should reject EXTERNAL_MAINTAINER_WITHOUT_ACCESS role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          externalMaintainerWithoutAccessSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can create comments",
        );
        expect(mockCommentService.createComment).not.toHaveBeenCalled();
      });
    });

    describe("Service errors", () => {
      it("should catch and return error from service", async () => {
        const errorMessage = "Database connection failed";
        mockCommentService.createComment.mockRejectedValue(
          new Error(errorMessage),
        );
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(errorMessage);
      });

      it("should handle non-Error exceptions from service", async () => {
        mockCommentService.createComment.mockRejectedValue("Unknown error");
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Failed to create comment");
      });

      it("should handle validation errors from service", async () => {
        const validationError = "Content exceeds maximum length";
        mockCommentService.createComment.mockRejectedValue(
          new Error(validationError),
        );
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(validationError);
      });

      it("should handle null response from service", async () => {
        mockCommentService.createComment.mockResolvedValue(null);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(testContent, testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toBeNull();
      });
    });

    describe("Edge cases", () => {
      it("should handle very long comment content", async () => {
        const longContent = "x".repeat(10000);
        mockCommentService.createComment.mockResolvedValue({
          ...mockCommentData,
          content: longContent,
        });
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(longContent, testReportId);

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          longContent,
          technicalOfficerSession.user.id,
          testReportId,
        );
      });

      it("should handle special characters in comment content", async () => {
        const specialContent = "<script>alert('xss')</script>@#$%^&*()";
        mockCommentService.createComment.mockResolvedValue({
          ...mockCommentData,
          content: specialContent,
        });
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(specialContent, testReportId);

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          specialContent,
          technicalOfficerSession.user.id,
          testReportId,
        );
      });

      it("should handle Unicode characters in comment content", async () => {
        const unicodeContent = "Hello 世界 🌍 مرحبا мир";
        mockCommentService.createComment.mockResolvedValue({
          ...mockCommentData,
          content: unicodeContent,
        });
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await createComment(unicodeContent, testReportId);

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          unicodeContent,
          technicalOfficerSession.user.id,
          testReportId,
        );
      });
    });
  });

  describe("getReportComments", () => {
    const testReportId = BigInt(1);

    describe("Success scenarios", () => {
      it("should successfully retrieve comments for a report when user is TECHNICAL_OFFICER", async () => {
        const mockComments = [
          mockCommentData,
          { ...mockCommentData, id: BigInt(2) },
        ];
        mockCommentService.getCommentsByReport.mockResolvedValue(mockComments);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockComments);
        expect(mockCommentService.getCommentsByReport).toHaveBeenCalledWith(
          testReportId,
        );
        expect(CommentService.getInstance).toHaveBeenCalled();
      });

      it("should return empty array when no comments exist for report", async () => {
        mockCommentService.getCommentsByReport.mockResolvedValue([]);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toEqual([]);
        expect(Array.isArray(response.data)).toBe(true);
      });

      it("should return multiple comments in correct order", async () => {
        const comment1 = {
          ...mockCommentData,
          id: BigInt(1),
          createdAt: new Date("2025-12-01"),
        };
        const comment2 = {
          ...mockCommentData,
          id: BigInt(2),
          createdAt: new Date("2025-12-02"),
        };
        const comment3 = {
          ...mockCommentData,
          id: BigInt(3),
          createdAt: new Date("2025-12-03"),
        };
        const mockComments = [comment1, comment2, comment3];
        mockCommentService.getCommentsByReport.mockResolvedValue(mockComments);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toHaveLength(3);
        expect(response.data).toEqual(mockComments);
      });

      it("should pass correct report ID to service", async () => {
        mockCommentService.getCommentsByReport.mockResolvedValue([]);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        await getReportComments(testReportId);

        expect(mockCommentService.getCommentsByReport).toHaveBeenCalledWith(
          testReportId,
        );
      });

      it("should handle large BigInt report IDs", async () => {
        const largeReportId = BigInt("9223372036854775807");
        mockCommentService.getCommentsByReport.mockResolvedValue([]);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(largeReportId);

        expect(response.success).toBe(true);
        expect(mockCommentService.getCommentsByReport).toHaveBeenCalledWith(
          largeReportId,
        );
      });
    });

    describe("Authorization failures", () => {
      it("should return error when user is not authenticated (no session)", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Unauthorized: No session found");
        expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
      });

      it("should return error when session exists but user is not present", async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
          expires: "2026-12-31T23:59:59.999Z",
        });

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Unauthorized: No session found");
        expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
      });

      it("should reject CITIZEN role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can view comments",
        );
        expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
      });

      it("should reject PUBLIC_RELATIONS_OFFICER role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          publicRelationsOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can view comments",
        );
        expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
      });

      it("should reject ADMIN role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(adminSession);

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can view comments",
        );
        expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
      });

      it("should reject EXTERNAL_MAINTAINER_WITHOUT_ACCESS role", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          externalMaintainerWithoutAccessSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Unauthorized: Only technical officers and external maintainers with access can view comments",
        );
        expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
      });
    });

    describe("Service errors", () => {
      it("should catch and return error from service", async () => {
        const errorMessage = "Database query failed";
        mockCommentService.getCommentsByReport.mockRejectedValue(
          new Error(errorMessage),
        );
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(errorMessage);
      });

      it("should handle non-Error exceptions from service", async () => {
        mockCommentService.getCommentsByReport.mockRejectedValue(
          "Unknown error",
        );
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Failed to retrieve comments");
      });

      it("should handle service timeout", async () => {
        const timeoutError = new Error("Request timeout");
        mockCommentService.getCommentsByReport.mockRejectedValue(timeoutError);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("Request timeout");
      });
    });

    describe("Response data structure", () => {
      it("should return comments with all required fields", async () => {
        mockCommentService.getCommentsByReport.mockResolvedValue([
          mockCommentData,
        ]);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        if (response.data && Array.isArray(response.data)) {
          expect(response.data).toHaveLength(1);
          const comment = response.data[0] as typeof mockCommentData;

          expect(comment).toHaveProperty("id");
          expect(comment).toHaveProperty("content");
          expect(comment).toHaveProperty("authorId");
          expect(comment).toHaveProperty("reportId");
          expect(comment).toHaveProperty("createdAt");
          expect(comment).toHaveProperty("updatedAt");
          expect(comment).toHaveProperty("author");
          expect(comment.author).toHaveProperty("id");
          expect(comment.author).toHaveProperty("firstName");
          expect(comment.author).toHaveProperty("lastName");
          expect(comment.author).toHaveProperty("email");
          expect(comment.author).toHaveProperty("username");
        }
      });

      it("should preserve comment data integrity", async () => {
        const customComment = {
          ...mockCommentData,
          id: BigInt(42),
          content: "Important note",
          authorId: "custom-user-id",
          reportId: BigInt(999),
        };
        mockCommentService.getCommentsByReport.mockResolvedValue([
          customComment,
        ]);
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );

        const response = await getReportComments(BigInt(999));

        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          expect(response.data[0]).toEqual(customComment);
          expect(response.data[0].id).toBe(BigInt(42));
          expect(response.data[0].content).toBe("Important note");
        }
      });
    });

    describe("Non-existing report and access control", () => {
      it("should handle error when report does not exist", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const reportNotFoundError = new Error("Report with id 999 not found");
        mockCommentService.getCommentsByReport.mockRejectedValue(
          reportNotFoundError,
        );

        const response = await getReportComments(BigInt(999));

        expect(response.success).toBe(false);
        expect(response.error).toBe("Report with id 999 not found");
        expect(mockCommentService.getCommentsByReport).toHaveBeenCalledWith(
          BigInt(999),
        );
      });

      it("should handle error when technical officer is not assigned to report", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const unauthorizedError = new Error(
          "User is not assigned to this report",
        );
        mockCommentService.getCommentsByReport.mockRejectedValue(
          unauthorizedError,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe("User is not assigned to this report");
      });

      it("should handle error when external maintainer with access is not assigned to report", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const unauthorizedError = new Error(
          "External maintainer is not assigned to this report's company",
        );
        mockCommentService.getCommentsByReport.mockRejectedValue(
          unauthorizedError,
        );

        const response = await getReportComments(testReportId);

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "External maintainer is not assigned to this report's company",
        );
      });

      it("should distinguish between report not found vs permission denied", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        mockCommentService.getCommentsByReport.mockRejectedValue(
          new Error("Report not found (404)"),
        );

        const response1 = await getReportComments(BigInt(1));

        expect(response1.success).toBe(false);
        expect(response1.error).toContain("404");

        jest.clearAllMocks();
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        mockCommentService.getCommentsByReport.mockRejectedValue(
          new Error("Access denied to report (403)"),
        );

        const response2 = await getReportComments(BigInt(1));

        expect(response2.success).toBe(false);
        expect(response2.error).toContain("403");
      });

      it("should handle malformed content with control characters", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const malformedContent = "Comment with \x00 null \x01 bytes";
        mockCommentService.createComment.mockResolvedValue({
          ...mockCommentData,
          content: malformedContent,
        });

        const response = await createComment(malformedContent, BigInt(1));

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          malformedContent,
          technicalOfficerSession.user.id,
          BigInt(1),
        );
      });

      it("should handle content with binary-like strings", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const binaryContent = "\u0000\u0001\u0002\u0003";
        mockCommentService.createComment.mockResolvedValue({
          ...mockCommentData,
          content: binaryContent,
        });

        const response = await createComment(binaryContent, BigInt(1));

        expect(response.success).toBe(true);
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          binaryContent,
          technicalOfficerSession.user.id,
          BigInt(1),
        );
      });

      it("should handle invalid BigInt values gracefully", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        mockCommentService.createComment.mockResolvedValue(mockCommentData);

        const testContent = "test";
        const negativeReportId = BigInt(-1);

        await createComment(testContent, negativeReportId);

        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          testContent,
          technicalOfficerSession.user.id,
          negativeReportId,
        );
      });
    });

    describe("Report access control and assignment", () => {
      it("should handle error when report does not exist", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const reportNotFoundError = new Error("Report with id 999 not found");
        mockCommentService.createComment.mockRejectedValue(reportNotFoundError);

        const response = await createComment("test comment", BigInt(999));

        expect(response.success).toBe(false);
        expect(response.error).toBe("Report with id 999 not found");
        expect(mockCommentService.createComment).toHaveBeenCalledWith(
          "test comment",
          technicalOfficerSession.user.id,
          BigInt(999),
        );
      });

      it("should handle error when technical officer is not assigned to report", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const unauthorizedError = new Error(
          "User is not assigned to this report",
        );
        mockCommentService.createComment.mockRejectedValue(unauthorizedError);

        const response = await createComment("test comment", BigInt(1));

        expect(response.success).toBe(false);
        expect(response.error).toBe("User is not assigned to this report");
      });

      it("should handle error when external maintainer with access is not assigned to report", async () => {
        // Note: Current implementation only allows TECHNICAL_OFFICER, but we test the pattern
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const unauthorizedError = new Error(
          "External maintainer is not assigned to this report's company",
        );
        mockCommentService.createComment.mockRejectedValue(unauthorizedError);

        const response = await createComment("test comment", BigInt(1));

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "External maintainer is not assigned to this report's company",
        );
      });

      it("should handle permission denied when trying to comment on non-assigned report", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(
          technicalOfficerSession,
        );
        const permissionError = new Error(
          "Permission denied: You do not have access to this report",
        );
        mockCommentService.createComment.mockRejectedValue(permissionError);

        const response = await createComment("test comment", BigInt(100));

        expect(response.success).toBe(false);
        expect(response.error).toBe(
          "Permission denied: You do not have access to this report",
        );
      });
    });
  });

  describe("Mock verification", () => {
    it("should call CommentService.getInstance exactly once per operation", async () => {
      mockCommentService.createComment.mockResolvedValue(mockCommentData);
      (getServerSession as jest.Mock).mockResolvedValue(
        technicalOfficerSession,
      );

      await createComment("test", BigInt(1));

      expect(CommentService.getInstance).toHaveBeenCalledTimes(1);
    });

    it("should not call service when authorization fails", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await createComment("test", BigInt(1));

      expect(mockCommentService.createComment).not.toHaveBeenCalled();
      expect(mockCommentService.getCommentsByReport).not.toHaveBeenCalled();
    });

    it("should clear session mock state between tests", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(
        technicalOfficerSession,
      );
      mockCommentService.createComment.mockResolvedValue(mockCommentData);

      await createComment("test", BigInt(1));
      jest.clearAllMocks();

      (getServerSession as jest.Mock).mockResolvedValue(null);
      await createComment("test", BigInt(1));

      expect(mockCommentService.createComment).not.toHaveBeenCalled();
    });
  });
});
