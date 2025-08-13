import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ToastrModule } from 'ngx-toastr';

import { routes } from './app.routes';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { rateLimitInterceptor } from './shared/interceptors/rate-limit.interceptor';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { GlobalErrorHandlerService } from './shared/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor, rateLimitInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 5000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        progressAnimation: 'increasing',
        closeButton: true,
        enableHtml: true,
        tapToDismiss: true,
        onActivateTick: true,
        maxOpened: 5,
        autoDismiss: true,
        newestOnTop: true,
        iconClasses: {
          error: 'toast-error',
          info: 'toast-info',
          success: 'toast-success',
          warning: 'toast-warning',
        },
      })
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
  ]
};

