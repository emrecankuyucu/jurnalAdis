import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Coffee, Clock } from 'lucide-react';
import clsx from 'clsx';
import type { RestaurantTable, Order } from '../../db/db';

interface TableCardProps {
    table: RestaurantTable;
    activeOrder?: Order;
}

const TableCard: React.FC<TableCardProps> = ({ table, activeOrder }) => {
    const navigate = useNavigate();
    const isOccupied = table.status === 'occupied';

    return (
        <button
            onClick={() => navigate(`/order/${table.id}`)}
            className={clsx(
                'w-full text-left p-2 sm:p-6 rounded-2xl border transition-all duration-200 group relative overflow-hidden',
                isOccupied
                    ? 'bg-secondary/50 border-primary/50 hover:border-primary'
                    : 'bg-surface border-secondary hover:border-text-muted/50'
            )}
        >
            <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div className={clsx(
                    'p-2 sm:p-3 rounded-xl',
                    isOccupied ? 'bg-primary/20 text-primary' : 'bg-secondary text-text-muted'
                )}>
                    <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className={clsx(
                    'px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider',
                    isOccupied ? 'bg-primary text-surface' : 'bg-success/10 text-success'
                )}>
                    {table.status}
                </div>
            </div>

            <h3 className="text-base sm:text-xl font-bold text-white mb-1">{table.name}</h3>

            {isOccupied && activeOrder ? (
                <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-4">
                    <div className="flex items-center gap-2 text-text-muted text-xs sm:text-sm">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{activeOrder.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-primary">
                        {Math.floor(activeOrder.totalAmount)} TL
                    </div>
                </div>
            ) : (
                <div className="mt-2 sm:mt-4 text-text-muted text-xs sm:text-sm flex items-center gap-2">
                    <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Ready</span>
                </div>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
    );
};

export default TableCard;
