

// This is a small subset of templates that will be loaded immediately
// The full database will be loaded asynchronously
export const initialMemeTemplates = [
  {
    id: "drake",
    name: "Drake Hotline Bling",
    url: "https://i.imgflip.com/30b1gx.jpg"
  },
  {
    id: "distracted-boyfriend",
    name: "Distracted Boyfriend",
    url: "https://i.imgflip.com/1ur9b0.jpg"
  },
  {
    id: "change-my-mind",
    name: "Change My Mind",
    url: "https://i.imgflip.com/24y43o.jpg"
  },
  {
    id: "two-buttons",
    name: "Two Buttons",
    url: "https://i.imgflip.com/1g8my4.jpg"
  }
];

// Template database version for cache management
export const TEMPLATES_VERSION = "1.0.0";
export const TEMPLATES_STORAGE_KEY = "meme_templates_database";
export const TEMPLATES_VERSION_KEY = "meme_templates_version";

// Full schema for template objects
export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  filename?: string;
  category?: string;
  tags?: string[];
  width?: number;
  height?: number;
}

// Default templates if remote loading fails
export const memeTemplates = initialMemeTemplates;

