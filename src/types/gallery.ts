export interface Artwork {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export type RenderQuality = 'low' | 'medium' | 'high';

export interface GallerySceneProps {
  onSelectArt: (art: Artwork) => void;
  artworks: Artwork[];
  quality: RenderQuality;
  isSurpriseActive: boolean;
  setIsSurpriseActive: (active: boolean) => void;
  isSurpriseEnabled?: boolean;
  setShowLetter: (show: boolean) => void;
  isLetterOpen: boolean;
  setShowBook: (show: boolean) => void;
  isBookOpen: boolean;
}

export interface PedestalArtProps {
  quality: RenderQuality;
  isSurpriseActive: boolean;
  setIsSurpriseActive: (active: boolean) => void;
  isSurpriseEnabled?: boolean;
  setShowLetter: (show: boolean) => void;
  isLetterOpen: boolean;
  setShowBook: (show: boolean) => void;
  isBookOpen: boolean;
}
