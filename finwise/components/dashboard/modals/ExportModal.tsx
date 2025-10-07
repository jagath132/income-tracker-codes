
import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';
import Modal from '../../ui/Modal';
import { Spinner, DownloadIcon } from '../../ui/Icons';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    const [exportLoading, setExportLoading] = useState(false);

    const handleExport = async () => {
        setExportLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("User not authenticated.");
            setExportLoading(false);
            return;
        }

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('date,description,type,amount,categories(name)')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            alert("Error exporting data: " + error.message);
            setExportLoading(false);
            return;
        }

        if(!transactions || transactions.length === 0){
            alert("No transactions to export.");
            setExportLoading(false);
            return;
        }

        const csvHeader = "date,description,category,type,amount\n";
        const csvRows = transactions.map(t => {
            const description = `"${(t.description || '').replace(/"/g, '""')}"`;
            const categoryName = (t.categories as any)?.name || 'Uncategorized';
            return [t.date, description, categoryName, t.type, t.amount].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportLoading(false);
        onClose(); // Close modal after export
    };
    

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="sm">
            <div className="space-y-4">
                <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Download all your transaction data as a CSV file.</p>
                <div className="space-y-3 pt-2">
                    <button onClick={handleExport} disabled={exportLoading} className="w-full flex justify-center items-center gap-2 px-4 py-2 font-semibold rounded-md text-white bg-primary hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                        {exportLoading ? <Spinner className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5" />}
                        {exportLoading ? 'Exporting...' : 'Export to CSV'}
                    </button>
                </div>
                 <div className="flex justify-end pt-4 border-t border-border dark:border-dark-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-slate-700 border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary transition-colors">Cancel</button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
