
import React from 'react';
import Modal from '../../ui/Modal';

interface NegativeBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onIgnore: () => void;
}

const NegativeBalanceModal: React.FC<NegativeBalanceModalProps> = ({ isOpen, onClose, onConfirm, onIgnore }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Negative Balance Warning" size="md">
      <div className="space-y-6">
        <p className="text-text-secondary dark:text-dark-text-secondary">
          This transaction will cause your account balance to become negative. How would you like to proceed?
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold rounded-md text-text-primary dark:text-dark-text-primary bg-surface dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-slate-700 border border-border dark:border-dark-border focus:outline-none transition-colors"
          >
            Cancel Transaction
          </button>
          <button
            onClick={onIgnore}
            className="px-4 py-2 font-semibold rounded-md text-warning bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-warning focus:outline-none transition-colors"
          >
            Ignore (Allow Negative)
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 font-semibold rounded-md text-white bg-primary hover:bg-indigo-500 focus:outline-none transition-colors"
          >
            Add Correction & Proceed
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NegativeBalanceModal;
