import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import dashboardImg from "@/assets/illustrations/dashboard.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Your notes, organized and intelligent
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                NoteQuest transforms the way you take notes with integrated artificial intelligence. Organize, summarize and
                generate quizzes automatically to study more efficiently.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg">Get Started Free</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-lg border border-border bg-card shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-white p-6 flex items-center justify-center">
                <img
                  src={dashboardImg}
                  alt="Dashboard preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
