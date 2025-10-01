import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import type { Transaction, Category } from '../../types';
import { FilterType } from '../../types';
import { PlusIcon, LogoutIcon, SettingsIcon, EditIcon, TrashIcon, Spinner } from '../ui/Icons';
import TransactionModal from './modals/TransactionModal';
import CategoryModal from './modals/CategoryModal';
import DataToolsModal from './modals/SettingsModal';
import ConfirmModal from '../ui/ConfirmModal';

const TRANSACTIONS_PER_PAGE = 10;

interface DashboardProps {
  session: Session;
}

interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>(FilterType.All);
    const [transactionCount, setTransactionCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });

    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isDataToolsModalOpen, setDataToolsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    
    const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
    });

    const totalPages = Math.ceil(transactionCount / TRANSACTIONS_PER_PAGE);

    const fetchSummaryData = useCallback(async () => {
        const { data: incomeData, error: incomeError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', session.user.id)
            .eq('type', 'income');

        const { data: expenseData, error: expenseError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', session.user.id)
            .eq('type', 'expense');

        if (incomeError || expenseError) {
            console.error('Error fetching summary:', incomeError?.message || expenseError?.message);
            return;
        }
        
        const totalIncome = incomeData?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const totalExpenses = expenseData?.reduce((sum, t) => sum + t.amount, 0) || 0;
        setSummary({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses });

    }, [session.user.id]);

    const fetchData = useCallback(async (shouldFetchSummary = true) => {
        setLoading(true);
        const from = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
        const to = from + TRANSACTIONS_PER_PAGE - 1;

        let transactionQuery = supabase
            .from('transactions')
            .select('*, categories(name)', { count: 'exact' })
            .eq('user_id', session.user.id);
        
        if (filter !== FilterType.All) {
            transactionQuery = transactionQuery.eq('type', filter);
        }
        
        const { data: transactionsData, error: transactionsError, count } = await transactionQuery
            .order('date', { ascending: false })
            .range(from, to);

        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', session.user.id)
            .order('name', { ascending: true });

        if (transactionsError) console.error('Error fetching transactions:', transactionsError.message);
        else {
            setTransactions(transactionsData as any || []);
            setTransactionCount(count || 0);
        }

        if (categoriesError) console.error('Error fetching categories:', categoriesError.message);
        else setCategories(categoriesData || []);
        
        if (shouldFetchSummary) {
            await fetchSummaryData();
        }
        setLoading(false);
    }, [session.user.id, currentPage, filter, fetchSummaryData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    useEffect(() => {
        const channel = supabase.channel('public-db-changes');
        
        channel
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, 
            () => fetchData()
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, 
            () => fetchData(false)
          )
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [fetchData]);
    
    const openAddTransactionModal = () => {
        setEditingTransaction(null);
        setTransactionModalOpen(true);
    };

    const openEditTransactionModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setTransactionModalOpen(true);
    };

    const confirmDeleteTransaction = (id: string) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Delete Transaction',
            description: 'Are you sure you want to delete this transaction? This action cannot be undone.',
            onConfirm: async () => {
                const { error } = await supabase.from('transactions').delete().eq('id', id);
                if (error) alert(error.message);
                // No need to call fetchData(), realtime will handle it
            }
        });
    };

    const confirmDeleteCategory = (category: Category) => {
        setConfirmModalState({
            isOpen: true,
            title: `Delete Category: ${category.name}`,
            description: 'This will also delete all associated transactions. This action cannot be undone.',
            onConfirm: async () => {
                const { error } = await supabase.from('categories').delete().eq('id', category.id);
                if (error) alert(error.message);
                 // No need to call fetchData(), realtime will handle it
            }
        });
    };
    
    const handleConfirm = () => {
        if(confirmModalState.onConfirm) {
            confirmModalState.onConfirm();
        }
        setConfirmModalState({ isOpen: false, title: '', description: '', onConfirm: null });
    }

    const confirmResetData = () => {
        setConfirmModalState({
            isOpen: true,
            title: 'Reset All Data',
            description: 'Are you sure you want to permanently delete all your transactions and categories? This action cannot be undone.',
            onConfirm: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.error("User not authenticated for reset.");
                    return;
                };

                const { error: transactionError } = await supabase.from('transactions').delete().eq('user_id', user.id);
                if(transactionError) console.error("Error deleting transactions:", transactionError.message);

                const { error: categoryError } = await supabase.from('categories').delete().eq('user_id', user.id);
                if(categoryError) console.error("Error deleting categories:", categoryError.message);

                fetchData(); // Refresh UI
            }
        });
    };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary">Welcome back, {session.user.email}</p>
        </div>
      </header>

      {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl shadow-md border border-border">
                <h3 className="text-text-secondary text-sm font-medium">Total Income</h3>
                <p className="text-3xl font-semibold text-secondary">₹{summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-md border border-border">
                <h3 className="text-text-secondary text-sm font-medium">Total Expenses</h3>
                <p className="text-3xl font-semibold text-danger">₹{summary.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-md border border-border">
                <h3 className="text-text-secondary text-sm font-medium">Net Balance</h3>
                <p className={`text-3xl font-semibold ${summary.balance >= 0 ? 'text-secondary' : 'text-danger'}`}>₹{summary.balance.toFixed(2)}</p>
            </div>
        </div>

      {/* Action Bar */}
      <div className="bg-surface border border-border p-4 rounded-xl mb-6 flex flex-wrap items-center gap-2">
            <button 
                onClick={openAddTransactionModal} 
                className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md text-white bg-primary hover:bg-indigo-700 transition-colors"
            >
                <PlusIcon className="w-5 h-5"/> Add Transaction
            </button>
            <button 
                onClick={() => setCategoryModalOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md text-secondary bg-white hover:bg-green-50 border border-secondary transition-colors"
            >
                <SettingsIcon className="w-5 h-5"/> Manage Categories
            </button>
            <button 
                onClick={() => setDataToolsModalOpen(true)} 
                className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md text-text-primary bg-white hover:bg-gray-100 border border-border transition-colors"
            >
                Import / Export
            </button>
            <button 
                onClick={confirmResetData} 
                className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md text-danger bg-white hover:bg-red-50 border border-danger transition-colors"
            >
                Reset Data
            </button>
            <button 
                onClick={() => supabase.auth.signOut()} 
                className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md text-text-primary bg-white hover:bg-gray-100 border border-border transition-colors"
            >
                <LogoutIcon className="w-5 h-5" /> Sign Out
            </button>
      </div>

      {/* Tabs */}
        <div className="flex border-b border-border mb-6">
            {(Object.values(FilterType)).map(tab => (
                 <button key={tab} onClick={() => setFilter(tab)} className={`capitalize px-4 py-2 text-sm font-medium transition-colors ${filter === tab ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                    {tab}
                </button>
            ))}
        </div>
      
      {/* Transaction List (Desktop) */}
       <div className="hidden md:block bg-surface rounded-xl shadow-md border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-sm text-text-secondary">Date</th>
                            <th className="px-6 py-4 font-semibold text-sm text-text-secondary">Description</th>
                            <th className="px-6 py-4 font-semibold text-sm text-text-secondary">Category</th>
                            <th className="px-6 py-4 font-semibold text-sm text-text-secondary text-right">Amount</th>
                            <th className="px-6 py-4 font-semibold text-sm text-text-secondary text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-8"><Spinner className="w-8 h-8 mx-auto text-primary" /></td></tr>
                        ) : transactions.length > 0 ? (
                            transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-text-secondary whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-text-primary font-medium">{t.description}</td>
                                    <td className="px-6 py-4 text-text-secondary">{t.categories?.name || 'Uncategorized'}</td>
                                    <td className={`px-6 py-4 font-mono text-right whitespace-nowrap ${t.type === 'income' ? 'text-secondary' : 'text-danger'}`}>
                                        {t.type === 'expense' ? '-' : '+'}₹{t.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditTransactionModal(t)} className="text-text-secondary hover:text-primary p-1 rounded-full hover:bg-gray-100"><EditIcon /></button>
                                            <button onClick={() => confirmDeleteTransaction(t.id)} className="text-text-secondary hover:text-danger p-1 rounded-full hover:bg-red-100"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8 text-text-secondary">No transactions found for this filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 flex justify-between items-center text-sm text-text-secondary border-t border-border">
                    <div>
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 border border-border disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 border border-border disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Transaction Cards (Mobile) */}
        <div className="md:hidden space-y-4">
             {loading ? (
                <div className="text-center p-8 bg-surface rounded-xl shadow-md border border-border"><Spinner className="w-8 h-8 mx-auto text-primary" /></div>
            ) : transactions.length > 0 ? (
                transactions.map(t => (
                    <div key={t.id} className="bg-surface rounded-xl shadow-md border border-border p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-grow pr-4">
                                <p className="font-bold text-text-primary truncate">{t.description}</p>
                                <p className="text-sm text-text-secondary">{t.categories?.name || 'Uncategorized'}</p>
                            </div>
                            <div className={`font-mono whitespace-nowrap text-right ${t.type === 'income' ? 'text-secondary' : 'text-danger'}`}>
                                {t.type === 'expense' ? '-' : '+'}₹{t.amount.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-text-secondary border-t border-border pt-3 mt-3">
                            <span>{new Date(t.date).toLocaleDateString()}</span>
                            <div className="flex justify-center gap-2">
                                <button onClick={() => openEditTransactionModal(t)} className="text-text-secondary hover:text-primary p-1 rounded-full hover:bg-gray-100"><EditIcon /></button>
                                <button onClick={() => confirmDeleteTransaction(t.id)} className="text-text-secondary hover:text-danger p-1 rounded-full hover:bg-red-100"><TrashIcon /></button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-8 text-text-secondary bg-surface rounded-xl shadow-md border border-border">No transactions found for this filter.</div>
            )}
            {/* Mobile Pagination */}
            {totalPages > 1 && (
                <div className="pt-2 flex justify-between items-center text-sm text-text-secondary">
                     <div>
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 border border-border disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 border border-border disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>

        <TransactionModal 
            isOpen={isTransactionModalOpen}
            onClose={() => setTransactionModalOpen(false)}
            onSave={() => { /* Realtime handles update */ }}
            transaction={editingTransaction}
            categories={categories}
        />
        <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setCategoryModalOpen(false)}
            onSave={() => { /* Realtime handles update */ }}
            categories={categories}
            onDeleteRequest={confirmDeleteCategory}
        />
        <DataToolsModal 
            isOpen={isDataToolsModalOpen}
            onClose={() => setDataToolsModalOpen(false)}
            onImportSuccess={() => fetchData()}
        />
        <ConfirmModal
            isOpen={confirmModalState.isOpen}
            onClose={() => setConfirmModalState({ isOpen: false, title: '', description: '', onConfirm: null })}
            onConfirm={handleConfirm}
            title={confirmModalState.title}
            description={confirmModalState.description}
        />

    </div>
  );
};

export default Dashboard;