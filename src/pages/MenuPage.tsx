import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { type Product } from '../db/db';
import { dbServices } from '../db/services';
import ProductForm from '../components/menu/ProductForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const MenuPage: React.FC = () => {
    const products = useLiveQuery(() => dbServices.getProducts());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSave = async (product: Product) => {
        if (editingProduct?.id) {
            await dbServices.updateProduct(editingProduct.id, product);
        } else {
            await dbServices.addProduct(product);
        }
        setEditingProduct(undefined);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            await dbServices.deleteProduct(deleteId);
            setDeleteId(null);
        }
    };

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Menu Management</h1>
                    <p className="text-sm sm:text-base text-text-muted mt-1">Manage your products and prices</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(undefined);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-primary text-surface font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-secondary rounded-xl focus:outline-none focus:border-primary text-white placeholder-text-muted/50"
                />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6">
                {filteredProducts?.map((product) => (
                    <div
                        key={product.id}
                        className="group bg-surface border border-secondary rounded-xl p-3 sm:p-5 hover:border-primary/50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2 sm:mb-4">
                            <div className="bg-secondary/50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium text-text-muted truncate max-w-[70%]">
                                {product.category}
                            </div>
                            <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-1.5 sm:p-2 hover:bg-background rounded-lg text-primary transition-colors"
                                >
                                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(product.id!)}
                                    className="p-1.5 sm:p-2 hover:bg-background rounded-lg text-danger transition-colors"
                                >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] sm:text-sm text-text-muted mb-2 sm:mb-4 line-clamp-2 h-8 sm:h-auto">{product.description}</p>

                        <div className="text-base sm:text-xl font-bold text-primary">
                            {Math.floor(product.price)} TL
                        </div>
                    </div>
                ))}
            </div>

            <ProductForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(undefined);
                }}
                onSave={handleSave}
                initialData={editingProduct}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                variant="danger"
                confirmText="Delete"
            />
        </div>
    );
};

export default MenuPage;
