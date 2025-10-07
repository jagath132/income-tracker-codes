import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../services/supabase';
import type { Transaction, Category } from '../../../types';
import Modal from '../../ui/Modal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction, isNew: boolean) => void;
    transaction: Transaction | null;
    categories: Category[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    transaction, 
    categories
}) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const resetForm = () => {
        setType(transaction?.type || 'expense');
        setAmount(transaction?.amount.toString() || '');
        setDescription(transaction?.description || '');
        setCategoryId(transaction?.category_id || '');
        setDate(transaction?.date || new Date().toISOString().split('T')[0]);
        setErrorMessage(null);
    };

    useEffect(() => {
        if (isOpen) {
           resetForm();
        }
    }, [transaction, isOpen]);

    const filteredCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);
    
    useEffect(() => {
        if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
            setCategoryId('');
        }
    }, [type, filteredCategories, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const parsedAmount = parseFloat(amount);
        if (parsedAmount <= 0) {
            setErrorMessage("Amount must be greater than zero.");
            return;
        }
        if (!categoryId) {
            setErrorMessage("Please select a category.");
            return;
        }
        
        setLoading(true);
        setErrorMessage(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setErrorMessage("User not authenticated. Please log in again.");
            setLoading(false);
            return;
        }

        const transactionData = {
            user_id: user.id,
            type,
            amount: parsedAmount,
            description,
            category_id: categoryId,
            date,
        };

        try {
            const isNew = !transaction;
            
            const { data, error } = isNew
                ? await supabase.from('transactions').insert(transactionData).select().single()
                : await supabase.from('transactions').update(transactionData).eq('id', transaction!.id).select().single();

            if (error) {
                throw error;
            } else if (data) {
                onSave(data, isNew);
                onClose();
            } else {
                setErrorMessage("Could not save the transaction. Please try again.");
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full p-2 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary dark:text-dark-text-primary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="form-radio text-primary focus:ring-primary" />
                        <span className="text-text-primary dark:text-dark-text-primary">Expense</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="form-radio text-primary focus:ring-primary" />
                        <span className="text-text-primary dark:text-dark-text-primary">Income</span>
                    </label>
                </div>
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className={inputClasses} step="0.01" />
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className={inputClasses} />
                 <div>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className={inputClasses}>
                        <option value="" disabled>Select Category</option>
                        {filteredCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className={inputClasses} />
                
                {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
                
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-slate-700 border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 rounded-md font-semibold bg-primary hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionModal;