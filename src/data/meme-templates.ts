
// Un petit sous-ensemble de templates qui seront chargés immédiatement
// La base de données complète sera chargée de façon asynchrone
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

// Version de la base de données des templates pour la gestion du cache
// Incrémentez cette valeur pour forcer le rechargement du cache
export const TEMPLATES_VERSION = "1.3.0"; // Incrémenté pour forcer le rechargement
export const TEMPLATES_STORAGE_KEY = "meme_templates_database";
export const TEMPLATES_VERSION_KEY = "meme_templates_version";

// Schéma complet pour les objets de templates
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

// Templates par défaut en cas d'échec du chargement depuis le serveur
export const memeTemplates = initialMemeTemplates;
