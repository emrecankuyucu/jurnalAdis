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

    addItemToOrder: async (orderId: number, product: Product, overrideType?: 'paid' | 'complimentary') => {
        return db.transaction('rw', db.orders, db.orderItems, async () => {
            const type = overrideType || product.type || 'paid';
            const price = type === 'complimentary' ? 0 : product.price;

            // Check if item exists in order with SAME type
            const existingItems = await db.orderItems
                .where({ orderId, productId: product.id })
                .toArray();

            const existingItem = existingItems.find(item => item.type === type);

            if (existingItem) {
                await db.orderItems.update(existingItem.id!, {
                    quantity: existingItem.quantity + 1
                });
            } else {
                await db.orderItems.add({
                    orderId,
                    productId: product.id!,
                    productName: product.name,
                    quantity: 1,
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

    toggleOrderItemPaymentStatus: async (itemId: number) => {
        const item = await db.orderItems.get(itemId);
        if (item && item.type !== 'complimentary') {
            await db.orderItems.update(itemId, { isPaid: !item.isPaid });
        }
    }
};
