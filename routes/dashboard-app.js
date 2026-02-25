/* ============================================
   JOB NOTIFICATION TRACKER - DASHBOARD APP
   Job cards, filtering, modal, and localStorage
   ============================================ */

(function() {
  'use strict';

  // State
  let currentJobs = [];
  let savedJobIds = [];
  let currentFilters = {
    keyword: '',
    location: '',
    mode: '',
    experience: '',
    source: ''
  };
  let currentSort = 'latest';

  // DOM Elements
  let jobsContainer;
  let filterForm;
  let modal;
  let modalContent;
  let emptyState;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
  });

  function initDashboard() {
    // Load saved jobs from localStorage
    loadSavedJobs();
    
    // Initialize jobs
    currentJobs = [...jobsData];
    
    // Cache DOM elements
    jobsContainer = document.getElementById('jobs-container');
    filterForm = document.getElementById('filter-form');
    modal = document.getElementById('job-modal');
    modalContent = document.getElementById('modal-content');
    emptyState = document.getElementById('empty-state');
    
    // Setup event listeners
    if (filterForm) {
      filterForm.addEventListener('submit', handleFilterSubmit);
      filterForm.addEventListener('reset', handleFilterReset);
      
      // Real-time filtering for selects
      const selects = filterForm.querySelectorAll('select');
      selects.forEach(select => {
        select.addEventListener('change', applyFilters);
      });
      
      // Real-time search
      const keywordInput = document.getElementById('filter-keyword');
      if (keywordInput) {
        keywordInput.addEventListener('input', debounce(applyFilters, 300));
      }
      
      // Sort change
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
      }
    }
    
    // Modal close handlers
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal();
        }
      });
      
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeModal();
        }
      });
    }
    
    // Initial render
    renderJobs();
  }

  // Load saved jobs from localStorage
  function loadSavedJobs() {
    try {
      const saved = localStorage.getItem('savedJobs');
      if (saved) {
        savedJobIds = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved jobs:', e);
      savedJobIds = [];
    }
  }

  // Save jobs to localStorage
  function saveToLocalStorage() {
    try {
      localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
    } catch (e) {
      console.error('Error saving jobs:', e);
    }
  }

  // Check if job is saved
  function isJobSaved(jobId) {
    return savedJobIds.includes(jobId);
  }

  // Toggle save job
  function toggleSaveJob(jobId) {
    const index = savedJobIds.indexOf(jobId);
    if (index > -1) {
      savedJobIds.splice(index, 1);
    } else {
      savedJobIds.push(jobId);
    }
    saveToLocalStorage();
    renderJobs();
  }

  // Handle filter submit
  function handleFilterSubmit(e) {
    e.preventDefault();
    applyFilters();
  }

  // Handle filter reset
  function handleFilterReset() {
    currentFilters = {
      keyword: '',
      location: '',
      mode: '',
      experience: '',
      source: ''
    };
    setTimeout(applyFilters, 0);
  }

  // Handle sort change
  function handleSortChange(e) {
    currentSort = e.target.value;
    renderJobs();
  }

  // Apply filters
  function applyFilters() {
    if (!filterForm) return;
    
    const formData = new FormData(filterForm);
    currentFilters = {
      keyword: (formData.get('keyword') || '').toLowerCase().trim(),
      location: formData.get('location') || '',
      mode: formData.get('mode') || '',
      experience: formData.get('experience') || '',
      source: formData.get('source') || ''
    };
    
    // Filter jobs
    let filtered = jobsData.filter(job => {
      // Keyword filter (title, company, skills)
      if (currentFilters.keyword) {
        const searchText = `${job.title} ${job.company} ${job.skills.join(' ')}`.toLowerCase();
        if (!searchText.includes(currentFilters.keyword)) {
          return false;
        }
      }
      
      // Location filter
      if (currentFilters.location && job.location !== currentFilters.location) {
        return false;
      }
      
      // Mode filter
      if (currentFilters.mode && job.mode !== currentFilters.mode) {
        return false;
      }
      
      // Experience filter
      if (currentFilters.experience && job.experience !== currentFilters.experience) {
        return false;
      }
      
      // Source filter
      if (currentFilters.source && job.source !== currentFilters.source) {
        return false;
      }
      
      return true;
    });
    
    currentJobs = filtered;
    renderJobs();
  }

  // Sort jobs
  function sortJobs(jobs) {
    const sorted = [...jobs];
    
    switch (currentSort) {
      case 'latest':
        sorted.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
        break;
      case 'oldest':
        sorted.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
        break;
      case 'salary-high':
        // Simple sort by extracting first number from salary
        sorted.sort((a, b) => {
          const aNum = parseInt(a.salaryRange.match(/\d+/)?.[0] || 0);
          const bNum = parseInt(b.salaryRange.match(/\d+/)?.[0] || 0);
          return bNum - aNum;
        });
        break;
      case 'salary-low':
        sorted.sort((a, b) => {
          const aNum = parseInt(a.salaryRange.match(/\d+/)?.[0] || 0);
          const bNum = parseInt(b.salaryRange.match(/\d+/)?.[0] || 0);
          return aNum - bNum;
        });
        break;
      default:
        break;
    }
    
    return sorted;
  }

  // Render jobs
  function renderJobs() {
    if (!jobsContainer) return;
    
    const sortedJobs = sortJobs(currentJobs);
    
    if (sortedJobs.length === 0) {
      showEmptyState();
      return;
    }
    
    hideEmptyState();
    jobsContainer.innerHTML = sortedJobs.map(job => createJobCard(job)).join('');
    
    // Attach event listeners to buttons
    attachJobCardListeners();
  }

  // Create job card HTML
  function createJobCard(job) {
    const isSaved = isJobSaved(job.id);
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
        
        <div class="job-meta">
          <span class="job-posted">${postedText}</span>
        </div>
        
        <div class="job-actions">
          <button class="btn btn-secondary btn-sm job-view-btn" data-job-id="${job.id}">View</button>
          <button class="btn ${isSaved ? 'btn-primary' : 'btn-secondary'} btn-sm job-save-btn" data-job-id="${job.id}">
            ${isSaved ? 'Saved' : 'Save'}
          </button>
          <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Apply</a>
        </div>
      </div>
    `;
  }

  // Attach event listeners to job card buttons
  function attachJobCardListeners() {
    // View buttons
    document.querySelectorAll('.job-view-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const jobId = parseInt(this.dataset.jobId);
        openJobModal(jobId);
      });
    });
    
    // Save buttons
    document.querySelectorAll('.job-save-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const jobId = parseInt(this.dataset.jobId);
        toggleSaveJob(jobId);
      });
    });
  }

  // Open job modal
  function openJobModal(jobId) {
    const job = jobsData.find(j => j.id === jobId);
    if (!job || !modal || !modalContent) return;
    
    const isSaved = isJobSaved(job.id);
    const postedText = job.postedDaysAgo === 0 ? 'Today' : 
                       job.postedDaysAgo === 1 ? '1 day ago' : 
                       `${job.postedDaysAgo} days ago`;
    
    modalContent.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${escapeHtml(job.title)}</h2>
        <button class="modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-company">
          <span class="company-name">${escapeHtml(job.company)}</span>
          <span class="badge badge-${getSourceBadgeClass(job.source)}">${job.source}</span>
        </div>
        
        <div class="modal-details">
          <div class="modal-detail">
            <strong>Location:</strong> ${escapeHtml(job.location)} · ${job.mode}
          </div>
          <div class="modal-detail">
            <strong>Experience:</strong> ${job.experience}
          </div>
          <div class="modal-detail">
            <strong>Salary:</strong> ${escapeHtml(job.salaryRange)}
          </div>
          <div class="modal-detail">
            <strong>Posted:</strong> ${postedText}
          </div>
        </div>
        
        <div class="modal-section">
          <h4>Description</h4>
          <p>${escapeHtml(job.description)}</p>
        </div>
        
        <div class="modal-section">
          <h4>Skills</h4>
          <div class="skills-list">
            ${job.skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-save-btn" data-job-id="${job.id}">
          ${isSaved ? 'Unsave Job' : 'Save Job'}
        </button>
        <a href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Apply Now</a>
      </div>
    `;
    
    // Attach modal event listeners
    modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
    modalContent.querySelector('.modal-save-btn').addEventListener('click', function() {
      toggleSaveJob(parseInt(this.dataset.jobId));
      // Update modal button text
      const newIsSaved = isJobSaved(job.id);
      this.textContent = newIsSaved ? 'Unsave Job' : 'Save Job';
    });
    
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Show empty state
  function showEmptyState() {
    if (jobsContainer) jobsContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
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

  // Debounce function
  function debounce(func, wait) {
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

  // Expose functions globally for saved page
  window.jobsApp = {
    getSavedJobIds: () => savedJobIds,
    getJobById: (id) => jobsData.find(j => j.id === id),
    toggleSaveJob: toggleSaveJob,
    isJobSaved: isJobSaved,
    loadSavedJobs: loadSavedJobs
  };
})();
