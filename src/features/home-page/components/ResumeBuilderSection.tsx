"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, CheckCircle2, Sparkles, Wand2, Languages, Layout } from "lucide-react";

export function ResumeBuilderSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Layout,
      title: "Real-time Preview",
      description: "See your changes instantly as you type. No more guessing how your CV will look.",
    },
    {
      icon: Wand2,
      title: "AI Enhancement",
      description: "One-click polish for your bullet points to make them sound professional and impactful.",
    },
    {
      icon: Languages,
      title: "Multi-language",
      description: "Seamlessly switch between English and Arabic layouts with perfect RTL support.",
    },
  ];

  return (
    <section className="py-24 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Content */}
          <div 
            ref={ref}
            className="w-full lg:w-1/2 space-y-8"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateX(-50px)",
              transition: "all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) 0.1s"
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Builder</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Build Your CV <br />
              <span className="text-primary">Like a Pro</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the most intuitive resume builder designed for modern professionals. 
              Drag, drop, and customize every aspect of your CV without fighting with formatting.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Link href="/app/resume-builder">
                  Try the Builder Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Video Placeholder */}
          <div 
            className="w-full lg:w-1/2"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "none" : "translateX(50px)",
              transition: "all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s"
            }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur-sm group">
              {/* Browser Header Decoration */}
              <div className="h-10 border-b bg-muted/40 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="mx-auto w-1/2 h-5 rounded bg-muted/50 text-[10px] flex items-center justify-center text-muted-foreground font-mono">
                  civify.cv/resume-builder
                </div>
              </div>

              {/* YouTube Iframe Container */}
              <div className="aspect-video w-full bg-black/5 relative group-hover:bg-black/10 transition-colors">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&controls=0&loop=1" 
                  title="Civify Resume Builder Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                
                {/* Overlay gradient to blend with design */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-b-2xl pointer-events-none" />
              </div>
            </div>

            {/* Floating generic tags decoration */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
