import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { dbServices } from '../../db/services';
import { type Order } from '../../db/db';
import ConfirmationModal from '../ui/ConfirmationModal';

interface OrderDetailsModalProps {
    order: Order | null;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const orderItems = useLiveQuery(
        async () => {
            if (!order?.id) return [];
            return dbServices.getOrderItems(order.id);
        },
        [order?.id]
    );

    return (
        <AnimatePresence>
            {order && (
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
                        className="relative w-full max-w-lg bg-surface border border-secondary rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary shrink-0">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white">Order Details</h2>
                                <p className="text-text-muted text-xs sm:text-sm">Order #{order.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary rounded-lg text-text-muted hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 overflow-y-auto">
                            <div className="space-y-3 sm:space-y-4">
                                {orderItems?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-background/50 p-3 sm:p-4 rounded-xl">
                                        <div>
                                            <div className="font-medium text-white text-sm sm:text-base">{item.productName}</div>
                                            <div className="text-xs sm:text-sm text-text-muted">
                                                {item.type === 'complimentary' ? (
                                                    <span className="text-success">İkram</span>
                                                ) : (
                                                    <span>{Math.floor(item.price)} TL</span>
                                                )}
                                                {' x '}{item.quantity}
                                            </div>
                                        </div>
                                        <div className="font-bold text-white text-sm sm:text-base">
                                            {Math.floor(item.price * item.quantity)} TL
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 border-t border-secondary bg-secondary/30 shrink-0">
                            <div className="flex justify-between items-center text-base sm:text-lg font-bold text-white">
                                <span>Total Amount</span>
                                <span className="text-primary">{Math.floor(order.totalAmount)} TL</span>
                            </div>
                            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                                <span className="text-text-muted hidden sm:inline">Status</span>
                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                    {order.status === 'no_payment' && (
                                        <button
                                            onClick={() => setIsConfirmOpen(true)}
                                            className="px-3 py-1 bg-success text-white rounded-lg text-xs font-bold hover:bg-success/90 transition-colors whitespace-nowrap"
                                        >
                                            Ödendi Olarak İşaretle
                                        </button>
                                    )}
                                    <span className={`px-3 py-1 rounded-full font-bold uppercase text-xs sm:text-sm ${order.status === 'paid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                        }`}>
                                        {order.status === 'no_payment' ? 'Ödemesiz' : 'Ödendi'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <ConfirmationModal
                        isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={async () => {
                            await dbServices.updateOrderStatus(order.id!, 'paid');
                            onClose();
                        }}
                        title="Mark as Paid"
                        message="Are you sure you want to mark this order as PAID? This will update your revenue reports."
                        variant="success"
                        confirmText="Mark as Paid"
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
