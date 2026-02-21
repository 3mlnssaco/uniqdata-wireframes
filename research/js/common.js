/**
 * Common.js - Shared JavaScript Utilities
 * Extracted from wireframe HTML files to reduce duplication
 * Usage: Include this file before page-specific scripts
 */

// ===== MODAL MANAGEMENT =====
/**
 * Open a modal by ID
 * @param {string} id - The modal ID to open
 */
function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('show');
  }
}

/**
 * Close a modal by ID
 * @param {string} id - The modal ID to close
 */
function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('show');
  }
}

/**
 * Close all open modals when Escape key is pressed
 * Attach to all modal overlays with class 'modal-overlay'
 */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(function(m) {
      m.classList.remove('show');
    });
  }
});


// ===== TAB/METHOD SWITCHING =====
/**
 * Switch active tab/method in a section
 * Works with elements that have 'data-method' or similar attributes
 * @param {string} section - Section identifier
 * @param {Element} el - The clicked element
 * @param {Object} options - Configuration options
 */
function selectMethod(section, el, options) {
  options = options || {};

  // Get the target container
  var container = el.closest(options.containerClass || '.card-body') || document.body;

  // Remove active from all methods in container
  var selector = options.methodSelector || '[data-method]';
  container.querySelectorAll(selector).forEach(function(item) {
    item.classList.remove('active', 'selected');
  });

  // Add active to clicked element
  el.classList.add(options.activeClass || 'active');
}

/**
 * Toggle class on an element (e.g., for expanding/collapsing)
 * @param {string} elementId - The element ID
 * @param {string} className - The class to toggle (default: 'active')
 */
function toggleClass(elementId, className) {
  className = className || 'active';
  var el = document.getElementById(elementId);
  if (el) {
    el.classList.toggle(className);
  }
}


// ===== DESIGNER NOTES PANEL CYCLING =====
/**
 * Cycle through designer notes panels
 * Useful for multiple note sections (e.g., design, spec, backend)
 * @param {Array} panelIds - Array of panel IDs to cycle through
 */
function createNotesCycler(panelIds) {
  return function toggleNotes() {
    var currentShown = -1;

    // Find currently shown panel
    for (var i = 0; i < panelIds.length; i++) {
      var panel = document.getElementById(panelIds[i]);
      if (panel && panel.classList.contains('show')) {
        currentShown = i;
        break;
      }
    }

    // Close all panels
    for (var i = 0; i < panelIds.length; i++) {
      var panel = document.getElementById(panelIds[i]);
      if (panel) {
        panel.classList.remove('show');
      }
    }

    // Open next panel
    if (currentShown === -1) {
      // No panel shown, show first
      var firstPanel = document.getElementById(panelIds[0]);
      if (firstPanel) firstPanel.classList.add('show');
    } else if (currentShown < panelIds.length - 1) {
      // Show next panel
      var nextPanel = document.getElementById(panelIds[currentShown + 1]);
      if (nextPanel) nextPanel.classList.add('show');
    }
    // If last panel was shown, they all close
  };
}


// ===== TOGGLE/SWITCH HANDLERS =====
/**
 * Toggle visibility of an element
 * @param {string} elementId - The element ID
 */
function toggleVisibility(elementId) {
  var el = document.getElementById(elementId);
  if (el) {
    var isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
  }
}

/**
 * Toggle a section's expanded/collapsed state
 * Works with nested items that have .research-nav-item structure
 */
function initSectionToggle(headerSelector) {
  document.querySelectorAll(headerSelector).forEach(function(header) {
    header.addEventListener('click', function() {
      var item = this.closest('.research-nav-item');
      if (item) {
        if (item.classList.contains('expanded')) {
          item.classList.remove('expanded');
          item.classList.add('collapsed');
        } else {
          item.classList.remove('collapsed');
          item.classList.add('expanded');
        }
      }
    });
  });
}


// ===== RADIO/CHECKBOX SELECTION =====
/**
 * Handle single-selection radio button groups
 * @param {string} groupSelector - Selector for all items in group
 * @param {string} activeClass - Class to apply when selected (default: 'selected')
 * @param {Function} onSelect - Callback when selection changes
 */
function initRadioGroup(groupSelector, activeClass, onSelect) {
  activeClass = activeClass || 'selected';

  document.querySelectorAll(groupSelector).forEach(function(item) {
    item.addEventListener('click', function() {
      // Remove active from all in group
      document.querySelectorAll(groupSelector).forEach(function(i) {
        i.classList.remove(activeClass);
      });
      // Add active to clicked
      this.classList.add(activeClass);
      // Call callback
      if (onSelect) onSelect(this);
    });
  });
}

/**
 * Handle toggle selection (can select multiple items)
 * @param {string} itemSelector - Selector for toggleable items
 * @param {string} activeClass - Class to apply when selected (default: 'selected')
 * @param {Function} onToggle - Callback when selection changes
 */
function initToggleGroup(itemSelector, activeClass, onToggle) {
  activeClass = activeClass || 'selected';

  document.querySelectorAll(itemSelector).forEach(function(item) {
    item.addEventListener('click', function(e) {
      this.classList.toggle(activeClass);
      if (onToggle) onToggle(this);
    });
  });
}


// ===== SIDEBAR EXPAND/COLLAPSE =====
/**
 * Toggle sidebar expansion
 * @param {string} sidebarId - Sidebar element ID
 * @param {string} expandedClass - Class for expanded state (default: 'expanded')
 */
function toggleSidebar(sidebarId, expandedClass) {
  expandedClass = expandedClass || 'expanded';
  var sidebar = document.getElementById(sidebarId);
  if (sidebar) {
    sidebar.classList.toggle(expandedClass);
  }
}


// ===== DETAIL PANEL MANAGEMENT =====
/**
 * Open/close detail panel (for split views)
 * @param {string} splitId - The split container ID
 * @param {boolean} open - True to open, false to close
 */
function toggleDetail(splitId, open) {
  var split = document.getElementById(splitId);
  if (split) {
    if (open === undefined) {
      split.classList.toggle('detail-open');
    } else if (open) {
      split.classList.add('detail-open');
    } else {
      split.classList.remove('detail-open');
    }
  }
}

/**
 * Clear selection from table/list
 * @param {string} containerSelector - Container CSS selector
 */
function clearSelection(containerSelector) {
  document.querySelectorAll(containerSelector + ' .selected').forEach(function(el) {
    el.classList.remove('selected');
  });
}


// ===== COPY TO CLIPBOARD =====
/**
 * Copy text to clipboard and show feedback
 * @param {string} text - Text to copy
 * @param {Element} element - Element to show feedback on (optional)
 */
function copyToClipboard(text, element) {
  navigator.clipboard.writeText(text).then(function() {
    if (element) {
      var originalText = element.textContent;
      element.textContent = '복사됨!';
      setTimeout(function() {
        element.textContent = originalText;
      }, 2000);
    }
  }).catch(function() {
    console.error('Failed to copy to clipboard');
  });
}


// ===== FORM/INPUT HELPERS =====
/**
 * Format a number with thousands separator
 * @param {number} num - Number to format
 * @param {string} format - Format type: 'ko' for Korean (default), 'en' for English
 */
function formatNumber(num, format) {
  format = format || 'ko';
  if (format === 'ko') {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return num.toLocaleString();
}

/**
 * Debounce function for input handlers
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
function debounce(func, wait) {
  var timeout;
  return function executedFunction() {
    var later = function() {
      clearTimeout(timeout);
      func();
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


// ===== DOM UTILITIES =====
/**
 * Safe element query with null checking
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 */
function safeQuery(selector, context) {
  context = context || document;
  var el = context.querySelector(selector);
  return el || null;
}

/**
 * Safe query all with array operations
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 */
function safeQueryAll(selector, context) {
  context = context || document;
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Add event listeners to multiple elements
 * @param {string} selector - CSS selector for elements
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {Function} handler - Event handler function
 */
function addListeners(selector, eventType, handler) {
  document.querySelectorAll(selector).forEach(function(el) {
    el.addEventListener(eventType, handler);
  });
}


// ===== ATTRIBUTE HELPERS =====
/**
 * Get data attribute with default value
 * @param {Element} el - Element
 * @param {string} attr - Data attribute name (without 'data-' prefix)
 * @param {*} defaultValue - Default value if not found
 */
function getData(el, attr, defaultValue) {
  return el.dataset[attr] !== undefined ? el.dataset[attr] : defaultValue;
}

/**
 * Set multiple data attributes
 * @param {Element} el - Element
 * @param {Object} data - Object with key-value pairs
 */
function setData(el, data) {
  Object.keys(data).forEach(function(key) {
    el.dataset[key] = data[key];
  });
}
