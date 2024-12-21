import { Octokit } from '@octokit/rest';
import { Base64 } from 'js-base64';

interface GitFile {
  name: string;
  path: string;
  sha: string;
}

interface GitContent {
  content: string;
  sha: string;
}

interface GitCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export class GitOperations {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  async listFiles(path: string): Promise<GitFile[]> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Path does not point to a directory');
      }

      return response.data.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async getFile(path: string): Promise<GitContent> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if (Array.isArray(response.data) || response.data.type !== 'file') {
        throw new Error('Path does not point to a file');
      }

      if (!response.data.content) {
        throw new Error('File content is empty');
      }

      return {
        content: Base64.decode(response.data.content),
        sha: response.data.sha
      };
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }

  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<{ sha: string }> {
    try {
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Base64.encode(content),
        sha,
      });

      if (!response.data.content?.sha) {
        throw new Error('Failed to get SHA from response');
      }

      return { sha: response.data.content.sha };
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw error;
    }
  }

  async getCommitHistory(path: string): Promise<GitCommit[]> {
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        date: commit.commit.author?.date ?? '',
        author: commit.commit.author?.name ?? 'Unknown',
      }));
    } catch (error) {
      console.error('Error getting commit history:', error);
      throw error;
    }
  }
} 