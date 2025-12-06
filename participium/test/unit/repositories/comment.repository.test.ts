jest.mock("@/prisma/db", () => ({
  prisma: {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { CommentRepository } from "@/app/lib/repositories/comment.repository";
import type { CommentResponse } from "@/dtos/comment.dto";
import type { UserAuthor } from "@/dtos/user.dto";

const mockPrisma = jest.requireMock("@/prisma/db").prisma;

interface MockComment extends CommentResponse {
  updatedAt?: Date;
}

describe("CommentRepository", () => {
  let repository: CommentRepository;

  const mockUser: UserAuthor = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    username: "johndoe",
  };

  const mockCommentData: MockComment = {
    id: BigInt(1),
    content: "Test comment",
    authorId: "user-123",
    reportId: BigInt(1),
    createdAt: new Date("2025-12-06"),
    updatedAt: new Date("2025-12-06"),
    author: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = CommentRepository.getInstance();
  });

  describe("getInstance", () => {
    it("should return a singleton instance of CommentRepository", () => {
      const instance1 = CommentRepository.getInstance();
      const instance2 = CommentRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create a new instance only once", () => {
      const instance1 = CommentRepository.getInstance();
      const instance2 = CommentRepository.getInstance();
      const instance3 = CommentRepository.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it("should maintain singleton after multiple getInstance calls", () => {
      const instances = Array.from({ length: 5 }, () =>
        CommentRepository.getInstance(),
      );

      for (let i = 1; i < instances.length; i++) {
        expect(instances[i]).toBe(instances[i - 1]);
      }
    });
  });

  describe("createComment", () => {
    beforeEach(() => {
      repository = CommentRepository.getInstance();
    });

    it("should successfully create a comment with valid data", async () => {
      const createData = {
        content: "Test comment",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result).toEqual({
        ...mockCommentData,
        author: mockUser,
      });
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it("should include author information in response", async () => {
      const createData = {
        content: "Test comment",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: mockCommentData.id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
            },
          },
        },
      });
      expect(result.author).toBeDefined();
      expect(result.author?.id).toBe(mockUser.id);
    });

    it("should handle long comment content", async () => {
      const longContent = "a".repeat(5000);
      const createData = {
        content: longContent,
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        content: longContent,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        content: longContent,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.content).toBe(longContent);
      expect(result.content.length).toBe(5000);
    });

    it("should handle special characters in content", async () => {
      const specialContent = "Test <>&\"'`\\n\\t\\r";
      const createData = {
        content: specialContent,
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        content: specialContent,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        content: specialContent,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.content).toBe(specialContent);
    });

    it("should handle Unicode characters in content", async () => {
      const unicodeContent = "🎉 Test 中文 العربية ελληνικά";
      const createData = {
        content: unicodeContent,
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        content: unicodeContent,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        content: unicodeContent,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.content).toBe(unicodeContent);
    });

    it("should preserve BigInt reportId", async () => {
      const largeReportId = BigInt("9223372036854775807");
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: largeReportId,
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        reportId: largeReportId,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        reportId: largeReportId,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.reportId).toBe(largeReportId);
      expect(typeof result.reportId).toBe("bigint");
    });

    it("should preserve BigInt comment id", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.id).toBe(BigInt(1));
      expect(typeof result.id).toBe("bigint");
    });

    it("should preserve timestamps", async () => {
      const now = new Date();
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        createdAt: now,
        updatedAt: now,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        createdAt: now,
        updatedAt: now,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.createdAt).toEqual(now);
      expect(result.updatedAt).toEqual(now);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle different author IDs", async () => {
      const authorId = "custom-author-456";
      const createData = {
        content: "Test",
        authorId,
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        authorId,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        authorId,
        author: { ...mockUser, id: authorId },
      });

      const result = await repository.createComment(createData);

      expect(result.authorId).toBe(authorId);
    });

    it("should handle different report IDs", async () => {
      const reportId = BigInt(999);
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId,
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        reportId,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        reportId,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.reportId).toBe(reportId);
    });

    it("should handle database constraint violations", async () => {
      const createData = {
        content: "Test",
        authorId: "nonexistent-user",
        reportId: BigInt(1),
      };

      const constraintError = new Error(
        "Foreign key constraint failed on the fields: (authorId)",
      );
      mockPrisma.comment.create.mockRejectedValue(constraintError);

      await expect(repository.createComment(createData)).rejects.toThrow(
        "Foreign key constraint failed",
      );
    });

    it("should handle report not found error", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(99999),
      };

      const notFoundError = new Error(
        "Foreign key constraint failed on the fields: (reportId)",
      );
      mockPrisma.comment.create.mockRejectedValue(notFoundError);

      await expect(repository.createComment(createData)).rejects.toThrow(
        "Foreign key constraint failed",
      );
    });

    it("should handle database connection errors", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      const connectionError = new Error("connect ECONNREFUSED");
      mockPrisma.comment.create.mockRejectedValue(connectionError);

      await expect(repository.createComment(createData)).rejects.toThrow(
        "connect ECONNREFUSED",
      );
    });

    it("should handle null author in response", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: null,
      });

      const result = await repository.createComment(createData);

      expect(result.author).toBeNull();
    });

    it("should handle undefined author in response", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: undefined,
      });

      const result = await repository.createComment(createData);

      expect(result.author).toBeUndefined();
    });

    it("should call findUnique with correct comment id from create response", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      const createdComment = { ...mockCommentData, id: BigInt(42) };
      mockPrisma.comment.create.mockResolvedValue(createdComment);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...createdComment,
        author: mockUser,
      });

      await repository.createComment(createData);

      expect(mockPrisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(42) },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
            },
          },
        },
      });
    });

    it("should handle empty string content", async () => {
      const createData = {
        content: "",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        content: "",
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        content: "",
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.content).toBe("");
    });

    it("should handle whitespace-only content", async () => {
      const whitespaceContent = "   \n\t  ";
      const createData = {
        content: whitespaceContent,
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue({
        ...mockCommentData,
        content: whitespaceContent,
      });
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        content: whitespaceContent,
        author: mockUser,
      });

      const result = await repository.createComment(createData);

      expect(result.content).toBe(whitespaceContent);
    });

    it("should handle timeout errors", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      const timeoutError = new Error("Query timed out");
      mockPrisma.comment.create.mockRejectedValue(timeoutError);

      await expect(repository.createComment(createData)).rejects.toThrow(
        "Query timed out",
      );
    });

    it("should handle duplicate entry errors", async () => {
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      const duplicateError = new Error("Unique constraint failed");
      mockPrisma.comment.create.mockRejectedValue(duplicateError);

      await expect(repository.createComment(createData)).rejects.toThrow(
        "Unique constraint failed",
      );
    });
  });

  describe("getCommentsByReport", () => {
    beforeEach(() => {
      repository = CommentRepository.getInstance();
    });

    it("should successfully retrieve comments for a report", async () => {
      const comments = [
        {
          ...mockCommentData,
          author: mockUser,
        },
      ];

      mockPrisma.comment.findMany.mockResolvedValue(comments);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result).toEqual(comments);
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: { reportId: BigInt(1) },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
            },
          },
        },
      });
    });

    it("should return empty array when no comments exist", async () => {
      mockPrisma.comment.findMany.mockResolvedValue([]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should retrieve multiple comments ordered by creation date", async () => {
      const comment1 = {
        ...mockCommentData,
        id: BigInt(1),
        createdAt: new Date("2025-12-01"),
        author: mockUser,
      };
      const comment2 = {
        ...mockCommentData,
        id: BigInt(2),
        createdAt: new Date("2025-12-02"),
        author: mockUser,
      };
      const comment3 = {
        ...mockCommentData,
        id: BigInt(3),
        createdAt: new Date("2025-12-03"),
        author: mockUser,
      };

      mockPrisma.comment.findMany.mockResolvedValue([
        comment1,
        comment2,
        comment3,
      ]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result.length).toBe(3);
      expect(result[0].id).toBe(BigInt(1));
      expect(result[1].id).toBe(BigInt(2));
      expect(result[2].id).toBe(BigInt(3));
      expect(result[0].createdAt).toEqual(new Date("2025-12-01"));
      expect(result[2].createdAt).toEqual(new Date("2025-12-03"));
    });

    it("should include author information for each comment", async () => {
      const user1 = { ...mockUser, id: "user-1" };
      const user2 = { ...mockUser, id: "user-2" };

      const comment1 = { ...mockCommentData, id: BigInt(1), author: user1 };
      const comment2 = { ...mockCommentData, id: BigInt(2), author: user2 };

      mockPrisma.comment.findMany.mockResolvedValue([comment1, comment2]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].author).toBeDefined();
      expect(result[0].author?.id).toBe("user-1");
      expect(result[1].author).toBeDefined();
      expect(result[1].author?.id).toBe("user-2");
    });

    it("should preserve BigInt IDs in results", async () => {
      const largeId = BigInt("9223372036854775807");
      const largeReportId = BigInt("9223372036854775800");

      const comment = {
        ...mockCommentData,
        id: largeId,
        reportId: largeReportId,
        author: mockUser,
      };

      mockPrisma.comment.findMany.mockResolvedValue([comment]);

      const result = await repository.getCommentsByReport(largeReportId);

      expect(result[0].id).toBe(largeId);
      expect(result[0].reportId).toBe(largeReportId);
      expect(typeof result[0].id).toBe("bigint");
      expect(typeof result[0].reportId).toBe("bigint");
    });

    it("should preserve timestamps", async () => {
      const now = new Date();
      const comment = {
        ...mockCommentData,
        createdAt: now,
        updatedAt: now,
        author: mockUser,
      };

      mockPrisma.comment.findMany.mockResolvedValue([comment]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].createdAt).toEqual(now);
      expect(result[0].updatedAt).toEqual(now);
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
    });

    it("should handle comments with null author", async () => {
      const comment = {
        ...mockCommentData,
        author: null,
      };

      mockPrisma.comment.findMany.mockResolvedValue([comment]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].author).toBeNull();
    });

    it("should handle large datasets", async () => {
      const comments = Array.from({ length: 1000 }, (_, i) => ({
        ...mockCommentData,
        id: BigInt(i),
        author: mockUser,
      }));

      mockPrisma.comment.findMany.mockResolvedValue(comments);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result.length).toBe(1000);
      expect(result[0].id).toBe(BigInt(0));
      expect(result[999].id).toBe(BigInt(999));
    });

    it("should pass correct reportId to prisma", async () => {
      const reportId = BigInt(42);
      mockPrisma.comment.findMany.mockResolvedValue([]);

      await repository.getCommentsByReport(reportId);

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reportId },
        }),
      );
    });

    it("should order by createdAt ascending", async () => {
      mockPrisma.comment.findMany.mockResolvedValue([]);

      await repository.getCommentsByReport(BigInt(1));

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "asc" },
        }),
      );
    });

    it("should include author select fields", async () => {
      mockPrisma.comment.findMany.mockResolvedValue([]);

      await repository.getCommentsByReport(BigInt(1));

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
              },
            },
          },
        }),
      );
    });

    it("should handle database connection errors", async () => {
      const connectionError = new Error("connect ECONNREFUSED");
      mockPrisma.comment.findMany.mockRejectedValue(connectionError);

      await expect(repository.getCommentsByReport(BigInt(1))).rejects.toThrow(
        "connect ECONNREFUSED",
      );
    });

    it("should handle query timeout", async () => {
      const timeoutError = new Error("Query timed out");
      mockPrisma.comment.findMany.mockRejectedValue(timeoutError);

      await expect(repository.getCommentsByReport(BigInt(1))).rejects.toThrow(
        "Query timed out",
      );
    });

    it("should handle permission denied errors", async () => {
      const permissionError = new Error(
        "User does not have permission to access this report",
      );
      mockPrisma.comment.findMany.mockRejectedValue(permissionError);

      await expect(repository.getCommentsByReport(BigInt(1))).rejects.toThrow(
        "User does not have permission",
      );
    });

    it("should handle different report IDs", async () => {
      const reportId1 = BigInt(100);
      const reportId2 = BigInt(200);

      const comment1 = {
        ...mockCommentData,
        reportId: reportId1,
        author: mockUser,
      };
      mockPrisma.comment.findMany.mockResolvedValue([comment1]);

      await repository.getCommentsByReport(reportId1);
      expect(mockPrisma.comment.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { reportId: reportId1 },
        }),
      );

      mockPrisma.comment.findMany.mockClear();
      const comment2 = {
        ...mockCommentData,
        reportId: reportId2,
        author: mockUser,
      };
      mockPrisma.comment.findMany.mockResolvedValue([comment2]);

      await repository.getCommentsByReport(reportId2);
      expect(mockPrisma.comment.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: { reportId: reportId2 },
        }),
      );
    });

    it("should handle comments with identical timestamps", async () => {
      const sameDate = new Date("2025-12-06T10:00:00Z");
      const comment1 = {
        ...mockCommentData,
        id: BigInt(1),
        createdAt: sameDate,
        author: mockUser,
      };
      const comment2 = {
        ...mockCommentData,
        id: BigInt(2),
        createdAt: sameDate,
        author: mockUser,
      };

      mockPrisma.comment.findMany.mockResolvedValue([comment1, comment2]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].createdAt).toEqual(sameDate);
      expect(result[1].createdAt).toEqual(sameDate);
    });

    it("should handle comments with special characters", async () => {
      const specialComment = {
        ...mockCommentData,
        content: "<script>alert('xss')</script>",
        author: mockUser,
      };

      mockPrisma.comment.findMany.mockResolvedValue([specialComment]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].content).toBe("<script>alert('xss')</script>");
    });

    it("should handle comments with Unicode content", async () => {
      const unicodeComment = {
        ...mockCommentData,
        content: "🎉 中文 العربية",
        author: mockUser,
      };

      mockPrisma.comment.findMany.mockResolvedValue([unicodeComment]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].content).toBe("🎉 中文 العربية");
    });

    it("should handle mixed author and null author comments", async () => {
      const comment1 = { ...mockCommentData, id: BigInt(1), author: mockUser };
      const comment2 = { ...mockCommentData, id: BigInt(2), author: null };
      const comment3 = { ...mockCommentData, id: BigInt(3), author: mockUser };

      mockPrisma.comment.findMany.mockResolvedValue([
        comment1,
        comment2,
        comment3,
      ]);

      const result = await repository.getCommentsByReport(BigInt(1));

      expect(result[0].author).not.toBeNull();
      expect(result[1].author).toBeNull();
      expect(result[2].author).not.toBeNull();
    });

    it("should handle very large reportId", async () => {
      const veryLargeId = BigInt("18446744073709551615");
      mockPrisma.comment.findMany.mockResolvedValue([]);

      await repository.getCommentsByReport(veryLargeId);

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { reportId: veryLargeId },
        }),
      );
    });
  });

  describe("Singleton pattern consistency", () => {
    it("should maintain singleton instance across createComment calls", async () => {
      const instance1 = CommentRepository.getInstance();
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: mockUser,
      });

      await instance1.createComment(createData);

      const instance2 = CommentRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should maintain singleton instance across getCommentsByReport calls", async () => {
      const instance1 = CommentRepository.getInstance();

      mockPrisma.comment.findMany.mockResolvedValue([]);

      await instance1.getCommentsByReport(BigInt(1));

      const instance2 = CommentRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should maintain singleton instance across mixed method calls", async () => {
      const instance1 = CommentRepository.getInstance();
      const createData = {
        content: "Test",
        authorId: "user-123",
        reportId: BigInt(1),
      };

      mockPrisma.comment.create.mockResolvedValue(mockCommentData);
      mockPrisma.comment.findUnique.mockResolvedValue({
        ...mockCommentData,
        author: mockUser,
      });
      mockPrisma.comment.findMany.mockResolvedValue([]);

      await instance1.createComment(createData);
      await instance1.getCommentsByReport(BigInt(1));

      const instance2 = CommentRepository.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
