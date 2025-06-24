import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/components/onboarding-flow";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <OnboardingFlow />;
} 