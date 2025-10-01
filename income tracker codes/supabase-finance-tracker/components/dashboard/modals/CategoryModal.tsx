
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
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, categories, onDeleteRequest }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        // Reset form when modal is closed or opened
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
        // Let Dashboard's ConfirmModal handle the rest
        setDeletingId(null);
    };

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
                            className="flex-grow p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <select 
                            value={type} 
                            onChange={e => setType(e.target.value as any)} 
                            className="w-full sm:w-auto p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                     <div className="flex items-center justify-end gap-2">
                        {editingCategory && (
                             <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-md font-semibold bg-white hover:bg-gray-100 border border-border text-text-primary">
                                Cancel
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded-md font-semibold bg-primary hover:bg-indigo-700 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Spinner className="w-5 h-5" /> : (editingCategory ? 'Update Category' : 'Add Category')}
                        </button>
                    </div>
                </form>

                {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
                
                <div className="border-t border-border pt-4">
                    <h3 className="font-semibold text-text-primary mb-2">Existing Categories</h3>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {categories.length > 0 ? categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border border-border">
                            <div>
                                    <span className={`font-semibold ${cat.type === 'income' ? 'text-secondary' : 'text-danger'}`}>{cat.name}</span>
                                    <span className="text-xs text-text-secondary ml-2 capitalize">({cat.type})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(cat)} className="text-text-secondary hover:text-primary p-1 rounded-full hover:bg-gray-200">
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteCategory(cat)} disabled={deletingId === cat.id} className="text-text-secondary hover:text-danger p-1 rounded-full hover:bg-red-100 disabled:opacity-50">
                                    {deletingId === cat.id ? <Spinner className="w-4 h-4"/> : <TrashIcon className="w-4 h-4"/>}
                                </button>
                            </div>
                            </div>
                        )) : <p className="text-text-secondary text-center py-4">No categories created yet.</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CategoryModal;