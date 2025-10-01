import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../services/supabase';
import type { Transaction, Category } from '../../../types';
import Modal from '../../ui/Modal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    transaction: Transaction | null;
    categories: Category[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, categories }) => {
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
        
        if (parseFloat(amount) <= 0) {
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
            amount: parseFloat(amount),
            description,
            category_id: categoryId,
            date,
        };

        const { error } = transaction 
            ? await supabase.from('transactions').update(transactionData).eq('id', transaction.id)
            : await supabase.from('transactions').insert(transactionData);

        if (error) {
            setErrorMessage(error.message);
        } else {
            onSave();
            onClose();
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="form-radio text-primary focus:ring-primary" />
                        <span className="text-text-primary">Expense</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="form-radio text-primary focus:ring-primary" />
                        <span className="text-text-primary">Income</span>
                    </label>
                </div>
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" step="0.01" />
                <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                 <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="" disabled>Select Category</option>
                    {filteredCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                
                {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
                
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-white hover:bg-gray-100 border border-border text-text-primary">Cancel</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 rounded-md font-semibold bg-primary hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionModal;