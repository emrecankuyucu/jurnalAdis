import React, { useState, useEffect } from 'react';
import { X, Check, Infinity } from 'lucide-react';
import { type Product } from '../../db/db';

interface StockEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSave: (amount: number, isUnlimited: boolean, reason: string) => Promise<void>;
}

const StockEditModal: React.FC<StockEditModalProps> = ({ isOpen, onClose, product, onSave }) => {
    const [stock, setStock] = useState<number>(0);
    const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
    const [reason, setReason] = useState<string>('');
    const [mode, setMode] = useState<'add' | 'set'>('add'); // Add to existing or Set new total

    useEffect(() => {
        if (isOpen && product) {
            setStock(0); // Default to adding 0
            setIsUnlimited(product.isUnlimited || false);
            setReason('Stok güncelleme');
            setMode('add');
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // If mode is 'set', we calculate the difference
        let changeAmount = stock;
        if (mode === 'set') {
            changeAmount = stock - (product.stock || 0);
        }

        await onSave(changeAmount, isUnlimited, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-secondary rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-secondary flex items-center justify-between bg-secondary/30">
                    <h2 className="text-xl font-bold text-white">Edit Stock: {product.name}</h2>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Unlimited Toggle */}
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-secondary/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                <Infinity className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Unlimited Stock</h3>
                                <p className="text-sm text-text-muted">Disable stock tracking</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isUnlimited}
                                onChange={(e) => setIsUnlimited(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-secondary/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {!isUnlimited && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMode('add')}
                                    className={`p-2 text-sm font-medium rounded-lg border ${mode === 'add' ? 'bg-primary text-surface border-primary' : 'bg-transparent text-text-muted border-secondary'}`}
                                >
                                    Add Stock
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('set')}
                                    className={`p-2 text-sm font-medium rounded-lg border ${mode === 'set' ? 'bg-primary text-surface border-primary' : 'bg-transparent text-text-muted border-secondary'}`}
                                >
                                    Set Total
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">
                                    {mode === 'add' ? 'Amount to Add' : 'New Total Stock'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                                        className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-mono text-lg"
                                        min={mode === 'set' ? 0 : -1000}
                                    />
                                </div>
                                <p className="text-xs text-text-muted">
                                    Current Stock: <span className="text-white font-mono">{product.stock || 0}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Reason</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g., New shipment, Correction"
                                    className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-surface font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockEditModal;
