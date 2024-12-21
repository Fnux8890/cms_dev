import { GitOperations } from './git-operations';
import fs from 'fs/promises';
import path from 'path';

export class ContentSyncService {
  private git: GitOperations;
  private basePath: string;

  constructor(
    token: string,
    owner: string,
    repo: string,
    basePath: string = 'content'
  ) {
    this.git = new GitOperations(token, owner, repo);
    this.basePath = basePath;
  }

  /**
   * Synchronizes content from GitHub to local filesystem
   */
  async pullContent(): Promise<void> {
    try {
      // Get all files from GitHub
      const files = await this.git.listFiles(this.basePath);

      // Download each file and save locally
      for (const file of files) {
        const content = await this.git.getFile(file.path);
        const localPath = path.join(process.cwd(), 'src', file.path);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(localPath), { recursive: true });
        
        // Write file
        await fs.writeFile(localPath, content.content, 'utf-8');
      }
    } catch (error) {
      console.error('Error pulling content:', error);
      throw error;
    }
  }

  /**
   * Pushes local content changes to GitHub
   */
  async pushContent(filePath: string, content: string, message: string): Promise<void> {
    try {
      // Get the current file's SHA if it exists
      let sha: string | undefined;
      try {
        const existingFile = await this.git.getFile(filePath);
        sha = existingFile.sha;
      } catch {
        // File doesn't exist yet, that's okay
      }

      // Create or update the file on GitHub
      await this.git.createOrUpdateFile(
        filePath,
        content,
        message,
        sha
      );
    } catch (error) {
      console.error('Error pushing content:', error);
      throw error;
    }
  }

  /**
   * Checks if there are differences between local and remote content
   */
  async checkForChanges(filePath: string): Promise<{
    hasChanges: boolean;
    localContent?: string;
    remoteContent?: string;
  }> {
    try {
      const localPath = path.join(process.cwd(), 'src', filePath);
      const [localContent, remoteFile] = await Promise.all([
        fs.readFile(localPath, 'utf-8').catch(() => null),
        this.git.getFile(filePath).catch(() => null),
      ]);

      if (!localContent && !remoteFile) {
        throw new Error('File does not exist locally or remotely');
      }

      const remoteContent = remoteFile?.content;
      const hasChanges = localContent !== remoteContent;

      return {
        hasChanges,
        localContent: localContent ?? undefined,
        remoteContent: remoteContent ?? undefined,
      };
    } catch (error) {
      console.error('Error checking for changes:', error);
      throw error;
    }
  }

  /**
   * Resolves conflicts between local and remote content
   */
  async resolveConflict(
    filePath: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedContent?: string
  ): Promise<void> {
    try {
      const { localContent, remoteContent } = await this.checkForChanges(filePath);

      if (resolution === 'local' && localContent) {
        await this.pushContent(filePath, localContent, 'Resolve conflict: use local version');
      } else if (resolution === 'remote' && remoteContent) {
        const localPath = path.join(process.cwd(), 'src', filePath);
        await fs.writeFile(localPath, remoteContent, 'utf-8');
      } else if (resolution === 'merge' && mergedContent) {
        await this.pushContent(filePath, mergedContent, 'Resolve conflict: merge changes');
        const localPath = path.join(process.cwd(), 'src', filePath);
        await fs.writeFile(localPath, mergedContent, 'utf-8');
      } else {
        throw new Error('Invalid conflict resolution');
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }
} 