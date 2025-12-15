import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";
import { cn } from "../../lib/utils";

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
    duration?: number;
}

const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
};

const styles = {
    success: "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900",
    error: "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900",
    info: "border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900"
};

export function Toast({ id, message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div className={cn(
            "flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 border",
            styles[type]
        )} role="alert">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-transparent">
                {icons[type]}
            </div>
            <div className="ml-3 text-sm font-normal text-foreground">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-transparent dark:hover:bg-gray-700"
                onClick={() => onClose(id)}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}
