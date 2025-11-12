import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { Benefits } from "@/components/landing/Benefits"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Benefits />
      </main>
      <Footer />
    </div>
  )
}
