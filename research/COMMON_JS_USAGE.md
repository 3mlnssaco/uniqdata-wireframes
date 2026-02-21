# common.js Usage Guide

## Overview
`common.js` provides shared JavaScript utilities used across wireframe HTML files. This guide shows how each utility is used.

## Modal Management

### openModal(id)
Opens a modal dialog by ID.

**Usage in create-step3.html:**
```html
<button class="report-btn" onclick="openModal('passive-modal')">
  <span class="icon">🤖</span> AI 추천 근거
</button>

<div class="modal-overlay" id="passive-modal">
  <div class="modal"><!-- content --></div>
</div>
```

```javascript
// Automatically provided by common.js
function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('show');
  }
}
```

### closeModal(id)
Closes a modal dialog by ID.

**Usage:**
```html
<button class="modal-close" onclick="closeModal('passive-modal')">✕</button>
```

### Escape Key Handler
Automatically closes all open modals when Escape is pressed (from common.js).

---

## Designer Notes Panel Cycling

### createNotesCycler(panelIds)
Returns a `toggleNotes()` function that cycles through designer notes panels.

**Usage in create-step3.html:**
```javascript
// Page-specific initialization
var toggleNotes = createNotesCycler(['designer-note', 'func-spec', 'backend-spec']);
```

**HTML:**
```html
<button class="toggle-notes" onclick="toggleNotes()">📋 디자이너 노트</button>

<!-- Multiple note panels that cycle through -->
<div class="designer-notes" id="designer-note">...</div>
<div class="designer-notes" id="func-spec">...</div>
<div class="designer-notes" id="backend-spec">...</div>
```

**How it works:**
1. First click: Shows first panel ('designer-note')
2. Second click: Shows second panel ('func-spec')
3. Third click: Shows third panel ('backend-spec')
4. Fourth click: Hides all panels
5. Pattern repeats...

---

## Tab/Method Switching

### selectMethod(section, el, options)
Generic tab/method selector. Removes 'active' class from all and adds to clicked.

**Usage in create-step5.html (Payment method selection):**
```html
<!-- Tab buttons -->
<div class="pay-method-section">
  <div class="pay-method-card" onclick="selectPayMethod('standard', this)" data-method="xrp">
    XRP로 결제
  </div>
  <div class="pay-method-card" onclick="selectPayMethod('standard', this)" data-method="card">
    카드로 결제
  </div>
</div>
```

```javascript
// Page-specific: Payment method handler
function selectPayMethod(section, el) {
  var parent = el.closest('.card-body');
  parent.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  // ... update button text, show/hide details
}
```

---

## Toggle/Switch Handlers

### toggleVisibility(elementId)
Toggle show/hide (display: block/none) for an element.

**Usage pattern:**
```javascript
toggleVisibility('designer-notes-panel'); // Toggle visibility
```

### initSectionToggle(headerSelector)
Setup expand/collapse for sidebar items.

**Usage in data-table.html:**
```html
<div class="research-nav-item collapsed">
  <div class="research-nav-header">📁 My Research</div>
  <!-- Content that expands/collapses -->
</div>
```

```javascript
// Initialization
initSectionToggle('.research-nav-header');
```

**Result:**
- Click header → adds 'expanded' class, removes 'collapsed'
- Click again → adds 'collapsed' class, removes 'expanded'

---

## Selection Groups

### initRadioGroup(groupSelector, activeClass, onSelect)
Handle single-selection (radio button like) groups.

**Usage pattern:**
```javascript
initRadioGroup('.irb-type-card', 'selected', function(element) {
  console.log('Selected:', element.dataset.type);
  // Update UI based on selection
});
```

### initToggleGroup(itemSelector, activeClass, onToggle)
Handle multi-selection (checkbox like) groups.

**Usage in create-step3.html (data items):**
```html
<div class="data-item" data-group="passive" data-id="cgm">
  <div class="check"></div>
  <!-- Item content -->
</div>
```

```javascript
// Page-specific: Custom update logic on toggle
items.forEach(function(item) {
  item.addEventListener('click', function(e) {
    setSelected(item, !item.classList.contains('selected'));
    updateSummary(); // Custom callback
  });
});
```

---

## Detail Panel Management

### toggleDetail(splitId, open)
Open/close detail panels in split views.

**Usage in data-table.html:**
```javascript
function openIndDetail() {
  var split = document.getElementById('individualSplit');
  if (split) split.classList.add('detail-open');
}

function closeIndDetail() {
  var split = document.getElementById('individualSplit');
  if (split) split.classList.remove('detail-open');
}
```

**HTML Structure:**
```html
<div id="individualSplit" class="split-view">
  <div class="main-panel"><!-- Main content --></div>
  <div class="detail-panel"><!-- Detail content --></div>
</div>
```

**CSS (already in files):**
```css
.split-view { /* Two columns side by side */ }
.split-view.detail-open { /* Expands detail panel */ }
```

### clearSelection(containerSelector)
Remove 'selected' class from all elements in container.

**Usage pattern:**
```javascript
clearSelection('#groupView .data-table'); // Clear selections
```

---

## Utility Functions

### formatNumber(num, format)
Format numbers with thousands separator.

**Usage:**
```javascript
formatNumber(1000000, 'ko'); // Returns: "1,000,000"
```

### copyToClipboard(text, element)
Copy text with visual feedback.

**Usage pattern:**
```javascript
<button onclick="copyToClipboard('Some text to copy', this)">
  Copy
</button>
```

### debounce(func, wait)
Debounce function calls (useful for search, resize events).

**Usage pattern:**
```javascript
var debouncedSearch = debounce(function() {
  // Expensive operation
}, 300);

input.addEventListener('keyup', debouncedSearch);
```

### safeQuery(selector, context)
Safe DOM query with null checking.

**Usage:**
```javascript
var element = safeQuery('.my-element');
if (element) {
  element.textContent = 'Hello';
}
```

### addListeners(selector, eventType, handler)
Batch add event listeners.

**Usage pattern:**
```javascript
addListeners('.btn-item', 'click', function() {
  console.log('Clicked:', this);
});
```

### getData(el, attr, defaultValue)
Safe data attribute access.

**Usage:**
```javascript
var method = getData(element, 'method', 'default');
// Equivalent to: element.dataset.method || 'default'
```

### setData(el, data)
Batch set data attributes.

**Usage:**
```javascript
setData(element, {
  'method': 'xrp',
  'amount': '1000'
});
// Sets: data-method="xrp", data-amount="1000"
```

---

## Integration Pattern

Each HTML file should:

1. **Include common.js reference:**
   ```html
   <script src="js/common.js"></script>
   ```

2. **Use common utilities for shared patterns:**
   ```javascript
   // Modal handling is automatic
   // Escape key closes modals (automatic)
   // toggleNotes cycles through panels
   ```

3. **Keep page-specific logic inline:**
   ```javascript
   // Data item toggle (Step 3 specific)
   var items = document.querySelectorAll('.data-item');
   items.forEach(function(item) {
     item.addEventListener('click', function() {
       setSelected(item, !item.classList.contains('selected'));
       updateSummary(); // Custom Step 3 logic
     });
   });
   ```

---

## Files Using common.js

| File | Used Utilities |
|------|---|
| create-step3.html | openModal, closeModal, Escape handler, createNotesCycler |
| create-step4.html | selectMethod (custom), common.js reference for future use |
| create-step5.html | openModal, closeModal, Escape handler, selectPayMethod, selectIRBType, createNotesCycler |
| create-step6.html | updateEscrowBtn (custom), createNotesCycler |
| data-table.html | openDetail, closeDetail (custom), all DOM utilities |

---

## Best Practices

1. **Use common.js functions for new features** - Reduces code duplication
2. **Keep page-specific logic inline** - Domain logic is easier to understand in context
3. **Add comments to custom functions** - Explain why they can't be generalized
4. **Update common.js when pattern repeats** - Extract to common after 3+ uses
5. **Test with real page interactions** - Ensure modal cycles, toggles, and selections work properly

---

**Last Updated:** 2026-02-14
