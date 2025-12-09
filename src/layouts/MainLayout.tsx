import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, FileText, Settings, LogOut, Menu, X, Package } from 'lucide-react';
import clsx from 'clsx';

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Tables' },
        { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
        { to: '/inventory', icon: Package, label: 'Inventory' }, // Added Inventory
        { to: '/reports', icon: FileText, label: 'Reports' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-secondary flex items-center justify-between px-4 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="text-surface w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">POS System</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-text-muted hover:text-white"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-secondary flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="p-6 border-b border-secondary flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="text-surface w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">POS System</h1>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-1 text-text-muted hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                    isActive
                                        ? 'bg-primary text-surface font-semibold shadow-lg shadow-primary/20'
                                        : 'text-text-muted hover:bg-secondary hover:text-white'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-secondary">
                    <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-muted hover:bg-danger/10 hover:text-danger transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative w-full pt-16 lg:pt-0">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
