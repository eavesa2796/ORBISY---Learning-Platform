import LearningHub from "@/components/LearningHub";
import SiteNav from "@/components/SiteNav";

export default function LearningPage() {
  return (
    <main className="shell shell-wide">
      <SiteNav title="ORBISY Learning Platform" />
      <LearningHub />
    </main>
  );
}
