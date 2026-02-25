/* ============================================
   JOB NOTIFICATION TRACKER - PREFERENCES ENGINE
   Preference management and match scoring
   ============================================ */

(function() {
  'use strict';

  // Default preferences
  const DEFAULT_PREFERENCES = {
    roleKeywords: '',
    preferredLocations: [],
    preferredMode: [],
    experienceLevel: '',
    skills: '',
    minMatchScore: 40
  };

  const STORAGE_KEY = 'jobTrackerPreferences';

  // Load preferences from localStorage
  function loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
    return null;
  }

  // Save preferences to localStorage
  function savePreferences(preferences) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      return true;
    } catch (e) {
      console.error('Error saving preferences:', e);
      return false;
    }
  }

  // Check if preferences exist
  function hasPreferences() {
    return loadPreferences() !== null;
  }

  // Parse comma-separated string to array
  function parseCommaSeparated(str) {
    if (!str || typeof str !== 'string') return [];
    return str.split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
  }

  // Calculate match score for a job
  function calculateMatchScore(job, preferences) {
    if (!preferences) return 0;
    if (!job || typeof job !== 'object') return 0;

    let score = 0;

    // Parse preferences
    const roleKeywords = parseCommaSeparated(preferences.roleKeywords);
    const userSkills = parseCommaSeparated(preferences.skills);
    const preferredLocations = (preferences.preferredLocations || []).map(l => l.toLowerCase());
    const preferredModes = (preferences.preferredMode || []).map(m => m.toLowerCase());
    const experienceLevel = (preferences.experienceLevel || '').toLowerCase();

    // Parse job data
    const jobTitle = (job.title || '').toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    const jobLocation = (job.location || '').toLowerCase();
    const jobMode = (job.mode || '').toLowerCase();
    const jobExperience = (job.experience || '').toLowerCase();
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    const jobSource = (job.source || '').toLowerCase();
    const postedDaysAgo = job.postedDaysAgo || 0;

    // +25 if any roleKeyword appears in job.title
    if (roleKeywords.length > 0) {
      const titleMatch = roleKeywords.some(keyword => jobTitle.includes(keyword));
      if (titleMatch) score += 25;
    }

    // +15 if any roleKeyword appears in job.description
    if (roleKeywords.length > 0) {
      const descMatch = roleKeywords.some(keyword => jobDescription.includes(keyword));
      if (descMatch) score += 15;
    }

    // +15 if job.location matches preferredLocations
    if (preferredLocations.length > 0) {
      const locationMatch = preferredLocations.some(loc => jobLocation.includes(loc));
      if (locationMatch) score += 15;
    }

    // +10 if job.mode matches preferredMode
    if (preferredModes.length > 0) {
      const modeMatch = preferredModes.some(mode => jobMode === mode);
      if (modeMatch) score += 10;
    }

    // +10 if job.experience matches experienceLevel
    if (experienceLevel) {
      const expMatch = jobExperience === experienceLevel;
      if (expMatch) score += 10;
    }

    // +15 if overlap between job.skills and user.skills
    if (userSkills.length > 0 && jobSkills.length > 0) {
      const skillOverlap = userSkills.some(skill => 
        jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
      );
      if (skillOverlap) score += 15;
    }

    // +5 if postedDaysAgo <= 2
    if (postedDaysAgo <= 2) score += 5;

    // +5 if source is LinkedIn
    if (jobSource === 'linkedin') score += 5;

    // Cap at 100
    return Math.min(score, 100);
  }

  // Get match score color class
  function getMatchScoreClass(score) {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'not-started';
    return 'error';
  }

  // Get match score label
  function getMatchScoreLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  }

  // Expose globally
  window.preferencesEngine = {
    loadPreferences: loadPreferences,
    savePreferences: savePreferences,
    hasPreferences: hasPreferences,
    calculateMatchScore: calculateMatchScore,
    getMatchScoreClass: getMatchScoreClass,
    getMatchScoreLabel: getMatchScoreLabel,
    DEFAULT_PREFERENCES: DEFAULT_PREFERENCES,
    STORAGE_KEY: STORAGE_KEY
  };
})();
