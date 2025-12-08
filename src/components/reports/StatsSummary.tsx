import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

interface StatsSummaryProps {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ totalRevenue, totalOrders, averageOrderValue }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="bg-surface border border-secondary p-3 md:p-6 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-primary/20 rounded-lg md:rounded-xl text-primary shrink-0">
                        <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-text-muted text-xs md:text-sm truncate">Total Revenue</p>
                        <h3 className="text-lg md:text-2xl font-bold text-white truncate">{Math.floor(totalRevenue)} TL</h3>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-secondary p-3 md:p-6 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg md:rounded-xl text-blue-500 shrink-0">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-text-muted text-xs md:text-sm truncate">Total Orders</p>
                        <h3 className="text-lg md:text-2xl font-bold text-white truncate">{totalOrders}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-secondary p-3 md:p-6 rounded-xl md:rounded-2xl col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-green-500/20 rounded-lg md:rounded-xl text-green-500 shrink-0">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-text-muted text-xs md:text-sm truncate">Avg. Order Value</p>
                        <h3 className="text-lg md:text-2xl font-bold text-white truncate">{Math.floor(averageOrderValue)} TL</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsSummary;
