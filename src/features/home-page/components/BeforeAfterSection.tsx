"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BeforeAfterSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            ✨ See the Transformation
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            From Generic to Game-Changing
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch how our AI transforms ordinary bullet points into powerful achievements
          </p>
        </div>

        {/* Comparison */}
        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12">
          {/* Before */}
          <Card className="border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                  ⚪ Before
                </Badge>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Match Score: 45%
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-900/50">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    <span>Responsible for managing team projects and meetings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    <span>Worked on improving customer satisfaction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                    <span>Helped with various marketing tasks</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Issues detected:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• No quantifiable metrics</li>
                  <li>• Vague responsibilities</li>
                  <li>• Missing keywords</li>
                  <li>• Weak action verbs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50">
              <ArrowRight className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* After */}
          <Card className="border-2 border-purple-200 dark:border-purple-900">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center justify-between">
                <Badge className="bg-purple-600 text-sm hover:bg-purple-700">
                  ✨ After
                </Badge>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Match Score: 92%
                </span>
              </div>

              <div className="rounded-lg bg-purple-50 p-6 dark:bg-purple-950/20">
                <ul className="space-y-3 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                    <span>
                      <strong>Led</strong> cross-functional team of 8 members to deliver{" "}
                      <strong>15+ projects</strong> on time, increasing client satisfaction by{" "}
                      <strong>35%</strong> through improved stakeholder communication
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                    <span>
                      <strong>Implemented</strong> customer feedback system that boosted NPS score
                      from 42 to <strong>78</strong>, resulting in <strong>25% increase</strong> in
                      customer retention
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                    <span>
                      <strong>Executed</strong> multi-channel marketing campaigns generating{" "}
                      <strong>$500K</strong> in revenue and <strong>10,000+</strong> qualified leads
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  Improvements made:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Quantified achievements with metrics</li>
                  <li>✓ Strong action verbs (Led, Implemented)</li>
                  <li>✓ Industry-specific keywords</li>
                  <li>✓ Clear business impact</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
