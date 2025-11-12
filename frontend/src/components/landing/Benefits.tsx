import { Check } from "lucide-react"

const benefits = [
  {
    title: "Study faster",
    description: "Leverage AI to accelerate your learning",
    points: [
      "AI-powered automatic summaries in seconds",
      "Generate personalized quizzes from your notes",
      "Upload and process PDF, DOCX, Excel, and PowerPoint files",
      "Markdown editor for organized note-taking",
    ],
    imagePosition: "left" as const,
  },
  {
    title: "Automatic organization",
    description: "Keep everything in order effortlessly",
    points: [
      "Organize notes in unlimited notebooks",
      "Track your study streaks and progress",
      "User profile with statistics and achievements",
      "Easy search and filter across all your content",
    ],
    imagePosition: "right" as const,
  },
  {
    title: "Collaborate with friends",
    description: "Study together, learn faster",
    points: [
      "Share notes with your friends easily",
      "Add friends and manage connections",
      "Copy shared notes to your notebooks",
      "Permission and privacy control",
    ],
    imagePosition: "left" as const,
  },
]

export function Benefits() {
  return (
    <section id="benefits" className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-24">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                benefit.imagePosition === "right" ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div className={`space-y-6 ${benefit.imagePosition === "right" ? "lg:col-start-2" : ""}`}>
                <div className="space-y-3">
                  <h3 className="text-3xl md:text-4xl font-bold text-balance">{benefit.title}</h3>
                  <p className="text-lg text-muted-foreground text-pretty">{benefit.description}</p>
                </div>
                <ul className="space-y-3">
                  {benefit.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${benefit.imagePosition === "right" ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                <div className="aspect-video rounded-lg border border-border bg-card shadow-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="text-center text-muted-foreground p-8">
                      <p className="text-sm">{benefit.title}</p>
                      <p className="text-xs mt-2">Imagen ilustrativa</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
