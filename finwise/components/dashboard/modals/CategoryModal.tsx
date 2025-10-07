import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import type { Category } from '../../../types';
import Modal from '../../ui/Modal';
import { PlusIcon, TrashIcon, EditIcon, Spinner } from '../../ui/Icons';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    categories: Category[];
    onDeleteRequest: (category: Category) => void;
    categoryTotals: { [key: string]: number };
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, categories, onDeleteRequest, categoryTotals }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        if (!isOpen) {
            cancelEdit();
        }
    }, [isOpen]);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setType(category.type);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setName('');
        setType('expense');
        setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setErrorMessage("User not found. Please log in again.");
            setLoading(false);
            return;
        }

        if (editingCategory) {
            // Update existing category
            const { error } = await supabase.from('categories').update({ name, type }).eq('id', editingCategory.id);
            if (error) {
                setErrorMessage(error.message);
            } else {
                cancelEdit();
                onSave();
            }
        } else {
            // Insert new category
            const { error } = await supabase.from('categories').insert({ user_id: user.id, name, type });
            if (error) {
                setErrorMessage(error.message);
            } else {
                setName(''); // Clear name only on successful add
                onSave();
            }
        }
        setLoading(false);
    };

    const deleteCategory = async (category: Category) => {
        setDeletingId(category.id);
        onDeleteRequest(category);
        setDeletingId(null);
    };

    const inputClasses = "p-2 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary dark:text-dark-text-primary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" size="lg">
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="text" 
                            placeholder="Category Name" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                            className={`flex-grow ${inputClasses}`}
                        />
                        <select 
                            value={type} 
                            onChange={e => setType(e.target.value as any)} 
                            className={`w-full sm:w-auto ${inputClasses}`}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                     <div className="flex items-center justify-end gap-2">
                        {editingCategory && (
                             <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-md font-semibold bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-slate-700 border border-border dark:border-dark-border text-text-primary dark:text-dark-text-primary transition-colors">
                                Cancel
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded-md font-semibold bg-primary hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                            {loading ? <Spinner className="w-5 h-5" /> : (editingCategory ? 'Update Category' : 'Add Category')}
                        </button>
                    </div>
                </form>

                {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
                
                <div className="border-t border-border dark:border-dark-border pt-4">
                    <h3 className="font-semibold text-text-primary dark:text-dark-text-primary mb-2">Existing Categories</h3>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {categories.length > 0 ? categories.map(cat => {
                            const totalAmount = categoryTotals[cat.id] ?? 0;
                            return (
                                <div key={cat.id} className={`flex justify-between items-center p-3 bg-surface dark:bg-dark-surface rounded-lg border shadow-sm ${
                                    cat.type === 'income' 
                                    ? 'border-green-200 dark:border-green-500/30' 
                                    : 'border-red-200 dark:border-red-500/30'
                                }`}>
                                    <div className="flex-grow truncate pr-4">
                                        <span className={`font-semibold truncate ${cat.type === 'income' ? 'text-success' : 'text-danger'}`}>{cat.name}</span>
                                        <span className="text-xs text-text-secondary dark:text-dark-text-secondary ml-2 capitalize">({cat.type})</span>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 shrink-0">
                                        {totalAmount > 0 && (
                                            <span className="font-mono text-sm text-text-primary dark:text-dark-text-primary text-right w-28 truncate" title={`₹${totalAmount.toLocaleString('en-IN')}`}>
                                            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleEdit(cat)} className="text-text-secondary dark:text-dark-text-secondary hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => deleteCategory(cat)} disabled={deletingId === cat.id} className="text-text-secondary dark:text-dark-text-secondary hover:text-danger p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                                                {deletingId === cat.id ? <Spinner className="w-5 h-5"/> : <TrashIcon className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-text-secondary dark:text-dark-text-secondary text-center py-4">No categories created yet.</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CategoryModal;