// Desktop-focused UI enhancements for FutureFund
class DesktopUIManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.addDesktopStyles();
        this.setupDesktopInteractions();
        this.setupNotificationSystem();
        console.log('🖥️ Desktop UI enhancements ready');
    }
    
    addDesktopStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Subtle desktop hover effects */
            .btn {
                transition: all 0.15s ease;
            }
            
            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .btn:active {
                transform: translateY(0);
                transition: all 0.05s ease;
            }
            
            .summary-card:hover, .account-card:hover, .scenario-card:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                transition: all 0.15s ease;
            }
            
            /* Desktop notification system */
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification {
                animation: slideInFromRight 0.25s ease-out;
            }
            
            /* Enhanced focus for desktop */
            input:focus, select:focus, textarea:focus {
                box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
                border-color: var(--primary-color);
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupDesktopInteractions() {
        // Minimal, professional desktop interactions only
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                this.addButtonFeedback(e.target);
            }
        });
    }
    
    addButtonFeedback(button) {
        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    setupNotificationSystem() {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                pointer-events: none;
                max-width: 350px;
            `;
            document.body.appendChild(container);
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 12px 16px;
            border-radius: var(--radius-md);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 8px;
            pointer-events: auto;
            border-left: 3px solid var(--primary-color);
            font-size: 14px;
        `;
        
        const colors = {
            success: 'var(--success-color)',
            error: 'var(--danger-color)',
            warning: 'var(--warning-color)',
            info: 'var(--info-color)'
        };
        
        if (colors[type]) {
            notification.style.borderLeftColor = colors[type];
        }
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'i'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: bold;">${icons[type] || icons.info}</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: var(--text-secondary); 
                               cursor: pointer; padding: 0; margin-left: auto; font-size: 16px;">×</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 250);
        }, duration);
        
        return notification;
    }
    
    showSuccess(message, duration = 2500) {
        return this.showNotification(message, 'success', duration);
    }
    
    showError(message, duration = 4000) {
        return this.showNotification(message, 'error', duration);
    }
    
    showWarning(message, duration = 3500) {
        return this.showNotification(message, 'warning', duration);
    }
}

// Initialize desktop UI enhancements
let desktopUI;

document.addEventListener('DOMContentLoaded', () => {
    desktopUI = new DesktopUIManager();
    window.uiAnimations = desktopUI; // Keep same global name for compatibility
    
    console.log('✨ Desktop UI ready');
}); 