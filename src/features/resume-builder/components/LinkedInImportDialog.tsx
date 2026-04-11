import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResumeData } from "@/features/upload-cv/types";
import { useTranslations } from "next-intl";
import { linkedInService, LinkedInParseResponse } from "../services/linkedin.service";
import { MergeMode } from "../utils/mergeResumeData";
import { Loader2, AlertCircle } from "lucide-react";

interface LinkedInImportDialogProps {
    open: boolean;
    onClose: () => void;
    onApply: (incomingData: ResumeData, mode: MergeMode, sectionsToMerge: { personalInfo: boolean; experience: boolean; education: boolean; skills: boolean }) => void;
    showMergeOptions?: boolean; // True in Editor, false in Upload Page step 1
}

export function LinkedInImportDialog({ open, onClose, onApply, showMergeOptions = false }: LinkedInImportDialogProps) {
    const t = useTranslations("builder");
    
    const [step, setStep] = useState<"paste" | "preview">("paste");
    const [profileText, setProfileText] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<LinkedInParseResponse | null>(null);
    
    const [mergeMode, setMergeMode] = useState<MergeMode>(showMergeOptions ? "append" : "replace");
    const [selectedSections, setSelectedSections] = useState({
        personalInfo: true,
        experience: true,
        education: true,
        skills: true
    });

    const handleParse = async () => {
        if (!profileText.trim()) return;
        
        setIsParsing(true);
        setError(null);
        
        try {
            const data = await linkedInService.parseProfile(profileText);
            setParsedData(data);
            if (!data.success) {
                setError(data.errorMessage || t("linkedin.parseFailed"));
            } else {
                setStep("preview");
            }
        } catch (err: any) {
            setError(err?.message || t("linkedin.parseFailed"));
        } finally {
            setIsParsing(false);
        }
    };

    const handleApply = () => {
        if (!parsedData?.resumeData) return;
        
        onApply(parsedData.resumeData, mergeMode, selectedSections);
        handleClose();
    };

    const handleClose = () => {
        onClose();
        // Reset state after dialog animation finishes
        setTimeout(() => {
            setStep("paste");
            setProfileText("");
            setError(null);
            setParsedData(null);
        }, 300);
    };

    const toggleSection = (section: keyof typeof selectedSections) => {
        setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("linkedin.dialogTitle")}</DialogTitle>
                    <DialogDescription>
                        {step === "paste" ? t("linkedin.pasteLabel") : t("linkedin.preview")}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {step === "paste" ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("linkedin.pasteLabel")}</Label>
                            <Input
                                placeholder={t("linkedin.pastePlaceholder")}
                                value={profileText}
                                onChange={(e) => setProfileText(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border">
                            {t("linkedin.helpText") || "Tip: If the URL doesn't work, you can also paste your full LinkedIn profile text (Copy-Paste from your profile page)."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {/* Profile Summary */}
                        <div className="bg-muted p-4 rounded-md">
                            <h3 className="font-semibold text-lg">{parsedData?.detectedName || "Anonymous"}</h3>
                            <p className="text-sm text-muted-foreground">{parsedData?.detectedHeadline}</p>
                        </div>
                        
                        {/* Section Selection */}
                        <div className="space-y-3">
                            <Label>{t("linkedin.sections")}</Label>
                            
                            <div className="space-y-2 border rounded-md p-3 bg-card">
                                <div className="flex items-center space-x-2 pb-2 border-b">
                                    <Checkbox 
                                        id="import-pi" 
                                        checked={selectedSections.personalInfo} 
                                        onCheckedChange={() => toggleSection("personalInfo")} 
                                    />
                                    <Label htmlFor="import-pi" className="font-normal cursor-pointer flex-1">
                                        {t("linkedin.personalInfo")}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 py-1">
                                    <Checkbox 
                                        id="import-exp" 
                                        checked={selectedSections.experience} 
                                        onCheckedChange={() => toggleSection("experience")} 
                                    />
                                    <Label htmlFor="import-exp" className="font-normal cursor-pointer flex-1 flex justify-between">
                                        <span>{t("linkedin.experience")}</span>
                                        <span className="text-muted-foreground text-xs">{t("linkedin.items").replace("{count}", String(parsedData?.experienceCount || 0))}</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 py-1">
                                    <Checkbox 
                                        id="import-edu" 
                                        checked={selectedSections.education} 
                                        onCheckedChange={() => toggleSection("education")} 
                                    />
                                    <Label htmlFor="import-edu" className="font-normal cursor-pointer flex-1 flex justify-between">
                                        <span>{t("linkedin.education")}</span>
                                        <span className="text-muted-foreground text-xs">{t("linkedin.items").replace("{count}", String(parsedData?.educationCount || 0))}</span>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 pt-1 border-t">
                                    <Checkbox 
                                        id="import-skills" 
                                        checked={selectedSections.skills} 
                                        onCheckedChange={() => toggleSection("skills")} 
                                    />
                                    <Label htmlFor="import-skills" className="font-normal cursor-pointer flex-1 flex justify-between">
                                        <span>{t("linkedin.skills")}</span>
                                        <span className="text-muted-foreground text-xs">{t("linkedin.items").replace("{count}", String(parsedData?.skillsCount || 0))}</span>
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Merge Mode Details (Only in builder) */}
                        {showMergeOptions && (
                            <div className="space-y-3 pt-2">
                                <RadioGroup value={mergeMode} onValueChange={(val) => setMergeMode(val as MergeMode)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="append" id="r-append" />
                                        <Label htmlFor="r-append" className="cursor-pointer">{t("linkedin.modeAppend")}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="replace" id="r-replace" />
                                        <Label htmlFor="r-replace" className="cursor-pointer text-destructive">{t("linkedin.modeReplace")}</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={step === "preview" ? () => setStep("paste") : handleClose}>
                        {step === "preview" ? "Back" : "Cancel"}
                    </Button>
                    
                    {step === "paste" ? (
                        <Button onClick={handleParse} disabled={isParsing || !profileText.trim()}>
                            {isParsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isParsing ? t("linkedin.parsing") : t("linkedin.parseButton")}
                        </Button>
                    ) : (
                        <Button onClick={handleApply}>
                            {t("linkedin.applyButton")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
