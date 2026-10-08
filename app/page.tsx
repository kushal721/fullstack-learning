export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">
        Full-Stack Learning
      </h1>
      <p className="text-lg leading-8 text-foreground/80">
        Learn how a real web application works by building one — from an empty
        project to a deployed app.
      </p>
      <blockquote className="border-l-4 border-foreground/20 pl-4 text-lg italic">
        Don&apos;t just learn what to write. Understand what happens when you
        write it.
      </blockquote>
    </main>
  );
}
