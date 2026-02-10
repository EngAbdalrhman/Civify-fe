"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Languages,
  Layout,
  Play,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function ResumeBuilderSection() {
  const t = useTranslations("landing.resumeBuilder");
  const ref = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isVideoInView = useInView(videoRef, { once: true, margin: "100px" });
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // Load video when it comes into view
  if (isVideoInView && !shouldLoadVideo) {
    setShouldLoadVideo(true);
  }

  const features = [
    {
      icon: Layout,
      title: t("features.preview.title"),
      description: t("features.preview.description"),
    },
    {
      icon: Wand2,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
    },
    {
      icon: Languages,
      title: t("features.multiLang.title"),
      description: t("features.multiLang.description"),
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
              transition: "all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) 0.1s",
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>{t("badge")}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {t("title")} <br />
              <span className="text-primary">{t("titleAccent")}</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("description")}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                <Link href="/app/resume-builder">
                  {t("cta")}
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
              transition: "all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s",
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
              <div
                ref={videoRef}
                className="aspect-video w-full bg-black/5 relative group-hover:bg-black/10 transition-colors"
              >
                {shouldLoadVideo ? (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/TyZcDykNqQE?autoplay=0&mute=1&controls=0&loop=1"
                    title="Civify Resume Builder Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  /* Thumbnail placeholder with loading spinner */
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {t("loadingVideo") || "Loading video..."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Overlay gradient to blend with design */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-b-2xl pointer-events-none" />
              </div>
            </div>

            {/* Floating generic tags decoration */}
            <div className="absolute -z-10 -bottom-10 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -z-10 -top-10 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
