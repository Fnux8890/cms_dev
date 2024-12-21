import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

describe('MDX Content', () => {
  it('should have valid frontmatter in hello-world.mdx', async () => {
    const mdxPath = path.join(process.cwd(), 'src/content/posts/hello-world.mdx');
    const fileContent = await fs.readFile(mdxPath, 'utf-8');
    const { data: frontmatter } = matter(fileContent);
    
    expect(frontmatter).toMatchObject({
      title: 'Hello World',
      description: 'Our first MDX post',
      author: 'CMS Team',
      category: 'general',
      tags: ['mdx', 'test']
    });
    
    // Validate the date is a valid ISO string for the expected date
    const date = new Date(frontmatter.date);
    expect(date.toISOString().split('T')[0]).toBe('2023-12-21');
  });

  it('should have proper MDX content structure', async () => {
    const mdxPath = path.join(process.cwd(), 'src/content/posts/hello-world.mdx');
    const fileContent = await fs.readFile(mdxPath, 'utf-8');
    const { content } = matter(fileContent);
    
    // Check for expected MDX content markers
    expect(content).toContain('# Hello World!');
    expect(content).toContain('import { Button }');
    expect(content).toContain('<Button>Click me!</Button>');
  });
}); 