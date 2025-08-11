import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const retryAttempts = 3;
  const retryDelay = 2000; // 2 seconds

  return next(req).pipe(
    retry({
      count: retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on 429 (Too Many Requests) or 5xx server errors
        if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
          const delayTime = retryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
          console.log(`Retrying request in ${delayTime}ms... (attempt ${retryCount}/${retryAttempts})`);
          return timer(delayTime);
        }
        // Don't retry for other errors
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        console.warn('Rate limit exceeded. Please slow down your requests.');

        // Extract retry-after header if present
        const retryAfter = error.headers.get('Retry-After');
        if (retryAfter) {
          const retryAfterSeconds = parseInt(retryAfter, 10);
          console.log(`Server suggests retrying after ${retryAfterSeconds} seconds`);
        }
      }

      return throwError(() => error);
    })
  );
};
