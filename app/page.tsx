import ProductStoryLoader from "../components/story/ProductStoryLoader";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-background text-foreground">
      <div className="aurora" aria-hidden />
      <ProductStoryLoader />
      <div className="vignette" aria-hidden />
      <div className="cinematic-grain" aria-hidden />
    </main>
  );
}
