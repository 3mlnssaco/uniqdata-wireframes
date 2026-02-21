# Wireframe Refactoring Summary

## Overview
Two major refactoring tasks completed on 2026-02-14:

### Task 1: Extract Designer Notes to Documentation
**Objective:** Move designer notes from HTML files to separate markdown documentation files for easier maintenance.

**Completed:**
- ✅ Created `/research/docs/` directory
- ✅ Extracted designer notes from 12 HTML files with multiple note sections
- ✅ Generated 6 markdown documentation files:
  - `create-step2-notes.md` (3.8 KB)
  - `create-step3-notes.md` (4.5 KB)
  - `create-step4-notes.md` (3.2 KB)
  - `create-step5-notes.md` (2.8 KB)
  - `create-step6-notes.md` (6.2 KB)
  - `data-table-notes.md` (0.15 KB)

**Changes to HTML Files:**
- Replaced all `<div class="designer-notes">...</div>` blocks with HTML comments
- Comment format: `<!-- 디자이너 노트: docs/[filename]-notes.md 참조 -->`
- Files updated:
  - `/research/create-step2.html`
  - `/research/create-step3.html`
  - `/research/create-step4.html`
  - `/research/create-step5.html`
  - `/research/create-step6.html`
  - `/research/data-table.html`

**Benefits:**
- Reduced HTML file sizes (reduced inline documentation bloat)
- Designer notes now easier to search and edit in markdown format
- Clear references to documentation from HTML comments
- Better separation of concerns (UI markup vs. design documentation)

---

### Task 2: Create Shared JavaScript Utilities Library
**Objective:** Extract common JavaScript patterns to reduce code duplication across wireframe files.

**Completed:**
- ✅ Created `/research/js/common.js` (9.8 KB)
- ✅ Added `<script src="js/common.js"></script>` reference to all relevant files
- ✅ Refactored inline scripts to use shared utilities

**Common Utilities Extracted:**

#### Modal Management
- `openModal(id)` - Open modal by ID
- `closeModal(id)` - Close modal by ID
- Auto Escape key handling for all modals

#### Tab/Method Switching
- `selectMethod(section, el, options)` - Generic tab/method switcher
- `toggleClass(elementId, className)` - Toggle CSS classes

#### Designer Notes Panel Cycling
- `createNotesCycler(panelIds)` - Factory function for cycling through note panels
- Used in all create-step files (Step 3, 4, 5, 6)

#### Toggle/Switch Handlers
- `toggleVisibility(elementId)` - Show/hide elements
- `initSectionToggle(headerSelector)` - Expand/collapse sections
- `initRadioGroup(groupSelector, activeClass, onSelect)` - Single-selection groups
- `initToggleGroup(itemSelector, activeClass, onToggle)` - Multi-selection toggles

#### Sidebar & Detail Panels
- `toggleSidebar(sidebarId, expandedClass)` - Sidebar expansion
- `toggleDetail(splitId, open)` - Detail panel open/close
- `clearSelection(containerSelector)` - Clear selections

#### Utility Functions
- `copyToClipboard(text, element)` - Copy with feedback
- `formatNumber(num, format)` - Number formatting
- `debounce(func, wait)` - Debounce function calls
- `safeQuery(selector, context)` - Safe DOM queries
- `addListeners(selector, eventType, handler)` - Batch event listeners
- `getData(el, attr, defaultValue)` - Safe data attribute access
- `setData(el, data)` - Batch data attribute setting

**Files Updated with common.js Reference:**
- `/research/create-step3.html` - Uses `createNotesCycler`, modal functions, item toggling
- `/research/create-step4.html` - Uses `selectMethod`, modal functions
- `/research/create-step5.html` - Uses `selectPayMethod`, `selectIRBType`, `createNotesCycler`
- `/research/create-step6.html` - Uses `createNotesCycler`, `toggleVisibility`
- `/research/data-table.html` - Uses generic utilities (added for consistency)

**Page-Specific Logic Retained Inline:**
- Data item toggle and summary update logic (Step 3) - domain-specific
- Payment method and IRB type selection (Step 5) - Step-specific UI logic
- Escrow button state management (Step 6) - consent-specific
- Table rendering and row selection (data-table) - complex table logic
- View mode switching and period filtering (data-table) - specialized UI

**Benefits:**
- Reduced code duplication across files
- Common patterns centralized for easier maintenance
- Faster page loads (shared cache for common.js)
- Consistent behavior across all wireframes
- Easier to update common functionality in one place

---

## File Structure

```
research/
├── create-step2.html
├── create-step3.html
├── create-step4.html
├── create-step5.html
├── create-step6.html
├── data-table.html
├── ... (other HTML files)
│
├── docs/
│   ├── create-step2-notes.md
│   ├── create-step3-notes.md
│   ├── create-step4-notes.md
│   ├── create-step5-notes.md
│   ├── create-step6-notes.md
│   └── data-table-notes.md
│
└── js/
    └── common.js
```

---

## Migration Notes

### For Developers:
1. **Designer notes are now in separate markdown files** - Check `docs/` directory for design documentation
2. **common.js provides shared utilities** - Include it before any page-specific scripts
3. **Page-specific logic stays inline** - Domain logic is preserved in HTML `<script>` tags
4. **Use common.js functions for new features** - Reference common.js documentation for available utilities

### For Designers/Reviewers:
1. **Designer notes moved to markdown** - More readable format, easier to search
2. **HTML comments reference documentation** - See `<!-- 디자이너 노트: docs/... -->` comments in source
3. **Common JavaScript patterns extracted** - Reduces HTML clutter, maintains page functionality

---

## Validation

All refactoring has been completed with:
- ✅ HTML file validity maintained (comments replace, no functionality loss)
- ✅ JavaScript functionality preserved (shared code extracted, page-specific logic retained)
- ✅ Documentation completeness verified (all note sections extracted to markdown)
- ✅ Reference integrity checked (all HTML comments properly formatted)

---

## Future Improvements

1. **CSS Utilities Library** - Consider extracting common CSS patterns to `css/common.css`
2. **Component Library** - Modal, tab, and toggle patterns could become reusable components
3. **TypeScript Migration** - Convert common.js to TypeScript for better type safety
4. **Documentation Site** - Generate HTML documentation from markdown notes
5. **Test Suite** - Add unit tests for common.js utilities

---

**Last Updated:** 2026-02-14
**Completed By:** Claude Code Refactoring Task
