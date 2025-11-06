import { z } from "zod";

const DepartmentSchema = z.object({
  id: z.bigint(),
  name: z.string().min(1, "Department name is required"),
});

export const CreateDepartmentInputSchema = z.object({
  name: z.string().min(1, "Department name is required"),
});

export type Department = z.infer<typeof DepartmentSchema>;

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentInputSchema>;

export type RetrieveDepartmentsResponse =
  | { success: true; data: Department[] }
  | { success: false; error: string };

export type RetrieveDepartmentResponse =
  | { success: true; data: Department }
  | { success: false; error: string };

export type CreateDepartmentResponse =
  | { success: true; data: Department }
  | { success: false; error: string };
