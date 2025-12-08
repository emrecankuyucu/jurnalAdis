import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-surface border border-secondary rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 text-center">
                            <div className={clsx(
                                "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4",
                                variant === 'danger' && "bg-danger/10 text-danger",
                                variant === 'primary' && "bg-primary/10 text-primary",
                                variant === 'success' && "bg-success/10 text-success"
                            )}>
                                {variant === 'danger' && <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />}
                                {variant === 'primary' && <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8" />}
                                {variant === 'success' && <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h2>
                            <p className="text-sm sm:text-base text-text-muted mb-6 sm:mb-8">{message}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-secondary/50 text-white font-bold rounded-xl hover:bg-secondary transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={clsx(
                                        "flex-1 py-2 sm:py-3 text-sm sm:text-base font-bold rounded-xl transition-colors text-white",
                                        variant === 'danger' && "bg-danger hover:bg-danger/90",
                                        variant === 'primary' && "bg-primary text-surface hover:bg-primary-hover",
                                        variant === 'success' && "bg-success hover:bg-success/90"
                                    )}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
