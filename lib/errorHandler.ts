// lib/errorHandler.ts
export function handleError(error: unknown, context?: string): string {
  let userMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
  if (error && typeof error === 'object' && 'response' in error) {
    // @ts-ignore
    userMessage = error.response?.data?.message || userMessage;
  }
  if (process.env.NODE_ENV !== 'production') {
    // Log detallado para el desarrollador
    console.error(`[${context || 'Error'}]`, error);
  }
  return userMessage;
}
