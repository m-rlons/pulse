import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/components/onboarding-flow";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <OnboardingFlow />;
} 