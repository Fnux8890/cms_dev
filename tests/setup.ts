import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Astro's content collections
vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockImplementation((collection) => {
    if (collection === 'posts') {
      return Promise.resolve([
        {
          id: 'hello-world.mdx',
          slug: 'hello-world',
          body: '# Hello World',
          collection: 'posts',
          data: {
            title: 'Hello World',
            description: 'Our first MDX post',
            date: new Date('2023-12-21'),
            author: 'CMS Team',
            category: 'general',
            tags: ['mdx', 'test']
          }
        }
      ]);
    }
    return Promise.resolve([]);
  })
}));