import { describe, it, expect, beforeEach } from 'vitest';
import { ContentSyncService } from '../../src/lib/content-sync';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
const mockMkdir = vi.fn();
const mockWriteFile = vi.fn();
const mockReadFile = vi.fn();

vi.mock('fs/promises', () => ({
  default: {
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
    readFile: mockReadFile,
  },
}));

// Mock GitOperations
const mockListFiles = vi.fn();
const mockGetFile = vi.fn();
const mockCreateOrUpdateFile = vi.fn();

vi.mock('../../src/lib/git-operations', () => ({
  GitOperations: vi.fn(() => ({
    listFiles: mockListFiles,
    getFile: mockGetFile,
    createOrUpdateFile: mockCreateOrUpdateFile,
  })),
}));

describe('ContentSyncService', () => {
  let contentSync: ContentSyncService;
  const mockToken = 'test-token';
  const mockOwner = 'test-owner';
  const mockRepo = 'test-repo';

  beforeEach(() => {
    vi.clearAllMocks();
    contentSync = new ContentSyncService(mockToken, mockOwner, mockRepo);
  });

  describe('pullContent', () => {
    it('should sync files from GitHub to local filesystem', async () => {
      const mockFiles = [
        { name: 'file1.md', path: 'content/file1.md', sha: 'sha1' },
      ];

      const mockContent = {
        content: 'Hello World',
        sha: 'sha1',
      };

      mockListFiles.mockResolvedValueOnce(mockFiles);
      mockGetFile.mockResolvedValueOnce(mockContent);

      await contentSync.pullContent();

      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining('content'),
        { recursive: true }
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('content/file1.md'),
        'Hello World',
        'utf-8'
      );
    });
  });

  describe('pushContent', () => {
    it('should push new content to GitHub', async () => {
      const filePath = 'content/new-file.md';
      const content = 'New content';
      const message = 'Add new file';

      mockGetFile.mockRejectedValueOnce(new Error('Not found'));
      
      await contentSync.pushContent(filePath, content, message);

      expect(mockCreateOrUpdateFile).toHaveBeenCalledWith(
        filePath,
        content,
        message,
        undefined
      );
    });

    it('should update existing content on GitHub', async () => {
      const filePath = 'content/existing-file.md';
      const content = 'Updated content';
      const message = 'Update file';
      const existingSha = 'existing-sha';

      mockGetFile.mockResolvedValueOnce({
        content: 'Old content',
        sha: existingSha,
      });

      await contentSync.pushContent(filePath, content, message);

      expect(mockCreateOrUpdateFile).toHaveBeenCalledWith(
        filePath,
        content,
        message,
        existingSha
      );
    });
  });

  describe('checkForChanges', () => {
    it('should detect changes between local and remote content', async () => {
      const filePath = 'content/file.md';
      const localContent = 'Local content';
      const remoteContent = 'Remote content';

      mockReadFile.mockResolvedValueOnce(localContent);
      mockGetFile.mockResolvedValueOnce({
        content: remoteContent,
        sha: 'sha1',
      });

      const result = await contentSync.checkForChanges(filePath);

      expect(result.hasChanges).toBe(true);
      expect(result.localContent).toBe(localContent);
      expect(result.remoteContent).toBe(remoteContent);
    });
  });

  describe('resolveConflict', () => {
    it('should resolve conflict using local content', async () => {
      const filePath = 'content/file.md';
      const localContent = 'Local content';
      const remoteContent = 'Remote content';

      vi.spyOn(contentSync, 'checkForChanges').mockResolvedValueOnce({
        hasChanges: true,
        localContent,
        remoteContent,
      });

      await contentSync.resolveConflict(filePath, 'local');

      expect(mockCreateOrUpdateFile).toHaveBeenCalledWith(
        filePath,
        localContent,
        'Resolve conflict: use local version',
        undefined
      );
    });

    it('should resolve conflict using remote content', async () => {
      const filePath = 'content/file.md';
      const localContent = 'Local content';
      const remoteContent = 'Remote content';

      vi.spyOn(contentSync, 'checkForChanges').mockResolvedValueOnce({
        hasChanges: true,
        localContent,
        remoteContent,
      });

      await contentSync.resolveConflict(filePath, 'remote');

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining(filePath),
        remoteContent,
        'utf-8'
      );
    });

    it('should resolve conflict using merged content', async () => {
      const filePath = 'content/file.md';
      const mergedContent = 'Merged content';

      vi.spyOn(contentSync, 'checkForChanges').mockResolvedValueOnce({
        hasChanges: true,
        localContent: 'Local content',
        remoteContent: 'Remote content',
      });

      await contentSync.resolveConflict(filePath, 'merge', mergedContent);

      expect(mockCreateOrUpdateFile).toHaveBeenCalledWith(
        filePath,
        mergedContent,
        'Resolve conflict: merge changes',
        undefined
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining(filePath),
        mergedContent,
        'utf-8'
      );
    });
  });
}); 