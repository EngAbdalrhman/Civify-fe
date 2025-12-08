"use client";

import { Upload, FileText, Sparkles, Download } from "lucide-react";
import { howItWorksSteps } from "../data";

const iconMap = {
  Upload,
  FileText,
  Sparkles,
  Download,
};

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How Civify Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From upload to download in just 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative mx-auto max-w-6xl">
          {/* Connection line */}
          <div className="absolute left-8 top-12 hidden h-[calc(100%-6rem)] w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 md:block md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-12 md:space-y-20">
            {howItWorksSteps.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.step}
                  className={`relative flex flex-col items-start gap-6 md:flex-row md:items-center ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <div
                      className={`inline-block rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:from-gray-800 dark:to-purple-900/20 ${
                        isEven ? "md:ml-auto" : "md:mr-auto"
                      }`}
                    >
                      <div className="mb-2 text-sm font-semibold text-primary">
                        Step {step.step}
                      </div>
                      <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  {/* Icon Circle */}
                  <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/50 md:h-20 md:w-20">
                    <Icon className="h-8 w-8 text-white md:h-10 md:w-10" />
                  </div>

                  {/* Spacer for alignment */}
                  <div className="hidden flex-1 md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
