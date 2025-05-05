
import { initialMemeTemplates, MemeTemplate, TEMPLATES_STORAGE_KEY, TEMPLATES_VERSION, TEMPLATES_VERSION_KEY } from "@/data/meme-templates";

// Remote templates source - this would be your API endpoint or JSON file
const TEMPLATES_URL = "https://raw.githubusercontent.com/memefactory/templates/main/templates-database.json";

// Fallback URL format - can be used if GitHub link above doesn't work
// This will construct direct URLs to the Google Drive files
const getGoogleDriveViewUrl = (fileId: string) => 
  `https://drive.google.com/uc?export=view&id=${fileId}`;

// Main function to load all templates
export const loadAllTemplates = async (): Promise<MemeTemplate[]> => {
  try {
    // First check if we have a cached version
    const storedVersion = localStorage.getItem(TEMPLATES_VERSION_KEY);
    if (storedVersion === TEMPLATES_VERSION) {
      const cachedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (cachedTemplates) {
        console.log("Using cached templates");
        return JSON.parse(cachedTemplates);
      }
    }

    // If no cache or version mismatch, try to fetch from remote
    console.log("Fetching templates from remote source");
    
    // For demo purposes, we'll simulate a large template database
    // In production, you would replace this with an actual fetch call:
    // const response = await fetch(TEMPLATES_URL);
    // const data = await response.json();
    
    // Use only the initial templates, without generating more
    const templates = initialMemeTemplates;
    
    // Cache the templates for future use
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    localStorage.setItem(TEMPLATES_VERSION_KEY, TEMPLATES_VERSION);
    
    return templates;
  } catch (error) {
    console.error("Failed to load templates:", error);
    return initialMemeTemplates; // Fallback to initial templates
  }
};
