import { create } from 'zustand';

export type Role = 'user' | 'ai' | 'system';

export interface MessageNode {
  id: string;
  role: Role;
  content: string;
  parentId: string | null;
  childrenIds: string[];
  status: 'thinking' | 'typing' | 'done' | 'error';
}

export interface Chat {
  id: string;
  title: string;
  folderId: string | null;
  messages: Record<string, MessageNode>;
  currentLeafId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

// --- NOU: Adăugăm interfața pentru panoul de lucru (Artifact) ---
export interface Artifact {
  title: string;
  content: string;
  language: string;
}

interface ChatState {
  // --- AUTH STATE ---
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // --- WORKSPACE (ARTIFACT) STATE ---
  activeArtifact: Artifact | null;
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: () => void;
  updateArtifactContent: (newContent: string) => void;

  // --- CHAT STATE ---
  chats: Record<string, Chat>;
  folders: Record<string, Folder>;
  activeChatId: string | null;

  setActiveChat: (chatId: string) => void;
  createFolder: (name: string) => void;
  createChat: (folderId?: string | null) => string;
  addMessage: (chatId: string, content: string, role: Role, parentId: string | null) => string;
  updateMessageStatus: (chatId: string, messageId: string, status: MessageNode['status']) => void;
  updateMessageContent: (chatId: string, messageId: string, newContent: string) => void;
  switchToBranch: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Implementare Auth
  isAuthenticated: false,
  user: null,
  login: (username, password) => {
    if (username === 'admin' && password === 'admin') {
      set({ isAuthenticated: true, user: { username: 'admin' } });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, user: null }),

  // --- NOU: Implementare Workspace ---
  activeArtifact: null,
  openArtifact: (artifact) => set({ activeArtifact: artifact }),
  closeArtifact: () => set({ activeArtifact: null }),
  updateArtifactContent: (newContent) => set((state) => ({
    activeArtifact: state.activeArtifact ? { ...state.activeArtifact, content: newContent } : null
  })),

  // Implementare Chat
  chats: {},
  folders: {
    'folder-1': { id: 'folder-1', name: 'Facultate - Proiecte' },
    'folder-2': { id: 'folder-2', name: 'Învățare AI' }
  },
  activeChatId: null,

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  createFolder: (name) => {
    const id = crypto.randomUUID();
    set((state) => ({
      folders: { ...state.folders, [id]: { id, name } }
    }));
  },

  createChat: (folderId = null) => {
    const id = crypto.randomUUID();
    const newChat: Chat = {
      id,
      title: 'Conversație nouă',
      folderId,
      messages: {},
      currentLeafId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      chats: { ...state.chats, [id]: newChat },
      activeChatId: id,
    }));
    return id;
  },

  addMessage: (chatId, content, role, parentId) => {
    const messageId = crypto.randomUUID();
    const newMessage: MessageNode = {
      id: messageId,
      role,
      content,
      parentId,
      childrenIds: [],
      status: role === 'ai' ? 'thinking' : 'done',
    };

    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;

      const updatedMessages = { ...chat.messages, [messageId]: newMessage };

      if (parentId && updatedMessages[parentId]) {
        updatedMessages[parentId] = {
          ...updatedMessages[parentId],
          childrenIds: [...updatedMessages[parentId].childrenIds, messageId]
        };
      }

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: updatedMessages,
            currentLeafId: messageId,
            updatedAt: Date.now(),
          }
        }
      };
    });

    return messageId;
  },

  updateMessageStatus: (chatId, messageId, status) => {
    set((state) => {
      const chat = state.chats[chatId];
      if (!chat || !chat.messages[messageId]) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: {
              ...chat.messages,
              [messageId]: { ...chat.messages[messageId], status }
            }
          }
        }
      };
    });
  },

  updateMessageContent: (chatId, messageId, newContent) => {
    set((state) => {
      const chat = state.chats[chatId];
      if (!chat || !chat.messages[messageId]) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: {
              ...chat.messages,
              [messageId]: { ...chat.messages[messageId], content: newContent }
            }
          }
        }
      };
    });
  },

  switchToBranch: (chatId, messageId) => {
    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;
      return {
        chats: {
          ...state.chats,
          [chatId]: { ...chat, currentLeafId: messageId }
        }
      };
    });
  }
}));