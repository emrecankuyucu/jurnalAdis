import { db, type Product } from './db';

export const dbServices = {
    // Products
    getProducts: () => db.products.toArray(),
    addProduct: (product: Product) => db.products.add(product),
    updateProduct: (id: number, product: Partial<Product>) => db.products.update(id, product),
    deleteProduct: (id: number) => db.products.delete(id),

    // Tables
    getTables: () => db.diningTables.toArray(),
    getTable: (id: number) => db.diningTables.get(id),
    updateTableStatus: (id: number, status: 'available' | 'occupied', currentOrderId?: number) =>
        db.diningTables.update(id, { status, currentOrderId }),

    // Orders
    createOrder: async (tableId: number) => {
        return db.transaction('rw', db.orders, db.diningTables, async () => {
            const orderId = await db.orders.add({
                tableId,
                status: 'active',
                totalAmount: 0,
                createdAt: new Date(),
            });

            await db.diningTables.update(tableId, {
                status: 'occupied',
                currentOrderId: orderId as number
            });

            return orderId;
        });
    },

    getActiveOrderForTable: async (tableId: number) => {
        const table = await db.diningTables.get(tableId);
        if (!table?.currentOrderId) return null;
        return db.orders.get(table.currentOrderId);
    },

    getOrderItems: (orderId: number) => db.orderItems.where('orderId').equals(orderId).toArray(),

    addItemToOrder: async (orderId: number, product: Product, overrideType?: 'paid' | 'complimentary', quantity: number = 1) => {
        return db.transaction('rw', db.orders, db.orderItems, db.products, db.stockLogs, async () => {
            // 1. Check Stock
            const currentProduct = await db.products.get(product.id!);
            if (!currentProduct) throw new Error("Product not found");

            if (!currentProduct.isUnlimited && (currentProduct.stock || 0) < quantity) {
                throw new Error("Insufficient stock");
            }

            // 2. Decrement Stock if not unlimited
            if (!currentProduct.isUnlimited) {
                const newStock = (currentProduct.stock || 0) - quantity;
                await db.products.update(currentProduct.id!, { stock: newStock });
            }

            const type = overrideType || product.type || 'paid';
            const price = type === 'complimentary' ? 0 : product.price;

            // Check if item exists in order with SAME type
            const existingItems = await db.orderItems
                .where({ orderId, productId: product.id })
                .toArray();

            const existingItem = existingItems.find(item => item.type === type && !item.isPaid);

            if (existingItem) {
                await db.orderItems.update(existingItem.id!, {
                    quantity: existingItem.quantity + quantity
                });
            } else {
                await db.orderItems.add({
                    orderId,
                    productId: product.id!,
                    productName: product.name,
                    quantity: quantity,
                    price: price,
                    type: type,
                    isPaid: false
                });
            }

            // Update order total
            const items = await db.orderItems.where('orderId').equals(orderId).toArray();
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            await db.orders.update(orderId, { totalAmount: total });
        });
    },

    closeOrder: async (orderId: number, tableId: number, status: 'paid' | 'no_payment' = 'paid') => {
        return db.transaction('rw', db.orders, db.diningTables, async () => {
            await db.orders.update(orderId, {
                status: status,
                closedAt: new Date()
            });

            await db.diningTables.update(tableId, {
                status: 'available',
                currentOrderId: undefined
            });
        });
    },

    updateOrderStatus: async (orderId: number, status: 'paid' | 'no_payment') => {
        return db.orders.update(orderId, { status });
    },

    // Updated Payment Logic with Split/Merge support
    markOrderItemAsPaid: async (itemId: number, quantityToPay: number) => {
        return db.transaction('rw', db.orderItems, async () => {
            const item = await db.orderItems.get(itemId);
            if (!item || item.type === 'complimentary' || item.isPaid) return;

            if (quantityToPay >= item.quantity) {
                // Determine if we need to merge with an existing PAID item for this product/price
                // (Optional: usually not strictly needed if we just mark this as paid, but keeps data clean)
                // Let's just mark it as paid for simplicity unless strict merging is requested everywhere.
                // Actually, let's try to merge for consistency if possible.

                const existingPaidItem = await db.orderItems
                    .where({ orderId: item.orderId, productId: item.productId, isPaid: 1 }) // 1 for true
                    .filter(i => i.price === item.price && i.type === item.type)
                    .first();

                if (existingPaidItem) {
                    await db.orderItems.update(existingPaidItem.id!, {
                        quantity: existingPaidItem.quantity + item.quantity
                    });
                    await db.orderItems.delete(itemId);
                } else {
                    await db.orderItems.update(itemId, { isPaid: true });
                }

            } else {
                // Split: Reduce current quantity
                await db.orderItems.update(itemId, {
                    quantity: item.quantity - quantityToPay
                });

                // Check for existing PAID item to merge into
                const existingPaidItem = await db.orderItems
                    .where({ orderId: item.orderId, productId: item.productId, isPaid: 1 }) // 1 for true (Dexie boolean index)
                    .filter(i => i.price === item.price && i.type === item.type)
                    .first();

                if (existingPaidItem) {
                    await db.orderItems.update(existingPaidItem.id!, {
                        quantity: existingPaidItem.quantity + quantityToPay
                    });
                } else {
                    // Create new Paid item
                    await db.orderItems.add({
                        orderId: item.orderId,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: quantityToPay,
                        price: item.price,
                        type: item.type,
                        isPaid: true
                    });
                }
            }
        });
    },

    markOrderItemAsUnpaid: async (itemId: number) => {
        return db.transaction('rw', db.orderItems, async () => {
            const item = await db.orderItems.get(itemId);
            if (!item || !item.isPaid) return;

            // 1. Mark as unpaid (conceptually) - actually we try to merge
            // Find existing UNPAID item
            const existingUnpaidItem = await db.orderItems
                .where({ orderId: item.orderId, productId: item.productId, isPaid: 0 }) // 0 for false
                .filter(i => i.price === item.price && i.type === item.type)
                .first();

            if (existingUnpaidItem) {
                // Merge into existing unpaid
                await db.orderItems.update(existingUnpaidItem.id!, {
                    quantity: existingUnpaidItem.quantity + item.quantity
                });
                await db.orderItems.delete(itemId);
            } else {
                // Just flip status
                await db.orderItems.update(itemId, { isPaid: false });
            }
        });
    },

    // Inventory Services
    updateStock: async (productId: number, changeAmount: number, reason: string) => {
        return db.transaction('rw', db.products, db.stockLogs, async () => {
            const product = await db.products.get(productId);
            if (!product) throw new Error('Product not found');

            const newStock = (product.stock || 0) + changeAmount;

            await db.products.update(productId, { stock: newStock });

            await db.stockLogs.add({
                productId,
                productName: product.name,
                changeAmount,
                newStock,
                reason,
                createdAt: new Date()
            });
        });
    },

    toggleUnlimited: async (productId: number) => {
        const product = await db.products.get(productId);
        if (product) {
            await db.products.update(productId, { isUnlimited: !product.isUnlimited });
        }
    }
};
