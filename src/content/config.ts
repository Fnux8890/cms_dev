import { z, defineCollection } from 'astro:content';

// Base schema for common frontmatter fields
const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  author: z.string().optional(),
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([])
});

// Schema for blog posts
const postSchema = baseSchema.extend({
  category: z.string().optional(),
  featured: z.boolean().optional().default(false)
});

// Schema for pages
const pageSchema = baseSchema.extend({
  layout: z.string().optional(),
  menu: z.object({
    title: z.string(),
    weight: z.number()
  }).optional()
});

// Define collections
export const collections = {
  posts: defineCollection({
    type: 'content',
    schema: postSchema,
  }),
  pages: defineCollection({
    type: 'content',
    schema: pageSchema,
  })
}; 