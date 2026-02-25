/* ============================================
   JOB NOTIFICATION TRACKER - DIGEST APP
   Daily digest UI and interactions
   ============================================ */

(function() {
  'use strict';

  // State
  let currentDigest = null;
  let userPreferences = null;

  // DOM Elements
  let generateBtn;
  let digestActions;
  let blockingMessage;
  let emptyMatches;
  let digestContent;
  let digestDate;
  let digestJobList;
  let copyBtn;
  let emailBtn;
  let toast;
  let statusUpdatesList;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initDigest();
  });

  function initDigest() {
    // Cache DOM elements
    generateBtn = document.getElementById('generate-btn');
    digestActions = document.getElementById('digest-actions');
    blockingMessage = document.getElementById('blocking-message');
    emptyMatches = document.getElementById('empty-matches');
    digestContent = document.getElementById('digest-content');
    digestDate = document.getElementById('digest-date');
    digestJobList = document.getElementById('digest-job-list');
    copyBtn = document.getElementById('copy-btn');
    emailBtn = document.getElementById('email-btn');
    toast = document.getElementById('toast');
    statusUpdatesList = document.getElementById('status-updates-list');

    // Load preferences
    loadPreferences();

    // Check initial state
    updateUIState();

    // Event listeners
    if (generateBtn) {
      generateBtn.addEventListener('click', handleGenerateDigest);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopyToClipboard);
    }

    if (emailBtn) {
      emailBtn.addEventListener('click', handleEmailDraft);
    }
  }

  // Load preferences
  function loadPreferences() {
    if (typeof window.preferencesEngine !== 'undefined') {
      userPreferences = window.preferencesEngine.loadPreferences();
    }
  }

  // Update UI based on state
  function updateUIState() {
    // Check if preferences are set
    if (!userPreferences) {
      showBlockingMessage();
      return;
    }

    // Check if digest already exists for today
    if (typeof window.digestEngine !== 'undefined' && window.digestEngine.hasTodayDigest()) {
      loadExistingDigest();
    }
  }

  // Show blocking message (no preferences)
  function showBlockingMessage() {
    if (generateBtn) generateBtn.style.display = 'none';
    if (digestActions) digestActions.style.display = 'none';
    if (digestContent) digestContent.style.display = 'none';
    if (emptyMatches) emptyMatches.style.display = 'none';
    if (blockingMessage) blockingMessage.style.display = 'block';
  }

  // Show empty matches state
  function showEmptyMatches() {
    if (generateBtn) generateBtn.style.display = 'none';
    if (digestActions) digestActions.style.display = 'none';
    if (digestContent) digestContent.style.display = 'none';
    if (blockingMessage) blockingMessage.style.display = 'none';
    if (emptyMatches) emptyMatches.style.display = 'block';
  }

  // Show digest content
  function showDigest() {
    if (generateBtn) {
      generateBtn.textContent = 'Regenerate Today\'s Digest';
      generateBtn.style.display = 'inline-block';
    }
    if (digestActions) digestActions.style.display = 'flex';
    if (digestContent) digestContent.style.display = 'block';
    if (blockingMessage) blockingMessage.style.display = 'none';
    if (emptyMatches) emptyMatches.style.display = 'none';
  }

  // Handle generate digest button
  function handleGenerateDigest() {
    if (typeof window.digestEngine === 'undefined' || typeof jobsData === 'undefined') {
      console.error('Required engines not loaded');
      return;
    }

    // Generate or load digest
    currentDigest = window.digestEngine.getOrGenerateTodayDigest(jobsData, userPreferences);

    // Check if we have jobs
    if (!currentDigest.jobs || currentDigest.jobs.length === 0) {
      showEmptyMatches();
      return;
    }

    // Render digest
    renderDigest(currentDigest);
    showDigest();
    
    // Render status updates
    renderStatusUpdates();
  }

  // Load existing digest from localStorage
  function loadExistingDigest() {
    if (typeof window.digestEngine === 'undefined') return;

    currentDigest = window.digestEngine.loadTodayDigest();

    if (currentDigest && currentDigest.jobs && currentDigest.jobs.length > 0) {
      renderDigest(currentDigest);
      showDigest();
    }
  }

  // Render digest
  function renderDigest(digest) {
    if (!digest) return;

    // Set date
    if (digestDate) {
      digestDate.textContent = digest.formattedDate || window.digestEngine.getFormattedDate();
    }

    // Render job list
    if (digestJobList) {
      digestJobList.innerHTML = digest.jobs.map(job => createDigestJobItem(job)).join('');
    }
  }

  // Create digest job item HTML
  function createDigestJobItem(job) {
    const matchScoreClass = getMatchScoreClass(job.matchScore);
    const matchScoreLabel = getMatchScoreLabel(job.matchScore);

    return `
      <div class="digest-job-item">
        <div class="digest-job-header">
          <div>
            <h3 class="digest-job-title">${escapeHtml(job.title)}</h3>
            <p class="digest-job-company">${escapeHtml(job.company)}</p>
          </div>
        </div>
        
        <div class="digest-job-meta">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            ${escapeHtml(job.location)}
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            ${escapeHtml(job.experience)}
          </span>
        </div>
        
        <div class="digest-job-footer">
          <span class="digest-match-score ${matchScoreClass}">
            ${job.matchScore}% Match — ${matchScoreLabel}
          </span>
          <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Apply
          </a>
        </div>
      </div>
    `;
  }

  // Get match score CSS class
  function getMatchScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  }

  // Get match score label
  function getMatchScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  }

  // Handle copy to clipboard
  async function handleCopyToClipboard() {
    if (!currentDigest || typeof window.digestEngine === 'undefined') return;

    const plainText = window.digestEngine.generatePlainText(currentDigest);

    try {
      await navigator.clipboard.writeText(plainText);
      showToast('Copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = plainText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
      } catch (e) {
        showToast('Failed to copy. Please try again.');
      }
      
      document.body.removeChild(textArea);
    }
  }

  // Handle email draft
  function handleEmailDraft(e) {
    if (!currentDigest || typeof window.digestEngine === 'undefined') return;

    const mailtoUrl = window.digestEngine.generateMailtoUrl(currentDigest);
    emailBtn.href = mailtoUrl;
    // Let the default link behavior handle opening the email client
  }

  // Show toast notification
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(function() {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Render status updates
  function renderStatusUpdates() {
    if (!statusUpdatesList || typeof window.statusEngine === 'undefined' || typeof jobsData === 'undefined') {
      return;
    }
    
    const updates = window.statusEngine.getRecentStatusUpdates(jobsData, 10);
    
    if (updates.length === 0) {
      statusUpdatesList.innerHTML = '<div class="status-updates-empty">No status updates yet. Change job statuses on the dashboard.</div>';
      return;
    }
    
    statusUpdatesList.innerHTML = updates.map(update => createStatusUpdateItem(update)).join('');
  }
  
  // Create status update item HTML
  function createStatusUpdateItem(update) {
    if (!update.job) return '';
    
    const statusClass = update.status.toLowerCase().replace(' ', '-');
    const date = new Date(update.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `
      <div class="status-update-item">
        <div class="status-update-info">
          <span class="status-update-job">${escapeHtml(update.job.title)}</span>
          <span class="status-update-company">${escapeHtml(update.job.company)}</span>
        </div>
        <div class="status-update-meta">
          <span class="status-update-badge ${statusClass}">${update.status}</span>
          <span class="status-update-date">${dateStr}</span>
        </div>
      </div>
    `;
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
