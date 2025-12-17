// UI Manager
export class UIManager {
  constructor() {
    this.modals = [];
    this.toasts = [];
    this.mobileMenuOpen = false;
  }

  init() {
    this.setupModalHandlers();
    this.setupToastContainer();
    console.log('UI Manager initialized');
  }

  // Modal Management
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('show');
    modal.style.display = 'flex';
    this.modals.push(modalId);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus first input if available
    setTimeout(() => {
      const firstInput = modal.querySelector('input, textarea, select');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);

    this.modals = this.modals.filter(id => id !== modalId);

    // Restore body scroll if no modals open
    if (this.modals.length === 0) {
      document.body.style.overflow = '';
    }
  }

  hideAllModals() {
    this.modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
    });

    this.modals = [];
    document.body.style.overflow = '';
  }

  setupModalHandlers() {
    // ESC key to close modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modals.length > 0) {
        this.hideAllModals();
      }
    });
  }

  // Toast Notifications
  showToast(message, type = 'info', duration = 5000) {
    const toast = this.createToastElement(message, type);
    const container = document.getElementById('toast-container');

    if (container) {
      container.appendChild(toast);

      // Trigger animation
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      // Auto remove
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);

      // Click to dismiss
      toast.addEventListener('click', () => {
        this.removeToast(toast);
      });
    }

    this.toasts.push(toast);
  }

  createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = this.getToastIcon(type);

    toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

    return toast;
  }

  getToastIcon(type) {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-info-circle';
    }
  }

  removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';

      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }

    this.toasts = this.toasts.filter(t => t !== toast);
  }

  setupToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  // Mobile Menu
  toggleMobileMenu() {
    const navList = document.querySelector('.nav-list');
    const toggle = document.getElementById('mobile-toggle');

    if (!navList || !toggle) return;

    this.mobileMenuOpen = !this.mobileMenuOpen;

    if (this.mobileMenuOpen) {
      navList.style.display = 'flex';
      navList.style.position = 'absolute';
      navList.style.top = '100%';
      navList.style.left = '0';
      navList.style.right = '0';
      navList.style.background = 'var(--surface)';
      navList.style.flexDirection = 'column';
      navList.style.padding = '1rem';
      navList.style.borderTop = '1px solid var(--border)';
      navList.style.zIndex = '1001';
      toggle.classList.add('active');
    } else {
      navList.style.display = '';
      navList.style.position = '';
      navList.style.top = '';
      navList.style.left = '';
      navList.style.right = '';
      navList.style.background = '';
      navList.style.flexDirection = '';
      navList.style.padding = '';
      navList.style.borderTop = '';
      navList.style.zIndex = '';
      toggle.classList.remove('active');
    }
  }

  // File Handling
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 10MB');
    }

    return true;
  }

  // Form Helpers
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();

      // Clear any preview images
      const previews = form.querySelectorAll('.image-preview');
      previews.forEach(preview => {
        preview.style.display = 'none';
      });
    }
  }

  setFormData(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(data).forEach(key => {
      const field = form.querySelector(`[name="${key}"], #${key}`);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = data[key];
        } else {
          field.value = data[key] || '';
        }
      }
    });
  }

  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  // Loading States
  setLoading(elementId, isLoading = true, loadingText = 'Loading...') {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (isLoading) {
      element.classList.add('loading');
      element.disabled = true;
      element.dataset.originalText = element.textContent;
      element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    } else {
      element.classList.remove('loading');
      element.disabled = false;
      element.textContent =
        element.dataset.originalText || element.textContent.replace(/^.*Loading\.\.\.$/, '').trim();
    }
  }

  showLoadingSpinner(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading...
                </div>
            `;
    }
  }

  hideLoadingSpinner(containerId) {
    const container = document.getElementById(containerId);
    const spinner = container?.querySelector('.loading-spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  // Animation Helpers
  fadeIn(element, duration = 300) {
    if (!element) return;

    element.style.opacity = '0';
    element.style.display = 'block';

    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);

      element.style.opacity = opacity;

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  fadeOut(element, duration = 300) {
    if (!element) return;

    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = initialOpacity * (1 - Math.min(progress / duration, 1));

      element.style.opacity = opacity;

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }

    requestAnimationFrame(animate);
  }

  slideDown(element, duration = 300) {
    if (!element) return;

    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.display = 'block';

    const targetHeight = element.scrollHeight;
    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const height = targetHeight * Math.min(progress / duration, 1);

      element.style.height = `${height}px`;

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = '';
        element.style.overflow = '';
      }
    }

    requestAnimationFrame(animate);
  }

  slideUp(element, duration = 300) {
    if (!element) return;

    element.style.overflow = 'hidden';
    const initialHeight = element.offsetHeight;
    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const height = initialHeight * (1 - Math.min(progress / duration, 1));

      element.style.height = `${height}px`;

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
      }
    }

    requestAnimationFrame(animate);
  }

  // Utility Methods
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

    return date.toLocaleDateString();
  }

  formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Confirmation Dialogs
  showConfirmDialog(message, onConfirm, onCancel = null) {
    const confirmed = confirm(message);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
    return confirmed;
  }

  // Scroll Helpers
  scrollToTop(smooth = true) {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  scrollToElement(elementId, smooth = true) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
    }
  }

  // Theme Management (if needed later)
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('artshare_theme', theme);
  }

  getTheme() {
    return localStorage.getItem('artshare_theme') || 'dark';
  }

  // Accessibility Helpers
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Performance Helpers
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}
