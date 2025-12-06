jest.mock("@/app/lib/repositories/comment.repository");

import CommentService from "@/app/lib/services/comment.service";
import { CommentRepository } from "@/app/lib/repositories/comment.repository";
import { Comment } from "@prisma/client";

describe("CommentService", () => {
  let commentService: CommentService;
  let mockCommentRepository: jest.Mocked<CommentRepository>;

  const mockCommentData: Comment = {
    id: BigInt(1),
    content: "Test comment",
    authorId: "user-123",
    reportId: BigInt(1),
    createdAt: new Date("2025-12-06"),
    updatedAt: new Date("2025-12-06"),
  };

  beforeEach(() => {
    // Clear the singleton instance before each test
    jest.clearAllMocks();
    (CommentRepository.getInstance as jest.Mock).mockClear();

    // Reset the CommentService singleton
    (CommentService as any).instance = undefined;

    mockCommentRepository = {
      createComment: jest.fn(),
      getCommentsByReport: jest.fn(),
    } as unknown as jest.Mocked<CommentRepository>;

    (CommentRepository.getInstance as jest.Mock).mockReturnValue(
      mockCommentRepository,
    );

    commentService = CommentService.getInstance();
  });

  describe("getInstance", () => {
    it("should return a singleton instance of CommentService", () => {
      const instance1 = CommentService.getInstance();
      const instance2 = CommentService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create a new instance only once", () => {
      CommentService.getInstance();
      CommentService.getInstance();
      CommentService.getInstance();

      expect(CommentRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it("should initialize CommentRepository on first getInstance call", () => {
      (CommentService as any).instance = undefined;
      CommentService.getInstance();

      expect(CommentRepository.getInstance).toHaveBeenCalled();
    });
  });

  describe("createComment", () => {
    const testContent = "This is a test comment";
    const testAuthorId = "user-123";
    const testReportId = BigInt(1);

    describe("Success scenarios", () => {
      it("should successfully create a comment with valid data", async () => {
        mockCommentRepository.createComment.mockResolvedValue(mockCommentData);

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(result).toEqual(mockCommentData);
        expect(mockCommentRepository.createComment).toHaveBeenCalledWith({
          content: testContent,
          authorId: testAuthorId,
          reportId: testReportId,
        });
      });

      it("should pass exact parameters to repository", async () => {
        mockCommentRepository.createComment.mockResolvedValue(mockCommentData);

        await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(mockCommentRepository.createComment).toHaveBeenCalledWith({
          content: testContent,
          authorId: testAuthorId,
          reportId: testReportId,
        });
        expect(mockCommentRepository.createComment).toHaveBeenCalledTimes(1);
      });

      it("should return comment with correct id", async () => {
        const customComment = { ...mockCommentData, id: BigInt(42) };
        mockCommentRepository.createComment.mockResolvedValue(customComment);

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(result.id).toBe(BigInt(42));
      });

      it("should return comment with correct timestamps", async () => {
        const createdDate = new Date("2025-12-06T10:30:00Z");
        const customComment = {
          ...mockCommentData,
          createdAt: createdDate,
          updatedAt: createdDate,
        };
        mockCommentRepository.createComment.mockResolvedValue(customComment);

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(result.createdAt).toEqual(createdDate);
        expect(result.updatedAt).toEqual(createdDate);
      });

      it("should handle empty comment content", async () => {
        mockCommentRepository.createComment.mockResolvedValue(mockCommentData);

        const result = await commentService.createComment(
          "",
          testAuthorId,
          testReportId,
        );

        expect(result).toEqual(mockCommentData);
        expect(mockCommentRepository.createComment).toHaveBeenCalledWith({
          content: "",
          authorId: testAuthorId,
          reportId: testReportId,
        });
      });

      it("should handle very long comment content", async () => {
        const longContent = "x".repeat(10000);
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          content: longContent,
        });

        const result = await commentService.createComment(
          longContent,
          testAuthorId,
          testReportId,
        );

        expect(result.content).toBe(longContent);
        expect(mockCommentRepository.createComment).toHaveBeenCalledWith({
          content: longContent,
          authorId: testAuthorId,
          reportId: testReportId,
        });
      });

      it("should handle special characters in content", async () => {
        const specialContent = "<script>alert('xss')</script>@#$%^&*()";
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          content: specialContent,
        });

        const result = await commentService.createComment(
          specialContent,
          testAuthorId,
          testReportId,
        );

        expect(result.content).toBe(specialContent);
      });

      it("should handle Unicode characters in content", async () => {
        const unicodeContent = "Hello 世界 🌍 مرحبا мир";
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          content: unicodeContent,
        });

        const result = await commentService.createComment(
          unicodeContent,
          testAuthorId,
          testReportId,
        );

        expect(result.content).toBe(unicodeContent);
      });

      it("should handle control characters in content", async () => {
        const controlContent = "Comment with \x00 null \x01 bytes";
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          content: controlContent,
        });

        const result = await commentService.createComment(
          controlContent,
          testAuthorId,
          testReportId,
        );

        expect(result.content).toBe(controlContent);
      });

      it("should handle newlines and special whitespace", async () => {
        const multilineContent = "Line 1\nLine 2\r\nLine 3\tTabbed";
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          content: multilineContent,
        });

        const result = await commentService.createComment(
          multilineContent,
          testAuthorId,
          testReportId,
        );

        expect(result.content).toBe(multilineContent);
      });

      it("should handle large BigInt report IDs", async () => {
        const largeReportId = BigInt("9223372036854775807");
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          reportId: largeReportId,
        });

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          largeReportId,
        );

        expect(result.reportId).toBe(largeReportId);
        expect(mockCommentRepository.createComment).toHaveBeenCalledWith({
          content: testContent,
          authorId: testAuthorId,
          reportId: largeReportId,
        });
      });

      it("should handle negative BigInt report IDs", async () => {
        const negativeReportId = BigInt(-1);
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          reportId: negativeReportId,
        });

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          negativeReportId,
        );

        expect(result.reportId).toBe(negativeReportId);
      });

      it("should handle zero report ID", async () => {
        const zeroReportId = BigInt(0);
        mockCommentRepository.createComment.mockResolvedValue({
          ...mockCommentData,
          reportId: zeroReportId,
        });

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          zeroReportId,
        );

        expect(result.reportId).toBe(zeroReportId);
      });

      it("should handle various author ID formats", async () => {
        const authorIds = [
          "user-123",
          "uuid-12345678-1234-1234-1234-123456789012",
          "email@example.com",
          "123",
        ];

        for (const authorId of authorIds) {
          jest.clearAllMocks();
          mockCommentRepository.createComment.mockResolvedValue({
            ...mockCommentData,
            authorId,
          });

          const result = await commentService.createComment(
            testContent,
            authorId,
            testReportId,
          );

          expect(result.authorId).toBe(authorId);
          expect(mockCommentRepository.createComment).toHaveBeenCalledWith({
            content: testContent,
            authorId,
            reportId: testReportId,
          });
        }
      });

      it("should preserve all comment properties from repository response", async () => {
        const fullComment = {
          id: BigInt(99),
          content: "Full content",
          authorId: "author-456",
          reportId: BigInt(789),
          createdAt: new Date("2025-11-01"),
          updatedAt: new Date("2025-12-05"),
        };
        mockCommentRepository.createComment.mockResolvedValue(fullComment);

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(result).toEqual(fullComment);
        expect(result.id).toBe(BigInt(99));
        expect(result.content).toBe("Full content");
        expect(result.authorId).toBe("author-456");
        expect(result.reportId).toBe(BigInt(789));
      });
    });

    describe("Error scenarios", () => {
      it("should propagate repository errors", async () => {
        const error = new Error("Database connection failed");
        mockCommentRepository.createComment.mockRejectedValue(error);

        await expect(
          commentService.createComment(testContent, testAuthorId, testReportId),
        ).rejects.toThrow("Database connection failed");
      });

      it("should handle foreign key constraint error for report", async () => {
        const fkError = new Error(
          "Foreign key constraint failed on the fields: (`reportId`)",
        );
        mockCommentRepository.createComment.mockRejectedValue(fkError);

        await expect(
          commentService.createComment(testContent, testAuthorId, testReportId),
        ).rejects.toThrow("Foreign key constraint");
      });

      it("should handle foreign key constraint error for author", async () => {
        const fkError = new Error(
          "Foreign key constraint failed on the fields: (`authorId`)",
        );
        mockCommentRepository.createComment.mockRejectedValue(fkError);

        await expect(
          commentService.createComment(testContent, testAuthorId, testReportId),
        ).rejects.toThrow("Foreign key constraint");
      });

      it("should handle validation error from repository", async () => {
        const validationError = new Error("Content must be a non-empty string");
        mockCommentRepository.createComment.mockRejectedValue(validationError);

        await expect(
          commentService.createComment(testContent, testAuthorId, testReportId),
        ).rejects.toThrow("Content must be a non-empty string");
      });

      it("should handle prisma unique constraint violations", async () => {
        const uniqueError = new Error("Unique constraint failed");
        mockCommentRepository.createComment.mockRejectedValue(uniqueError);

        await expect(
          commentService.createComment(testContent, testAuthorId, testReportId),
        ).rejects.toThrow("Unique constraint failed");
      });

      it("should handle timeout errors", async () => {
        const timeoutError = new Error("Database query timeout");
        mockCommentRepository.createComment.mockRejectedValue(timeoutError);

        await expect(
          commentService.createComment(testContent, testAuthorId, testReportId),
        ).rejects.toThrow("Database query timeout");
      });

      it("should handle null response from repository", async () => {
        mockCommentRepository.createComment.mockResolvedValue(null as any);

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(result).toBeNull();
      });

      it("should handle undefined response from repository", async () => {
        mockCommentRepository.createComment.mockResolvedValue(undefined as any);

        const result = await commentService.createComment(
          testContent,
          testAuthorId,
          testReportId,
        );

        expect(result).toBeUndefined();
      });
    });
  });

  describe("getCommentsByReport", () => {
    const testReportId = BigInt(1);

    describe("Success scenarios", () => {
      it("should successfully retrieve comments for a report", async () => {
        const comments = [mockCommentData];
        mockCommentRepository.getCommentsByReport.mockResolvedValue(comments);

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result).toEqual(comments);
        expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledWith(
          testReportId,
        );
      });

      it("should pass correct report ID to repository", async () => {
        mockCommentRepository.getCommentsByReport.mockResolvedValue([]);

        await commentService.getCommentsByReport(testReportId);

        expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledWith(
          testReportId,
        );
        expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledTimes(
          1,
        );
      });

      it("should return empty array when no comments exist", async () => {
        mockCommentRepository.getCommentsByReport.mockResolvedValue([]);

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });

      it("should return multiple comments in order", async () => {
        const comment1 = { ...mockCommentData, id: BigInt(1) };
        const comment2 = { ...mockCommentData, id: BigInt(2) };
        const comment3 = { ...mockCommentData, id: BigInt(3) };
        const comments = [comment1, comment2, comment3];
        mockCommentRepository.getCommentsByReport.mockResolvedValue(comments);

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result).toEqual(comments);
        expect(result).toHaveLength(3);
        expect(result[0].id).toBe(BigInt(1));
        expect(result[1].id).toBe(BigInt(2));
        expect(result[2].id).toBe(BigInt(3));
      });

      it("should preserve comment order from repository", async () => {
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
        const comments = [comment1, comment2, comment3];
        mockCommentRepository.getCommentsByReport.mockResolvedValue(comments);

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result[0].createdAt.getTime()).toBeLessThan(
          result[1].createdAt.getTime(),
        );
        expect(result[1].createdAt.getTime()).toBeLessThan(
          result[2].createdAt.getTime(),
        );
      });

      it("should handle large number of comments", async () => {
        const largeCommentList = Array.from({ length: 1000 }, (_, i) => ({
          ...mockCommentData,
          id: BigInt(i + 1),
        }));
        mockCommentRepository.getCommentsByReport.mockResolvedValue(
          largeCommentList,
        );

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result).toHaveLength(1000);
        expect(result[0].id).toBe(BigInt(1));
        expect(result[999].id).toBe(BigInt(1000));
      });

      it("should handle large BigInt report IDs", async () => {
        const largeReportId = BigInt("9223372036854775807");
        mockCommentRepository.getCommentsByReport.mockResolvedValue([
          mockCommentData,
        ]);

        const result = await commentService.getCommentsByReport(largeReportId);

        expect(result).toEqual([mockCommentData]);
        expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledWith(
          largeReportId,
        );
      });

      it("should handle zero report ID", async () => {
        const zeroReportId = BigInt(0);
        mockCommentRepository.getCommentsByReport.mockResolvedValue([]);

        const result = await commentService.getCommentsByReport(zeroReportId);

        expect(result).toEqual([]);
        expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledWith(
          zeroReportId,
        );
      });

      it("should handle negative report IDs", async () => {
        const negativeReportId = BigInt(-1);
        mockCommentRepository.getCommentsByReport.mockResolvedValue([]);

        const result =
          await commentService.getCommentsByReport(negativeReportId);

        expect(result).toEqual([]);
        expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledWith(
          negativeReportId,
        );
      });

      it("should return comments with all required fields", async () => {
        const comment = {
          id: BigInt(1),
          content: "Test",
          authorId: "user-1",
          reportId: BigInt(1),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockCommentRepository.getCommentsByReport.mockResolvedValue([comment]);

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("content");
        expect(result[0]).toHaveProperty("authorId");
        expect(result[0]).toHaveProperty("reportId");
        expect(result[0]).toHaveProperty("createdAt");
        expect(result[0]).toHaveProperty("updatedAt");
      });

      it("should preserve comment data integrity", async () => {
        const comment = {
          id: BigInt(42),
          content: "Important comment",
          authorId: "author-99",
          reportId: BigInt(777),
          createdAt: new Date("2025-11-15"),
          updatedAt: new Date("2025-12-06"),
        };
        mockCommentRepository.getCommentsByReport.mockResolvedValue([comment]);

        const result = await commentService.getCommentsByReport(BigInt(777));

        expect(result[0].id).toBe(BigInt(42));
        expect(result[0].content).toBe("Important comment");
        expect(result[0].authorId).toBe("author-99");
        expect(result[0].reportId).toBe(BigInt(777));
      });
    });

    describe("Error scenarios", () => {
      it("should propagate repository errors", async () => {
        const error = new Error("Database connection failed");
        mockCommentRepository.getCommentsByReport.mockRejectedValue(error);

        await expect(
          commentService.getCommentsByReport(testReportId),
        ).rejects.toThrow("Database connection failed");
      });

      it("should handle foreign key constraint error", async () => {
        const fkError = new Error(
          "Foreign key constraint failed on the fields: (`reportId`)",
        );
        mockCommentRepository.getCommentsByReport.mockRejectedValue(fkError);

        await expect(
          commentService.getCommentsByReport(testReportId),
        ).rejects.toThrow("Foreign key constraint");
      });

      it("should handle record not found error", async () => {
        const notFoundError = new Error("Report not found");
        mockCommentRepository.getCommentsByReport.mockRejectedValue(
          notFoundError,
        );

        await expect(
          commentService.getCommentsByReport(testReportId),
        ).rejects.toThrow("Report not found");
      });

      it("should handle timeout errors", async () => {
        const timeoutError = new Error("Database query timeout");
        mockCommentRepository.getCommentsByReport.mockRejectedValue(
          timeoutError,
        );

        await expect(
          commentService.getCommentsByReport(testReportId),
        ).rejects.toThrow("Database query timeout");
      });

      it("should handle permission denied errors", async () => {
        const permissionError = new Error(
          "Permission denied: Cannot access report",
        );
        mockCommentRepository.getCommentsByReport.mockRejectedValue(
          permissionError,
        );

        await expect(
          commentService.getCommentsByReport(testReportId),
        ).rejects.toThrow("Permission denied");
      });

      it("should handle null response from repository", async () => {
        mockCommentRepository.getCommentsByReport.mockResolvedValue(
          null as any,
        );

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result).toBeNull();
      });

      it("should handle undefined response from repository", async () => {
        mockCommentRepository.getCommentsByReport.mockResolvedValue(
          undefined as any,
        );

        const result = await commentService.getCommentsByReport(testReportId);

        expect(result).toBeUndefined();
      });
    });
  });

  describe("Edge cases and concurrency", () => {
    it("should handle concurrent createComment calls", async () => {
      mockCommentRepository.createComment.mockResolvedValue(mockCommentData);

      const promises = Array.from({ length: 5 }, (_, i) =>
        commentService.createComment(`test-${i}`, `user-${i}`, BigInt(i)),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockCommentRepository.createComment).toHaveBeenCalledTimes(5);
    });

    it("should handle concurrent getCommentsByReport calls", async () => {
      mockCommentRepository.getCommentsByReport.mockResolvedValue([
        mockCommentData,
      ]);

      const promises = Array.from({ length: 5 }, (_, i) =>
        commentService.getCommentsByReport(BigInt(i)),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledTimes(
        5,
      );
    });

    it("should handle mixed concurrent operations", async () => {
      mockCommentRepository.createComment.mockResolvedValue(mockCommentData);
      mockCommentRepository.getCommentsByReport.mockResolvedValue([
        mockCommentData,
      ]);

      const promises = [
        commentService.createComment("test1", "user-1", BigInt(1)),
        commentService.getCommentsByReport(BigInt(1)),
        commentService.createComment("test2", "user-2", BigInt(2)),
        commentService.getCommentsByReport(BigInt(2)),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(mockCommentRepository.createComment).toHaveBeenCalledTimes(2);
      expect(mockCommentRepository.getCommentsByReport).toHaveBeenCalledTimes(
        2,
      );
    });

    it("should handle one failing concurrent call among multiple", async () => {
      mockCommentRepository.createComment
        .mockResolvedValueOnce(mockCommentData)
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce(mockCommentData);

      const promises = [
        commentService.createComment("test1", "user-1", BigInt(1)),
        commentService.createComment("test2", "user-2", BigInt(2)),
        commentService.createComment("test3", "user-3", BigInt(3)),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe("fulfilled");
      expect(results[1].status).toBe("rejected");
      expect(results[2].status).toBe("fulfilled");
    });
  });
});
