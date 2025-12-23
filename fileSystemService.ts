import { FileSystemNode } from '../types';

// Initial File System State
const initialFS: Record<string, FileSystemNode> = {
  root: {
    id: 'root',
    name: 'root',
    type: 'folder',
    children: {
      'home': {
        id: 'home',
        name: 'home',
        type: 'folder',
        parentId: 'root',
        children: {
          'user': {
            id: 'user',
            name: 'user',
            type: 'folder',
            parentId: 'home',
            children: {
              'documents': {
                id: 'docs',
                name: 'documents',
                type: 'folder',
                parentId: 'user',
                children: {
                    'hello.txt': { id: 'f1', name: 'hello.txt', type: 'file', parentId: 'docs', content: 'Welcome to GeminiOS!' }
                }
              },
              'projects': {
                 id: 'projects',
                 name: 'projects',
                 type: 'folder',
                 parentId: 'user',
                 children: {
                     'test.js': { id: 'f2', name: 'test.js', type: 'file', parentId: 'projects', content: 'console.log("Hello from the Virtual Machine!");\nalert("Code Execution Successful");' }
                 }
              }
            }
          }
        }
      },
      'bin': {
          id: 'bin',
          name: 'bin',
          type: 'folder',
          parentId: 'root',
          children: {}
      }
    }
  }
};

class FileSystem {
  private fs: Record<string, FileSystemNode>;

  constructor() {
    // Try to load from local storage or use initial
    const saved = localStorage.getItem('gemini_os_fs');
    this.fs = saved ? JSON.parse(saved) : initialFS;
  }

  private save() {
    localStorage.setItem('gemini_os_fs', JSON.stringify(this.fs));
  }

  // Helper to traverse path: "/home/user" -> Node
  public resolvePath(path: string): FileSystemNode | null {
    if (path === '/') return this.fs.root;
    
    const parts = path.split('/').filter(p => p);
    let current = this.fs.root;

    for (const part of parts) {
      if (current.type !== 'folder' || !current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    return current;
  }

  public readDir(path: string): string[] {
    const node = this.resolvePath(path);
    if (!node || node.type !== 'folder' || !node.children) return [];
    return Object.keys(node.children);
  }

  public readFile(path: string): string | null {
    const node = this.resolvePath(path);
    if (!node || node.type !== 'file') return null;
    return node.content || '';
  }

  public writeFile(path: string, content: string): boolean {
    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop();
    const dirPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    
    if (!fileName) return false;

    const dirNode = this.resolvePath(dirPath);
    if (!dirNode || dirNode.type !== 'folder') return false;

    if (!dirNode.children) dirNode.children = {};
    
    // Update or Create
    dirNode.children[fileName] = {
      id: dirNode.children[fileName]?.id || Date.now().toString(),
      name: fileName,
      type: 'file',
      parentId: dirNode.id,
      content
    };
    
    this.save();
    return true;
  }

  public makeDir(path: string): boolean {
    const parts = path.split('/').filter(p => p);
    const dirName = parts.pop();
    const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    
    if (!dirName) return false;

    const parentNode = this.resolvePath(parentPath);
    if (!parentNode || parentNode.type !== 'folder') return false;

    if (!parentNode.children) parentNode.children = {};
    if (parentNode.children[dirName]) return false; // Already exists

    parentNode.children[dirName] = {
      id: Date.now().toString(),
      name: dirName,
      type: 'folder',
      parentId: parentNode.id,
      children: {}
    };

    this.save();
    return true;
  }

  public delete(path: string): boolean {
      const parts = path.split('/').filter(p => p);
      const name = parts.pop();
      const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');

      if (!name) return false;
      
      const parentNode = this.resolvePath(parentPath);
      if (!parentNode || parentNode.type !== 'folder' || !parentNode.children) return false;

      if (parentNode.children[name]) {
          delete parentNode.children[name];
          this.save();
          return true;
      }
      return false;
  }

  // --- Import/Export for Sharing ---

  public exportSystem(): string {
      return JSON.stringify(this.fs, null, 2);
  }

  public importSystem(jsonString: string): boolean {
      try {
          const parsed = JSON.parse(jsonString);
          if (parsed.root && parsed.root.id === 'root') {
              this.fs = parsed;
              this.save();
              return true;
          }
          return false;
      } catch (e) {
          console.error("Import failed", e);
          return false;
      }
  }

  public resetSystem() {
      this.fs = initialFS;
      this.save();
  }
}

export const fileSystem = new FileSystem();
