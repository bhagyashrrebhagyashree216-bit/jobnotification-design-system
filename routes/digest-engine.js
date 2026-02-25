/* ============================================
   JOB NOTIFICATION TRACKER - DAILY DIGEST ENGINE
   Generates and manages daily 9AM job digests
   ============================================ */

(function() {
  'use strict';

  const DIGEST_KEY_PREFIX = 'jobTrackerDigest_';
  const DIGEST_JOB_COUNT = 10;

  // Get today's date string (YYYY-MM-DD)
  function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Get formatted date for display
  function getFormattedDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  }

  // Get digest storage key for a specific date
  function getDigestKey(dateString) {
    return DIGEST_KEY_PREFIX + dateString;
  }

  // Check if digest exists for today
  function hasTodayDigest() {
    const key = getDigestKey(getTodayDateString());
    try {
      return localStorage.getItem(key) !== null;
    } catch (e) {
      return false;
    }
  }

  // Load digest for a specific date
  function loadDigest(dateString) {
    try {
      const key = getDigestKey(dateString);
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading digest:', e);
    }
    return null;
  }

  // Load today's digest
  function loadTodayDigest() {
    return loadDigest(getTodayDateString());
  }

  // Save digest for a specific date
  function saveDigest(dateString, digest) {
    try {
      const key = getDigestKey(dateString);
      localStorage.setItem(key, JSON.stringify(digest));
      return true;
    } catch (e) {
      console.error('Error saving digest:', e);
      return false;
    }
  }

  // Generate digest jobs
  function generateDigestJobs(allJobs, preferences) {
    if (!allJobs || !Array.isArray(allJobs) || allJobs.length === 0) {
      return [];
    }

    // Calculate match scores for all jobs
    const jobsWithScores = allJobs.map(job => {
      let matchScore = 0;
      if (preferences && typeof window.preferencesEngine !== 'undefined') {
        matchScore = window.preferencesEngine.calculateMatchScore(job, preferences);
      }
      return {
        ...job,
        matchScore: matchScore
      };
    });

    // Sort by: 1) matchScore descending, 2) postedDaysAgo ascending
    jobsWithScores.sort((a, b) => {
      // Primary: matchScore descending
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Secondary: postedDaysAgo ascending (most recent first)
      return a.postedDaysAgo - b.postedDaysAgo;
    });

    // Return top 10
    return jobsWithScores.slice(0, DIGEST_JOB_COUNT);
  }

  // Generate new digest
  function generateDigest(allJobs, preferences) {
    const today = getTodayDateString();
    const jobs = generateDigestJobs(allJobs, preferences);

    const digest = {
      date: today,
      formattedDate: getFormattedDate(),
      generatedAt: new Date().toISOString(),
      jobs: jobs,
      totalJobs: allJobs.length,
      preferencesUsed: preferences ? true : false
    };

    // Save to localStorage
    saveDigest(today, digest);

    return digest;
  }

  // Get or generate today's digest
  function getOrGenerateTodayDigest(allJobs, preferences) {
    // Check if digest already exists for today
    const existingDigest = loadTodayDigest();
    if (existingDigest) {
      return existingDigest;
    }

    // Generate new digest
    return generateDigest(allJobs, preferences);
  }

  // Generate plain text version of digest for clipboard
  function generatePlainText(digest) {
    if (!digest || !digest.jobs || digest.jobs.length === 0) {
      return 'No jobs in digest.';
    }

    let text = `Top ${digest.jobs.length} Jobs For You — 9AM Digest\n`;
    text += `${digest.formattedDate}\n`;
    text += '='.repeat(50) + '\n\n';

    digest.jobs.forEach((job, index) => {
      text += `${index + 1}. ${job.title}\n`;
      text += `   Company: ${job.company}\n`;
      text += `   Location: ${job.location}\n`;
      text += `   Experience: ${job.experience}\n`;
      if (job.matchScore > 0) {
        text += `   Match Score: ${job.matchScore}%\n`;
      }
      text += `   Apply: ${job.applyUrl}\n`;
      text += '\n';
    });

    text += '---\n';
    text += 'This digest was generated based on your preferences.\n';

    return text;
  }

  // Generate mailto URL for email draft
  function generateMailtoUrl(digest) {
    const subject = encodeURIComponent('My 9AM Job Digest');
    const body = encodeURIComponent(generatePlainText(digest));
    return `mailto:?subject=${subject}&body=${body}`;
  }

  // Expose globally
  window.digestEngine = {
    getTodayDateString: getTodayDateString,
    getFormattedDate: getFormattedDate,
    hasTodayDigest: hasTodayDigest,
    loadTodayDigest: loadTodayDigest,
    loadDigest: loadDigest,
    saveDigest: saveDigest,
    generateDigest: generateDigest,
    getOrGenerateTodayDigest: getOrGenerateTodayDigest,
    generatePlainText: generatePlainText,
    generateMailtoUrl: generateMailtoUrl,
    DIGEST_JOB_COUNT: DIGEST_JOB_COUNT
  };
})();
