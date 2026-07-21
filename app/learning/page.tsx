import InteractiveLesson from "@/components/InteractiveLesson";
import SiteNav from "@/components/SiteNav";
import { lessons } from "@/data/lessons";

export default function LearningPage() {
  const featuredLesson = lessons[0];

  return (
    <main className="shell shell-wide">
      <SiteNav title="ORBISY Learning Platform" />
      <InteractiveLesson lesson={featuredLesson} />
    </main>
  );
}
