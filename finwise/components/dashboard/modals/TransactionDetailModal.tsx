
import React from 'react';
import type { Transaction } from '../../../types';
import Modal from '../../ui/Modal';
import { EditIcon } from '../../ui/Icons';
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
        <div className="bg-background dark:bg-dark-background p-4 sm:p-6 rounded-lg border-2 border-dashed border-border dark:border-dark-border">
          
          {/* Amount is primary focus at the top */}
          <div className="text-center pb-4 mb-4 border-b-2 border-dashed border-border dark:border-dark-border">
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm font-semibold uppercase tracking-wider">{transaction.type === 'income' ? 'Income' : 'Expense'}</p>
              <p className={`text-5xl font-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm font-semibold uppercase tracking-wider mb-1">For</p>
            <p className="text-xl font-semibold text-text-primary dark:text-dark-text-primary text-balance">{transaction.description}</p>
          </div>
          
          {/* Details */}
          <div className="space-y-3 text-sm pt-4 border-t-2 border-dashed border-border dark:border-dark-border">
              <div className="flex justify-between items-baseline">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Category</span>
                  <span className="font-semibold text-text-primary dark:text-dark-text-primary text-right">{transaction.categories?.name || 'Uncategorized'}</span>
              </div>
              <div className="flex justify-between items-baseline">
                  <span className="text-text-secondary dark:text-dark-text-secondary">Payment Date</span>
                  <span className="font-semibold text-text-primary dark:text-dark-text-primary">{format(new Date(transaction.date), 'dd MMMM, yyyy')}</span>
              </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-1">
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
