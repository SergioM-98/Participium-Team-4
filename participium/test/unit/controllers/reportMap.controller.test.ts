import {
  getReportsForMap,
  getReportById,
  getApprovedReportsForPublic,
} from "../../../src/app/lib/controllers/reportMap.controller";
import { ReportMapService } from "../../../src/app/lib/services/reportMap.service";
import { getServerSession } from "next-auth/next";

// --- Mocks for NextAuth ---
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/auth", () => ({
  authOptions: {},
}));

// --- Mocks for File System (needed for getReportById image processing) ---
jest.mock("node:fs/promises", () => ({
  readFile: jest.fn().mockResolvedValue(Buffer.from("fake-image-content")),
}));

jest.mock("node:path", () => ({
  ...jest.requireActual("node:path"),
  basename: (p: string) => p.split("/").pop() || p,
}));

// --- Mock for ReportMapService ---
const mockReportMapService = {
  getReportsForMap: jest.fn(),
  getReportById: jest.fn(),
  getPublicApprovedReports: jest.fn(), // Fixed: Added this missing method
};

jest.mock("@/app/lib/services/reportMap.service", () => {
  return {
    ReportMapService: {
      getInstance: jest.fn(),
    },
  };
});

describe("ReportMapController Story 7", () => {
  const mockReportArray = [
    {
      id: "1",
      title: "Sample Title",
      longitude: 7.693,
      latitude: 45.0682,
      category: "ARCHITECTURAL_BARRIERS",
      username: "SampleUser",
    },
    {
      id: "2",
      title: "Sample Title 2",
      longitude: 7.693,
      latitude: 45.0682,
      category: "WATER_SUPPLY",
      username: "SampleUser",
    },
  ];

  const mockSingleReport = {
    id: "1",
    title: "Sample Title",
    description: "Sample Description",
    longitude: 7.693,
    latitude: 45.0682,
    createdAt: new Date(),
    category: "ARCHITECTURAL_BARRIERS",
    status: "APPROVED",
    username: "SampleUser",
    photos: ["", ""],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ReportMapService.getInstance as jest.Mock).mockReturnValue(
      mockReportMapService
    );
  });

  describe("reportMapController unit tests", () => {
    it("should retrieve all approved reports to the user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "1", role: ["CITIZEN"] },
      });

      mockReportMapService.getReportsForMap.mockResolvedValue({
        success: true,
        data: mockReportArray.map((r) => ({
          id: r.id,
          title: r.title,
          longitude: r.longitude,
          latitude: r.latitude,
          category: r.category,
          citizen: { username: r.username },
        })),
      });

      const response = await getReportsForMap();

      expect(response.success).toBe(true);
      expect(mockReportMapService.getReportsForMap).toHaveBeenCalled();
      expect(ReportMapService.getInstance).toHaveBeenCalled();
      if (response.success) {
        expect(response.data).toEqual(
          mockReportArray.map((r) => ({
            id: r.id.toString(),
            anonymous: false,
            citizenId: undefined,
            citizenUsername: r.username,
            description: "",
            photos: [],
            status: undefined,
            title: r.title,
            longitude: r.longitude,
            latitude: r.latitude,
            category: r.category,
          }))
        );
      }
    });

    it("should retrieve no approved reports to the user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "1", role: ["CITIZEN"] },
      });

      mockReportMapService.getReportsForMap.mockResolvedValue(null);

      const response = await getReportsForMap();

      expect(response.success).toBe(false);
      expect(mockReportMapService.getReportsForMap).toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("No reports found");
      }
    });

    it("should retrieve one approved report - without photos - to the user", async () => {
      mockReportMapService.getReportById.mockResolvedValue({
        success: true,
        data: {
          ...mockSingleReport,
          citizen: { username: mockSingleReport.username },
          photos: [], // Explicitly set photos to empty to avoid processing loop in test if needed
        },
      });

      const response = await getReportById({ id: "1" });

      expect(response.success).toBe(true);
      expect(mockReportMapService.getReportById).toHaveBeenCalled();
      if (response.success) {
        expect(response.data).toEqual({
          id: "1",
          title: "Sample Title",
          description: "Sample Description",
          longitude: 7.693,
          latitude: 45.0682,
          createdAt: mockSingleReport.createdAt.toISOString(),
          category: "ARCHITECTURAL_BARRIERS",
          anonymous: false,
          status: "APPROVED",
          citizenId: undefined,
          photos: [],
          username: "SampleUser",
        });
      }
    });

    it("should return error if report not found", async () => {
      mockReportMapService.getReportById.mockResolvedValue(null);
      const response = await getReportById({ id: "999" });
      expect(mockReportMapService.getReportById).toHaveBeenCalled();
      expect(response.success).toBe(false);
      expect(response.error).toBe("Report not found");
    });

    it("should retrieve approved reports for public (no session required)", async () => {
      mockReportMapService.getPublicApprovedReports.mockResolvedValue({
        success: true,
        data: mockReportArray.map((r) => ({
          ...r,
          citizen: { username: r.username },
          citizenId: "citizen1",
        })),
      });

      const response = await getApprovedReportsForPublic();

      expect(response.success).toBe(true);
      expect(mockReportMapService.getPublicApprovedReports).toHaveBeenCalled();

      if (response.success && response.data) {
        expect(response.data).toHaveLength(mockReportArray.length);
        expect(response.data[0]).toHaveProperty("username", "SampleUser");
      }
    });

    it("should return error for public reports if service returns no data", async () => {
      mockReportMapService.getPublicApprovedReports.mockResolvedValue({
        success: false,
      });

      const response = await getApprovedReportsForPublic();

      expect(response.success).toBe(false);
      expect(response.error).toBe("No reports found");
    });

    it("should hide username for anonymous reports when viewer is NOT the author", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "viewer123", role: ["CITIZEN"] },
      });

      const anonymousReport = {
        id: "1",
        title: "Anon Report",
        anonymous: true,
        citizenId: "author456", // Different from viewer
        citizen: { username: "SecretUser" },
        longitude: 0,
        latitude: 0,
        category: "OTHER",
      };

      mockReportMapService.getReportsForMap.mockResolvedValue({
        success: true,
        data: [anonymousReport],
      });

      const response = await getReportsForMap();

      expect(response.success).toBe(true);
      if (response.success) {
        // Expect username to be scrubbed/undefined
        expect(response.data[0].citizenUsername).toBeUndefined();
        expect(response.data[0].citizenId).toBeNull();
        expect(response.data[0].anonymous).toBe(true);
      }
    });

    it("should SHOW username for anonymous reports when viewer IS the author", async () => {
      const myId = "me123";
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: myId, role: ["CITIZEN"] },
      });

      const myAnonReport = {
        id: "1",
        title: "My Anon Report",
        anonymous: true,
        citizenId: myId, // Viewer IS Author
        citizen: { username: "MyName" },
        longitude: 0,
        latitude: 0,
        category: "OTHER",
      };

      mockReportMapService.getReportsForMap.mockResolvedValue({
        success: true,
        data: [myAnonReport],
      });

      const response = await getReportsForMap();

      expect(response.success).toBe(true);
      if (response.success) {
        // Logic: if I am the author, anonymous flag is flipped to false for me, and I see my name
        expect(response.data[0].citizenUsername).toBe("MyName");
        expect(response.data[0].anonymous).toBe(false);
      }
    });

    it("should scrub user details in getReportById if anonymous and viewer is not author", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "viewer" },
      });

      mockReportMapService.getReportById.mockResolvedValue({
        success: true,
        data: {
          ...mockSingleReport,
          anonymous: true,
          citizenId: "author", // Different ID
          citizen: { username: "Hidden" },
          photos: [],
        },
      });

      const response = await getReportById({ id: "1" });

      expect(response.success).toBe(true);
      if (response.success && response.data) {
        expect(response.data.username).toBeNull();
        expect(response.data.citizenId).toBeNull();
        expect(response.data.anonymous).toBe(true);
      }
    });
  });
});
