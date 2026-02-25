/* ============================================
   JOB NOTIFICATION TRACKER - STATUS ENGINE
   Job application status tracking and history
   ============================================ */

(function() {
  'use strict';

  const STATUS_STORAGE_KEY = 'jobTrackerStatus';
  const STATUS_HISTORY_KEY = 'jobTrackerStatusHistory';

  const STATUS = {
    NOT_APPLIED: 'Not Applied',
    APPLIED: 'Applied',
    REJECTED: 'Rejected',
    SELECTED: 'Selected'
  };

  const STATUS_COLORS = {
    [STATUS.NOT_APPLIED]: 'neutral',
    [STATUS.APPLIED]: 'info',
    [STATUS.REJECTED]: 'error',
    [STATUS.SELECTED]: 'success'
  };

  const STATUS_BADGE_CLASSES = {
    [STATUS.NOT_APPLIED]: 'not-started',
    [STATUS.APPLIED]: 'info',
    [STATUS.REJECTED]: 'error',
    [STATUS.SELECTED]: 'success'
  };

  // Load all statuses from localStorage
  function loadStatuses() {
    try {
      const saved = localStorage.getItem(STATUS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading statuses:', e);
    }
    return {};
  }

  // Save all statuses to localStorage
  function saveStatuses(statuses) {
    try {
      localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statuses));
      return true;
    } catch (e) {
      console.error('Error saving statuses:', e);
      return false;
    }
  }

  // Get status for a specific job
  function getJobStatus(jobId) {
    const statuses = loadStatuses();
    return statuses[jobId] || STATUS.NOT_APPLIED;
  }

  // Set status for a specific job
  function setJobStatus(jobId, status) {
    if (!Object.values(STATUS).includes(status)) {
      console.error('Invalid status:', status);
      return false;
    }

    const statuses = loadStatuses();
    const previousStatus = statuses[jobId] || STATUS.NOT_APPLIED;
    
    // Only update if status changed
    if (previousStatus === status) {
      return false;
    }

    statuses[jobId] = status;
    
    if (saveStatuses(statuses)) {
      // Add to history
      addStatusHistory(jobId, status, previousStatus);
      return true;
    }
    return false;
  }

  // Load status history from localStorage
  function loadStatusHistory() {
    try {
      const saved = localStorage.getItem(STATUS_HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading status history:', e);
    }
    return [];
  }

  // Save status history to localStorage
  function saveStatusHistory(history) {
    try {
      localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
      return true;
    } catch (e) {
      console.error('Error saving status history:', e);
      return false;
    }
  }

  // Add entry to status history
  function addStatusHistory(jobId, newStatus, previousStatus) {
    const history = loadStatusHistory();
    
    const entry = {
      jobId: jobId,
      status: newStatus,
      previousStatus: previousStatus,
      timestamp: new Date().toISOString()
    };

    // Add to beginning of array
    history.unshift(entry);

    // Keep only last 50 entries to prevent localStorage bloat
    if (history.length > 50) {
      history.length = 50;
    }

    saveStatusHistory(history);
  }

  // Get recent status updates (with job details)
  function getRecentStatusUpdates(jobsData, limit = 10) {
    const history = loadStatusHistory();
    
    if (!jobsData || !Array.isArray(jobsData)) {
      return [];
    }

    // Map history entries to include job details
    return history.slice(0, limit).map(entry => {
      const job = jobsData.find(j => j.id === entry.jobId);
      return {
        ...entry,
        job: job || null
      };
    }).filter(entry => entry.job !== null);
  }

  // Get status color
  function getStatusColor(status) {
    return STATUS_COLORS[status] || 'neutral';
  }

  // Get status badge class
  function getStatusBadgeClass(status) {
    return STATUS_BADGE_CLASSES[status] || 'not-started';
  }

  // Get all possible statuses
  function getAllStatuses() {
    return Object.values(STATUS);
  }

  // Clear all statuses (for testing/debugging)
  function clearAllStatuses() {
    try {
      localStorage.removeItem(STATUS_STORAGE_KEY);
      localStorage.removeItem(STATUS_HISTORY_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing statuses:', e);
      return false;
    }
  }

  // Expose globally
  window.statusEngine = {
    STATUS: STATUS,
    loadStatuses: loadStatuses,
    saveStatuses: saveStatuses,
    getJobStatus: getJobStatus,
    setJobStatus: setJobStatus,
    loadStatusHistory: loadStatusHistory,
    saveStatusHistory: saveStatusHistory,
    addStatusHistory: addStatusHistory,
    getRecentStatusUpdates: getRecentStatusUpdates,
    getStatusColor: getStatusColor,
    getStatusBadgeClass: getStatusBadgeClass,
    getAllStatuses: getAllStatuses,
    clearAllStatuses: clearAllStatuses,
    STATUS_STORAGE_KEY: STATUS_STORAGE_KEY,
    STATUS_HISTORY_KEY: STATUS_HISTORY_KEY
  };
})();
