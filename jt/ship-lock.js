/* ============================================
   JOB NOTIFICATION TRACKER - SHIP LOCK
   Enforces test completion before shipping
   ============================================ */

(function() {
  'use strict';

  const TEST_STORAGE_KEY = 'jobTrackerTestStatus';
  const TOTAL_TESTS = 10;

  // DOM Elements
  let shipLocked;
  let shipUnlocked;
  let progressBar;
  let testCount;
  let lastVerified;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initShipLock();
  });

  function initShipLock() {
    // Cache DOM elements
    shipLocked = document.getElementById('ship-locked');
    shipUnlocked = document.getElementById('ship-unlocked');
    progressBar = document.getElementById('progress-bar');
    testCount = document.getElementById('test-count');
    lastVerified = document.getElementById('last-verified');

    // Check test status and update UI
    updateShipState();
  }

  // Load test status from localStorage
  function loadTestStatus() {
    try {
      const saved = localStorage.getItem(TEST_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading test status:', e);
    }
    return {};
  }

  // Count passed tests
  function getPassedCount() {
    const status = loadTestStatus();
    let count = 0;
    for (let i = 1; i <= TOTAL_TESTS; i++) {
      if (status[i] === true) {
        count++;
      }
    }
    return count;
  }

  // Check if all tests are passed
  function areAllTestsPassed() {
    return getPassedCount() === TOTAL_TESTS;
  }

  // Update ship page state
  function updateShipState() {
    const passedCount = getPassedCount();
    const allPassed = areAllTestsPassed();
    const progressPercent = (passedCount / TOTAL_TESTS) * 100;

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = progressPercent + '%';
    }

    // Update test count text
    if (testCount) {
      testCount.textContent = `${passedCount} / ${TOTAL_TESTS} tests completed`;
    }

    // Show/hide appropriate state
    if (allPassed) {
      showUnlockedState();
    } else {
      showLockedState();
    }
  }

  // Show locked state
  function showLockedState() {
    if (shipLocked) shipLocked.style.display = 'block';
    if (shipUnlocked) shipUnlocked.style.display = 'none';
  }

  // Show unlocked state
  function showUnlockedState() {
    if (shipLocked) shipLocked.style.display = 'none';
    if (shipUnlocked) shipUnlocked.style.display = 'block';
    
    // Update last verified time
    if (lastVerified) {
      lastVerified.textContent = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  }

  // Expose globally
  window.shipLock = {
    getPassedCount: getPassedCount,
    areAllTestsPassed: areAllTestsPassed,
    updateShipState: updateShipState
  };
})();
