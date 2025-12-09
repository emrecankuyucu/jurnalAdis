import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Gift, Minus, Plus } from 'lucide-react';
import { type Product } from '../../db/db';

interface ProductActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onAdd: (type: 'paid' | 'complimentary', quantity: number) => void;
}

const ProductActionModal: React.FC<ProductActionModalProps> = ({
    isOpen,
    onClose,
    product,
    onAdd
}) => {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
        }
    }, [isOpen]);

    if (!product) return null;

    const handleIncrement = () => {
        if (product.isUnlimited || (product.stock && quantity < product.stock)) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white">{product.name}</h2>
                                <p className="text-primary font-bold text-sm sm:text-base">{Math.floor(product.price)} TL</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary rounded-lg text-text-muted hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <button
                                    onClick={handleDecrement}
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary hover:bg-primary hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <div className="w-16 sm:w-20 text-center font-bold text-2xl sm:text-3xl text-white">
                                    {quantity}
                                </div>
                                <button
                                    onClick={handleIncrement}
                                    disabled={!product.isUnlimited && quantity >= (product.stock || 0)}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary hover:bg-primary hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    onAdd('paid', quantity);
                                    onClose();
                                }}
                                className="w-full py-3 sm:py-4 bg-surface border border-secondary hover:border-primary hover:bg-secondary/50 rounded-xl transition-all flex items-center justify-between px-4 sm:px-6 group"
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-base sm:text-lg">Add Paid</div>
                                        <div className="text-text-muted text-xs sm:text-sm">Regular price</div>
                                    </div>
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-primary">
                                    {Math.floor(product.price * quantity)} TL
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    onAdd('complimentary', quantity);
                                    onClose();
                                }}
                                className="w-full py-3 sm:py-4 bg-surface border border-secondary hover:border-success hover:bg-success/10 rounded-xl transition-all flex items-center justify-between px-4 sm:px-6 group"
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                        <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-base sm:text-lg">Add Complimentary</div>
                                        <div className="text-text-muted text-xs sm:text-sm">Price will be 0 TL</div>
                                    </div>
                                </div>
                                <div className="text-lg sm:text-xl font-bold text-success">
                                    İkram
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductActionModal;
