"use client";

import {
  Search,
  Target,
  LayoutTemplate,
  Wand2,
  TrendingUp,
  Download,
  Gauge,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "../data";

const iconMap = {
  Search,
  Target,
  LayoutTemplate,
  Wand2,
  TrendingUp,
  Download,
  Gauge,
  Globe,
};

export function FeaturesSection() {
  return (
    <section className="bg-gradient-to-b from-background to-blue-50/30 py-20 dark:to-gray-900 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to create a job-winning CV
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground">{feature.description}</p>

                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
