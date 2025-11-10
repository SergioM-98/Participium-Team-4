// --- 1. Types ---

// Submitter info
export type Submitter = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

// Report categories
export const CATEGORIES = {
  WATER: "Water Supply - Drinking Water",
  BARRIERS: "Architectural Barriers",
  SEWER: "Sewer System",
  LIGHTING: "Public Lighting",
  WASTE: "Waste",
  SIGNS: "Road Signs and Traffic Lights",
  ROADS: "Roads and Urban Furnishings",
  GREEN: "Public Green Areas and Playgrounds",
  OTHER: "Other",
} as const;
export type ReportCategory = (typeof CATEGORIES)[keyof typeof CATEGORIES];

// Report statuses
export const STATUS = {
  PENDING: "Pending Approval",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
  RESOLVED: "Resolved",
} as const;
export type ReportStatus = (typeof STATUS)[keyof typeof STATUS];

// The full Report structure
export type Report = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  photos: string[];
  latitude: number;
  longitude: number;
  isAnonymous: boolean;
  submitter: Submitter;
  status: ReportStatus;
  dateSubmitted: string;
  rejectionReason?: string;
};

// --- 2. Dummy Data ---

const data: Report[] = [
  {
    id: "RPT-001",
    title: "Large pothole on main road",
    description: "A very deep and dangerous pothole at the intersection...",
    category: CATEGORIES.ROADS,
    photos: ["https://via.placeholder.com/600/92c952"],
    latitude: 45.0703,
    longitude: 7.6869,
    isAnonymous: false,
    submitter: {
      firstName: "Ken",
      lastName: "Adams",
      email: "ken99@example.com",
      username: "ken99",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-27",
  },
  {
    id: "RPT-002",
    title: "Streetlight out",
    description:
      "The streetlight in front of my house has been out for 3 days.",
    category: CATEGORIES.LIGHTING,
    photos: [
      "https://via.placeholder.com/600/771796",
      "https://via.placeholder.com/600/24f355",
    ],
    latitude: 45.0711,
    longitude: 7.6852,
    isAnonymous: false,
    submitter: {
      firstName: "Abe",
      lastName: "Lincoln",
      email: "Abe45@example.com",
      username: "abe45",
    },
    status: STATUS.ASSIGNED,
    dateSubmitted: "2023-10-25",
  },
  {
    id: "RPT-003",
    title: "Trash overflow at Parco Valentino",
    description: "The bins at the park are overflowing.",
    category: CATEGORIES.WASTE,
    photos: [
      "https://via.placeholder.com/600/f66b97",
      "https://via.placeholder.com/600/56a8c2",
      "https://via.placeholder.com/600/b0f7cc",
    ],
    latitude: 45.0688,
    longitude: 7.6888,
    isAnonymous: true,
    submitter: {
      firstName: "Monserrat",
      lastName: "Lopez",
      email: "Monserrat44@example.com",
      username: "monserrat44",
    },
    status: STATUS.IN_PROGRESS,
    dateSubmitted: "2023-10-28",
  },
  {
    id: "RPT-004",
    title: "Duplicate report",
    description: "This was reported by someone else already.",
    category: CATEGORIES.OTHER,
    photos: ["https://via.placeholder.com/600/51aa97"],
    latitude: 45.0699,
    longitude: 7.6833,
    isAnonymous: false,
    submitter: {
      firstName: "Silas",
      lastName: "Ortega",
      email: "Silas22@example.com",
      username: "silas22",
    },
    status: STATUS.REJECTED,
    dateSubmitted: "2023-10-24",
    rejectionReason: "This issue has already been reported (see RPT-001).",
  },
  {
    id: "RPT-005",
    title: "Broken swing at playground",
    description: "The swing chain is broken and unsafe for children.",
    category: CATEGORIES.GREEN,
    photos: ["https://via.placeholder.com/600/d32776"],
    latitude: 45.0722,
    longitude: 7.6811,
    isAnonymous: false,
    submitter: {
      firstName: "Carmella",
      lastName: "Smith",
      email: "carmella@example.com",
      username: "carmella",
    },
    status: STATUS.RESOLVED,
    dateSubmitted: "2023-10-22",
  },
  // ... (the rest of your dummy data) ...
  {
    id: "RPT-015",
    title: "Broken pavement",
    description: "The sidewalk is broken and uneven, a tripping hazard.",
    category: CATEGORIES.ROADS,
    photos: ["https://via.placeholder.com/600/d51a05"],
    latitude: 45.065,
    longitude: 7.6882,
    isAnonymous: false,
    submitter: {
      firstName: "Ken",
      lastName: "Adams",
      email: "ken99@example.com",
      username: "ken99",
    },
    status: STATUS.PENDING,
    dateSubmitted: "2023-10-29",
  },
];

// --- 3. Data-fetching Functions ---
// We simulate async fetching, as you would in a real app.

export const getReports = async (): Promise<Report[]> => {
  // In a real app: await fetch('/api/reports')
  return Promise.resolve(data);
};

export const getReportById = async (
  id: string
): Promise<Report | undefined> => {
  // In a real app: await fetch(`/api/reports/${id}`)
  return Promise.resolve(data.find((report) => report.id === id));
};
