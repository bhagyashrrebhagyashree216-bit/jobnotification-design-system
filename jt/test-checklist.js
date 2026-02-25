/* ============================================
   JOB NOTIFICATION TRACKER - TEST CHECKLIST
   Pre-ship testing and verification
   ============================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'jobTrackerTestStatus';
  const TOTAL_TESTS = 10;

  // DOM Elements
  let checkboxes;
  let testsPassedEl;
  let progressBar;
  let testWarning;
  let testSuccess;
  let resetBtn;
  let shipLink;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initChecklist();
  });

  function initChecklist() {
    // Cache DOM elements
    checkboxes = document.querySelectorAll('.checklist-checkbox');
    testsPassedEl = document.getElementById('tests-passed');
    progressBar = document.getElementById('progress-bar');
    testWarning = document.getElementById('test-warning');
    testSuccess = document.getElementById('test-success');
    resetBtn = document.getElementById('reset-btn');
    shipLink = document.getElementById('ship-link');

    // Load saved state
    loadChecklistState();

    // Attach event listeners
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', resetChecklist);
    }

    // Initial update
    updateSummary();
  }

  // Load checklist state from localStorage
  function loadChecklistState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        
        checkboxes.forEach(checkbox => {
          const testId = checkbox.id.replace('test-', '');
          if (state[testId] === true) {
            checkbox.checked = true;
            updateItemVisualState(checkbox, true);
          }
        });
      }
    } catch (e) {
      console.error('Error loading checklist state:', e);
    }
  }

  // Save checklist state to localStorage
  function saveChecklistState() {
    try {
      const state = {};
      checkboxes.forEach(checkbox => {
        const testId = checkbox.id.replace('test-', '');
        state[testId] = checkbox.checked;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Error saving checklist state:', e);
      return false;
    }
  }

  // Handle checkbox change
  function handleCheckboxChange(e) {
    const checkbox = e.target;
    const isChecked = checkbox.checked;
    
    updateItemVisualState(checkbox, isChecked);
    saveChecklistState();
    updateSummary();
  }

  // Update item visual state
  function updateItemVisualState(checkbox, isChecked) {
    const item = checkbox.closest('.checklist-item');
    if (item) {
      if (isChecked) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
    }
  }

  // Update summary display
  function updateSummary() {
    const passedCount = getPassedCount();
    const progressPercent = (passedCount / TOTAL_TESTS) * 100;

    // Update counter
    if (testsPassedEl) {
      testsPassedEl.textContent = passedCount;
    }

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = progressPercent + '%';
    }

    // Update warning/success messages
    if (passedCount < TOTAL_TESTS) {
      if (testWarning) testWarning.classList.remove('hidden');
      if (testSuccess) testSuccess.classList.add('hidden');
      if (shipLink) {
        shipLink.classList.add('btn-secondary');
        shipLink.classList.remove('btn-primary');
      }
    } else {
      if (testWarning) testWarning.classList.add('hidden');
      if (testSuccess) testSuccess.classList.remove('hidden');
      if (shipLink) {
        shipLink.classList.remove('btn-secondary');
        shipLink.classList.add('btn-primary');
      }
    }
  }

  // Get count of passed tests
  function getPassedCount() {
    let count = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) count++;
    });
    return count;
  }

  // Check if all tests are passed
  function areAllTestsPassed() {
    return getPassedCount() === TOTAL_TESTS;
  }

  // Reset checklist
  function resetChecklist() {
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      updateItemVisualState(checkbox, false);
    });

    // Clear from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing checklist state:', e);
    }

    updateSummary();
  }

  // Expose globally for ship page
  window.testChecklist = {
    areAllTestsPassed: areAllTestsPassed,
    getPassedCount: getPassedCount,
    TOTAL_TESTS: TOTAL_TESTS,
    STORAGE_KEY: STORAGE_KEY
  };
})();
