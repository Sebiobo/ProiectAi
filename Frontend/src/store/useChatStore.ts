import { create } from 'zustand';
import { loginUser } from '../services/authService';
import {
  fetchUserChats,
  fetchChatMessages,
  createBackendChat,
  fetchUserDocuments,
  deleteUserDocument
} from '../services/aiService';

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
  year: string | null;
  subject: string | null;
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

export interface Artifact {
  title: string;
  content: string;
  language: string;
}

interface ChatState {
  // --- AUTH STATE ---
  isAuthenticated: boolean;
  token: string | null;
  user: { email: string; full_name?: string | null } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // --- ACADEMIC CONTEXT STATE ---
  selectedYear: string;
  selectedSubject: string | null;
  setSelectedYear: (year: string) => void;
  setSelectedSubject: (subject: string | null) => void;

  // --- WORKSPACE (ARTIFACT) STATE ---
  activeArtifact: Artifact | null;
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: () => void;
  updateArtifactContent: (newContent: string) => void;

  // --- CHAT STATE ---
  chats: Record<string, Chat>;
  folders: Record<string, Folder>;
  activeChatId: string | null;

  setActiveChat: (chatId: string) => Promise<void>;
  createFolder: (name: string) => void;
  createChat: (folderId?: string | null, year?: string | null, subject?: string | null) => Promise<string>;
  addMessage: (chatId: string, content: string, role: Role, parentId: string | null) => string;
  updateMessageStatus: (chatId: string, messageId: string, status: MessageNode['status']) => void;
  updateMessageContent: (chatId: string, messageId: string, newContent: string) => void;
  switchToBranch: (chatId: string, messageId: string) => void;

  // --- DOCUMENTS STATE ---
  documents: any[];
  fetchDocuments: () => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

// Helpers for tree mapping
const mapMessagesToTree = (backendMsgs: any[]): { messages: Record<string, MessageNode>, currentLeafId: string | null } => {
  const messages: Record<string, MessageNode> = {};
  if (backendMsgs.length === 0) {
    return { messages, currentLeafId: null };
  }
  for (let i = 0; i < backendMsgs.length; i++) {
    const msg = backendMsgs[i];
    const parentId = i > 0 ? String(backendMsgs[i - 1].id) : null;
    const childrenIds = i < backendMsgs.length - 1 ? [String(backendMsgs[i + 1].id)] : [];
    messages[String(msg.id)] = {
      id: String(msg.id),
      role: msg.role as Role,
      content: msg.content,
      parentId,
      childrenIds,
      status: 'done'
    };
  }
  const currentLeafId = String(backendMsgs[backendMsgs.length - 1].id);
  return { messages, currentLeafId };
};

export const useChatStore = create<ChatState>((set, get) => ({
  // --- AUTH ---
  isAuthenticated: false,
  token: null,
  user: null,
  login: async (email, password) => {
    const data = await loginUser({ email, password });
    set({ isAuthenticated: true, token: data.access_token, user: { email } });

    // Load chats and documents on login
    try {
      const backendChats = await fetchUserChats();
      const chatsRecord: Record<string, Chat> = {};
      for (const bc of backendChats) {
        chatsRecord[String(bc.id)] = {
          id: String(bc.id),
          title: bc.title || 'Conversație',
          folderId: null,
          year: null,
          subject: null,
          messages: {},
          currentLeafId: null,
          createdAt: new Date(bc.created_at).getTime(),
          updatedAt: new Date(bc.created_at).getTime(),
        };
      }
      set({ chats: chatsRecord });

      if (backendChats.length > 0) {
        const lastChatId = String(backendChats[0].id);
        set({ activeChatId: lastChatId });
        const msgs = await fetchChatMessages(Number(lastChatId));
        const { messages, currentLeafId } = mapMessagesToTree(msgs);
        set((state) => ({
          chats: {
            ...state.chats,
            [lastChatId]: {
              ...state.chats[lastChatId],
              messages,
              currentLeafId
            }
          }
        }));
      }
    } catch (err) {
      console.error("Eroare la preluarea inițială a chat-urilor:", err);
    }

    try {
      const docs = await fetchUserDocuments();
      set({ documents: docs });
    } catch (err) {
      console.error("Eroare la preluarea inițială a documentelor:", err);
    }
  },
  logout: () => set({ isAuthenticated: false, token: null, user: null, chats: {}, activeChatId: null, documents: [] }),

  // --- ACADEMIC CONTEXT ---
  selectedYear: '1',
  selectedSubject: null,
  setSelectedYear: (year) => set({ selectedYear: year, selectedSubject: null }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),

  // --- WORKSPACE ---
  activeArtifact: null,
  openArtifact: (artifact) => set({ activeArtifact: artifact }),
  closeArtifact: () => set({ activeArtifact: null }),
  updateArtifactContent: (newContent) => set((state) => ({
    activeArtifact: state.activeArtifact ? { ...state.activeArtifact, content: newContent } : null
  })),

  // --- CHAT ---
  chats: {},
  folders: {
    'folder-1': { id: 'folder-1', name: 'Sesiuni Salvo' },
    'folder-2': { id: 'folder-2', name: 'Arhivă' }
  },
  activeChatId: null,

  setActiveChat: async (chatId) => {
    set({ activeChatId: chatId });
    if (chatId) {
      try {
        const msgs = await fetchChatMessages(Number(chatId));
        const { messages, currentLeafId } = mapMessagesToTree(msgs);
        set((state) => ({
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              messages,
              currentLeafId
            }
          }
        }));
      } catch (err) {
        console.error("Eroare la preluarea mesajelor chat-ului:", err);
      }
    }
  },

  createFolder: (name) => {
    const id = crypto.randomUUID();
    set((state) => ({
      folders: { ...state.folders, [id]: { id, name } }
    }));
  },

  createChat: async (folderId = null, year = null, subject = null) => {
    const title = subject ? `${subject} - Anul ${year}` : "Conversație Nouă";
    try {
      const newBc = await createBackendChat(title, null);
      const newChatId = String(newBc.id);
      const newChat: Chat = {
        id: newChatId,
        title: newBc.title,
        folderId,
        year,
        subject,
        messages: {},
        currentLeafId: null,
        createdAt: new Date(newBc.created_at).getTime(),
        updatedAt: new Date(newBc.created_at).getTime(),
      };

      set((state) => ({
        chats: { ...state.chats, [newChatId]: newChat },
        activeChatId: newChatId,
      }));
      return newChatId;
    } catch (err) {
      console.error("Eroare la crearea chat-ului pe backend:", err);
      // Fallback local în caz de eroare de rețea
      const id = crypto.randomUUID();
      const newChat: Chat = {
        id,
        title,
        folderId,
        year,
        subject,
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
    }
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
  },

  // --- DOCUMENTS ---
  documents: [],
  fetchDocuments: async () => {
    if (!get().isAuthenticated) return;
    try {
      const docs = await fetchUserDocuments();
      set({ documents: docs });
    } catch (err) {
      console.error("Eroare la preluarea documentelor:", err);
    }
  },
  deleteDocument: async (id) => {
    try {
      await deleteUserDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
    } catch (err) {
      console.error("Eroare la ștergerea documentului:", err);
    }
  }
}));