import React from 'react';
import { Trash2, Database } from 'lucide-react';
import { db } from '../db/db';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const SettingsPage: React.FC = () => {
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const handleReset = async () => {
        try {
            await db.delete();
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete database:', error);
            alert('Failed to reset database. Please try clearing your browser data manually.');
        }
    };

    const handleResetDatabase = () => {
        setIsConfirmOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
                <p className="text-sm sm:text-base text-text-muted mt-1">Manage your application preferences</p>
            </div>

            <div className="bg-surface border border-secondary rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-secondary">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Data Management
                    </h2>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-3 sm:p-4 bg-background/50 rounded-xl border border-secondary">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">Reset Database</h3>
                            <p className="text-text-muted text-xs sm:text-sm mt-1">
                                Clear all current data (orders, products, tables) and restore the default seed data.
                                <br />
                                <span className="text-primary">Use this if you don't see the new tables or products.</span>
                            </p>
                        </div>
                        <button
                            onClick={handleResetDatabase}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-danger/10 text-danger font-bold rounded-xl hover:bg-danger hover:text-white transition-colors w-full sm:w-auto"
                        >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            Reset Data
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleReset}
                title="Reset Database"
                message="Are you sure? This will delete ALL data and reset to the default seed data. This cannot be undone."
                variant="danger"
                confirmText="Reset Everything"
            />
        </div>
    );
};

export default SettingsPage;
