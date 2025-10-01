import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import { Category } from '../../../types';
import Modal from '../../ui/Modal';
import { Spinner, DownloadIcon, UploadIcon } from '../../ui/Icons';

interface DataToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

const DataToolsModal: React.FC<DataToolsModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setImportFile(null);
            setImportError(null);
            setImportSuccess(null);
        }
    }, [isOpen]);
    
    // --- EXPORT LOGIC ---
    const handleExport = async () => {
        setExportLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

        const csvHeader = "date,description,category,type,amount\n";
        const csvRows = transactions.map(t => {
            const description = `"${(t.description || '').replace(/"/g, '""')}"`;
            const categoryName = (t.categories as any)?.name || 'Uncategorized';
            return [t.date, description, categoryName, t.type, t.amount].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportLoading(false);
    };

    // --- IMPORT LOGIC ---
    const handleDownloadSample = () => {
        const sampleContent = "date,description,category,type,amount\n2025-09-24,\"Monthly Salary\",Salary,income,5000\n2025-09-24,\"Groceries, milk and bread\",Groceries,expense,75.50\n";
        const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-s8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "sample_transactions.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (!importFile) {
            setImportError("Please select a file to import.");
            return;
        }
        setImportLoading(true);
        setImportError(null);
        setImportSuccess(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setImportError("User not found.");
            setImportLoading(false);
            return;
        }

        try {
            const fileContent = await importFile.text();
            const rows = fileContent.split('\n').filter(row => row.trim() !== '');
            const header = rows.shift()?.trim().split(',');
            if (!header || header.join(',') !== 'date,description,category,type,amount') {
                throw new Error("Invalid CSV header. Expected: date,description,category,type,amount");
            }
            
            // Fetch existing categories
            const { data: existingCategoriesData, error: catError } = await supabase.from('categories').select('*').eq('user_id', user.id);
            if (catError) throw catError;
            const existingCategories: Category[] = existingCategoriesData || [];
            const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c]));
            
            const newCategoriesToCreate = new Map<string, {name: string, type: 'income' | 'expense'}>();
            const transactionsToInsert = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i].trim();
                const [date, description, categoryName, type, amount] = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '')) || [];
                
                if (!date || !description || !categoryName || !type || !amount) {
                    throw new Error(`Invalid data on row ${i + 2}. Each row must have 5 columns.`);
                }
                if (type !== 'income' && type !== 'expense') {
                    throw new Error(`Invalid type '${type}' on row ${i + 2}. Must be 'income' or 'expense'.`);
                }
                if (isNaN(parseFloat(amount))) {
                    throw new Error(`Invalid amount '${amount}' on row ${i + 2}. Must be a number.`);
                }

                // Check if category exists or needs to be created
                if (!categoryMap.has(categoryName.toLowerCase()) && !newCategoriesToCreate.has(categoryName.toLowerCase())) {
                    newCategoriesToCreate.set(categoryName.toLowerCase(), { name: categoryName, type: type as 'income' | 'expense' });
                }

                transactionsToInsert.push({ date, description, categoryName, type, amount: parseFloat(amount) });
            }

            // Create new categories if any
            if (newCategoriesToCreate.size > 0) {
                const newCategoryList = Array.from(newCategoriesToCreate.values()).map(c => ({...c, user_id: user.id}));
                const { data: createdCategories, error: createCatError } = await supabase.from('categories').insert(newCategoryList).select();
                if (createCatError) throw createCatError;
                createdCategories?.forEach(c => categoryMap.set(c.name.toLowerCase(), c));
            }
            
            // Insert transactions
            const finalTransactions = transactionsToInsert.map(t => ({
                user_id: user.id,
                date: t.date,
                description: t.description,
                type: t.type,
                amount: t.amount,
                category_id: categoryMap.get(t.categoryName.toLowerCase())!.id,
            }));

            const { error: insertError } = await supabase.from('transactions').insert(finalTransactions);
            if (insertError) throw insertError;
            
            setImportSuccess(`Successfully imported ${finalTransactions.length} transactions.`);
            onImportSuccess();
        } catch (error: any) {
            setImportError(error.message);
        } finally {
            setImportLoading(false);
            setImportFile(null);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import & Export Data" size="lg">
            <div className="space-y-6">
                
                {/* Export Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-text-primary">Export Data</h3>
                    <div className="p-4 border border-border rounded-lg bg-gray-50 space-y-2">
                        <p className="text-text-secondary text-sm">Download all your transactions as a CSV file.</p>
                        <button onClick={handleExport} disabled={exportLoading} className="w-full flex justify-center items-center gap-2 px-4 py-2 font-semibold rounded-md text-white bg-secondary hover:bg-emerald-600 disabled:opacity-50">
                            {exportLoading ? <Spinner className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5" />}
                            {exportLoading ? 'Exporting...' : 'Export to CSV'}
                        </button>
                    </div>
                </div>

                {/* Import Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-text-primary">Import Data</h3>
                     <div className="p-4 border border-border rounded-lg bg-gray-50 space-y-4">
                        <p className="text-text-secondary text-sm">Import transactions from a CSV file. Make sure the file matches the required format.</p>
                        <button onClick={handleDownloadSample} className="text-sm text-primary hover:underline">Download Sample CSV</button>
                        <div>
                             <input type="file" accept=".csv" onChange={e => setImportFile(e.target.files ? e.target.files[0] : null)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-primary hover:file:bg-indigo-100"/>
                        </div>
                        <button onClick={handleImport} disabled={importLoading || !importFile} className="w-full flex justify-center items-center gap-2 px-4 py-2 font-semibold rounded-md text-white bg-primary hover:bg-indigo-700 disabled:opacity-50">
                            {importLoading ? <Spinner className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                            {importLoading ? 'Importing...' : 'Import from CSV'}
                        </button>
                        {importError && <p className="text-sm text-danger text-center">{importError}</p>}
                        {importSuccess && <p className="text-sm text-secondary text-center">{importSuccess}</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-white hover:bg-gray-100 border border-border text-text-primary">Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default DataToolsModal;