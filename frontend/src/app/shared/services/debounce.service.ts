import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DebounceService {
  private subjects = new Map<string, Subject<any>>();

  /**
   * Create a debounced observable for a specific key
   */
  createDebouncedObservable<T>(
    key: string,
    debounceMs: number = 500,
    filterEmpty: boolean = true
  ): { input$: Subject<T>; output$: Observable<T> } {

    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<T>());
    }

    const input$ = this.subjects.get(key) as Subject<T>;

    let output$ = input$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged()
    );

    if (filterEmpty) {
      output$ = output$.pipe(
        filter((value: T) => {
          if (typeof value === 'string') {
            return value.trim().length > 0;
          }
          return value != null && value !== undefined;
        })
      );
    }

    return { input$, output$: output$ };
  }

  /**
   * Emit a value to a debounced observable
   */
  emit<T>(key: string, value: T): void {
    const subject = this.subjects.get(key);
    if (subject) {
      subject.next(value);
    }
  }

  /**
   * Complete and remove a debounced observable
   */
  complete(key: string): void {
    const subject = this.subjects.get(key);
    if (subject) {
      subject.complete();
      this.subjects.delete(key);
    }
  }

  /**
   * Clear all debounced observables
   */
  clearAll(): void {
    this.subjects.forEach(subject => subject.complete());
    this.subjects.clear();
  }

  /**
   * Create a search debouncer specifically for search inputs
   */
  createSearchDebouncer<T>(
    searchFn: (query: string) => Observable<T>,
    debounceMs: number = 300
  ): { search$: Subject<string>; results$: Observable<T> } {
    const search$ = new Subject<string>();

    const results$ = search$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      filter(query => query.trim().length >= 2), // Minimum 2 characters
      switchMap(query => searchFn(query))
    );

    return { search$, results$ };
  }

  /**
   * Create a form field debouncer
   */
  createFormFieldDebouncer(
    fieldName: string,
    debounceMs: number = 500
  ): { value$: BehaviorSubject<string>; debounced$: Observable<string> } {
    const value$ = new BehaviorSubject<string>('');

    const debounced$ = value$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      filter(value => value.trim().length > 0)
    );

    return { value$, debounced$ };
  }
}
