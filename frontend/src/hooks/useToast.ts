import { createContext, useContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

export const defaultToastContext: ToastContextType = {
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  dismissToast: () => {},
};

export const ToastContext = createContext<ToastContextType>(defaultToastContext);

export const useToast = (): ToastContextType => {
  return useContext(ToastContext);
};
