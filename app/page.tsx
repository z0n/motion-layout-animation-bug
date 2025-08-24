import { HeroTitle } from "@/components/hero";

export default function Home() {
  return (
    <div className="font-sans flex h-screen p-8 items-center justify-center">
      <main>
        <HeroTitle text="Motion Layout Animation Bug" wordToHighlight="Animation" />
      </main>
    </div>
  );
}
