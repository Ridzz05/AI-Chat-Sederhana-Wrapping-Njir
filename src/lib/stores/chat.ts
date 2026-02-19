import { writable } from 'svelte/store';

export type ChatSession = {
	id: string;
	title: string;
	createdAt: number;
};

// Available AI models
export const MODELS = [
	{ id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
	{ id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'google' },
	{ id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
	{ id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
	{ id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
	{ id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' }
] as const;

export const selectedModel = writable<string>('gemini-2.0-flash');
export const sidebarOpen = writable<boolean>(false);
export const darkMode = writable<boolean>(true);

// Chat sessions stored in localStorage
export const chatSessions = writable<ChatSession[]>([]);
export const activeChatId = writable<string | null>(null);

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
