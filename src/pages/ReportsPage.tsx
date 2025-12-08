import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import StatsSummary from '../components/reports/StatsSummary';
import OrderDetailsModal from '../components/reports/OrderDetailsModal';

const ReportsPage: React.FC = () => {
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'custom'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderItemsMap, setOrderItemsMap] = useState<Record<number, any[]>>({});

    const orders = useLiveQuery(async () => {
        let collection = db.orders.where('status').anyOf('paid', 'no_payment');

        let allOrders = await collection.toArray();

        if (dateFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            allOrders = allOrders.filter(o => o.createdAt >= today);
        } else if (dateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            allOrders = allOrders.filter(o => o.createdAt >= weekAgo);
        } else if (dateFilter === 'custom') {
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    allOrders = allOrders.filter(o => o.createdAt >= start && o.createdAt <= end);
                } else {
                    // Only start date provided: filter for that specific day
                    const end = new Date(startDate);
                    end.setHours(23, 59, 59, 999);
                    allOrders = allOrders.filter(o => o.createdAt >= start && o.createdAt <= end);
                }
            }
        }

        const sortedOrders = allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Fetch items for these orders to calculate partial payments
        const orderIds = sortedOrders.map(o => o.id!);
        if (orderIds.length > 0) {
            const items = await db.orderItems.where('orderId').anyOf(orderIds).toArray();
            const itemsMap: Record<number, any[]> = {};
            items.forEach(item => {
                if (!itemsMap[item.orderId]) itemsMap[item.orderId] = [];
                itemsMap[item.orderId].push(item);
            });
            setOrderItemsMap(itemsMap);
        } else {
            setOrderItemsMap({});
        }

        return sortedOrders;
    }, [dateFilter, startDate, endDate]);

    const paidOrders = orders?.filter(o => o.status === 'paid') || [];
    const unpaidOrders = orders?.filter(o => o.status === 'no_payment') || [];

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = paidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const tables = useLiveQuery(() => db.diningTables.toArray());
    const tablesMap = React.useMemo(() => {
        return tables?.reduce((acc, table) => {
            acc[table.id!] = table.name;
            return acc;
        }, {} as Record<number, string>) || {};
    }, [tables]);

    const OrderTable = ({ title, data }: { title: string, data: any[] }) => (
        <div className="bg-surface border border-secondary rounded-2xl overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-secondary">
                <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr className="bg-secondary/30 text-text-muted text-xs sm:text-sm">
                            <th className="p-3 sm:p-4 font-medium">Order ID</th>
                            <th className="p-3 sm:p-4 font-medium">Date</th>
                            <th className="p-3 sm:p-4 font-medium">Time</th>
                            <th className="p-3 sm:p-4 font-medium">Table</th>
                            <th className="p-3 sm:p-4 font-medium text-right">Amount</th>
                            <th className="p-3 sm:p-4 font-medium text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary text-xs sm:text-sm">
                        {data.map((order) => {
                            const items = orderItemsMap[order.id!] || [];
                            const paidItemsAmount = items.filter(i => i.isPaid).reduce((sum, i) => sum + (i.price * i.quantity), 0);
                            const isPartiallyPaid = paidItemsAmount > 0 && order.status === 'no_payment';

                            return (
                                <tr
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="hover:bg-secondary/20 transition-colors cursor-pointer"
                                >
                                    <td className="p-3 sm:p-4 text-white font-mono">#{order.id}</td>
                                    <td className="p-3 sm:p-4 text-text-muted">
                                        {order.createdAt.toLocaleDateString()}
                                    </td>
                                    <td className="p-3 sm:p-4 text-text-muted">
                                        {order.createdAt.toLocaleTimeString()}
                                    </td>
                                    <td className="p-3 sm:p-4 text-white">{tablesMap[order.tableId] || `Table ${order.tableId}`}</td>
                                    <td className="p-3 sm:p-4 text-white font-bold text-right">
                                        {isPartiallyPaid ? (
                                            <div className="flex flex-col items-end">
                                                <span className="line-through text-text-muted text-xs">{Math.floor(order.totalAmount)} TL</span>
                                                <span className="text-danger">{Math.floor(order.totalAmount - paidItemsAmount)} TL</span>
                                                <span className="text-[10px] text-success font-normal">({Math.floor(paidItemsAmount)} TL Paid)</span>
                                            </div>
                                        ) : (
                                            <span>{Math.floor(order.totalAmount)} TL</span>
                                        )}
                                    </td>
                                    <td className="p-3 sm:p-4 text-center">
                                        <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase ${order.status === 'paid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                            }`}>
                                            {order.status === 'no_payment' ? 'Ödemesiz' : 'Ödendi'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-6 sm:p-8 text-center text-text-muted">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Reports & Analytics</h1>
                    <p className="text-sm lg:text-base text-text-muted mt-1">View your sales performance</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex bg-surface border border-secondary rounded-xl p-1 self-start lg:self-auto w-full lg:w-auto overflow-x-auto">
                        {(['all', 'today', 'week', 'custom'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setDateFilter(filter)}
                                className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${dateFilter === filter
                                    ? 'bg-primary text-surface shadow-sm'
                                    : 'text-text-muted hover:text-white'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {dateFilter === 'custom' && (
                        <div className="flex gap-2 items-center bg-surface border border-secondary rounded-xl p-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-white text-sm px-2 py-1 outline-none"
                                placeholder="Start Date"
                            />
                            <span className="text-text-muted">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-white text-sm px-2 py-1 outline-none"
                                placeholder="End Date"
                            />
                        </div>
                    )}
                </div>
            </div>

            <StatsSummary
                totalRevenue={totalRevenue}
                totalOrders={totalOrders}
                averageOrderValue={averageOrderValue}
            />

            <OrderTable title="Paid Orders (Ödenen Siparişler)" data={paidOrders} />

            {unpaidOrders.length > 0 && (
                <OrderTable title="Unpaid/Complimentary Orders (Ödemesiz Kapatılanlar)" data={unpaidOrders} />
            )}

            <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
};

export default ReportsPage;
