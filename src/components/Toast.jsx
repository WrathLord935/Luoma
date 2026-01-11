import { useEffect } from 'react';
import { X, CheckCircle2, AlertOctagon } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="toast-container">
            <div className={`toast ${type}`}>
                <div className="toast-icon">
                    {type === 'success' ? (
                        <CheckCircle2 size={24} strokeWidth={3} />
                    ) : (
                        <AlertOctagon size={24} strokeWidth={3} />
                    )}
                </div>
                <div className="toast-content">
                    <div className="toast-title">
                        {type === 'success' ? 'SYSTEM UPDATE' : 'SYSTEM ERROR'}
                    </div>
                    <div className="toast-message">{message}</div>
                </div>
                <button className="toast-close" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
