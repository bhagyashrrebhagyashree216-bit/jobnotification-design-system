/* ============================================
   NAVIGATION JAVASCRIPT
   SPA-style navigation without page reloads
   Active link management
   Mobile menu toggle
   ============================================ */

(function() {
  'use strict';

  // Initialize navigation when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileMenu();
    highlightActiveLink();
  });

  /**
   * Initialize navigation click handlers
   * Prevents page reload for same-page navigation
   */
  function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // If clicking already active link, prevent navigation
        if (this.classList.contains('active')) {
          e.preventDefault();
          return;
        }

        // For same-origin navigation, allow smooth behavior
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          // Update active state immediately for perceived performance
          navLinks.forEach(function(l) { l.classList.remove('active'); });
          this.classList.add('active');
          
          // Close mobile menu if open
          closeMobileMenu();
        }
      });
    });
  }

  /**
   * Initialize mobile menu toggle
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function() {
      const isOpen = navLinks.classList.contains('open');
      
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  /**
   * Open mobile navigation menu
   */
  function openMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const toggle = document.querySelector('.nav-toggle');
    
    if (navLinks) {
      navLinks.classList.add('open');
    }
    
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      // Change to X icon
      toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    }
  }

  /**
   * Close mobile navigation menu
   */
  function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const toggle = document.querySelector('.nav-toggle');
    
    if (navLinks) {
      navLinks.classList.remove('open');
    }
    
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      // Change back to hamburger icon
      toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>';
    }
  }

  /**
   * Highlight the active link based on current URL
   */
  function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      
      // Remove active class from all links
      link.classList.remove('active');
      
      // Add active class to matching link
      if (href === currentPath || (currentPath === '/' && href === '/')) {
        link.classList.add('active');
      }
      
      // Handle /index.html as root
      if (currentPath === '/index.html' && href === '/') {
        link.classList.add('active');
      }
    });
  }

  // Expose closeMobileMenu globally for page transitions
  window.closeMobileMenu = closeMobileMenu;
})();
