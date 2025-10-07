import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../services/supabase';
import { Category } from '../../../types';
import Modal from '../../ui/Modal';
import { Spinner, UploadIcon, CloseIcon } from '../../ui/Icons';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
    categories: Category[];
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSuccess, categories }) => {
    const [importLoading, setImportLoading] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setImportFile(null);
            setImportError(null);
            setImportSuccess(null);
        }
    }, [isOpen]);

    const handleFileClear = () => {
        setImportFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleDownloadSample = () => {
        const sampleContent = "date,description,category,type,amount\n2025-09-24,\"Monthly Salary\",Salary,income,5000\n2025-09-24,\"Groceries, milk and bread\",Groceries,expense,75.50\n";
        const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
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
            const header = rows.shift()?.trim().toLowerCase().split(',');
            if (!header || header.join(',') !== 'date,description,category,type,amount') {
                throw new Error("Invalid CSV header. Expected: date,description,category,type,amount");
            }
            
            const existingCategories: Category[] = categories || [];
            const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c]));
            
            const newCategoriesToCreate = new Map<string, {name: string, type: 'income' | 'expense'}>();
            const transactionsToInsert = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;
                
                const values = row.match(/(".*?"|[^",\r]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '')) || [];

                if (values.length < 5) {
                    console.warn(`Skipping malformed row ${i + 2}: ${row}`);
                    continue;
                }
                const [date, description, categoryName, type, amount] = values;
                
                if (!date || !description || !categoryName || !type || !amount) {
                    throw new Error(`Invalid data on row ${i + 2}. Each row must have 5 columns.`);
                }
                const lowerCaseType = type.toLowerCase();
                if (lowerCaseType !== 'income' && lowerCaseType !== 'expense') {
                    throw new Error(`Invalid type '${type}' on row ${i + 2}. Must be 'income' or 'expense'.`);
                }
                if (isNaN(parseFloat(amount))) {
                    throw new Error(`Invalid amount '${amount}' on row ${i + 2}. Must be a number.`);
                }

                if (!categoryMap.has(categoryName.toLowerCase()) && !newCategoriesToCreate.has(categoryName.toLowerCase())) {
                    newCategoriesToCreate.set(categoryName.toLowerCase(), { name: categoryName, type: lowerCaseType as 'income' | 'expense' });
                }

                transactionsToInsert.push({ date, description, categoryName, type: lowerCaseType, amount: parseFloat(amount) });
            }

            if (newCategoriesToCreate.size > 0) {
                const newCategoryList = Array.from(newCategoriesToCreate.values()).map(c => ({...c, user_id: user.id}));
                const { data: createdCategories, error: createCatError } = await supabase.from('categories').insert(newCategoryList).select();
                if (createCatError) throw createCatError;
                createdCategories?.forEach(c => categoryMap.set(c.name.toLowerCase(), c));
            }
            
            const finalTransactions = transactionsToInsert.map(t => {
                const category = categoryMap.get(t.categoryName.toLowerCase());
                if (!category) {
                    console.error(`Could not find or create category for "${t.categoryName}"`);
                    return null;
                }
                return {
                    user_id: user.id,
                    date: t.date,
                    description: t.description,
                    type: t.type,
                    amount: t.amount,
                    category_id: category.id,
                }
            }).filter((t): t is NonNullable<typeof t> => t !== null);

            if(finalTransactions.length > 0) {
              const { error: insertError } = await supabase.from('transactions').insert(finalTransactions);
              if (insertError) throw insertError;
            }
            
            setImportSuccess(`Successfully imported ${finalTransactions.length} transactions.`);
            onImportSuccess();
        } catch (error: any) {
            setImportError(error.message);
        } finally {
            setImportLoading(false);
            handleFileClear();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Transactions" size="md">
             <div className="space-y-4">
                <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Import transactions from a CSV file. The file must have the columns: <code>date,description,category,type,amount</code>.</p>
                <button onClick={handleDownloadSample} className="text-sm text-primary hover:underline">Download Sample CSV</button>
                <div>
                    {importFile ? (
                        <div className="flex items-center justify-between p-2.5 border border-border dark:border-dark-border rounded-md bg-gray-50 dark:bg-slate-700/50 text-sm">
                            <span className="text-text-secondary dark:text-dark-text-secondary truncate" title={importFile.name}>
                                {importFile.name}
                            </span>
                            <button
                                type="button"
                                onClick={handleFileClear}
                                className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-danger dark:hover:bg-red-500/20 text-text-secondary dark:text-dark-text-secondary transition-colors"
                                aria-label="Clear selected file"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                         <>
                            <label htmlFor="csv-import" className="sr-only">CSV file</label>
                            <input ref={fileInputRef} id="csv-import" type="file" accept=".csv" onChange={e => setImportFile(e.target.files ? e.target.files[0] : null)} className="text-sm w-full p-2 border border-border dark:border-dark-border rounded-md text-text-secondary dark:text-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-500/20 file:text-primary dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/30"/>
                         </>
                    )}
                </div>
                {importError && <p className="text-sm text-danger p-2 bg-red-50 dark:bg-red-500/20 rounded-md">{importError}</p>}
                {importSuccess && <p className="text-sm text-success p-2 bg-green-50 dark:bg-green-500/20 rounded-md">{importSuccess}</p>}
                
                <div className="flex justify-end items-center gap-2 pt-4 border-t border-border dark:border-dark-border">
                     <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-slate-700 border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary transition-colors">Cancel</button>
                     <button onClick={handleImport} disabled={importLoading || !importFile} className="flex justify-center items-center gap-2 px-4 py-2 font-semibold rounded-md text-white bg-primary hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                        {importLoading ? <Spinner className="w-5 h-5"/> : <UploadIcon className="w-5 h-5"/>}
                        {importLoading ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportModal;