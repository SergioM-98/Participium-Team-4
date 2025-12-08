// Setup file for component tests only - no database connection needed
import path from "path";

// Set environment variables for component tests
process.env.UPLOADS_DIR = path.join(process.cwd(), "test_uploads");
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret";

// Mock any database-related modules if needed
// Component tests should not connect to the database
