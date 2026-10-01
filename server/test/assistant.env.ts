// Settings for assistant.test.ts; imported before helpers so the app sees them.
// The provider URL is never really called: the test replaces fetch for it.
process.env.AI_API_KEY = 'test-key';
process.env.AI_BASE_URL = 'https://ai.test/v1';
process.env.AI_MODEL = 'test-model';

export {};
