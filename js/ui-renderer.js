/**
 * UI Renderer - DOM Manipulation and Rendering
 * Production-grade UI rendering with vanilla JavaScript
 */

const UIRenderer = (() => {
    const LOADING_CLASS = 'hidden';
    const ERROR_CLASS = 'hidden';
    
    /**
     * Show loading spinner
     */
    function showLoading() {
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) {
                spinner.classList.remove(LOADING_CLASS);
            }
        } catch (error) {
            console.error('Error showing loading:', error);
        }
    }
    
    /**
     * Hide loading spinner
     */
    function hideLoading() {
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) {
                spinner.classList.add(LOADING_CLASS);
            }
        } catch (error) {
            console.error('Error hiding loading:', error);
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     * @param {Function} retryCallback - Retry callback function
     */
    function showError(message, retryCallback = null) {
        try {
            const container = document.getElementById('error-container');
            const messageEl = document.getElementById('error-message');
            const retryBtn = document.getElementById('error-retry-btn');
            const closeBtn = document.getElementById('error-close-btn');
            
            if (container && messageEl) {
                messageEl.textContent = message || EXPLORER_CONFIG.ERRORS.UNKNOWN_ERROR;
                container.classList.remove(ERROR_CLASS);
                
                // Set up retry button
                if (retryBtn) {
                    if (retryCallback) {
                        retryBtn.style.display = 'inline-block';
                        retryBtn.onclick = () => {
                            hideError();
                            retryCallback();
                        };
                    } else {
                        retryBtn.style.display = 'none';
                    }
                }
                
                // Set up close button
                if (closeBtn) {
                    closeBtn.onclick = hideError;
                }
                
                // Auto-hide after duration
                setTimeout(hideError, EXPLORER_CONFIG.UI.ERROR_DISPLAY_DURATION);
            }
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }
    
    /**
     * Hide error message
     */
    function hideError() {
        try {
            const container = document.getElementById('error-container');
            if (container) {
                container.classList.add(ERROR_CLASS);
            }
        } catch (error) {
            console.error('Error hiding error:', error);
        }
    }
    
    /**
     * Clear page container
     */
    function clearPage() {
        try {
            const container = document.getElementById('page-container');
            if (container) {
                container.innerHTML = '';
            }
        } catch (error) {
            console.error('Error clearing page:', error);
        }
    }
    
    /**
     * Render dashboard page
     * @param {Object} data - Dashboard data
     */
    function renderDashboard(data) {
        try {
            clearPage();
            const container = document.getElementById('page-container');
            
            const html = `
                <div class="dashboard-page">
                    <section class="metrics-section">
                        <h2>Network Metrics</h2>
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <h3>Block Height</h3>
                                <p class="metric-value">${FormatUtil.formatBlockNumber(data.blockHeight || 0)}</p>
                            </div>
                            <div class="metric-card">
                                <h3>Gas Price</h3>
                                <p class="metric-value">${FormatUtil.formatGasPrice(data.gasPrice || 0)}</p>
                            </div>
                            <div class="metric-card">
                                <h3>Network Status</h3>
                                <p class="metric-value">${data.syncing ? 'Syncing' : 'Synced'}</p>
                            </div>
                            <div class="metric-card">
                                <h3>Avg Block Time</h3>
                                <p class="metric-value">${data.avgBlockTime || 'N/A'}</p>
                            </div>
                        </div>
                    </section>
                    
                    <section class="recent-blocks-section">
                        <h2>Recent Blocks</h2>
                        <div id="recent-blocks-container" class="blocks-list">
                            <!-- Blocks will be rendered here -->
                        </div>
                    </section>
                    
                    <section class="recent-transactions-section">
                        <h2>Recent Transactions</h2>
                        <div id="recent-transactions-container" class="transactions-list">
                            <!-- Transactions will be rendered here -->
                        </div>
                    </section>
                    
                    <section class="validators-section">
                        <h2>Top Validators</h2>
                        <div id="validators-container" class="validators-list">
                            <!-- Validators will be rendered here -->
                        </div>
                    </section>
                </div>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            showError('Failed to render dashboard');
        }
    }
    
    /**
     * Render block details page
     * @param {Object} block - Block data
     */
    function renderBlockDetails(block) {
        try {
            clearPage();
            const container = document.getElementById('page-container');
            
            const html = `
                <div class="block-details-page">
                    <h1>Block #${FormatUtil.formatBlockNumber(block.number)}</h1>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Block Hash</label>
                            <code>${block.hash}</code>
                        </div>
                        <div class="detail-item">
                            <label>Parent Hash</label>
                            <code>${block.parentHash}</code>
                        </div>
                        <div class="detail-item">
                            <label>Timestamp</label>
                            <p>${FormatUtil.formatTimestampReadable(block.timestamp)}</p>
                        </div>
                        <div class="detail-item">
                            <label>Miner</label>
                            <code>${block.miner}</code>
                        </div>
                        <div class="detail-item">
                            <label>Gas Used</label>
                            <p>${FormatUtil.formatNumber(block.gasUsed)} / ${FormatUtil.formatNumber(block.gasLimit)}</p>
                        </div>
                        <div class="detail-item">
                            <label>Transactions</label>
                            <p>${block.transactions.length}</p>
                        </div>
                    </div>
                    
                    <section class="block-transactions">
                        <h2>Transactions (${block.transactions.length})</h2>
                        <div id="block-transactions-container" class="transactions-list">
                            <!-- Transactions will be rendered here -->
                        </div>
                    </section>
                </div>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error rendering block details:', error);
            showError('Failed to render block details');
        }
    }
    
    /**
     * Render transaction details page
     * @param {Object} tx - Transaction data
     * @param {Object} receipt - Transaction receipt
     */
    function renderTransactionDetails(tx, receipt) {
        try {
            clearPage();
            const container = document.getElementById('page-container');
            
            const status = receipt ? FormatUtil.formatTransactionStatus(receipt) : TRANSACTION_STATUS.UNKNOWN;
            const fee = receipt ? FormatUtil.formatTransactionFee(receipt.gasUsed, tx.gasPrice) : 'N/A';
            
            const html = `
                <div class="transaction-details-page">
                    <h1>Transaction Details</h1>
                    
                    <div class="tx-status" data-status="${status}">
                        <span class="status-badge">${status.toUpperCase()}</span>
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Transaction Hash</label>
                            <code>${tx.hash}</code>
                        </div>
                        <div class="detail-item">
                            <label>From</label>
                            <code>${tx.from}</code>
                        </div>
                        <div class="detail-item">
                            <label>To</label>
                            <code>${tx.to || 'Contract Creation'}</code>
                        </div>
                        <div class="detail-item">
                            <label>Value</label>
                            <p>${FormatUtil.formatBalance(tx.value)}</p>
                        </div>
                        <div class="detail-item">
                            <label>Gas Price</label>
                            <p>${FormatUtil.formatGasPrice(tx.gasPrice)}</p>
                        </div>
                        <div class="detail-item">
                            <label>Gas Used</label>
                            <p>${receipt ? FormatUtil.formatNumber(receipt.gasUsed) : 'Pending'}</p>
                        </div>
                        <div class="detail-item">
                            <label>Transaction Fee</label>
                            <p>${fee}</p>
                        </div>
                        <div class="detail-item">
                            <label>Block Number</label>
                            <p>${tx.blockNumber ? FormatUtil.formatBlockNumber(tx.blockNumber) : 'Pending'}</p>
                        </div>
                    </div>
                    
                    ${tx.input && tx.input !== '0x' ? `
                        <section class="transaction-input">
                            <h2>Input Data</h2>
                            <code>${tx.input}</code>
                        </section>
                    ` : ''}
                </div>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error rendering transaction details:', error);
            showError('Failed to render transaction details');
        }
    }
    
    /**
     * Render account details page
     * @param {Object} account - Account data
     */
    function renderAccountDetails(account) {
        try {
            clearPage();
            const container = document.getElementById('page-container');
            
            const html = `
                <div class="account-details-page">
                    <h1>Account Details</h1>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Address</label>
                            <code>${account.address}</code>
                        </div>
                        <div class="detail-item">
                            <label>Balance</label>
                            <p>${FormatUtil.formatBalance(account.balance)}</p>
                        </div>
                        <div class="detail-item">
                            <label>Nonce</label>
                            <p>${FormatUtil.formatNumber(account.nonce)}</p>
                        </div>
                        <div class="detail-item">
                            <label>Transaction Count</label>
                            <p>${account.transactionCount || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <section class="account-transactions">
                        <h2>Transaction History</h2>
                        <div id="account-transactions-container" class="transactions-list">
                            <!-- Transactions will be rendered here -->
                        </div>
                    </section>
                </div>
            `;
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error rendering account details:', error);
            showError('Failed to render account details');
        }
    }
    
    /**
     * Render data table
     * @param {Array} data - Table data
     * @param {Array} columns - Column definitions
     * @returns {string} HTML table
     */
    function renderTable(data, columns) {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                return '<p class="no-data">No data available</p>';
            }
            
            let html = '<table class="data-table"><thead><tr>';
            
            // Render headers
            for (const column of columns) {
                html += `<th>${column.label}</th>`;
            }
            html += '</tr></thead><tbody>';
            
            // Render rows
            for (const row of data) {
                html += '<tr>';
                for (const column of columns) {
                    const value = row[column.key];
                    const formatted = column.format ? column.format(value) : value;
                    html += `<td>${formatted}</td>`;
                }
                html += '</tr>';
            }
            
            html += '</tbody></table>';
            return html;
        } catch (error) {
            console.error('Error rendering table:', error);
            return '<p class="error">Failed to render table</p>';
        }
    }
    
    /**
     * Render pagination controls
     * @param {number} currentPage - Current page number
     * @param {number} totalPages - Total number of pages
     * @param {Function} onPageChange - Page change callback
     * @returns {string} HTML pagination
     */
    function renderPagination(currentPage, totalPages, onPageChange) {
        try {
            if (totalPages <= 1) {
                return '';
            }
            
            let html = '<div class="pagination">';
            
            // Previous button
            if (currentPage > 1) {
                html += `<button class="page-btn" onclick="onPageChange(${currentPage - 1})">← Previous</button>`;
            }
            
            // Page numbers
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            if (startPage > 1) {
                html += `<button class="page-btn" onclick="onPageChange(1)">1</button>`;
                if (startPage > 2) {
                    html += '<span class="page-ellipsis">...</span>';
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                const active = i === currentPage ? 'active' : '';
                html += `<button class="page-btn ${active}" onclick="onPageChange(${i})">${i}</button>`;
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    html += '<span class="page-ellipsis">...</span>';
                }
                html += `<button class="page-btn" onclick="onPageChange(${totalPages})">${totalPages}</button>`;
            }
            
            // Next button
            if (currentPage < totalPages) {
                html += `<button class="page-btn" onclick="onPageChange(${currentPage + 1})">Next →</button>`;
            }
            
            html += '</div>';
            return html;
        } catch (error) {
            console.error('Error rendering pagination:', error);
            return '';
        }
    }
    
    /**
     * Update real-time data
     * @param {string} elementId - Element ID to update
     * @param {*} data - Data to display
     */
    function updateRealTime(elementId, data) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                if (typeof data === 'object') {
                    element.textContent = JSON.stringify(data);
                } else {
                    element.textContent = data;
                }
            }
        } catch (error) {
            console.error('Error updating real-time data:', error);
        }
    }
    
    /**
     * Update connection status indicator
     * @param {boolean} connected - Connection status
     */
    function updateConnectionStatus(connected) {
        try {
            const indicator = document.getElementById('connection-indicator');
            const text = document.getElementById('connection-text');
            
            if (indicator) {
                indicator.className = 'status-indicator ' + (connected ? 'connected' : 'disconnected');
            }
            
            if (text) {
                text.textContent = connected ? 'Connected' : 'Disconnected';
            }
        } catch (error) {
            console.error('Error updating connection status:', error);
        }
    }
    
    /**
     * Set active navigation link
     * @param {string} page - Page name
     */
    function setActiveNav(page) {
        try {
            // Remove active class from all links
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => link.classList.remove('active'));
            
            // Add active class to current page link
            const activeLink = document.querySelector(`[data-page="${page}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        } catch (error) {
            console.error('Error setting active nav:', error);
        }
    }
    
    /**
     * Create element with attributes
     * @param {string} tag - HTML tag
     * @param {Object} attributes - Element attributes
     * @param {string} content - Element content
     * @returns {HTMLElement} Created element
     */
    function createElement(tag, attributes = {}, content = '') {
        try {
            const element = document.createElement(tag);
            
            for (const [key, value] of Object.entries(attributes)) {
                if (key === 'class') {
                    element.className = value;
                } else if (key === 'style') {
                    Object.assign(element.style, value);
                } else {
                    element.setAttribute(key, value);
                }
            }
            
            if (content) {
                element.innerHTML = content;
            }
            
            return element;
        } catch (error) {
            console.error('Error creating element:', error);
            return null;
        }
    }
    
    return {
        showLoading,
        hideLoading,
        showError,
        hideError,
        clearPage,
        renderDashboard,
        renderBlockDetails,
        renderTransactionDetails,
        renderAccountDetails,
        renderTable,
        renderPagination,
        updateRealTime,
        updateConnectionStatus,
        setActiveNav,
        createElement,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderer;
}
