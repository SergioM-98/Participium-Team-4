export function extractAuthTokenFromStartCommand(
  messageText: string
): string | null {
  const parts = messageText.trim().split(" ");
  return parts.length > 1 ? parts[1] : null;
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export async function callTelegramApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL environment variable is not set");
  }

  return fetchJson<T>(`${backendUrl}${endpoint}`, options);
}

export function formatWelcomeMessage(username: string): string {
  return (
    `Account connected successfully!\n\n` +
    `Welcome ${username}!\n\n` +
    `Your Telegram account is now linked to Participium.\n`
  );
}

export function formatWelcomeBackMessage(username: string): string {
  return (
    `Welcome back ${username}! \n\n` +
    `Your Telegram account is already linked to Participium.\n\n` +
    `Use /newreport to create a new report or /help for more information.`
  );
}

export function formatAuthErrorMessage(reason: string): string {
  return `Authentication error:\n\n` + `${reason}\n\n`;
}

export function formatAuthInstructionsMessage(): string {
  return (
    `Welcome to Participium!\n\n` +
    `To link your Telegram account, follow these steps:\n\n` +
    `1. Log in to the Participium website\n` +
    `2. Go to the profile section\n` +
    `3. Click on "Link Telegram"\n` +
    `4. Click the link shown to you\n\n` +
    `You will be automatically redirected to Telegram to complete the authentication.`
  );
}

export const TELEGRAM_API = {
  IS_AUTHENTICATED: "/api/telegram/isAuthenticated",
  REGISTER: "/api/telegram/registration",
  SEND_REPORT: "/api/telegram/reports",
};
