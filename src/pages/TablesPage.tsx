import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { dbServices } from '../db/services';
import { db } from '../db/db';
import TableCard from '../components/tables/TableCard';

const TablesPage: React.FC = () => {
    const tables = useLiveQuery(() => dbServices.getTables());
    const orders = useLiveQuery(() => db.orders.where('status').equals('active').toArray());

    // Group tables by section
    const sections = tables?.reduce((acc, table) => {
        const section = table.section || 'General';
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(table);
        return acc;
    }, {} as Record<string, typeof tables>);

    const sectionOrder = ['Alt Kat', 'Bahçe', '2. Kat', 'Teras'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Tables Dashboard</h1>
                <p className="text-sm sm:text-base text-text-muted mt-1">Overview of all restaurant tables</p>
            </div>

            {sectionOrder.map((sectionName) => {
                const sectionTables = sections?.[sectionName];
                if (!sectionTables) return null;

                return (
                    <div key={sectionName} className="space-y-4">
                        <h2 className="text-xl font-bold text-primary border-b border-secondary pb-2">
                            {sectionName}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-6">
                            {sectionTables.map((table) => {
                                const activeOrder = orders?.find(o => o.id === table.currentOrderId);
                                return (
                                    <TableCard
                                        key={table.id}
                                        table={table}
                                        activeOrder={activeOrder}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Render any other sections not in the ordered list */}
            {Object.keys(sections || {}).filter(s => !sectionOrder.includes(s)).map((sectionName) => (
                <div key={sectionName} className="space-y-4">
                    <h2 className="text-xl font-bold text-primary border-b border-secondary pb-2">
                        {sectionName}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-6">
                        {sections![sectionName].map((table) => {
                            const activeOrder = orders?.find(o => o.id === table.currentOrderId);
                            return (
                                <TableCard
                                    key={table.id}
                                    table={table}
                                    activeOrder={activeOrder}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TablesPage;
