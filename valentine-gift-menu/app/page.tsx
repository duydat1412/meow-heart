import { FloatingHearts } from "@/components/floating-hearts"
import { StartMenu } from "@/components/start-menu"

export default function Page() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background">
      {/* Radial glow behind content */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(215 80% 55% / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Floating hearts background */}
      <FloatingHearts />

      {/* Main content */}
      <StartMenu />
    </main>
  )
}
