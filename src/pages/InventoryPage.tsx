import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { dbServices } from '../db/services';
import { Search, AlertCircle, Infinity } from 'lucide-react';
import StockEditModal from '../components/inventory/StockEditModal';
import { type Product } from '../db/db';

const InventoryPage: React.FC = () => {
    const products = useLiveQuery(() => dbServices.getProducts());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    // Advanced Stats Query with Date Filtering
    const productStats = useLiveQuery(async () => {
        let ordersCollection = db.orders.toCollection();

        // 1. Filter Orders by Date
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();
            startDate.setHours(0, 0, 0, 0);

            if (dateFilter === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateFilter === 'month') {
                startDate.setMonth(now.getMonth() - 1);
            }
            // 'today' is already set to start of today

            ordersCollection = db.orders.where('createdAt').aboveOrEqual(startDate);
        }

        const filteredOrders = await ordersCollection.toArray();
        const orderIds = filteredOrders.map(o => o.id!);

        // 2. Fetch items depending on filter
        let items: any[] = [];
        if (dateFilter === 'all') {
            items = await db.orderItems.toArray();
        } else {
            if (orderIds.length > 0) {
                items = await db.orderItems.where('orderId').anyOf(orderIds).toArray();
            }
        }

        const stats: Record<number, { paid: number, comp: number, revenue: number }> = {};

        items.forEach(item => {
            if (!stats[item.productId]) {
                stats[item.productId] = { paid: 0, comp: 0, revenue: 0 };
            }
            if (item.type === 'complimentary') {
                stats[item.productId].comp += item.quantity;
            } else {
                stats[item.productId].paid += item.quantity;
                stats[item.productId].revenue += (item.price * item.quantity);
            }
        });
        return stats;
    }, [dateFilter]);

    // Calculate totals for the report view
    const reportData = React.useMemo(() => {
        if (!products || !productStats) return { items: [], totalRevenue: 0 };

        const items: {
            id: number;
            name: string;
            type: 'paid' | 'complimentary';
            quantity: number;
            revenue: number;
        }[] = [];

        let totalRevenue = 0;

        products.forEach(p => {
            const stats = productStats[p.id!];
            if (!stats) return;

            if (stats.paid > 0) {
                const revenue = stats.revenue;
                items.push({
                    id: p.id!,
                    name: p.name,
                    type: 'paid',
                    quantity: stats.paid,
                    revenue: revenue
                });
                totalRevenue += revenue;
            }

            if (stats.comp > 0) {
                items.push({
                    id: p.id!,
                    name: p.name,
                    type: 'complimentary',
                    quantity: stats.comp,
                    revenue: 0
                });
            }
        });

        return { items, totalRevenue };
    }, [products, productStats]);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const categories = ['All', ...Array.from(new Set(products?.map(p => p.category) || []))];

    const filteredProducts = products?.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSaveStock = async (amount: number, isUnlimited: boolean, reason: string) => {
        if (!selectedProduct) return;

        // Update unlimited status if changed
        if (selectedProduct.isUnlimited !== isUnlimited) {
            await dbServices.toggleUnlimited(selectedProduct.id!);
        }

        // Update stock if not unlimited (or if just switched to tracked)
        if (amount !== 0 && !isUnlimited) {
            await dbServices.updateStock(selectedProduct.id!, amount, reason);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inventory Control</h1>
                    <p className="text-text-muted mt-1">
                        {dateFilter === 'all' ? 'Manage stock and view all products' : 'Sales performance report'}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Date Filter */}
                    <div className="flex bg-surface border border-secondary rounded-xl p-1">
                        {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setDateFilter(filter)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${dateFilter === filter
                                        ? 'bg-primary text-surface shadow-sm'
                                        : 'text-text-muted hover:text-white'
                                    }`}
                            >
                                {filter === 'all' ? 'Stock Mgmt' : filter}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-secondary rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-primary w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {dateFilter === 'all' ? (
                <>
                    {/* Filters Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterCategory === cat
                                        ? 'bg-primary text-surface shadow-sm'
                                        : 'bg-surface border border-secondary text-text-muted hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Stock Management Table */}
                    <div className="bg-surface border border-secondary rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-secondary/30 text-text-muted text-sm border-b border-secondary">
                                        <th className="p-4 font-medium">Product</th>
                                        <th className="p-4 font-medium">Category</th>
                                        <th className="p-4 font-medium text-center">Stock</th>
                                        <th className="p-4 font-medium text-center">Total Sales</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary text-sm">
                                    {filteredProducts?.map(product => {
                                        const stats = productStats?.[product.id!] || { paid: 0, comp: 0, revenue: 0 };
                                        const isLowStock = !product.isUnlimited && (product.stock || 0) <= 5;
                                        const isOut = !product.isUnlimited && (product.stock || 0) <= 0;

                                        return (
                                            <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{product.name}</div>
                                                    <div className="text-xs text-text-muted">{Math.floor(product.price)} TL</div>
                                                </td>
                                                <td className="p-4 text-text-muted">
                                                    <span className="px-2 py-1 rounded-md bg-secondary/50 text-xs">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {product.isUnlimited ? (
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                                            <Infinity className="w-5 h-5" />
                                                        </div>
                                                    ) : (
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono font-bold ${isOut ? 'bg-danger/10 text-danger' :
                                                                isLowStock ? 'bg-warning/10 text-warning' :
                                                                    'bg-success/10 text-success'
                                                            }`}>
                                                            {product.stock || 0}
                                                            {isLowStock && <AlertCircle className="w-3 h-3" />}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-text-muted">Paid: <span className="text-white">{stats.paid}</span></div>
                                                        <div className="text-xs text-text-muted">Comp: <span className="text-warning">{stats.comp}</span></div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-white rounded-lg transition-colors text-xs font-medium"
                                                    >
                                                        Edit Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Sales Report Table */}
                    <div className="bg-surface border border-secondary rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-secondary bg-secondary/10 flex justify-between items-center">
                            <h2 className="font-bold text-white">Sales Report ({dateFilter})</h2>
                            <div className="text-sm font-bold text-primary">
                                Total Revenue: <span className="text-white font-mono">{Math.floor(reportData.totalRevenue)} TL</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-secondary/30 text-text-muted text-sm border-b border-secondary">
                                        <th className="p-4 font-medium">Product</th>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium text-center">Quantity</th>
                                        <th className="p-4 font-medium text-right">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary text-sm">
                                    {reportData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-text-muted">
                                                No sales found for this period.
                                            </td>
                                        </tr>
                                    ) : (
                                        reportData.items.map((item, idx) => (
                                            <tr key={`${item.id}-${item.type}`} className="hover:bg-secondary/20 transition-colors">
                                                <td className="p-4 font-bold text-white">{item.name}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.type === 'paid'
                                                            ? 'bg-success/10 text-success'
                                                            : 'bg-warning/10 text-warning'
                                                        }`}>
                                                        {item.type === 'paid' ? 'Paid' : 'İkram'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center font-mono text-white">
                                                    {item.quantity}
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold text-white">
                                                    {Math.floor(item.revenue)} TL
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-secondary/30 border-t border-secondary">
                                    <tr>
                                        <td colSpan={3} className="p-4 text-right font-bold text-text-muted text-lg">Total Revenue:</td>
                                        <td className="p-4 text-right font-bold text-primary text-xl">
                                            {Math.floor(reportData.totalRevenue)} TL
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <StockEditModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                onSave={handleSaveStock}
            />
        </div>
    );
};

export default InventoryPage;
