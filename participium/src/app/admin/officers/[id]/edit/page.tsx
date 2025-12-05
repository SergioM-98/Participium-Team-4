import { notFound } from "next/navigation";
import { UserService } from "@/services/user.service";
// [RENAME] Import the renamed component
import EditOfficerClient from "./EditOfficerClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  const user = await UserService.getInstance().getMe(id);

  if (!user) {
    return notFound();
  }

  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    role: user.role,
    office: user.office || null,
    companyId: user.companyId || null,
    email: user.email || null,
  };

  return (
    <div>
      <EditOfficerClient user={userData} />
    </div>
  );
}
