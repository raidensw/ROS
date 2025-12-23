import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { AppId } from '../types';
import { fileSystem } from './fileSystemService';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Tool Definitions ---

const openAppTool: FunctionDeclaration = {
  name: 'openApp',
  description: 'Opens an application on the OS.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      appId: {
        type: Type.STRING,
        description: 'The ID of the app to open. Available: terminal, notepad, explorer, settings, monitor, media, browser, code',
        enum: Object.values(AppId),
      },
      filePath: {
          type: Type.STRING,
          description: 'Optional file path to open in the app (e.g., /home/user/doc.txt)'
      }
    },
    required: ['appId'],
  },
};

const closeAppTool: FunctionDeclaration = {
  name: 'closeApp',
  description: 'Closes the currently active window or a specific app.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      target: {
        type: Type.STRING,
        description: 'Either "active" or the app ID.',
      },
    },
  },
};

const changeWallpaperTool: FunctionDeclaration = {
  name: 'changeWallpaper',
  description: 'Changes the desktop wallpaper to a random scenic image.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// File System Tools for AI

const listFilesTool: FunctionDeclaration = {
    name: 'listFiles',
    description: 'Lists files in a specific directory.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            path: { type: Type.STRING, description: 'The directory path to list.' }
        },
        required: ['path']
    }
};

const readFileTool: FunctionDeclaration = {
    name: 'readFile',
    description: 'Reads the content of a file.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            path: { type: Type.STRING, description: 'The file path to read.' }
        },
        required: ['path']
    }
};

const writeFileTool: FunctionDeclaration = {
    name: 'writeFile',
    description: 'Writes content to a file. Overwrites if exists. Creates if missing.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            path: { type: Type.STRING, description: 'The file path.' },
            content: { type: Type.STRING, description: 'The content to write.' }
        },
        required: ['path', 'content']
    }
};

const tools: Tool[] = [
  {
    functionDeclarations: [
        openAppTool, 
        closeAppTool, 
        changeWallpaperTool,
        listFilesTool,
        readFileTool,
        writeFileTool
    ],
  },
];

// --- Service Logic ---

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are ROS Assistant, the integrated AI brain of this web-based operating system. 
      You are helpful, concise, and act like a sophisticated futuristic terminal interface.
      
      You have FULL CONTROL over the virtual file system. 
      If a user asks you to "create a python script" or "make a website", you should use the 'writeFile' tool to actually create the file in the OS.
      
      Common paths:
      - /home/user/documents
      - /home/user/projects
      
      You can also open apps. If you write code for the user, open it in the 'code' app (Code Studio) so they can run it.
      If you write HTML, tell them to open it in the Browser.
      
      Always respond in a technical but friendly manner.`,
      tools: tools,
    },
  });
};

export const performFileSystemAction = (name: string, args: any) => {
    try {
        switch(name) {
            case 'listFiles':
                return { files: fileSystem.readDir(args.path) };
            case 'readFile':
                return { content: fileSystem.readFile(args.path) };
            case 'writeFile':
                const success = fileSystem.writeFile(args.path, args.content);
                return { success, message: success ? 'File written successfully' : 'Failed to write file' };
            default:
                return { error: 'Unknown tool' };
        }
    } catch (e) {
        return { error: 'FileSystem Error' };
    }
}