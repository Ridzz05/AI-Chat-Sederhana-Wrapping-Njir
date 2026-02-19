import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

const google = createGoogleGenerativeAI({
	apiKey: GOOGLE_GENERATIVE_AI_API_KEY
});

const openai = createOpenAI({
	apiKey: OPENAI_API_KEY
});

const MODEL_MAP: Record<string, () => ReturnType<typeof google | typeof openai>> = {
	'gemini-2.0-flash': () => google('gemini-2.0-flash'),
	'gemini-2.0-flash-lite': () => google('gemini-2.0-flash-lite'),
	'gemini-1.5-pro': () => google('gemini-1.5-pro'),
	'gpt-4o': () => openai('gpt-4o'),
	'gpt-4o-mini': () => openai('gpt-4o-mini'),
	'gpt-3.5-turbo': () => openai('gpt-3.5-turbo')
};

export const POST: RequestHandler = async ({ request }) => {
	const { messages, model: modelId } = (await request.json()) as {
		messages: UIMessage[];
		model: string;
	};

	console.log('API keys loaded:', {
		google: !!GOOGLE_GENERATIVE_AI_API_KEY,
		openai: !!OPENAI_API_KEY
	});
	console.log('Request model:', modelId);

	const selectedModel = modelId && MODEL_MAP[modelId] ? modelId : 'gemini-2.0-flash';

	const result = streamText({
		model: MODEL_MAP[selectedModel](),
		messages: await convertToModelMessages(messages),
		system: `You are AI ChatKu, a helpful and friendly AI assistant. You can answer questions, help with tasks, write code, and have natural conversations. Always respond in the same language the user uses. Format your responses using Markdown when appropriate.`
	});

	return result.toUIMessageStreamResponse();
};
