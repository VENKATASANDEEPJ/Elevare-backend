let unauthorizedHandler: ((message?: string) => void) | null = null;

export const registerUnauthorizedHandler = (
  handler: ((message?: string) => void) | null
) => {
  unauthorizedHandler = handler;
};

export const notifyUnauthorized = (message?: string) => {
  if (unauthorizedHandler) {
    unauthorizedHandler(message);
  }
};
