/* ============================================
   JOB NOTIFICATION TRACKER - SETTINGS APP
   Preference form handling
   ============================================ */

(function() {
  'use strict';

  // DOM Elements
  let form;
  let slider;
  let sliderValue;
  let successMessage;

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initSettings();
  });

  function initSettings() {
    // Cache DOM elements
    form = document.getElementById('preferences-form');
    slider = document.getElementById('min-match-score');
    sliderValue = document.getElementById('slider-value');
    successMessage = document.getElementById('success-message');

    if (!form) return;

    // Setup slider
    if (slider && sliderValue) {
      slider.addEventListener('input', function() {
        sliderValue.textContent = this.value;
      });
    }

    // Load existing preferences
    loadFormData();

    // Form submit handler
    form.addEventListener('submit', handleSubmit);

    // Form reset handler
    form.addEventListener('reset', function() {
      setTimeout(function() {
        if (sliderValue) sliderValue.textContent = '40';
      }, 0);
    });
  }

  // Load form data from localStorage
  function loadFormData() {
    const preferences = window.preferencesEngine.loadPreferences();
    if (!preferences) return;

    // Role keywords
    const roleKeywordsInput = form.querySelector('[name="roleKeywords"]');
    if (roleKeywordsInput) roleKeywordsInput.value = preferences.roleKeywords || '';

    // Preferred locations (multi-select)
    const locationsSelect = form.querySelector('[name="preferredLocations"]');
    if (locationsSelect && preferences.preferredLocations) {
      Array.from(locationsSelect.options).forEach(option => {
        option.selected = preferences.preferredLocations.includes(option.value);
      });
    }

    // Preferred mode (checkboxes)
    const modeCheckboxes = form.querySelectorAll('[name="preferredMode"]');
    modeCheckboxes.forEach(checkbox => {
      checkbox.checked = preferences.preferredMode && 
                         preferences.preferredMode.includes(checkbox.value);
    });

    // Experience level
    const experienceSelect = form.querySelector('[name="experienceLevel"]');
    if (experienceSelect) experienceSelect.value = preferences.experienceLevel || '';

    // Skills
    const skillsInput = form.querySelector('[name="skills"]');
    if (skillsInput) skillsInput.value = preferences.skills || '';

    // Min match score
    const minScoreInput = form.querySelector('[name="minMatchScore"]');
    if (minScoreInput) {
      minScoreInput.value = preferences.minMatchScore || 40;
      if (sliderValue) sliderValue.textContent = minScoreInput.value;
    }
  }

  // Handle form submit
  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);

    // Build preferences object
    const preferences = {
      roleKeywords: formData.get('roleKeywords') || '',
      preferredLocations: getSelectedValues(form.querySelector('[name="preferredLocations"]')),
      preferredMode: getCheckedValues(form.querySelectorAll('[name="preferredMode"]')),
      experienceLevel: formData.get('experienceLevel') || '',
      skills: formData.get('skills') || '',
      minMatchScore: parseInt(formData.get('minMatchScore')) || 40
    };

    // Save preferences
    const saved = window.preferencesEngine.savePreferences(preferences);

    if (saved) {
      showSuccessMessage();
    }
  }

  // Get selected values from multi-select
  function getSelectedValues(select) {
    if (!select) return [];
    return Array.from(select.selectedOptions).map(option => option.value);
  }

  // Get checked values from checkboxes
  function getCheckedValues(checkboxes) {
    return Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  // Show success message
  function showSuccessMessage() {
    if (!successMessage) return;
    successMessage.classList.add('show');
    setTimeout(function() {
      successMessage.classList.remove('show');
    }, 3000);
  }
})();
