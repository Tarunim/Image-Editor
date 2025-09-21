
export interface ImageFile {
  id: string;
  name: string;
  url: string; // data URL
  file: File;
}

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
    BLUE = 'blue',
    FOREST = 'forest',
    SUNSET = 'sunset',
    MONOCHROME = 'monochrome',
    RETRO = 'retro',
}

export interface ChatMessage {
  id: string;
  text: string;
}

export enum EditTarget {
  SUBJECT = 'subject',
  BACKGROUND = 'background',
}

export enum StylePreset {
  NONE = 'None',
  PHOTOREALISTIC = 'Photorealistic',
  CINEMATIC = 'Cinematic',
  ANIME = 'Anime / Manga',
  GHIBLI = 'Ghibli Studio',
  FANTASY = 'Fantasy Art',
  WATERCOLOR = 'Watercolor',
  OIL_PAINTING = 'Oil Painting',
  STEAMPUNK = 'Steampunk',
  CYBERPUNK = 'Cyberpunk',
  VAPORWAVE = 'Vaporwave',
  LOW_POLY = 'Low Poly',
  PIXEL_ART = 'Pixel Art',
  LINE_ART = 'Line Art',
  POP_ART = 'Pop Art',
  ART_DECO = 'Art Deco',
  MINIMALIST = 'Minimalist',
  IMPRESSIONISM = 'Impressionism',
  SURREALISM = 'Surrealism',
  ABSTRACT = 'Abstract',
  CONCEPT_ART = 'Concept Art',
  VINTAGE_PHOTO = 'Vintage Photo',
  GOTHIC = 'Gothic Art',
  COMIC_BOOK = 'Comic Book',
  ISOMETRIC = 'Isometric',
}