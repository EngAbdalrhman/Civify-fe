"use client";

import { useState } from "react";
import {
  Code,
  BarChart,
  Lightbulb,
  Calculator,
  Headphones,
  TrendingUp,
  Megaphone,
  ClipboardList,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { roleCategories } from "../data";

const iconMap = {
  Code,
  BarChart,
  Lightbulb,
  Calculator,
  Headphones,
  TrendingUp,
  Megaphone,
  ClipboardList,
};

export function RolePersonalizationSection() {
  const [selectedRole, setSelectedRole] = useState(roleCategories[0].id);

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tailored for Your Role
          </h2>
          <p className="text-lg text-muted-foreground">
            Industry-specific optimization for every profession
          </p>
        </div>

        {/* Role Tabs */}
        <Tabs value={selectedRole} onValueChange={setSelectedRole} className="mx-auto max-w-6xl">
          <TabsList className="mb-8 grid w-full grid-cols-2 gap-2 bg-transparent md:grid-cols-4 lg:grid-cols-8">
            {roleCategories.map((role) => {
              const Icon = iconMap[role.icon as keyof typeof iconMap];
              return (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-transparent p-4 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{role.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {roleCategories.map((role) => (
            <TabsContent key={role.id} value={role.id} className="mt-0">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="grid gap-8 md:grid-cols-3">
                    {/* Keywords */}
                    <div>
                      <h3 className="mb-4 text-lg font-bold">Optimized Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {role.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Industry Language */}
                    <div>
                      <h3 className="mb-4 text-lg font-bold">Industry Language</h3>
                      <ul className="space-y-2">
                        {role.industryLanguage.map((term, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Examples */}
                    <div>
                      <h3 className="mb-4 text-lg font-bold">Tailored Examples</h3>
                      <ul className="space-y-3">
                        {role.examples.map((example, index) => (
                          <li key={index} className="rounded-lg bg-muted p-3 text-sm">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 text-center">
                    <Button asChild size="lg">
                      <Link href="/signup">
                        Create {role.name} CV
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
