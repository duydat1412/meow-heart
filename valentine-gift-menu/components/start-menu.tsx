"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

export function StartMenu() {
  const [clicked, setClicked] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  const handleClick = () => {
    setClicked(true)
    setShowPulse(true)
    setTimeout(() => setShowPulse(false), 1000)
  }

  return (
    <div className="relative flex flex-col items-center gap-10">
      {/* Decorative heart icon */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
        <Heart
          className="relative h-12 w-12 text-accent animate-pulse"
          fill="currentColor"
          strokeWidth={0}
        />
      </div>

      {/* Main title */}
      <h1
        className="text-center text-4xl font-light tracking-wide text-foreground sm:text-5xl md:text-6xl leading-relaxed"
        style={{ fontFamily: "var(--font-fira-sans), sans-serif" }}
      >
        <span className="text-balance">{'Tặng ebe ntnq'}</span>
      </h1>

      {/* Subtle decorative line */}
      <div className="flex items-center gap-3">
        <div className="h-px w-12 bg-border" />
        <Heart className="h-3 w-3 text-accent/60" fill="currentColor" strokeWidth={0} />
        <div className="h-px w-12 bg-border" />
      </div>

      {/* Button */}
      <div className="relative">
        {showPulse && (
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
        )}
        <button
          type="button"
          onClick={handleClick}
          className={`
            relative z-10 rounded-full border border-primary/30 bg-primary/10 
            px-12 py-3 text-lg font-medium text-primary-foreground
            backdrop-blur-sm transition-all duration-500 
            hover:bg-primary/20 hover:border-primary/50 hover:scale-105
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
            active:scale-95
            ${clicked ? "bg-primary/25 border-accent/50" : ""}
          `}
          style={{ fontFamily: "var(--font-fira-sans), sans-serif" }}
        >
          {'dạ'}
        </button>
      </div>

      {/* Thank you message after click */}
      <div
        className={`transition-all duration-700 ${
          clicked ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {clicked && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Heart className="h-3.5 w-3.5 text-accent" fill="currentColor" strokeWidth={0} />
            <span style={{ fontFamily: "var(--font-fira-sans), sans-serif" }}>
              {'Happy Valentine\'s Day'}
            </span>
            <Heart className="h-3.5 w-3.5 text-accent" fill="currentColor" strokeWidth={0} />
          </div>
        )}
      </div>
    </div>
  )
}
