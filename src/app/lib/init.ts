import createAdmin from "@/prisma/admin";

export async function init() {
  await createAdmin();
}
