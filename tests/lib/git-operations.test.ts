import { describe, it, expect, beforeEach } from 'vitest';
import { GitOperations } from '../../src/lib/git-operations';
import { Base64 } from 'js-base64';

// Create mock Octokit instance
const mockGetContent = vi.fn();
const mockCreateOrUpdateFileContents = vi.fn();
const mockListCommits = vi.fn();

const mockOctokit = {
  repos: {
    getContent: mockGetContent,
    createOrUpdateFileContents: mockCreateOrUpdateFileContents,
    listCommits: mockListCommits,
  },
};

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => mockOctokit),
}));

describe('GitOperations', () => {
  let gitOps: GitOperations;
  const mockToken = 'test-token';
  const mockOwner = 'test-owner';
  const mockRepo = 'test-repo';

  beforeEach(() => {
    vi.clearAllMocks();
    gitOps = new GitOperations(mockToken, mockOwner, mockRepo);
  });

  describe('listFiles', () => {
    it('should list files in a directory', async () => {
      const mockResponse = {
        data: [
          { name: 'file1.md', path: 'content/file1.md', sha: 'sha1' },
          { name: 'file2.md', path: 'content/file2.md', sha: 'sha2' },
        ],
      };

      mockGetContent.mockResolvedValueOnce(mockResponse);

      const files = await gitOps.listFiles('content');
      expect(files).toHaveLength(2);
      expect(files[0]).toEqual({
        name: 'file1.md',
        path: 'content/file1.md',
        sha: 'sha1',
      });
    });

    it('should throw error if path is not a directory', async () => {
      const mockResponse = {
        data: { type: 'file', name: 'file1.md', path: 'content/file1.md', sha: 'sha1' },
      };

      mockGetContent.mockResolvedValueOnce(mockResponse);

      await expect(gitOps.listFiles('content')).rejects.toThrow('Path does not point to a directory');
    });
  });

  describe('getFile', () => {
    it('should get file content', async () => {
      const content = 'Hello, World!';
      const mockResponse = {
        data: {
          type: 'file',
          content: Base64.encode(content),
          sha: 'sha1',
        },
      };

      mockGetContent.mockResolvedValueOnce(mockResponse);

      const file = await gitOps.getFile('content/file1.md');
      expect(file.content).toBe(content);
      expect(file.sha).toBe('sha1');
    });

    it('should throw error if path is a directory', async () => {
      const mockResponse = {
        data: [{ type: 'file', name: 'file1.md' }],
      };

      mockGetContent.mockResolvedValueOnce(mockResponse);

      await expect(gitOps.getFile('content')).rejects.toThrow('Path does not point to a file');
    });
  });

  describe('createOrUpdateFile', () => {
    it('should create a new file', async () => {
      const mockResponse = {
        data: {
          content: {
            sha: 'new-sha',
          },
        },
      };

      mockCreateOrUpdateFileContents.mockResolvedValueOnce(mockResponse);

      const result = await gitOps.createOrUpdateFile(
        'content/new-file.md',
        'Hello, World!',
        'Create new file'
      );

      expect(result.sha).toBe('new-sha');
    });

    it('should update an existing file', async () => {
      const mockResponse = {
        data: {
          content: {
            sha: 'updated-sha',
          },
        },
      };

      mockCreateOrUpdateFileContents.mockResolvedValueOnce(mockResponse);

      const result = await gitOps.createOrUpdateFile(
        'content/file1.md',
        'Updated content',
        'Update file',
        'old-sha'
      );

      expect(result.sha).toBe('updated-sha');
    });
  });

  describe('getCommitHistory', () => {
    it('should get commit history for a file', async () => {
      const mockResponse = {
        data: [
          {
            sha: 'commit1',
            commit: {
              message: 'First commit',
              author: {
                date: '2023-12-21T00:00:00Z',
                name: 'Test Author',
              },
            },
          },
        ],
      };

      mockListCommits.mockResolvedValueOnce(mockResponse);

      const history = await gitOps.getCommitHistory('content/file1.md');
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({
        sha: 'commit1',
        message: 'First commit',
        date: '2023-12-21T00:00:00Z',
        author: 'Test Author',
      });
    });
  });
}); 