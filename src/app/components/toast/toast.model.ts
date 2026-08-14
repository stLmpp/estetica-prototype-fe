export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}
