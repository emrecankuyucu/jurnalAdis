import React, { useState } from 'react';
import { X } from 'lucide-react';

interface QuantitySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
    maxQuantity: number;
    title: string;
    productName: string;
}

const QuantitySelectionModal: React.FC<QuantitySelectionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    maxQuantity,
    title,
    productName
}) => {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(quantity);
        setQuantity(1); // Reset
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-secondary rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-secondary flex justify-between items-center bg-secondary/30">
                    <h3 className="font-bold text-white text-lg">{title}</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-text-muted mb-6 text-center">
                        How many <span className="text-white font-bold">{productName}</span> would you like to pay for?
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-white font-bold text-xl transition-colors flex items-center justify-center"
                        >
                            -
                        </button>
                        <div className="w-20 text-center">
                            <span className="text-4xl font-bold text-white">{quantity}</span>
                            <div className="text-xs text-text-muted mt-1">/ {maxQuantity}</div>
                        </div>
                        <button
                            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                            className="w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-white font-bold text-xl transition-colors flex items-center justify-center"
                        >
                            +
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleConfirm}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-surface font-bold rounded-xl transition-colors"
                        >
                            Confirm ({quantity})
                        </button>
                        {maxQuantity > 1 && quantity < maxQuantity && (
                            <button
                                onClick={() => onConfirm(maxQuantity)}
                                className="w-full py-2 bg-secondary/50 hover:bg-secondary text-white font-medium rounded-xl transition-colors text-sm"
                            >
                                Pay All ({maxQuantity})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuantitySelectionModal;
