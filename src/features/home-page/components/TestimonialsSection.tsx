"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { testimonials } from "../data";

export function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-background to-purple-50/30 py-20 dark:to-gray-900 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of professionals who landed their dream jobs with Civify
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="mx-auto max-w-6xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
                    <CardContent className="flex h-full flex-col p-6">
                      {/* Rating */}
                      <div className="mb-4 flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="mb-6 flex-1 text-muted-foreground">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Success Metric */}
                      {testimonial.successMetric && (
                        <Badge className="mb-4 w-fit bg-green-600 hover:bg-green-700">
                          ✓ {testimonial.successMetric}
                        </Badge>
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role} at {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">50,000+</p>
            <p className="text-sm text-muted-foreground">Happy Users</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">4.9/5</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">2,000+</p>
            <p className="text-sm text-muted-foreground">5-Star Reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
