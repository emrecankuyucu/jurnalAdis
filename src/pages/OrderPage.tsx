import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, CreditCard, Receipt } from 'lucide-react';
import { dbServices } from '../db/services';
import { type Product } from '../db/db';
import clsx from 'clsx';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import ProductActionModal from '../components/order/ProductActionModal';

const OrderPage: React.FC = () => {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const id = parseInt(tableId || '0');

    const table = useLiveQuery(() => dbServices.getTable(id), [id]);
    const products = useLiveQuery(() => dbServices.getProducts());
    const activeOrder = useLiveQuery(() => dbServices.getActiveOrderForTable(id), [id]);

    const orderItems = useLiveQuery(
        async () => {
            if (!activeOrder?.id) return [];
            return dbServices.getOrderItems(activeOrder.id);
        },
        [activeOrder]
    );

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'primary' | 'danger';
        confirmText: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'primary',
        confirmText: 'Confirm'
    });

    const handleStartOrder = async () => {
        if (!table) return;
        await dbServices.createOrder(table.id!);
    };

    const handleAddItem = async (type: 'paid' | 'complimentary', _quantity: number) => {
        if (!selectedProduct) return;

        if (!activeOrder) {
            const orderId = await dbServices.createOrder(table!.id!);
            await dbServices.addItemToOrder(orderId, selectedProduct, type);
        } else {
            await dbServices.addItemToOrder(activeOrder.id!, selectedProduct, type);
        }
        setSelectedProduct(null);
    };

    const handlePay = (status: 'paid' | 'no_payment') => {
        if (!activeOrder || !table) return;

        const isPaid = status === 'paid';

        setConfirmModal({
            isOpen: true,
            title: isPaid ? 'Close Order' : 'Close Without Payment',
            message: isPaid
                ? `Are you sure you want to close this order and pay ${Math.floor(activeOrder.totalAmount)} TL?`
                : 'Are you sure you want to close this order WITHOUT payment? This will be recorded as unpaid.',
            variant: isPaid ? 'primary' : 'danger',
            confirmText: isPaid ? 'Pay & Close' : 'Close Order',
            onConfirm: async () => {
                await dbServices.closeOrder(activeOrder.id!, table.id!, status);
                navigate('/');
            }
        });
    };

    const categories = ['All', ...Array.from(new Set(products?.map(p => p.category) || []))];
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products?.filter(p => p.category === selectedCategory);

    if (!table) return <div>Loading...</div>;

    const handleToggleItemPayment = (item: any) => {
        if (item.isPaid) {
            setConfirmModal({
                isOpen: true,
                title: 'Mark Item as Unpaid',
                message: `Are you sure you want to mark "${item.productName}" as UNPAID?`,
                variant: 'danger',
                confirmText: 'Mark Unpaid',
                onConfirm: async () => {
                    await dbServices.toggleOrderItemPaymentStatus(item.id!);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Mark Item as Paid',
            message: `Are you sure you want to mark "${item.productName}" as paid?`,
            variant: 'primary',
            confirmText: 'Confirm Paid',
            onConfirm: async () => {
                await dbServices.toggleOrderItemPaymentStatus(item.id!);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const paidAmount = orderItems?.filter(i => i.isPaid).reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const totalAmount = activeOrder?.totalAmount || 0;
    const remainingAmount = totalAmount - paidAmount;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4 lg:gap-6">
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
                <div className="flex items-center justify-between mb-4 lg:mb-6 shrink-0">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-text-muted hover:text-white"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-white">{table.name}</h1>
                            <p className="text-sm lg:text-base text-text-muted">Select items to add</p>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide shrink-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={clsx(
                                'px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl whitespace-nowrap font-medium transition-colors text-sm lg:text-base',
                                selectedCategory === cat
                                    ? 'bg-primary text-surface'
                                    : 'bg-surface text-text-muted hover:bg-secondary hover:text-white'
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4">
                        {filteredProducts?.map(product => (
                            <button
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className="bg-surface border border-secondary p-2 sm:p-3 lg:p-4 rounded-xl hover:border-primary/50 hover:bg-secondary/50 transition-all text-left group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-1 sm:mb-2 w-full">
                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors text-xs sm:text-sm lg:text-base line-clamp-2 leading-tight">{product.name}</h3>
                                    <span className="text-primary font-bold text-xs sm:text-sm lg:text-base whitespace-nowrap ml-1 sm:ml-2">{Math.floor(product.price)} TL</span>
                                </div>
                                <p className="text-[10px] sm:text-xs lg:text-sm text-text-muted line-clamp-2 mt-auto leading-tight">{product.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-96 bg-surface border border-secondary rounded-2xl flex flex-col overflow-hidden h-[300px] lg:h-auto shrink-0 shadow-2xl lg:shadow-none">
                <div className="p-2 lg:p-6 border-b border-secondary bg-secondary/30 shrink-0 flex justify-between items-center">
                    <h2 className="text-sm lg:text-xl font-bold text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                        Current Order
                    </h2>
                    <div className="text-xs lg:text-sm text-text-muted hidden lg:block">
                        Order #{activeOrder?.id || 'New'}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1.5 lg:space-y-3">
                    {!activeOrder && (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                            <Receipt className="w-8 h-8 lg:w-12 lg:h-12 mb-2" />
                            <p className="text-xs lg:text-base">No active order</p>
                        </div>
                    )}

                    {orderItems?.filter(i => i.price > 0).map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleToggleItemPayment(item)}
                            className={clsx(
                                "flex justify-between items-center p-1.5 lg:p-3 rounded-lg lg:rounded-xl cursor-pointer transition-colors select-none",
                                item.isPaid
                                    ? "bg-success/10 border border-success/20"
                                    : "bg-background/50 hover:bg-background/80"
                            )}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className={clsx("font-medium text-xs lg:text-base", item.isPaid ? "text-success" : "text-white")}>
                                        {item.productName}
                                    </div>
                                    {item.isPaid && (
                                        <span className="text-[10px] lg:text-xs font-bold bg-success text-white px-1.5 py-0.5 rounded-full">
                                            ÖDENDİ
                                        </span>
                                    )}
                                </div>
                                <div className={clsx("text-[10px] lg:text-sm", item.isPaid ? "text-success/70" : "text-text-muted")}>
                                    <span>{Math.floor(item.price)} TL</span>
                                    {' x '}{item.quantity}
                                </div>
                            </div>
                            <div className={clsx("font-bold text-xs lg:text-base", item.isPaid ? "text-success" : "text-white")}>
                                {Math.floor(item.price * item.quantity)} TL
                            </div>
                        </div>
                    ))}

                    {/* Complimentary Items Section */}
                    {orderItems?.some(i => i.price === 0) && (
                        <>
                            <div className="flex items-center gap-2 mt-2 lg:mt-4 mb-1 lg:mb-2 text-success font-bold text-[10px] lg:text-sm uppercase tracking-wider">
                                <div className="h-px bg-success/20 flex-1" />
                                <span>İkramlar</span>
                                <div className="h-px bg-success/20 flex-1" />
                            </div>
                            {orderItems?.filter(i => i.price === 0).map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-success/5 border border-success/10 p-1.5 lg:p-3 rounded-lg lg:rounded-xl">
                                    <div>
                                        <div className="font-medium text-white text-xs lg:text-base">{item.productName}</div>
                                        <div className="text-[10px] lg:text-sm text-success">
                                            <span className="font-bold">İkram</span>
                                            <span className="text-success/70">{' x '}{item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-success text-xs lg:text-base">
                                        0 TL
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="p-2 lg:p-6 border-t border-secondary bg-secondary/30 space-y-2 lg:space-y-4 shrink-0">
                    <div className="flex justify-between items-center text-sm lg:text-lg font-bold text-white">
                        <span>Total</span>
                        <div className="flex flex-col items-end">
                            <span className={clsx("text-primary", paidAmount > 0 && "line-through text-text-muted text-xs lg:text-sm")}>
                                {Math.floor(totalAmount)} TL
                            </span>
                            {paidAmount > 0 && (
                                <span className="text-primary font-bold">
                                    Kalan: {Math.floor(remainingAmount)} TL
                                </span>
                            )}
                        </div>
                    </div>

                    {!activeOrder ? (
                        <button
                            onClick={handleStartOrder}
                            className="w-full py-1.5 lg:py-3 bg-primary text-surface font-bold rounded-lg lg:rounded-xl hover:bg-primary-hover transition-colors text-xs lg:text-base"
                        >
                            Start Order
                        </button>
                    ) : (
                        <div className="flex gap-2 lg:flex-col lg:space-y-3">
                            <button
                                onClick={() => handlePay('paid')}
                                className="flex-1 py-1.5 lg:py-3 bg-success text-white font-bold rounded-lg lg:rounded-xl hover:bg-success/90 transition-colors flex items-center justify-center gap-1.5 lg:gap-2 text-[10px] lg:text-base whitespace-nowrap"
                            >
                                <CreditCard className="w-3 h-3 lg:w-5 lg:h-5" />
                                Pay & Close
                            </button>
                            <button
                                onClick={() => handlePay('no_payment')}
                                className="flex-1 py-1.5 lg:py-3 bg-danger/10 text-danger font-bold rounded-lg lg:rounded-xl hover:bg-danger hover:text-white transition-colors flex items-center justify-center gap-1.5 lg:gap-2 text-[10px] lg:text-base whitespace-nowrap"
                            >
                                <CreditCard className="w-3 h-3 lg:w-5 lg:h-5" />
                                Ödemesiz Kapat
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ProductActionModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                onAdd={handleAddItem}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText={confirmModal.confirmText}
            />
        </div>
    );
};

export default OrderPage;
