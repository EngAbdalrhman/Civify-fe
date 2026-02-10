"use client";

import { useState, useCallback } from "react";
import {
  GuestPreviewState,
  ExtractedSkills,
  sampleExtractedSkills,
  calculateDemoMatchScore,
} from "../types";

// Simulates skill extraction from job description
const simulateSkillExtraction = (jobDescription: string): ExtractedSkills => {
  // For demo purposes, we return sample data
  // In production, this would call an API
  const jdLower = jobDescription.toLowerCase();

  const allSkills = [
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "MongoDB",
    "GraphQL",
    "REST APIs",
    "Microservices",
    "CI/CD",
    "Git",
    "SQL",
    "NoSQL",
    "Redis",
    "Linux",
    "Agile",
  ];

  // Simple keyword matching for demo
  const required = allSkills
    .filter((skill) => jdLower.includes(skill.toLowerCase()))
    .slice(0, 8);

  const preferred = allSkills
    .filter(
      (skill) =>
        !required.includes(skill) && jdLower.includes(skill.toLowerCase()),
    )
    .slice(0, 4);

  // Simulate matched skills (for demo, we match most required)
  const matched = required.slice(0, Math.ceil(required.length * 0.75));
  const missing = required.filter((skill) => !matched.includes(skill));

  return {
    required: required.length > 0 ? required : sampleExtractedSkills.required,
    preferred:
      preferred.length > 0 ? preferred : sampleExtractedSkills.preferred,
    matched: matched.length > 0 ? matched : sampleExtractedSkills.matched,
    missing: missing.length > 0 ? missing : sampleExtractedSkills.missing,
  };
};

export function useGuestPreview() {
  const [state, setState] = useState<GuestPreviewState>({
    step: "input",
    jobDescription: "",
    extractedSkills: null,
    matchScore: null,
    isLoading: false,
  });

  const setJobDescription = useCallback((jd: string) => {
    setState((prev) => ({ ...prev, jobDescription: jd }));
  }, []);

  const analyzeJobDescription = useCallback(async () => {
    if (!state.jobDescription.trim() || state.jobDescription.length < 50) {
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate API delay for realism
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const skills = simulateSkillExtraction(state.jobDescription);
    const score = calculateDemoMatchScore(skills);

    setState((prev) => ({
      ...prev,
      extractedSkills: skills,
      matchScore: score,
      step: "preview",
      isLoading: false,
    }));

    return true;
  }, [state.jobDescription]);

  const goToSignup = useCallback(() => {
    setState((prev) => ({ ...prev, step: "signup" }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: "input",
      jobDescription: "",
      extractedSkills: null,
      matchScore: null,
      isLoading: false,
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: prev.step === "signup" ? "preview" : "input",
    }));
  }, []);

  return {
    ...state,
    setJobDescription,
    analyzeJobDescription,
    goToSignup,
    goBack,
    reset,
  };
}
