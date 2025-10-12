"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, FileText, Briefcase, GraduationCap, Award, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const databaseService = useDatabase();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (databaseService) {
      loadProfile();
    }
  }, [databaseService]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await databaseService!.getUserProfile(user);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !databaseService) return;

    try {
      setSaving(true);
      await databaseService.updateUserProfile(profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information. These fields can be auto-filled from your CV.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details. Empty fields will be auto-filled when you upload a CV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                  title="Email cannot be changed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Professional Summary</h3>
            </div>
            <Textarea
              id="summary"
              value={profile.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              placeholder="Brief professional summary..."
              rows={4}
            />
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
            </div>
            <Textarea
              id="experience"
              value={profile.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              placeholder="Your work experience..."
              rows={6}
            />
          </div>

          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Education</h3>
            </div>
            <Textarea
              id="education"
              value={profile.education}
              onChange={(e) => handleInputChange("education", e.target.value)}
              placeholder="Your education background..."
              rows={4}
            />
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
            </div>
            <Textarea
              id="skills"
              value={profile.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
              placeholder="Your skills (comma-separated)..."
              rows={3}
            />
          </div>

          {/* Account Info */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 font-semibold capitalize">{profile.plan || "free"}</span>
              </div>
              <div>
                <span className="text-gray-600">UI CV Limit:</span>
                <span className="ml-2 font-semibold">
                  {profile.uiCvCount || 0} / {profile.uiCvLimit || 5} this month
                </span>
              </div>
              {profile.isLicensed && (
                <>
                  <div>
                    <span className="text-gray-600">API Access:</span>
                    <span className="ml-2 font-semibold text-green-600">Active</span>
                  </div>
                  <div>
                    <span className="text-gray-600">API Usage:</span>
                    <span className="ml-2 font-semibold">
                      {profile.apiUsageCount || 0} / {profile.apiRateLimit || 500} this month
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

