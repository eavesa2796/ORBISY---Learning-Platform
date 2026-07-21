import { redirect } from "next/navigation";
import { validateSession } from "@/lib/session";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateSession();

  if (!session) {
    redirect("/login?callbackUrl=/portal");
  }

  if (session.userRole !== "CUSTOMER") {
    redirect("/console");
  }

  return <>{children}</>;
}
