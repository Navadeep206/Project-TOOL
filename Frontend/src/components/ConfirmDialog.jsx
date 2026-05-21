import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Execute', cancelText = 'Abort', type = 'info' }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    border: 'border-red-900',
                    glow: 'shadow-[0_0_20px_rgba(153,27,27,0.2)]',
                    button: 'bg-red-600 hover:bg-red-500 text-white',
                    icon: 'text-red-500'
                };
            case 'warning':
                return {
                    border: 'border-amber-900',
                    glow: 'shadow-[0_0_20px_rgba(146,64,14,0.2)]',
                    button: 'bg-amber-600 hover:bg-amber-500 text-black',
                    icon: 'text-amber-500'
                };
            default:
                return {
                    border: 'border-blue-900',
                    glow: 'shadow-[0_0_20px_rgba(30,58,138,0.2)]',
                    button: 'bg-blue-600 hover:bg-blue-500 text-white',
                    icon: 'text-blue-500'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md bg-zinc-950 border ${styles.border} ${styles.glow} rounded-sm overflow-hidden animate-in zoom-in-95 duration-200`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${styles.icon} bg-current`}></span>
                        <h3 className="text-sm font-mono text-zinc-100 uppercase tracking-widest">{title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm font-sans mb-8 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 font-mono text-xs uppercase tracking-widest transition-all rounded-sm"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-2 ${styles.button} font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
                {/* Visual accent line at bottom */}
                <div className={`h-1 w-full opacity-50 ${styles.button.split(' ')[0]}`}></div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
