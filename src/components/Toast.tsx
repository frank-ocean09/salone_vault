import { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'success', isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const bgColors = {
        success: 'bg-gray-900',
        error: 'bg-red-600',
        info: 'bg-blue-600',
    };

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-400" />,
        error: <AlertCircle className="h-5 w-5 text-white" />,
        info: <Info className="h-5 w-5 text-white" />,
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl ${bgColors[type]} text-white min-w-[300px] max-w-md`}
                >
                    {icons[type]}
                    <span className="font-medium text-sm flex-1 text-center">{message}</span>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
