"use server";
import RegisterForm from "@/components/RegisterForm";
import { register } from "../lib/controllers/user.controller";

export default async function RegisterPage() {
  return <RegisterForm register={register} />;
}