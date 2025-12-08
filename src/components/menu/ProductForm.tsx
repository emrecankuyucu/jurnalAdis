import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../db/db';

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    initialData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Product>({
        name: '',
        price: 0,
        category: '',
        description: '',
        type: 'paid'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', price: 0, category: '', description: '', type: 'paid' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-surface border border-secondary rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary shrink-0">
                            <h2 className="text-lg sm:text-xl font-bold text-white">
                                {initialData ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-text-muted hover:text-white hover:bg-secondary rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 bg-background border border-secondary rounded-xl focus:outline-none focus:border-primary text-white placeholder-text-muted/50 text-sm sm:text-base"
                                    placeholder="e.g. Cheese Burger"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-1">Price (TL)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="1"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 sm:px-4 py-2 bg-background border border-secondary rounded-xl focus:outline-none focus:border-primary text-white text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-1">Category</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 bg-background border border-secondary rounded-xl focus:outline-none focus:border-primary text-white text-sm sm:text-base"
                                    placeholder="e.g. Food"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-text-muted mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2 bg-background border border-secondary rounded-xl focus:outline-none focus:border-primary text-white h-20 sm:h-24 resize-none text-sm sm:text-base"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2 sm:pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-3 sm:px-4 py-2 text-sm sm:text-base text-text-muted hover:text-white hover:bg-secondary rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-surface font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductForm;
