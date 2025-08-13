import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public isLoading$ = this.loadingSubject.asObservable() || false;

  constructor() { }

  /**
   * Hide the initial loading screen
   */
  hideInitialLoading(): void {
    // Add a minimum loading time to show the loading screen
    setTimeout(() => {
      const loadingElement = document.getElementById('initial-loader');
      if (loadingElement) {
        loadingElement.style.opacity = '0';
        loadingElement.style.transition = 'opacity 0.5s ease';
        // Remove the element after animation completes
        setTimeout(() => {
          if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
          }
        }, 500);
      }
      this.setLoading(false);
    }, 5000); // Show loading for at least 5 seconds to showcase the beautiful loading screen
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Show loading
   */
  show(): void {
    this.setLoading(true);
  }

  /**
   * Hide loading
   */
  hide(): void {
    this.setLoading(false);
  }
}
