import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Sparkles, BookOpen, Users, FileText, Upload, Zap } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Summaries",
    description: "Automatically generate intelligent summaries of your notes with advanced AI.",
  },
  {
    icon: Zap,
    title: "Quiz Generator",
    description: "Create personalized quizzes based on your notes to study better.",
  },
  {
    icon: Users,
    title: "Share Notes",
    description: "Easily share your notes with classmates and collaborate in real-time.",
  },
  {
    icon: BookOpen,
    title: "Notebook Organization",
    description: "Keep everything organized in customizable and easy-to-navigate notebooks.",
  },
  {
    icon: Upload,
    title: "File Upload",
    description: "Import PDFs, DOCX and other formats to integrate them with your notes.",
  },
  {
    icon: FileText,
    title: "Collaborative Mode",
    description: "Work as a team with simultaneous editing and real-time synchronization.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">
            Powerful features for smart students
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to take, organize and study your notes efficiently.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
