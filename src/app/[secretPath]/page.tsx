import { redirect } from "next/navigation";
import { adminPath } from "@/lib/constants";

export default function SecretRootRedirectPage() {
  redirect(adminPath("dashboard"));
}
