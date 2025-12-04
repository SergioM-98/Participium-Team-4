import createExternalMaintainerWithAccess from "@/prisma/external-maintainer-with-access";
import createAdmin from "@/prisma/admin";
import createAnonymous from "@/prisma/anonymous";
import createExternalMaintainerWithoutAccess from "@/prisma/external-maintainer-without-access";
import createCitizen from "@/prisma/citizen";
import createTechnicalOfficer from "@/prisma/technical-officer";
import createPublicRelationsOfficer from "@/prisma/public-relations-officer";

let isInitialized = false;

export async function init() {
  if (process.env.SKIP_DB_INIT === "true") {
    console.log("SKIP_DB_INIT=true, skipping initialization...");
    return;
  }

  if (isInitialized) {
    console.log("App already initialized, skipping...");
    return;
  }

  try {
    console.log("Initializing application...");
    isInitialized = true;

    await createAdmin();
    await createAnonymous();
    await createExternalMaintainerWithAccess();
    await createExternalMaintainerWithoutAccess();
    await createCitizen();
    await createTechnicalOfficer();
    await createPublicRelationsOfficer();

    console.log("Application initialization completed!");
  } catch (error) {
    isInitialized = false;
    console.error("Failed to initialize application:", error);
    throw error;
  }
}
