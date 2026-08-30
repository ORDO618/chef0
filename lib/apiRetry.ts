/**
 * Robust fetch wrapper with automatic retry, timeout, exponential backoff,
 * and user-friendly error normalization for Gemini API calls.
 */

export interface RetryFetchOptions extends RequestInit {
  maxRetries?: number;
  timeoutMs?: number;
  initialDelayMs?: number;
}

export class ApiError extends Error {
  status?: number;
  userMessage: string;

  constructor(message: string, userMessage: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.userMessage = userMessage;
    this.status = status;
  }
}

export async function fetchWithRetry(
  url: string,
  options: RetryFetchOptions = {}
): Promise<Response> {
  const {
    maxRetries = 2,
    timeoutMs = 30000,
    initialDelayMs = 800,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timerId);

      // If server responded with 5xx or rate limit 429, retry
      if ((response.status >= 500 || response.status === 429) && attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        let errMessage = 'İşlem sırasında bir hata oluştu.';
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch { /* empty */ }

        if (response.status === 429) {
          throw new ApiError(
            `Rate limit: ${response.status}`,
            'Yapay zeka çok yoğun veya kota aşıldı, lütfen biraz bekleyip tekrar deneyin.',
            response.status
          );
        }

        if (response.status === 400) {
          throw new ApiError(`Bad Request: ${errMessage}`, errMessage, 400);
        }

        throw new ApiError(
          `Server Error: ${response.status} - ${errMessage}`,
          'Sunucu geçici olarak yanıt veremedi, lütfen tekrar deneyin.',
          response.status
        );
      }

      return response;
    } catch (err: any) {
      clearTimeout(timerId);

      if (err.name === 'AbortError') {
        if (attempt < maxRetries) {
          attempt++;
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
          continue;
        }
        throw new ApiError(
          'Request timed out',
          'Bağlantı zaman aşımına uğradı. İnternet bağlantınızı kontrol edip tekrar deneyin.'
        );
      }

      if (err instanceof ApiError) {
        throw err;
      }

      // Network errors (fetch failed)
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }

      throw new ApiError(
        err?.message || 'Network error',
        'İnternet bağlantısı kurulamadı veya sunucuya ulaşılamıyor.'
      );
    }
  }

  throw new ApiError('Max retries exceeded', 'İşlem gerçekleştirilemedi, lütfen tekrar deneyin.');
}
