"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import ConfirmModal from "./ConfirmModal";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  showInput?: boolean;
  inputPlaceholder?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<string | boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within a ConfirmProvider");
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "", message: "" });
  const [resolveCallback, setResolveCallback] = useState<((value: string | boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<string | boolean>((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = (inputValue?: string) => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(inputValue ?? true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        showInput={options.showInput}
        inputPlaceholder={options.inputPlaceholder}
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};
