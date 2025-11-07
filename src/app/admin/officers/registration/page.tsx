import OfficerRegistration from "./registration";
import { auth } from "@/app/auth";

import { redirect } from "next/navigation";

import {  revalidatePath } from "next/cache";

async function submitNewOfficer(formData: FormData) {
  "use server";
  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  const office = formData.get("office")?.toString();
  if (!firstName || !lastName || !password || !role) {
    throw new Error("All fields are required");
  }

  const result = await register({ firstName, lastName, email:null,  password, role, office });

  if(!result.success){
    throw new Error(result.message);
  }else{
    revalidatePath("/admin/officers/registration");
    return { success: true };
  }
}


export default async function AdminUsersPage() {

  const session = await auth;

  if (!session) {
    return(
      <div>
        <OfficerRegistration submitNewOfficer={submitNewOfficer} />
        {/*<p>You must be the administrator to view this page.</p>*/}
      </div>
    );
  }

  return (
    <OfficerRegistration submitNewOfficer={submitNewOfficer} />
);
}
