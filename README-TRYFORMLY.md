# Webflow Forms + tryformly.com Compatible Multi-Step System

This branch contains a **complete replacement for tryformly.com** that maintains 100% compatibility with their data attributes while integrating seamlessly with your existing webflow-forms field enhancements.

## 🎯 What's New in This Branch

### ✅ **Complete tryformly.com Replacement**
- Exact same data attributes (`data-go-to`, `data-answer`, `data-skip`, etc.)
- Same JavaScript API (`window.Formly`)
- Drop-in replacement - no frontend changes needed

### ✅ **Single File Distribution** 
- **`dist/webflow-forms-complete.js`** - Everything in one file
- Field enhancements + multi-step forms + tryformly compatibility
- No additional dependencies

### ✅ **Advanced Skip Functionality**
- Radio buttons with `data-skip` attributes
- Buttons and inline links with skip logic
- Conditional step skipping with `data-skip-if`
- Branching logic with `data-go-to` and `data-answer`

### ✅ **Webflow Optimized**
- Inactive steps properly hidden (`display: none`)
- Smooth transition effects
- Works with Webflow's form submission
- Maintains all existing styling

## 📁 Branch File Structure

```
├── dist/
│   └── webflow-forms-complete.js      # ← Single file with everything
├── src/
│   └── tryformly-compatible.js        # Multi-step form system
├── examples/
│   └── multi-step-form-example.html   # Complete working example
├── MULTISTEP_FORM_GUIDE.md           # Comprehensive documentation
└── README-TRYFORMLY.md               # This file
```

## 🚀 Quick Start

### 1. Include the Library
```html
<script src="dist/webflow-forms-complete.js"></script>
```

### 2. Use tryformly.com Data Attributes
```html
<form data-multi-step>
    <div data-step="1">
        <!-- Radio with skip logic -->
        <input type="radio" data-skip="3" name="type" value="individual">
        
        <!-- Radio with branching -->
        <input type="radio" data-go-to="2" data-answer="business" name="type" value="business">
        
        <!-- Skip link -->
        <a href="#" data-skip="4">Skip this section</a>
        
        <button data-next>Next</button>
    </div>
    
    <div data-step="2" data-skip-if="type=individual">
        <!-- This step skips if user selected "individual" -->
        <button data-prev>Previous</button>
        <button data-next>Continue</button>
    </div>
    
    <div data-step="3">
        <button data-prev>Previous</button>
        <button data-submit>Submit</button>
    </div>
</form>
```

### 3. Use Familiar API
```javascript
// Same API as tryformly.com
const currentStep = window.Formly.getCurrentStep(form);
const formData = window.Formly.getFormData(form);

// Navigate manually
window.Formly.goToStepManual(form, 2);
```

## 📋 Key Data Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-multi-step` | Mark form as multi-step | `<form data-multi-step>` |
| `data-step="1"` | Define step number | `<div data-step="1">` |
| `data-next` | Next step button | `<button data-next>` |
| `data-prev` | Previous step button | `<button data-prev>` |
| `data-submit` | Submit form button | `<button data-submit>` |
| `data-skip="3"` | Skip to step 3 | `<button data-skip="3">` |
| `data-go-to="2"` | Go to step 2 if condition met | `<input data-go-to="2" data-answer="yes">` |
| `data-answer="yes"` | Required value for go-to | Combined with `data-go-to` |
| `data-skip-if="field=value"` | Skip step if condition met | `<div data-skip-if="user-type=individual">` |

## 🎮 JavaScript Events

```javascript
// Listen for step changes
document.addEventListener('stepChange', (e) => {
    console.log('Current step:', e.detail.currentStep);
    console.log('Form data:', e.detail.formData);
});

// Listen for form submission
document.addEventListener('multiStepSubmit', (e) => {
    console.log('Submitted data:', e.detail.formData);
});
```

## 🔧 Examples

### Radio Button Skip Logic
```html
<!-- Skip to step 4 if "Individual" selected -->
<input type="radio" name="account-type" value="individual" data-skip="4">

<!-- Go to step 2 if "Business" selected -->
<input type="radio" name="account-type" value="business" data-go-to="2" data-answer="business">
```

### Conditional Step Skipping
```html
<!-- This entire step will be skipped if user-type equals "individual" -->
<div data-step="3" data-skip-if="user-type=individual">
    <h3>Business Information</h3>
    <!-- Business-only fields -->
</div>
```

### Skip Links and Buttons
```html
<!-- Skip link in content -->
<p>Don't have this info? <a href="#" data-skip="5">Skip to final step</a></p>

<!-- Skip button -->
<button type="button" data-skip="3">Skip Business Setup</button>
```

## 🔄 Migration from tryformly.com

### 1. Replace Script
```html
<!-- OLD -->
<script src="https://cdn.jsdelivr.net/tryformly/tryformly.min.js"></script>

<!-- NEW -->
<script src="dist/webflow-forms-complete.js"></script>
```

### 2. Keep Your HTML
**No changes needed!** All your existing data attributes work identically.

### 3. Update JavaScript (if any)
```javascript
// OLD: tryformly API
tryformly.getCurrentStep(form);

// NEW: Same methods, same API
Formly.getCurrentStep(form);
```

## 🎨 Styling

The system automatically applies CSS classes:

```css
.form-step          /* Base step class */
.step-visible       /* Currently shown step */
.step-hidden        /* Hidden step */
.step-enter         /* Entering animation */
.step-exit          /* Exiting animation */
.field-error        /* Validation error */
.has-goto-logic     /* Field has data-go-to */
.has-skip-logic     /* Field has data-skip */
```

## 🛠️ Development Commands

```bash
# Switch to this branch
git checkout feature/tryformly-compatible

# Switch back to main
git checkout main

# View differences
git diff main feature/tryformly-compatible

# Merge when ready (from main branch)
git merge feature/tryformly-compatible
```

## 📖 Documentation

- **[MULTISTEP_FORM_GUIDE.md](./MULTISTEP_FORM_GUIDE.md)** - Complete documentation
- **[multi-step-form-example.html](./examples/multi-step-form-example.html)** - Working example

## ✨ Why This Branch?

This branch gives you:

1. **Safety** - Test without affecting your main project
2. **Compatibility** - 100% tryformly.com data attribute compatibility  
3. **Integration** - Works with all your existing webflow-forms enhancements
4. **Control** - Full source code, no external dependencies
5. **Performance** - Single file, optimized for Webflow

## 🚀 Ready to Deploy?

When you're satisfied with testing:

1. Merge this branch into main
2. Deploy `dist/webflow-forms-complete.js` to your site
3. Replace tryformly.com script tag
4. Everything works identically but with full control!

---

**This branch maintains your existing project while adding powerful tryformly.com-compatible multi-step functionality. Test freely!** 