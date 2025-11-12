/**
 * Utility functions for AI operations
 */

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  context: string = 'Operation'
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        throw error;
      }
      
      // Check if it's the last attempt
      if (attempt === maxRetries - 1) {
        console.error(`${context} failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`${context} attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error.message);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error(`${context} failed after ${maxRetries} attempts`);
}

/**
 * Validate that AI output is not empty and has required fields
 */
export function validateAIOutput<T extends Record<string, any>>(
  output: T | null | undefined,
  requiredFields: (keyof T)[],
  context: string = 'AI Output'
): T {
  if (!output) {
    throw new Error(`${context}: Output is null or undefined`);
  }
  
  for (const field of requiredFields) {
    if (output[field] === undefined || output[field] === null) {
      throw new Error(`${context}: Missing required field '${String(field)}'`);
    }
  }
  
  return output;
}

/**
 * Sanitize and validate URLs from AI
 */
export function sanitizeUrls(urls: string[] | undefined): string[] {
  if (!urls || !Array.isArray(urls)) {
    return [];
  }
  
  return urls
    .filter(url => {
      if (typeof url !== 'string') return false;
      try {
        // Check if it's a valid URL or a search term
        if (url.startsWith('http://') || url.startsWith('https://')) {
          new URL(url);
          return true;
        }
        // Allow search terms (non-URLs)
        return url.length > 0 && url.length < 200;
      } catch {
        return false;
      }
    })
    .slice(0, 5); // Limit to 5 resources
}

/**
 * Sanitize text output from AI
 */
export function sanitizeText(text: string | undefined, maxLength: number = 1000): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove excessive whitespace and limit length
  return text.trim().slice(0, maxLength);
}

/**
 * Check if error is a quota/rate limit error
 */
export function isQuotaError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  return (
    errorMessage.includes('429') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('Quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('overloaded')
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any, defaultMessage: string = 'Ocorreu um erro inesperado'): string {
  if (isQuotaError(error)) {
    return 'Limite de uso da IA atingido. Tente novamente em alguns minutos.';
  }
  
  if (error?.message?.includes('503')) {
    return 'O serviço de IA está temporariamente indisponível. Tente novamente.';
  }
  
  if (error?.message?.includes('404')) {
    return 'Modelo de IA não encontrado. Verifique a configuração.';
  }
  
  if (error?.message?.includes('FAILED_PRECONDITION')) {
    return 'Configuração de API inválida. Verifique as credenciais.';
  }
  
  return defaultMessage;
}

/**
 * Debounce function for frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a simple in-memory cache with TTL
 */
export class SimpleCache<T> {
  private cache: Map<string, { value: T; expires: number }> = new Map();
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 24 * 60 * 60 * 1000) { // 24 hours default
    this.defaultTTL = defaultTTL;
  }
  
  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expires });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Queue for sequential execution of async operations
 */
export class AsyncQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing: boolean = false;
  
  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('Queue operation failed:', error);
        }
      }
    }
    
    this.processing = false;
  }
  
  get length(): number {
    return this.queue.length;
  }
  
  get isProcessing(): boolean {
    return this.processing;
  }
}
