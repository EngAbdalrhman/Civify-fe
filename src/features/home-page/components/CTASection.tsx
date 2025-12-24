"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center text-white">
          {/* Icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-8 w-8" />
          </div>

          {/* Headline */}
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Stop Sending CVs Into the Void
          </h2>

          {/* Subtext */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
            Join our Beta and be among the first to experience AI-powered CV optimization.
            <br />
            <span className="font-semibold">Full Arabic support. 92% match rate. Free to start.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 bg-white px-8 text-base font-semibold text-purple-600 hover:bg-white/90"
            >
              <Link href="/app/upload">
                Create Your CV Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/80">
            {/* <div className="flex items-center gap-2">
              <svg className="h-5 w-5 fill-white" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">4.9/5 rating</span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div>
              <span className="font-semibold">50,000+ users</span>
            </div>
            <div className="h-4 w-px bg-white/30" /> */}
            <div>
              <span className="font-semibold">Free to start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
