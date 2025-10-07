import React from 'react';
import type { Transaction } from '../../../types';
import Modal from '../../ui/Modal';
import { TagIcon, EditIcon, CalendarIcon } from '../../ui/Icons';
import { format } from 'date-fns';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  transaction: Transaction | null;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, onEdit, transaction }) => {
  if (!isOpen || !transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details" size="sm">
      <div className="space-y-5">
        {/* Amount and Description */}
        <div className="text-center pb-4 border-b border-border dark:border-dark-border">
          <p className={`text-3xl font-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
            {transaction.type === 'expense' ? '-' : ''}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary break-words">{transaction.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-text-primary dark:text-dark-text-primary">
          <div className="flex items-center gap-3 p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
            <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Date</p>
              <p className="font-semibold text-sm">{format(new Date(transaction.date), 'dd MMM yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
            <TagIcon className="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Category</p>
              <p className="font-semibold truncate text-sm">{transaction.categories?.name || 'Uncategorized'}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-5 border-t border-border dark:border-dark-border">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold rounded-md text-text-primary dark:text-dark-text-primary bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-slate-700 border border-border dark:border-dark-border focus:outline-none transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(transaction)}
            className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md text-white bg-primary hover:bg-indigo-500 focus:outline-none transition-colors"
          >
            <EditIcon className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;