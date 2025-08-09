"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { FormData } from "@/app/page";
import { Briefcase, FileText, Sparkles, CheckCircle } from "lucide-react";

interface Step3JobDetailsProps {
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

export default function Step3JobDetails({
  nextStep,
  prevStep,
  formData,
  updateFormData,
}: Step3JobDetailsProps) {
  const [localJobDescription, setLocalJobDescription] = useState(
    formData.jobDescription
  );
  const [localGenerateCoverLetter, setLocalGenerateCoverLetter] = useState(
    formData.generateCoverLetter
  );
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleJobDescriptionChange = (value: string) => {
    setLocalJobDescription(value);
    updateFormData({ jobDescription: value });
  };

  const handleCoverLetterToggle = (checked: boolean) => {
    setLocalGenerateCoverLetter(checked);
    updateFormData({ generateCoverLetter: checked });
  };

  const handleProceed = async () => {
    if (!localJobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description:
          "Please provide the job description to tailor your CV effectively.",
        variant: "destructive",
      });
      return;
    }

    if (localJobDescription.length < 50) {
      toast({
        title: "Job Description Too Short",
        description:
          "Please provide a more detailed job description for better CV tailoring.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    // Simulate brief validation
    setTimeout(() => {
      toast({
        title: "Ready to Generate!",
        description:
          "All information looks good. Let's create your tailored CV!",
      });
      setIsValidating(false);
      nextStep();
    }, 1000);
  };

  const extractKeywords = (text: string) => {
    const commonSkills = [
      "JavaScript",
      "Python",
      "React",
      "Node.js",
      "AWS",
      "Docker",
      "Kubernetes",
      "Project Management",
      "Leadership",
      "Communication",
      "Problem Solving",
      "Agile",
      "Scrum",
      "SQL",
      "MongoDB",
      "Git",
      "CI/CD",
      "DevOps",
    ];

    return commonSkills
      .filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))
      .slice(0, 8);
  };

  const detectedKeywords = localJobDescription
    ? extractKeywords(localJobDescription)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-8 h-8 text-purple-600" />
            <div>
              <CardTitle className="font-headline text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Job Details
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Provide the job description to create a perfectly tailored CV
                that matches the role.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <Label
                htmlFor="jobDescription"
                className="text-lg font-semibold text-gray-800"
              >
                Job Description *
              </Label>
            </div>

            <Textarea
              id="jobDescription"
              value={localJobDescription}
              onChange={(e) => handleJobDescriptionChange(e.target.value)}
              placeholder="Paste the complete job description here. Include requirements, responsibilities, qualifications, and any specific skills mentioned. The more detailed the description, the better we can tailor your CV to match the role perfectly."
              className="min-h-[300px] border-gray-300 focus:border-purple-500 text-base leading-relaxed"
              rows={12}
            />

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {localJobDescription.length} characters
                {localJobDescription.length < 50 && " (minimum 50 recommended)"}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                AI will analyze this for optimal matching
              </span>
            </div>
          </div>

          {/* Detected Keywords */}
          {detectedKeywords.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Detected Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {detectedKeywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                These skills will be emphasized in your tailored CV to match the
                job requirements.
              </p>
            </div>
          )}

          {/* Cover Letter Option */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Generate Cover Letter
                  </h3>
                  <p className="text-gray-600">
                    Create a personalized cover letter that complements your
                    tailored CV and highlights your fit for this specific role.
                  </p>
                </div>
                <Switch
                  checked={localGenerateCoverLetter}
                  onCheckedChange={handleCoverLetterToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" onClick={prevStep} size="lg">
              Back to Profile
            </Button>

            <Button
              onClick={handleProceed}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-8"
              disabled={!localJobDescription.trim() || isValidating}
            >
              {isValidating ? "Validating..." : "Generate AI-Tailored CV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            Pro Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
              Include the complete job posting with requirements,
              responsibilities, and qualifications
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
              Make sure to include any specific technologies, tools, or
              methodologies mentioned
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
              Company culture and values mentioned in the posting help tailor
              the language
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
              The more specific the job description, the better your CV will be
              tailored
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
