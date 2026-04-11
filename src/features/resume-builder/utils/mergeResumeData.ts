import { ResumeData, SectionItem } from "@/features/upload-cv/types";
import { v4 as uuidv4 } from 'uuid';

export type MergeMode = 'replace' | 'append';

export interface MergeOptions {
    mode: MergeMode;
    sections: {
        personalInfo: boolean;
        experience: boolean;
        education: boolean;
        skills: boolean;
    };
}

export function mergeResumeData(
    existing: ResumeData,
    incoming: ResumeData,
    options: MergeOptions
): ResumeData {
    // Deep clone the existing data to avoid mutating state directly
    const result: ResumeData = JSON.parse(JSON.stringify(existing));
    
    // Initialize sections if completely missing
    if (!result.sections) result.sections = [];
    
    // 1. Personal Info
    if (options.sections.personalInfo && incoming.personalInfo) {
        if (!result.personalInfo) {
            result.personalInfo = {
                fullName: "", jobTitle: "", phone: "", address: "", email: "", linkedin: "", summary: "", picture: ""
            };
        }
        
        // Only overwrite with non-empty incoming values
        const pi = incoming.personalInfo;
        if (pi.fullName) result.personalInfo.fullName = pi.fullName;
        if (pi.jobTitle) result.personalInfo.jobTitle = pi.jobTitle;
        if (pi.summary) result.personalInfo.summary = pi.summary;
        if (pi.linkedin) result.personalInfo.linkedin = pi.linkedin;
        if (pi.email) result.personalInfo.email = pi.email;
        if (pi.phone) result.personalInfo.phone = pi.phone;
        if (pi.address) result.personalInfo.address = pi.address;
        if (pi.picture) result.personalInfo.picture = pi.picture;
        
        // Preserve any existing picture since LinkedIn text parse won't have it
    }

    // Process lists (experience, education, skills, etc.)
    const processSectionList = (type: string, incomingItems: SectionItem[], shouldMerge: boolean) => {
        if (!shouldMerge || !incomingItems || incomingItems.length === 0) return;
        
        // Find existing section index
        const existingIdx = result.sections.findIndex(s => s.type === type);
        
        if (options.mode === 'replace') {
            const newItems = incomingItems.map(item => ({ ...item, id: uuidv4() }));
            
            if (existingIdx >= 0) {
                // Replace items but keep section metadata
                result.sections[existingIdx].items = newItems;
            } else {
                // Find incoming section metadata to copy titles, or use defaults
                const incSection = incoming.sections?.find(s => s.type === type);
                result.sections.push({
                    id: uuidv4(),
                    title: incSection?.title || (type.charAt(0).toUpperCase() + type.slice(1)),
                    type: type as any,
                    items: newItems
                });
            }
        } else if (options.mode === 'append') {
            const newItems = incomingItems.map(item => ({ ...item, id: uuidv4() }));
            
            if (existingIdx >= 0) {
                // Append items to existing section
                const currentItems = result.sections[existingIdx].items || [];
                
                if (type === 'skills') {
                    // Try to deduplicate skills (case-insensitive)
                    const existingNames = new Set(currentItems.map(i => i.title.toLowerCase()));
                    const filteredNew = newItems.filter(i => !existingNames.has(i.title.toLowerCase()));
                    result.sections[existingIdx].items = [...currentItems, ...filteredNew];
                } else {
                    // Prepend new experiences/educations to the top
                    result.sections[existingIdx].items = [...newItems, ...currentItems];
                }
            } else {
                // Section doesn't exist yet, just add it
                const incSection = incoming.sections?.find(s => s.type === type);
                result.sections.push({
                    id: uuidv4(),
                    title: incSection?.title || (type.charAt(0).toUpperCase() + type.slice(1)),
                    type: type as any,
                    items: newItems
                });
            }
        }
    };

    // Extract particular items from incoming sections array
    const extractItems = (type: string) => {
        const section = incoming.sections?.find(s => s.type === type);
        return section?.items || [];
    };

    // 2. Experience
    processSectionList('experience', extractItems('experience'), options.sections.experience);
    
    // 3. Education
    processSectionList('education', extractItems('education'), options.sections.education);
    
    // 4. Skills
    processSectionList('skills', extractItems('skills'), options.sections.skills);

    return result;
}
