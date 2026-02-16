import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toasts$ = new BehaviorSubject<Toast[]>([]);

  get toasts() {
    return this.toasts$.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
    const toast: Toast = { id: ++this.counter, message, type };
    this.toasts$.next([...this.toasts$.value, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  dismiss(id: number) {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }
}
