import { z } from "zod";

export type VerificationResponse = 
    | { success: true, data: string }
    | { success: false; error: string };
