import createAdmin from "@/db/admin";

export async function init() {
  await createAdmin();
}
