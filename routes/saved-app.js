/* ============================================
   JOB NOTIFICATION TRACKER - SAVED JOBS APP
   Render saved jobs from localStorage
   ============================================ */

(function() {
  'use strict';

  // DOM Elements
  let savedContainer;
  let emptyState;
  let savedCount;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initSavedPage();
  });

  function initSavedPage() {
    // Cache DOM elements
    savedContainer = document.getElementById('saved-jobs-container');
    emptyState = document.getElementById('saved-empty-state');
    savedCount = document.getElementById('saved-count');
    
    // Render saved jobs
    renderSavedJobs();
  }

  // Get saved job IDs from localStorage
  function getSavedJobIds() {
    try {
      const saved = localStorage.getItem('savedJobs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading saved jobs:', e);
      return [];
    }
  }

  // Get full job details by ID
  function getJobById(id) {
    return jobsData.find(job => job.id === id);
  }

  // Remove job from saved
  function unsaveJob(jobId) {
    try {
      const savedIds = getSavedJobIds();
      const index = savedIds.indexOf(jobId);
      if (index > -1) {
        savedIds.splice(index, 1);
        localStorage.setItem('savedJobs', JSON.stringify(savedIds));
        renderSavedJobs();
      }
    } catch (e) {
      console.error('Error unsaving job:', e);
    }
  }

  // Render saved jobs
  function renderSavedJobs() {
    if (!savedContainer) return;
    
    const savedIds = getSavedJobIds();
    const savedJobs = savedIds.map(id => getJobById(id)).filter(job => job !== undefined);
    
    // Update count
    if (savedCount) {
      savedCount.textContent = `${savedJobs.length} job${savedJobs.length !== 1 ? 's' : ''} saved`;
    }
    
    if (savedJobs.length === 0) {
      showEmptyState();
      return;
    }
    
    hideEmptyState();
    savedContainer.innerHTML = savedJobs.map(job => createSavedJobCard(job)).join('');
    
    // Attach event listeners
    attachEventListeners();
  }

  // Create saved job card HTML
  function createSavedJobCard(job) {
    const postedText = job.postedDaysAgo === 0 ? 'Today' : 
                       job.postedDaysAgo === 1 ? '1 day ago' : 
                       `${job.postedDaysAgo} days ago`;
    
    return `
      <div class="job-card" data-job-id="${job.id}">
        <div class="job-card-header">
          <div class="job-title-section">
            <h3 class="job-title">${escapeHtml(job.title)}</h3>
            <span class="job-company">${escapeHtml(job.company)}</span>
          </div>
          <span class="badge badge-${getSourceBadgeClass(job.source)}">${job.source}</span>
        </div>
        
        <div class="job-details">
          <div class="job-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>${escapeHtml(job.location)} · ${job.mode}</span>
          </div>
          <div class="job-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>${job.experience}</span>
          </div>
          <div class="job-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>${escapeHtml(job.salaryRange)}</span>
          </div>
        </div>
        
        <div class="job-skills-preview">
          ${job.skills.slice(0, 3).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
          ${job.skills.length > 3 ? `<span class="skill-tag">+${job.skills.length - 3} more</span>` : ''}
        </div>
        
        <div class="job-meta">
          <span class="job-posted">${postedText}</span>
        </div>
        
        <div class="job-actions">
          <button class="btn btn-secondary btn-sm unsave-btn" data-job-id="${job.id}">Remove</button>
          <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Apply</a>
        </div>
      </div>
    `;
  }

  // Attach event listeners
  function attachEventListeners() {
    // Unsave buttons
    document.querySelectorAll('.unsave-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const jobId = parseInt(this.dataset.jobId);
        unsaveJob(jobId);
      });
    });
  }

  // Show empty state
  function showEmptyState() {
    if (savedContainer) savedContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (savedCount) savedCount.textContent = '0 jobs saved';
  }

  // Hide empty state
  function hideEmptyState() {
    if (emptyState) emptyState.style.display = 'none';
  }

  // Get source badge class
  function getSourceBadgeClass(source) {
    switch (source) {
      case 'LinkedIn': return 'success';
      case 'Naukri': return 'warning';
      case 'Indeed': return 'not-started';
      default: return 'not-started';
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
