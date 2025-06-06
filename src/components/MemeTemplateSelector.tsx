
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader, RefreshCw, ImageOff } from "lucide-react";
import { initialMemeTemplates, MemeTemplate, TEMPLATES_STORAGE_KEY, TEMPLATES_VERSION_KEY } from '@/data/meme-templates';
import { loadAllTemplates } from '@/utils/template-loader';
import { toast } from "@/components/ui/use-toast";

interface MemeTemplateSelectorProps {
  onSelect: (templateUrl: string) => void;
}

const MemeTemplateSelector: React.FC<MemeTemplateSelectorProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<MemeTemplate[]>(initialMemeTemplates);
  const [visibleTemplates, setVisibleTemplates] = useState<MemeTemplate[]>(initialMemeTemplates);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(20);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const observerTarget = useRef<HTMLDivElement>(null);

  const TEMPLATES_PER_PAGE = 30;  // Augmenté pour afficher plus de templates à la fois

  // Charger tous les templates au montage du composant
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // Forcer le rechargement des templates
      localStorage.removeItem(TEMPLATES_STORAGE_KEY);
      localStorage.removeItem(TEMPLATES_VERSION_KEY);
      
      const allTemplates = await loadAllTemplates();
      console.log("Templates chargés dans le composant:", allTemplates.length);
      
      if (allTemplates.length === 0) {
        toast({
          title: "Aucun template trouvé",
          description: "Impossible de charger les templates. Veuillez vérifier le fichier JSON.",
          variant: "destructive",
          duration: 5000,
        });
        setTemplates(initialMemeTemplates);
        setVisibleTemplates(initialMemeTemplates);
      } else {
        setTemplates(allTemplates);
        setVisibleTemplates(allTemplates.slice(0, TEMPLATES_PER_PAGE));
        setLoadedCount(TEMPLATES_PER_PAGE);
        
        // Notifier l'utilisateur du nombre de templates chargés
        toast({
          title: "Templates chargés avec succès",
          description: `${allTemplates.length} templates disponibles dans la bibliothèque.`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des templates:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger tous les templates. Utilisation des templates par défaut.",
        variant: "destructive",
        duration: 5000,
      });
      setTemplates(initialMemeTemplates);
      setVisibleTemplates(initialMemeTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les erreurs de chargement d'image
  const handleImageError = useCallback((templateId: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(templateId);
      return newSet;
    });
  }, []);

  // Obtenir l'URL d'image à utiliser (thumbnail, fullImage, ou url)
  const getTemplateImageUrl = (template: MemeTemplate): string => {
    return template.thumbnail || template.fullImage || template.url || '';
  };
  
  // Obtenir le nom du template à afficher
  const getTemplateName = (template: MemeTemplate): string => {
    return template.displayName || template.name || template.id || 'Sans nom';
  };

  // Filtrer les templates selon la requête de recherche
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      (template.name?.toLowerCase().includes(query)) || 
      (template.displayName?.toLowerCase().includes(query)) || 
      (template.filename && template.filename.toLowerCase().includes(query)) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (template.category && template.category.toLowerCase().includes(query))
    );
  }, [searchQuery, templates]);

  // Charger plus de templates quand l'utilisateur fait défiler
  const loadMoreTemplates = useCallback(() => {
    if (loadedCount >= filteredTemplates.length) return;
    
    const nextBatchSize = Math.min(TEMPLATES_PER_PAGE, filteredTemplates.length - loadedCount);
    const newLoadedCount = loadedCount + nextBatchSize;
    
    setVisibleTemplates(filteredTemplates.slice(0, newLoadedCount));
    setLoadedCount(newLoadedCount);
  }, [filteredTemplates, loadedCount]);

  // Configurer l'observateur d'intersection pour le défilement infini
  useEffect(() => {
    if (!observerTarget.current) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreTemplates();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(observerTarget.current);
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMoreTemplates, isLoading]);

  // Réinitialiser les templates visibles quand la requête de recherche change
  useEffect(() => {
    setVisibleTemplates(filteredTemplates.slice(0, TEMPLATES_PER_PAGE));
    setLoadedCount(Math.min(TEMPLATES_PER_PAGE, filteredTemplates.length));
  }, [filteredTemplates]);

  // Fonction pour forcer le rechargement des templates (efface le cache)
  const handleForceRefresh = async () => {
    localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    localStorage.removeItem(TEMPLATES_VERSION_KEY);
    setIsLoading(true);
    setFailedImages(new Set());
    await fetchTemplates();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Rechercher des templates..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          {templates.length > initialMemeTemplates.length ? (
            <span className="text-meme-primary font-bold">{templates.length}</span>
          ) : (
            <span>{templates.length}</span>
          )} Templates disponibles
        </h3>
        
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader className="h-3 w-3 mr-1 animate-spin" />
              Chargement...
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
            disabled={isLoading}
            title="Recharger tous les templates"
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="sr-only md:not-sr-only md:inline-block">Actualiser</span>
          </Button>
        </div>
      </div>

      {filteredTemplates.length === 0 && !isLoading ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
          <p className="mb-2">Aucun template trouvé pour "{searchQuery}"</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Effacer la recherche
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[420px]">
          <div className="grid grid-cols-2 gap-2">
            {visibleTemplates.map((template) => (
              <Card 
                key={template.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                onClick={() => onSelect(template.fullImage || template.url || '')}
              >
                <div className="p-1 relative">
                  {failedImages.has(template.id) ? (
                    <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded">
                      <ImageOff className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        Image non disponible
                      </p>
                    </div>
                  ) : (
                    <img 
                      src={getTemplateImageUrl(template)} 
                      alt={getTemplateName(template)} 
                      className="w-full h-auto object-cover rounded"
                      loading="lazy"
                      onError={() => handleImageError(template.id)}
                      style={{ minHeight: "80px" }}
                    />
                  )}
                  <p className="text-xs text-center mt-1 text-muted-foreground line-clamp-1">
                    {getTemplateName(template)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Élément cible pour l'observateur d'intersection */}
          {filteredTemplates.length > loadedCount && (
            <div 
              ref={observerTarget} 
              className="py-4 flex justify-center"
            >
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default MemeTemplateSelector;
