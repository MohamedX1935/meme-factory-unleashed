
import { initialMemeTemplates, MemeTemplate, TEMPLATES_STORAGE_KEY, TEMPLATES_VERSION, TEMPLATES_VERSION_KEY } from "@/data/meme-templates";

// Chemin vers le fichier JSON contenant les templates depuis le dossier public
const TEMPLATES_URL = "/templates-database.json";

// Fallback URL format - peut être utilisé si besoin comme backup
const getGoogleDriveViewUrl = (fileId: string) => 
  `https://drive.google.com/uc?export=view&id=${fileId}`;

// Fonction principale pour charger tous les templates
export const loadAllTemplates = async (): Promise<MemeTemplate[]> => {
  try {
    // Vérifier si nous avons une version en cache
    const storedVersion = localStorage.getItem(TEMPLATES_VERSION_KEY);
    
    // Force le rechargement pour débugger
    console.log("Chargement forcé des templates depuis le fichier JSON");
    
    try {
      const response = await fetch(TEMPLATES_URL);
      
      if (!response.ok) {
        console.error(`Erreur lors du chargement des templates: ${response.status}`);
        throw new Error(`Erreur lors du chargement des templates: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Templates JSON chargés:", data);
      
      // Utiliser les templates du fichier JSON
      // Vérifier la structure du JSON et extraire les templates
      const templates = Array.isArray(data) 
        ? data 
        : data.templates || data.data || data.memes || [];
      
      // Vérifier que les templates ont bien les propriétés nécessaires
      const validTemplates = templates
        .filter((template: any) => template && typeof template === 'object')
        .map((template: any, index: number) => ({
          id: template.id || `template-${index}`,
          name: template.name || template.title || `Template ${index}`,
          url: template.url || template.src || template.image || '',
          filename: template.filename || '',
          category: template.category || '',
          tags: template.tags || [],
          width: template.width || 0,
          height: template.height || 0
        }))
        .filter((t: MemeTemplate) => t.url && t.url.trim() !== '');
      
      console.log(`${validTemplates.length} templates valides chargés avec succès`);
      
      if (validTemplates.length === 0) {
        console.warn("Aucun template valide trouvé dans le JSON, utilisation des templates par défaut");
        return initialMemeTemplates;
      }
      
      // Mise en cache des templates pour une utilisation future
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(validTemplates));
      localStorage.setItem(TEMPLATES_VERSION_KEY, TEMPLATES_VERSION);
      
      return validTemplates;
    } catch (fetchError) {
      console.error("Erreur lors du chargement du fichier JSON:", fetchError);
      console.log("Utilisation des templates initiaux suite à une erreur");
      return initialMemeTemplates;
    }
  } catch (error) {
    console.error("Échec du chargement des templates:", error);
    return initialMemeTemplates; // Utilisation des templates initiaux en cas d'échec
  }
};
