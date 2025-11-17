import RegisterForm from "@/components/RegisterForm";
import { UserController } from "../lib/controllers/user.controller";

export default function RegisterPage() {
  return <RegisterForm register={new UserController().register} />;
}