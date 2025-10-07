import React from 'react';
import Modal from '../../ui/Modal';
import { Spinner } from '../../ui/Icons';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  insightsText: string;
  error: string | null;
}

const parseMarkdownToHTML = (markdown: string): string => {
  const lines = markdown.split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    // Process inline styles first
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-text-primary dark:text-dark-text-primary">$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

    const isUl = line.trim().startsWith('* ');
    const isOl = /^\d+\.\s/.test(line.trim());

    // Close lists if the pattern breaks
    if (inUl && !isUl) { html += '</ul>'; inUl = false; }
    if (inOl && !isOl) { html += '</ol>'; inOl = false; }
    
    // Process block styles
    if (line.trim().startsWith('### ')) {
        html += `<h3 class="text-lg font-bold mt-4 mb-2 text-text-primary dark:text-dark-text-primary">${line.substring(4)}</h3>`;
    } else if (isUl) {
        if (!inUl) { html += '<ul class="list-disc list-inside space-y-1 my-2">'; inUl = true; }
        html += `<li>${line.trim().substring(2)}</li>`;
    } else if (isOl) {
        if (!inOl) { html += '<ol class="list-decimal list-inside space-y-1 my-2">'; inOl = true; }
        html += `<li>${line.trim().replace(/^\d+\.\s/, '')}</li>`;
    } else if (line.trim() !== '') {
        html += `<p>${line}</p>`;
    } else {
        html += ''; // Ignore empty lines for cleaner spacing
    }
  }

  // Close any remaining open lists
  if (inUl) html += '</ul>';
  if (inOl) html += '</ol>';

  return html;
};

const FormattedInsights: React.FC<{ text: string }> = ({ text }) => {
    const htmlContent = parseMarkdownToHTML(text);
    return (
        <div 
            className="space-y-3 text-text-secondary dark:text-dark-text-secondary leading-relaxed text-left w-full"
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
    );
};

const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose, isLoading, insightsText, error }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Financial Insights ✨" size="lg">
      <div className="p-2 min-h-[250px] flex flex-col justify-center items-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-text-secondary dark:text-dark-text-secondary">
            <Spinner className="w-12 h-12 text-primary" />
            <p className="font-semibold">Analyzing your transactions...</p>
            <p className="text-sm">This may take a moment.</p>
          </div>
        )}
        {error && (
            <div className="text-center space-y-3">
                <p className="text-danger font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary bg-red-50 dark:bg-red-900/50 p-3 rounded-md">{error}</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 font-semibold rounded-md bg-primary hover:bg-indigo-500 text-white transition-colors">
                    Close
                </button>
            </div>
        )}
        {!isLoading && !error && insightsText && (
          <FormattedInsights text={insightsText} />
        )}
      </div>
    </Modal>
  );
};

export default InsightsModal;