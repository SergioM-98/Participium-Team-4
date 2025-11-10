import createAdmin from "@/prisma/admin";
import createAnonymous from "@/prisma/anonymous";

let isInitialized = false;

export async function init() {

  if (isInitialized) {
    console.log("App already initialized, skipping...");
    return;
  }

  try {
    console.log("Initializing application...");
    isInitialized = true;
    
    await createAdmin();
    await createAnonymous();
    
    console.log("Application initialization completed!");
  } catch (error) {
    isInitialized = false; 
    console.error("Failed to initialize application:", error);
    throw error;
  }
}
