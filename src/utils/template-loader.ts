
import { initialMemeTemplates, MemeTemplate, TEMPLATES_STORAGE_KEY, TEMPLATES_VERSION, TEMPLATES_VERSION_KEY } from "@/data/meme-templates";

// Chemin vers le fichier JSON contenant les templates depuis le dossier public
const TEMPLATES_URL = "/templates-database.json";

export const loadAllTemplates = async (): Promise<MemeTemplate[]> => {
  try {
    console.log("Chargement des templates depuis le fichier JSON");
    
    try {
      const response = await fetch(TEMPLATES_URL);
      
      if (!response.ok) {
        console.error(`Erreur lors du chargement des templates: ${response.status}`);
        throw new Error(`Erreur lors du chargement des templates: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Templates JSON chargés:", data);
      
      // Vérifier que data est un tableau
      if (!Array.isArray(data)) {
        console.error("Le fichier JSON ne contient pas un tableau");
        return initialMemeTemplates;
      }
      
      // Mapper les données du JSON vers notre format MemeTemplate
      const validTemplates = data.map((item: any): MemeTemplate => {
        return {
          id: item.id || `template-${Math.random()}`,
          name: item.displayName || item.name || "",
          url: item.fullImage || item.url || "",
          filename: item.filename || "",
          displayName: item.displayName || "",
          thumbnail: item.thumbnail || "",
          fullImage: item.fullImage || "",
          category: item.category || "",
          tags: item.tags || [],
          width: item.width || 0,
          height: item.height || 0,
          cloudinaryId: item.cloudinaryId || "",
          originalSource: item.originalSource || ""
        };
      }).filter((t: MemeTemplate) => 
        t.id && (t.thumbnail || t.fullImage || t.url)
      );
      
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
