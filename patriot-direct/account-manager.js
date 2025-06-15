/**
 * Account Manager - Handles balance and transfer operations
 * Clean, reusable JavaScript functions for banking dashboard
 * Now with localStorage persistence for balance
 */

// Global account data storage (in-memory + localStorage)
window.AccountManager = {
    // Account data (static info)
    currentUser: {
        accountNumber: "3432567810",
        routingNumber: "111000025", 
        name: "Michael Wright"
    },

    // Initial balance amount (used only for first-time initialization)
    INITIAL_BALANCE: 674590.00,
    
    // Storage keys
    STORAGE_KEYS: {
        BALANCE: 'account_balance',
        TRANSACTIONS: 'account_transactions'
    },

    /**
     * Initialize the account manager
     */
    init() {
        console.log('Account Manager initialized');
        this.initializeBalance();
        this.loadTransactions();
        this.updateDashboardBalance();
        this.updateTransferBalance();
    },

    /**
     * Initialize balance from localStorage or set initial amount
     */
    initializeBalance() {
        const storedBalance = localStorage.getItem(this.STORAGE_KEYS.BALANCE);
        
        if (storedBalance === null) {
            // First time - set initial balance
            console.log('First time initialization - setting initial balance');
            this.setBalance(this.INITIAL_BALANCE);
        } else {
            // Balance exists in localStorage
            const balance = parseFloat(storedBalance);
            if (isNaN(balance)) {
                console.warn('Invalid balance in localStorage, resetting to initial amount');
                this.setBalance(this.INITIAL_BALANCE);
            }
        }
    },

    /**
     * Get current user balance from localStorage
     * @returns {number} Current balance
     */
    getCurrentBalance() {
        const storedBalance = localStorage.getItem(this.STORAGE_KEYS.BALANCE);
        const balance = parseFloat(storedBalance);
        return isNaN(balance) ? this.INITIAL_BALANCE : balance;
    },

    /**
     * Set balance in localStorage and immediately update UI
     * @param {number} amount - New balance amount
     */
    setBalance(amount) {
        const newBalance = parseFloat(amount);
        if (isNaN(newBalance)) {
            console.error('Invalid balance amount provided');
            return;
        }
        
        localStorage.setItem(this.STORAGE_KEYS.BALANCE, newBalance.toString());
        console.log(`Balance updated to: ${this.formatCurrency(newBalance)}`);
        
        // Immediately update all balance displays
        this.updateAllBalanceDisplays();
    },

    /**
     * Deduct amount from balance
     * @param {number} amount - Amount to deduct
     * @returns {boolean} True if successful, false if insufficient funds
     */
    deductFromBalance(amount) {
        const currentBalance = this.getCurrentBalance();
        const deductAmount = parseFloat(amount);
        
        if (isNaN(deductAmount) || deductAmount <= 0) {
            console.error('Invalid deduction amount');
            return false;
        }
        
        if (currentBalance < deductAmount) {
            console.warn('Insufficient funds for deduction');
            return false;
        }
        
        const newBalance = currentBalance - deductAmount;
        this.setBalance(newBalance);
        return true;
    },

    /**
     * Add amount to balance
     * @param {number} amount - Amount to add
     * @returns {boolean} True if successful
     */
    addToBalance(amount) {
        const currentBalance = this.getCurrentBalance();
        const addAmount = parseFloat(amount);
        
        if (isNaN(addAmount) || addAmount <= 0) {
            console.error('Invalid addition amount');
            return false;
        }
        
        const newBalance = currentBalance + addAmount;
        this.setBalance(newBalance);
        return true;
    },

    /**
     * Load transactions from localStorage
     */
    loadTransactions() {
        const storedTransactions = localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS);
        if (storedTransactions) {
            try {
                this.transactions = JSON.parse(storedTransactions);
            } catch (error) {
                console.error('Error loading transactions from localStorage:', error);
                this.transactions = [];
            }
        } else {
            this.transactions = [];
        }
    },

    /**
     * Save transactions to localStorage
     */
    saveTransactions() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving transactions to localStorage:', error);
        }
    },

    /**
     * Format currency for display
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Update all balance displays across the application
     */
    updateAllBalanceDisplays() {
        this.updateDashboardBalance();
        this.updateTransferBalance();
        this.updateAnyOtherBalanceElements();
    },

    /**
     * Update balance display on dashboard page
     */
    updateDashboardBalance() {
        const balanceElement = document.getElementById('totalBalance');
        const welcomeElement = document.getElementById('welcomeMsg');
        const transactionHistory = document.getElementById('transaction-current-balance');
        
        if (balanceElement) {
            const currentBalance = this.getCurrentBalance();
            balanceElement.textContent = this.formatCurrency(currentBalance);
            
            // Add smooth update animation
            balanceElement.style.transform = 'scale(1.05)';
            balanceElement.style.transition = 'transform 0.2s ease-in-out';
            setTimeout(() => {
                balanceElement.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (transactionHistory) {
            const currentBalance = this.getCurrentBalance();
            transactionHistory.textContent = this.formatCurrency(currentBalance);
        }
        
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${this.currentUser.name}`;
        }
    },

    /**
     * Update balance display on transfer page
     */
    updateTransferBalance() {
        const balanceInfo = document.getElementById('balanceInfo');
        
        if (balanceInfo) {
            const currentBalance = this.getCurrentBalance();
            balanceInfo.textContent = `Your Balance: ${this.formatCurrency(currentBalance)}`;
        }
    },

    /**
     * Update any other balance elements that might exist
     */
    updateAnyOtherBalanceElements() {
        // Update any other elements that might show balance
        const otherBalanceElements = document.querySelectorAll('[data-balance-display]');
        otherBalanceElements.forEach(element => {
            const currentBalance = this.getCurrentBalance();
            element.textContent = this.formatCurrency(currentBalance);
        });
    },

    /**
     * Process a money transfer
     * @param {Object} transferData - Transfer details
     * @returns {Object} Transfer result
     */
    processTransfer(transferData) {
        const { recipientAccount, routingNumber, recipientName, amount, note } = transferData;
        
        // Validation
        if (!this.validateTransfer(transferData)) {
            return {
                success: false,
                message: "Invalid transfer data. Please check all fields."
            };
        }

        // Check if transferring to own account
        if (recipientAccount === this.currentUser.accountNumber) {
            return {
                success: false,
                message: "Cannot transfer to your own account."
            };
        }

        // Check sufficient funds and deduct amount
        if (!this.deductFromBalance(amount)) {
            return {
                success: false,
                message: "Insufficient funds for this transfer."
            };
        }

        // Add to transaction history
        this.addTransaction({
            type: 'transfer_out',
            amount: amount,
            recipient: recipientName,
            recipientAccount: recipientAccount,
            note: note,
            date: new Date(),
            status: 'completed'
        });

        // Force immediate UI update - this ensures totalBalance updates right away
        this.updateAllBalanceDisplays();

        return {
            success: true,
            message: `Transfer of ${this.formatCurrency(amount)} to ${recipientName} completed successfully!`,
            newBalance: this.getCurrentBalance()
        };
    },

    /**
     * Validate transfer data
     * @param {Object} transferData - Transfer details to validate
     * @returns {boolean} True if valid
     */
    validateTransfer(transferData) {
        const { recipientAccount, routingNumber, recipientName, amount } = transferData;
        
        // Check required fields
        if (!recipientAccount || !routingNumber || !recipientName || !amount) {
            return false;
        }

        // Validate account number (basic check)
        if (recipientAccount.length < 8 || recipientAccount.length > 12) {
            return false;
        }

        // Validate routing number (basic check)
        if (routingNumber.length !== 9) {
            return false;
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return false;
        }

        // Validate recipient name
        if (recipientName.trim().length < 2) {
            return false;
        }

        return true;
    },

    /**
     * Add transaction to history
     * @param {Object} transaction - Transaction details
     */
    addTransaction(transaction) {
        transaction.id = Date.now() + Math.random();
        this.transactions.unshift(transaction);
        
        // Keep only last 50 transactions
        if (this.transactions.length > 50) {
            this.transactions = this.transactions.slice(0, 50);
        }
        
        // Save to localStorage
        this.saveTransactions();
    },

    /**
     * Clear all stored data (useful for testing or reset)
     */
    clearStoredData() {
        localStorage.removeItem(this.STORAGE_KEYS.BALANCE);
        localStorage.removeItem(this.STORAGE_KEYS.TRANSACTIONS);
        this.transactions = [];
        console.log('All stored data cleared');
    },

    /**
     * Reset balance to initial amount
     */
    resetBalance() {
        this.setBalance(this.INITIAL_BALANCE);
        console.log('Balance reset to initial amount');
    },

    /**
     * Show success modal
     * @param {string} message - Success message
     * @param {function} callback - Optional callback function
     */
    showSuccessModal(message, callback = null) {
        // Remove existing modals
        this.removeExistingModals();

        const modal = document.createElement('div');
        modal.className = 'transfer-success-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="AccountManager.closeModal()"></div>
            <div class="modal-content">
                <div class="success-icon">✅</div>
                <h2>Transfer Successful!</h2>
                <p>${message}</p>
                <div class="modal-actions">
                    <button onclick="AccountManager.closeModal()" class="btn-primary">
                        Continue
                    </button>
                    <button onclick="AccountManager.goToDashboard()" class="btn-secondary">
                        View Dashboard
                    </button>
                </div>
            </div>
        `;

        // Add modal styles
        this.addModalStyles();
        
        document.body.appendChild(modal);
        
        // Trigger animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                this.closeModal();
                if (callback) callback();
            }
        }, 5000);
    },

    /**
     * Show error modal
     * @param {string} message - Error message
     */
    showErrorModal(message) {
        // Remove existing modals
        this.removeExistingModals();

        const modal = document.createElement('div');
        modal.className = 'transfer-error-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="AccountManager.closeModal()"></div>
            <div class="modal-content error">
                <div class="error-icon">❌</div>
                <h2>Transfer Failed</h2>
                <p>${message}</p>
                <div class="modal-actions">
                    <button onclick="AccountManager.closeModal()" class="btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        `;

        this.addModalStyles();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    },

    /**
     * Add modal styles to the page
     */
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .transfer-success-modal,
            .transfer-error-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .transfer-success-modal.show,
            .transfer-error-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(10px);
            }

            .modal-content {
                position: relative;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
                border-radius: 20px;
                padding: 2.5rem;
                max-width: 450px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                transform: scale(0.8) translateY(50px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .modal-content.error {
                background: linear-gradient(135deg, rgba(255, 240, 240, 0.95) 0%, rgba(255, 235, 235, 0.9) 100%);
            }

            .transfer-success-modal.show .modal-content,
            .transfer-error-modal.show .modal-content {
                transform: scale(1) translateY(0);
            }

            .success-icon,
            .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: bounceIn 0.6s ease-out 0.3s both;
            }

            .modal-content h2 {
                color: #2d3748;
                font-size: 1.8rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }

            .modal-content p {
                color: #4a5568;
                font-size: 1.1rem;
                margin-bottom: 2rem;
                line-height: 1.5;
            }

            .modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .btn-primary,
            .btn-secondary {
                padding: 0.8rem 2rem;
                border: none;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }

            .btn-primary {
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }

            .btn-primary:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }

            .btn-secondary {
                background: rgba(255, 255, 255, 0.8);
                color: #4a5568;
                border: 2px solid rgba(74, 85, 104, 0.2);
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 1);
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            }

            @keyframes bounceIn {
                0% {
                    opacity: 0;
                    transform: scale(0.3);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @media (max-width: 600px) {
                .modal-content {
                    padding: 2rem;
                    margin: 1rem;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
                
                .btn-primary,
                .btn-secondary {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    },

    /**
     * Remove existing modals
     */
    removeExistingModals() {
        const existingModals = document.querySelectorAll('.transfer-success-modal, .transfer-error-modal');
        existingModals.forEach(modal => modal.remove());
    },

    /**
     * Close modal
     */
    closeModal() {
        const modals = document.querySelectorAll('.transfer-success-modal, .transfer-error-modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    modal.remove();
                }
            }, 300);
        });
    },

    /**
     * Navigate to dashboard
     */
    goToDashboard() {
        this.closeModal();
        window.location.href = 'dashboard.html';
    },

    /**
     * Handle transfer form submission
     * @param {Event} event - Form submit event
     */
    handleTransferSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const transferData = {
            recipientAccount: formData.get('recipient') || document.getElementById('recipient')?.value,
            routingNumber: formData.get('routingNumber') || document.getElementById('routingNumber')?.value,
            recipientName: formData.get('recipientName') || document.getElementById('recipientName')?.value,
            amount: parseFloat(formData.get('amount') || document.getElementById('amount')?.value),
            note: formData.get('note') || document.getElementById('note')?.value || ''
        };

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn?.textContent || 'Send Money';
        if (submitBtn) {
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
        }

        // Process transfer immediately (no artificial delay for balance update)
        const result = this.processTransfer(transferData);
        
        // Simulate processing delay for realistic feel, but balance is already updated
        setTimeout(() => {
            // Reset button
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }

            if (result.success) {
                this.showSuccessModal(result.message);
                form.reset(); // Clear the form
            } else {
                this.showErrorModal(result.message);
            }
        }, 1000);
    },

    /**
     * Initialize transfer form if it exists
     */
    initTransferForm() {
        const transferForm = document.getElementById('transferForm');
        if (transferForm) {
            transferForm.addEventListener('submit', (e) => this.handleTransferSubmit(e));
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.AccountManager.init();
    window.AccountManager.initTransferForm();
});

// Also initialize if script loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AccountManager.init();
        window.AccountManager.initTransferForm();
    });
} else {
    window.AccountManager.init();
    window.AccountManager.initTransferForm();
}