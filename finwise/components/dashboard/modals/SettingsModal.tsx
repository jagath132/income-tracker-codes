
{/* FIX: Implement the SettingsModal component. The original file was empty. */}
import React from 'react';
import { NegativeBalanceBehavior } from '../../../types';
import Modal from '../../ui/Modal';
import { SunIcon, MoonIcon } from '../../ui/Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBehavior: NegativeBalanceBehavior;
    onBehaviorChange: (behavior: NegativeBalanceBehavior) => void;
    currentTheme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    currentBehavior, 
    onBehaviorChange,
    currentTheme,
    onThemeChange
}) => {
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
            <div className="space-y-6">
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">Theme</h3>
                    <div className="flex items-center justify-between gap-4 p-3 border border-border dark:border-dark-border rounded-md">
                       <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Switch between light and dark mode.</p>
                       <button 
                         onClick={() => onThemeChange(currentTheme === 'light' ? 'dark' : 'light')} 
                         className="p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-text-primary dark:text-dark-text-primary hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                       >
                            {currentTheme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                       </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">Negative Balance Behavior</h3>
                    <div className="p-4 border border-border dark:border-dark-border rounded-md space-y-3">
                         <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">Choose how the app should handle transactions that would result in a negative balance.</p>
                        <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                            <input 
                                type="radio" 
                                name="negativeBalanceBehavior" 
                                value={NegativeBalanceBehavior.Warn} 
                                checked={currentBehavior === NegativeBalanceBehavior.Warn} 
                                onChange={() => onBehaviorChange(NegativeBalanceBehavior.Warn)}
                                className="form-radio text-primary focus:ring-primary"
                            />
                            <div>
                                <span className="font-medium text-text-primary dark:text-dark-text-primary">Warn</span>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Show a warning and let you choose how to proceed.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                            <input 
                                type="radio" 
                                name="negativeBalanceBehavior" 
                                value={NegativeBalanceBehavior.Block} 
                                checked={currentBehavior === NegativeBalanceBehavior.Block} 
                                onChange={() => onBehaviorChange(NegativeBalanceBehavior.Block)}
                                className="form-radio text-primary focus:ring-primary"
                            />
                             <div>
                                <span className="font-medium text-text-primary dark:text-dark-text-primary">Block</span>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Prevent the transaction from being saved.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                            <input 
                                type="radio" 
                                name="negativeBalanceBehavior" 
                                value={NegativeBalanceBehavior.Allow} 
                                checked={currentBehavior === NegativeBalanceBehavior.Allow} 
                                onChange={() => onBehaviorChange(NegativeBalanceBehavior.Allow)}
                                className="form-radio text-primary focus:ring-primary"
                            />
                            <div>
                                <span className="font-medium text-text-primary dark:text-dark-text-primary">Allow</span>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Allow the balance to go negative without any warning.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border dark:border-dark-border">
                    <button onClick={onClose} className="px-4 py-2 font-semibold rounded-md bg-primary hover:bg-indigo-500 text-white transition-colors">Done</button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
