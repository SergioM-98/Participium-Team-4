import OfficerRegistration from "./registration";
import { auth } from "@/app/auth";

import {  revalidatePath } from "next/cache";
import { register } from "@/app/lib/actions/user";

async function submitNewOfficer(formData: FormData) {
  "use server";
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  if (!firstName || !lastName || !password || !role) {
    throw new Error("All fields are required");
  }

  const result = await register(formData);

  if(!result.success){
    const errorMessage = result.error ?? "Unknown error";
    throw new Error(errorMessage);
  }else{
    return { success: true };
  }
}


export default async function AdminUsersPage() {

  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return(
      <div>
        return <p>You must be the administrator to view this page.</p>;
      </div>
    );
  }

  return (
    <OfficerRegistration submitNewOfficer={submitNewOfficer} />
);
}
