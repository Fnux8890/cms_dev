// MDX Content Types
export interface BaseFrontmatter {
  title: string;
  description?: string;
  date: string;
  author?: string;
  draft?: boolean;
  tags?: string[];
}

export interface PostFrontmatter extends BaseFrontmatter {
  category?: string;
  featured?: boolean;
}

export interface PageFrontmatter extends BaseFrontmatter {
  layout?: string;
  menu?: {
    title: string;
    weight: number;
  };
}

// Astro Content Collections
declare module 'astro:content' {
  interface CollectionEntry<C extends keyof typeof collections> {
    data: C extends 'posts' 
      ? PostFrontmatter 
      : C extends 'pages' 
      ? PageFrontmatter 
      : never;
  }
} 