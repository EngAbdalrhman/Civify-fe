"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import type { FormData } from "@/app/page";
import { User, Mail, Phone, FileText, Award, CheckCircle } from "lucide-react";

interface Step2ProfileProps {
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
  updateProfileData: (data: Partial<FormData["profile"]>) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetData: () => void;
}

export default function Step2Profile({
  nextStep,
  prevStep,
  formData,
  updateProfileData,
  updateFormData,
  resetData,
}: Step2ProfileProps) {
  const [localProfile, setLocalProfile] = useState(formData.profile);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const database = useDatabase();

  // Auto-fill from structured CV data
  useEffect(() => {
    if (formData.structuredCvData && !isAutoFilled) {
      const cvData = formData.structuredCvData;
      const autoProfile = {
        name: cvData.personalInfo?.fullName || "",
        email: cvData.personalInfo?.email || "",
        phone: cvData.personalInfo?.phone || "",
        summary: cvData.professionalSummary || "",
        experience:
          cvData.workExperience
            ?.map(
              (exp: any) =>
                `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.description}`
            )
            .join("\n\n") || "",
        education:
          cvData.education
            ?.map(
              (edu: any) =>
                `${edu.degree} from ${edu.institution} (${edu.graduationDate})`
            )
            .join("\n") || "",
        skills:
          [
            ...(cvData.skills?.technical || []),
            ...(cvData.skills?.soft || []),
            ...(cvData.skills?.certifications || []),
          ].join(", ") || "",
      };

      setLocalProfile(autoProfile);
      updateProfileData(autoProfile);
      setIsAutoFilled(true);
    }
  }, [formData.structuredCvData, updateProfileData, toast, isAutoFilled]);

  const handleInputChange = (
    field: keyof FormData["profile"],
    value: string
  ) => {
    const updatedProfile = { ...localProfile, [field]: value };
    setLocalProfile(updatedProfile);
    updateProfileData({ [field]: value });
  };

  const handleProceed = async () => {
    // if (!localProfile.name || !localProfile.email) {
    // toast({
    //   title: "Missing Information",
    //   description: "Please fill in at least your name and email address.",
    //   variant: "destructive",
    // });
    // return;
    // }

    // Update user profile in database if CV data is available
    if (database && user && formData.structuredCvData) {
      try {
        setUpdating(true);

        // Check if CV email matches user email
        const cvEmail = formData.structuredCvData.personalInfo?.email;
        const userEmail = user.email;

        if (
          cvEmail &&
          userEmail &&
          cvEmail.toLowerCase() !== userEmail.toLowerCase()
        ) {
          // toast({
          //   title: "Email Mismatch",
          //   description:
          //     "The email in your CV doesn't match your account email. Please upload your own CV.",
          //   variant: "destructive",
          // });
          // setUpdating(false);
          // return;
        }

        // Update profile from CV data (only fills empty fields)
        await database.updateProfileFromCV(
          formData.structuredCvData,
          userEmail || ""
        );

        // toast({
        //   title: "Profile Updated",
        //   description: "Your profile has been updated with CV information.",
        // });
      } catch (error) {
        console.error("Error updating profile:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update profile";

        // If email mismatch error, don't proceed
        if (errorMessage.includes("email")) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          setUpdating(false);
          return;
        }

        // For other errors, just warn but allow proceeding
        // toast({
        //   title: "Warning",
        //   description: "Could not update profile, but you can continue.",
        //   variant: "default",
        // });
      } finally {
        setUpdating(false);
      }
    }

    nextStep();
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <CardTitle className="font-headline text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Review Your Profile
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {isAutoFilled
              ? "We've extracted your information from the CV. Please review and edit as needed."
              : "Please review and update your profile information."}
          </CardDescription>
          {isAutoFilled && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Auto-filled from your CV</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={localProfile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={localProfile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className={`pl-10 border-gray-300 focus:border-blue-500 ${
                      localProfile.email && !isValidEmail(localProfile.email)
                        ? "border-red-300"
                        : ""
                    }`}
                    required
                  />
                </div>
                {localProfile.email && !isValidEmail(localProfile.email) && (
                  <p className="text-sm text-red-600">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={localProfile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                Professional Summary
              </h3>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="summary"
                className="text-sm font-medium text-gray-700"
              >
                Professional Summary
              </Label>
              <Textarea
                id="summary"
                value={localProfile.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="A brief professional summary highlighting your key strengths and career objectives..."
                className="min-h-[100px] border-gray-300 focus:border-purple-500"
                rows={4}
              />
            </div>
          </div>

          <Separator />

          {/* Experience & Education */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Work Experience
                </h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="experience"
                  className="text-sm font-medium text-gray-700"
                >
                  Work Experience
                </Label>
                <Textarea
                  id="experience"
                  value={localProfile.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  placeholder="List your work experience, including job titles, companies, dates, and key achievements..."
                  className="min-h-[150px] border-gray-300 focus:border-green-500"
                  rows={6}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Education
                </h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="education"
                  className="text-sm font-medium text-gray-700"
                >
                  Education
                </Label>
                <Textarea
                  id="education"
                  value={localProfile.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                  placeholder="List your educational background, including degrees, institutions, and graduation dates..."
                  className="min-h-[150px] border-gray-300 focus:border-orange-500"
                  rows={6}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Skills & Competencies
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="skills"
                className="text-sm font-medium text-gray-700"
              >
                Skills (comma-separated)
              </Label>
              <Textarea
                id="skills"
                value={localProfile.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="JavaScript, React, Node.js, Project Management, Leadership, Communication..."
                className="min-h-[80px] border-gray-300 focus:border-blue-500"
                rows={3}
              />
              {localProfile.skills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {localProfile.skills
                    .split(",")
                    .slice(0, 10)
                    .map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {skill.trim()}
                      </Badge>
                    ))}
                  {localProfile.skills.split(",").length > 10 && (
                    <Badge variant="outline">
                      +{localProfile.skills.split(",").length - 10} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" onClick={prevStep} size="lg">
              Back to Upload
            </Button>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={resetData}
                className="text-gray-600 hover:text-red-600"
              >
                Reset All Data
              </Button>
              <Button
                onClick={handleProceed}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8"
                disabled={
                  updating ||
                  !localProfile.name ||
                  !localProfile.email ||
                  (!!localProfile.email && !isValidEmail(localProfile.email))
                }
              >
                {updating ? "Updating Profile..." : "Continue to Job Details"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CV Data Preview */}
      {formData.structuredCvData && (
        <Card className="shadow-lg rounded-2xl bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">
              Extracted CV Data
            </CardTitle>
            <CardDescription>
              Here's what our AI extracted from your CV. The information above
              has been auto-filled based on this data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Name:</strong>{" "}
                {formData.structuredCvData.personalInfo?.fullName ||
                  "Not found"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {formData.structuredCvData.personalInfo?.email || "Not found"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {formData.structuredCvData.personalInfo?.phone || "Not found"}
              </p>
              <p>
                <strong>Work Experience:</strong>{" "}
                {formData.structuredCvData.workExperience?.length || 0} entries
                found
              </p>
              <p>
                <strong>Education:</strong>{" "}
                {formData.structuredCvData.education?.length || 0} entries found
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {
                  [
                    ...(formData.structuredCvData.skills?.technical || []),
                    ...(formData.structuredCvData.skills?.soft || []),
                  ].length
                }{" "}
                skills identified
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
