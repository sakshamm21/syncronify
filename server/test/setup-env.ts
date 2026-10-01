// Imported first by every test (through helpers.ts), before any app module
// reads the environment. Test files that need extra settings set them in their
// own *.env.ts module and import it before helpers.
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = '';
process.env.CLIENT_URL ??= 'http://localhost:3000';
// The assistant is tested against a fake provider, never a real one.
process.env.AI_API_KEY ??= '';

export {};
