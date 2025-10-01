import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Transaction, Category } from '../../types';
import { FilterType } from '../../types';
import TransactionModal from './modals/TransactionModal';
import CategoryModal from './modals/CategoryModal';
import ConfirmModal from '../ui/ConfirmModal';
import ImportModal from './modals/ImportModal';
import ExportModal from './modals/ExportModal';
import { PlusIcon, TagIcon, LogoutIcon, Spinner, SearchIcon, UploadIcon, DownloadIcon, EditIcon, TrashIcon, SunIcon, MoonIcon, CloseIcon } from '../ui/Icons';
import { format } from 'date-fns';

interface DashboardProps {
  session: Session;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modal, setModal] = useState<'transaction' | 'category' | 'import' | 'export' | 'confirmDelete' | null>(null);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'transaction' | 'category', data: Transaction | Category } | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<FilterType>(FilterType.All);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (localStorage.getItem('theme')) {
            return localStorage.getItem('theme') as 'light' | 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', session.user.id);

            if (categoriesError) throw categoriesError;
            setCategories(categoriesData || []);

            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*, categories(name)')
                .eq('user_id', session.user.id)
                .order('date', { ascending: false });

            if (transactionsError) throw transactionsError;
            setTransactions(transactionsData || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => supabase.auth.signOut();

    const { currentBalance, totalIncome, totalExpenses } = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.totalIncome += t.amount;
                acc.currentBalance += t.amount;
            } else {
                acc.totalExpenses += t.amount;
                acc.currentBalance -= t.amount;
            }
            return acc;
        }, { currentBalance: 0, totalIncome: 0, totalExpenses: 0 });
    }, [transactions]);
    
    const categoryTotals = useMemo(() => {
        const totals: { [key: string]: number } = {};
        for (const category of categories) {
            totals[category.id] = 0;
        }

        for (const transaction of transactions) {
            if (transaction.category_id && totals[transaction.category_id] !== undefined) {
                totals[transaction.category_id] += transaction.amount;
            }
        }
        return totals;
    }, [transactions, categories]);

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => filterType === FilterType.All || t.type === filterType)
            .filter(t => {
                const search = searchTerm.toLowerCase();
                const categoryName = t.categories?.name || '';
                return t.description.toLowerCase().includes(search) || categoryName.toLowerCase().includes(search);
            });
    }, [transactions, filterType, searchTerm]);

    const handleSave = () => {
        fetchData();
        setModal(null);
    };

    const handleOpenTransactionModal = (transaction: Transaction | null) => {
        setSelectedTransaction(transaction);
        setModal('transaction');
    };
    
    const handleDeleteRequest = (item: Transaction | Category, type: 'transaction' | 'category') => {
        setItemToDelete({ type, data: item });
        setModal('confirmDelete');
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'transaction') {
            const { error } = await supabase.from('transactions').delete().eq('id', itemToDelete.data.id);
            if (error) setError(error.message);
        } else if (itemToDelete.type === 'category') {
            const { data: transactions, error: checkError } = await supabase.from('transactions').select('id').eq('category_id', itemToDelete.data.id).limit(1);
            if (checkError) {
                setError(checkError.message);
            } else if (transactions && transactions.length > 0) {
                setError(`Cannot delete category "${(itemToDelete.data as Category).name}" because it has associated transactions.`);
            } else {
                const { error: deleteError } = await supabase.from('categories').delete().eq('id', itemToDelete.data.id);
                if (deleteError) setError(deleteError.message);
            }
        }

        setItemToDelete(null);
        setModal(null);
        fetchData();
    };
    
    const renderTransactionCard = (t: Transaction) => (
        <div key={t.id} className="bg-surface dark:bg-dark-surface p-4 rounded-lg border border-border dark:border-dark-border flex flex-col gap-4 shadow-sm">
            {/* Top row: Description and Amount */}
            <div className="flex justify-between items-start gap-4">
                <p className="font-semibold text-text-primary dark:text-dark-text-primary break-words">{t.description}</p>
                <p className={`text-lg font-bold whitespace-nowrap ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                </p>
            </div>
            {/* Bottom row: Date, Category, and Actions */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm text-text-secondary dark:text-dark-text-secondary">
                    <div className="flex flex-col">
                        <span>{format(new Date(t.date), 'dd MMM')}</span>
                        <span className="text-xs text-text-secondary/80 dark:text-dark-text-secondary/80">{format(new Date(t.date), 'yyyy')}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-border dark:bg-dark-border"></div>
                    <span className="truncate border border-border dark:border-dark-border/50 px-2 py-1 rounded-md text-xs max-w-36" title={t.categories?.name || 'Uncategorized'}>
                        {t.categories?.name || 'Uncategorized'}
                    </span>
                </div>
                <div className="flex items-center shrink-0">
                    <button onClick={() => handleOpenTransactionModal(t)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors" aria-label={`Edit transaction ${t.description}`}><EditIcon /></button>
                    <button onClick={() => handleDeleteRequest(t, 'transaction')} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-danger transition-colors" aria-label={`Delete transaction ${t.description}`}><TrashIcon /></button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen">
            <header className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm p-4 shadow-md flex justify-between items-center border-b border-border dark:border-dark-border sticky top-0 z-40">
                <h1 className="text-2xl font-bold text-primary">FinWise</h1>
                <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-sm text-text-secondary dark:text-dark-text-secondary hidden sm:block truncate max-w-xs">{session.user.email}</span>
                     <button 
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" aria-label="Logout">
                        <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {error && (
                    <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)} aria-label="Close error message">
                           <CloseIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                     <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow border border-border dark:border-dark-border">
                        <h2 className="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary">Total Income</h2>
                        <p className="text-4xl font-bold text-success truncate">
                            ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                     <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow border border-border dark:border-dark-border">
                        <h2 className="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary">Total Expenses</h2>
                        <p className="text-4xl font-bold text-danger truncate">
                            ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow border border-border dark:border-dark-border">
                        <h2 className="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary">Current Balance</h2>
                        <p className={`text-4xl font-bold truncate ${currentBalance < 0 ? 'text-danger' : 'text-text-primary dark:text-dark-text-primary'}`}>
                            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-surface dark:bg-dark-surface p-4 rounded-lg shadow border border-border dark:border-dark-border">
                        <button onClick={() => handleOpenTransactionModal(null)} className="w-full flex items-center justify-center gap-2 text-text-primary dark:text-dark-text-primary bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors font-semibold rounded-lg p-3 text-base border border-transparent dark:border-dark-border">
                            <PlusIcon className="w-5 h-5" /> Add Transaction
                        </button>
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                            <button onClick={() => setModal('category')} className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
                                <TagIcon /> Categories
                            </button>
                            <button onClick={() => setModal('import')} className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
                                <UploadIcon className="w-5 h-5"/> Import
                            </button>
                            <button onClick={() => setModal('export')} className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary transition-colors font-medium text-sm">
                                <DownloadIcon className="w-5 h-5"/> Export Data
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow border border-border dark:border-dark-border">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="relative w-full sm:max-w-xs">
                             <label htmlFor="search-transactions" className="sr-only">Search transactions</label>
                            <input
                                id="search-transactions"
                                type="text"
                                placeholder="Search descriptions..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-10 border border-border dark:border-dark-border rounded-md bg-background dark:bg-dark-background focus:ring-2 focus:ring-primary"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-dark-text-secondary" />
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
                            {(Object.keys(FilterType) as Array<keyof typeof FilterType>).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setFilterType(FilterType[key])}
                                    className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-colors ${filterType === FilterType[key] ? 'bg-primary text-white shadow' : 'text-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                                >
                                    {FilterType[key]}
                                </button>
                            ))}
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner className="w-12 h-12 text-primary" />
                        </div>
                    ) : (
                        <div>
                             {/* Desktop Table View */}
                            <div className="overflow-x-auto hidden md:block">
                               <table className="w-full text-left">
                                    <thead className="border-b border-border dark:border-dark-border">
                                        <tr>
                                            <th className="p-3 font-semibold text-text-secondary dark:text-dark-text-secondary">Date</th>
                                            <th className="p-3 font-semibold text-text-secondary dark:text-dark-text-secondary">Description</th>
                                            <th className="p-3 font-semibold text-text-secondary dark:text-dark-text-secondary">Category</th>
                                            <th className="p-3 font-semibold text-text-secondary dark:text-dark-text-secondary text-right">Amount</th>
                                            <th className="p-3 font-semibold text-text-secondary dark:text-dark-text-secondary text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                            <tr key={t.id} className="border-b border-border dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                                <td className="p-3">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                                                <td className="p-3">{t.description}</td>
                                                <td className="p-3">{t.categories?.name || 'Uncategorized'}</td>
                                                <td className={`p-3 text-right font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                                    {t.type === 'expense' && '-'}₹{t.amount.toLocaleString('en-IN')}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <button onClick={() => handleOpenTransactionModal(t)} className="p-1 text-text-secondary dark:text-dark-text-secondary hover:text-primary rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"><EditIcon /></button>
                                                        <button onClick={() => handleDeleteRequest(t, 'transaction')} className="p-1 text-text-secondary dark:text-dark-text-secondary hover:text-danger rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><TrashIcon /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-10 text-text-secondary dark:text-dark-text-secondary">No transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile Card View */}
                             <div className="space-y-4 md:hidden">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(renderTransactionCard)
                                ) : (
                                    <p className="text-center py-10 text-text-secondary dark:text-dark-text-secondary">No transactions found.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            <TransactionModal
                isOpen={modal === 'transaction'}
                onClose={() => setModal(null)}
                onSave={handleSave}
                transaction={selectedTransaction}
                categories={categories}
            />

            <CategoryModal
                isOpen={modal === 'category'}
                onClose={() => setModal(null)}
                onSave={handleSave}
                categories={categories}
                onDeleteRequest={(category) => handleDeleteRequest(category, 'category')}
                categoryTotals={categoryTotals}
            />

            <ImportModal
                isOpen={modal === 'import'}
                onClose={() => setModal(null)}
                onImportSuccess={handleSave}
                categories={categories}
            />
            
            <ExportModal isOpen={modal === 'export'} onClose={() => setModal(null)} />
            
            {itemToDelete && <ConfirmModal
                isOpen={modal === 'confirmDelete'}
                onClose={() => setModal(null)}
                onConfirm={confirmDeleteItem}
                title={`Delete ${itemToDelete.type}`}
                description={`Are you sure you want to delete this ${itemToDelete.type}? This action cannot be undone.`}
            />}
        </div>
    );
};

export default Dashboard;