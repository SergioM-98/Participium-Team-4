import OfficerRegistration from "./registration";

import { register } from "@/app/lib/actions/user";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";


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

  const session = await getServerSession(authOptions);

  if (!session) {
    return(
      <div>
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }else if(session.user.role !== "ADMIN"){
    return(
      <div>
        <p>You must be the administrator to view this page.</p>
      </div>
    );
  }

  return (
    <OfficerRegistration submitNewOfficer={submitNewOfficer} />
);
}
