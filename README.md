# Webflow Field Enhancer

**Advanced field behaviors for Webflow forms that go beyond Webflow's default functionality.**

Enhances form fields with functionality that Webflow doesn't provide natively, while working seamlessly alongside Webflow's core form features and Formly for submission handling.

## What This Library Does vs. What Webflow/Formly Handle

### ✅ **This Library Handles (Beyond Webflow Defaults):**
- 🎨 **Input Formatting** - Phone numbers, currency, credit cards
- 📊 **Character Counters** - Live character count with warnings
- 📏 **Auto-Resize Textareas** - Dynamic height based on content
- 🔗 **Conditional Fields** - Show/hide fields based on other field values
- 🎯 **Custom Validation** - Advanced regex patterns beyond basic validation
- 🔄 **Field Syncing** - Copy/transform values between fields
- ⚡ **Enhanced Interactions** - Typing indicators, custom focus states
- 🎭 **Input Masking** - Format input as user types

### 🌐 **Webflow Handles (Native Functionality):**
- Required field validation
- Basic email/URL validation
- Form styling and states
- Basic focus/blur interactions
- Field labels and structure

### 🚀 **Formly Handles:**
- Form submission
- Data processing
- Success/error states
- Integrations (email, CRM, etc.)

## Installation

### Via JSDelivr CDN

```html
<script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

### Via NPM

```bash
npm install webflow-forms
```

## Usage

The library only enhances fields that have specific data attributes. Fields without enhancement attributes are left to Webflow's native functionality.

```html
<!-- This field uses only Webflow's native functionality -->
<input type="email" name="email" required>

<!-- This field gets enhanced with formatting -->
<input type="tel" name="phone" data-format="phone-us">

<!-- This field gets enhanced with character counter -->
<textarea name="message" data-character-counter="true" maxlength="500"></textarea>
```

## Complete Data Attributes Reference

### All Available Data Attributes

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-webflow-fields-disable` | Form or Field | `"true"` | Disables all enhancements for form/field | `<form data-webflow-fields-disable="true">` |
| `data-format` | Input | `"phone-us"`, `"currency"`, `"credit-card"` | Formats input as user types | `<input data-format="phone-us">` |
| `data-character-counter` | Textarea | `"true"` | Shows live character count | `<textarea data-character-counter="true">` |
| `data-counter-format` | Textarea | Custom string | Custom counter display format | `data-counter-format="{current}/{max} chars"` |
| `data-counter-position` | Textarea | `"before"`, `"after"` | Position of character counter | `data-counter-position="before"` |
| `data-auto-resize` | Textarea | `"true"` | Auto-resize height based on content | `<textarea data-auto-resize="true">` |
| `data-min-height` | Textarea | Number (px) | Minimum height for auto-resize | `data-min-height="100"` |
| `data-max-height` | Textarea | Number (px) | Maximum height for auto-resize | `data-max-height="300"` |
| `data-shows-field` | Any Field | CSS selector | Shows target field when condition met | `data-shows-field="#hidden-section"` |
| `data-hides-field` | Any Field | CSS selector | Hides target field when condition met | `data-hides-field="#optional-field"` |
| `data-trigger-value` | Any Field | String | Specific value that triggers show/hide | `data-trigger-value="yes"` |
| `data-trigger-values` | Any Field | Comma-separated | Multiple values that trigger show/hide | `data-trigger-values="option1,option2"` |
| `data-custom-validation` | Input/Textarea | Regex pattern | Custom validation beyond Webflow defaults | `data-custom-validation="^[A-Z][a-z]+$"` |
| `data-validation-message` | Input/Textarea | String | Custom validation error message | `data-validation-message="Invalid format"` |
| `data-validate-on-input` | Input/Textarea | `"true"` | Validate in real-time as user types | `data-validate-on-input="true"` |
| `data-field-sync` | Input/Textarea | CSS selector | Sync value to another field | `data-field-sync="#target-field"` |
| `data-sync-type` | Input/Textarea | `"copy"`, `"uppercase"`, `"lowercase"` | How to transform synced value | `data-sync-type="uppercase"` |
| `data-input-mask` | Input | Mask pattern | Apply input masking (extensible) | `data-input-mask="(000) 000-0000"` |
| `data-auto-complete` | Input | Custom type | Enhanced autocomplete behavior | `data-auto-complete="company-names"` |

### Common Combinations

| Use Case | Combination | Example |
|----------|-------------|---------|
| **Phone Input with Formatting** | `data-format="phone-us"` | `<input type="tel" name="phone" data-format="phone-us">` |
| **Smart Textarea** | `data-auto-resize` + `data-character-counter` | `<textarea data-auto-resize="true" data-character-counter="true" maxlength="500">` |
| **Conditional Field** | `data-shows-field` + `data-trigger-value` | `<select data-shows-field="#details" data-trigger-value="yes">` |
| **Real-time Validation** | `data-custom-validation` + `data-validate-on-input` | `<input data-custom-validation="^\d{4}$" data-validate-on-input="true">` |
| **Field Syncing** | `data-field-sync` + `data-sync-type` | `<input data-field-sync="#display" data-sync-type="uppercase">` |
| **Advanced Counter** | `data-character-counter` + `data-counter-format` | `<textarea data-character-counter="true" data-counter-format="Words: {current}/{max}">` |

## Data Attributes for Enhanced Behaviors

### Input Formatting (Beyond Webflow)

```html
<!-- US Phone number formatting: (555) 123-4567 -->
<input type="tel" data-format="phone-us">

<!-- Currency formatting: $123.45 -->
<input type="text" data-format="currency">

<!-- Credit card formatting: 1234 5678 9012 3456 -->
<input type="text" data-format="credit-card">
```

### Character Counters

```html
<!-- Basic character counter -->
<textarea data-character-counter="true" maxlength="500"></textarea>

<!-- Custom counter format -->
<textarea data-character-counter="true" 
          data-counter-format="{current}/{max} characters"
          maxlength="500"></textarea>

<!-- Counter positioning -->
<textarea data-character-counter="true" 
          data-counter-position="before"
          maxlength="500"></textarea>
```

### Auto-Resize Textareas

```html
<!-- Basic auto-resize -->
<textarea data-auto-resize="true"></textarea>

<!-- With min/max height constraints -->
<textarea data-auto-resize="true" 
          data-min-height="100" 
          data-max-height="300"></textarea>
```

### Conditional Fields

```html
<!-- Show field when specific value is selected -->
<select data-shows-field="#project-details" data-trigger-value="project">
  <option value="">Select type</option>
  <option value="project">New Project</option>
  <option value="support">Support</option>
</select>

<div id="project-details" style="display: none;">
  <textarea name="project-description"></textarea>
</div>

<!-- Multiple trigger values -->
<select data-shows-field="#advanced-options" data-trigger-values="advanced,expert">
  <option value="basic">Basic</option>
  <option value="advanced">Advanced</option>
  <option value="expert">Expert</option>
</select>

<!-- Hide field when condition is met -->
<input type="checkbox" data-hides-field="#optional-section" value="hide">
```

### Custom Validation (Beyond Webflow's Basic Validation)

```html
<!-- Custom regex validation -->
<input type="text" 
       data-custom-validation="^[A-Z][a-z]+$"
       data-validation-message="Must start with capital letter">

<!-- Validate on input (real-time) -->
<input type="text" 
       data-custom-validation="^\d{4}$"
       data-validate-on-input="true"
       data-validation-message="Must be 4 digits">
```

### Field Syncing

```html
<!-- Copy value to another field -->
<input type="text" name="company" data-field-sync="#company-confirm">
<input type="text" id="company-confirm" readonly>

<!-- Transform value while syncing -->
<input type="text" name="username" 
       data-field-sync="#display-name" 
       data-sync-type="uppercase">
<input type="text" id="display-name" readonly>
```

### Disable Enhancement

```html
<!-- Disable all enhancements for this form -->
<form data-webflow-fields-disable="true">

<!-- Disable enhancement for specific field -->
<input type="text" data-webflow-fields-disable="true">
```

## CSS Classes for Styling

```css
/* Field is enhanced by the library */
.wf-field-enhanced {
    /* Your enhanced field styles */
}

/* Field has focus (beyond Webflow's default) */
.wf-field-focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* User is actively typing */
.wf-field-typing {
    border-color: #10b981;
}

/* Character counter */
.wf-character-counter {
    font-size: 12px;
    color: #666;
    text-align: right;
    margin-top: 4px;
}

.wf-counter-warning {
    color: #f59e0b;
}

.wf-counter-danger {
    color: #ef4444;
}
```

## Complete Example

```html
<form data-name="Enhanced Contact Form">
  
  <!-- Standard Webflow field (no enhancement) -->
  <input type="text" name="name" required>
  
  <!-- Enhanced phone formatting -->
  <input type="tel" name="phone" data-format="phone-us">
  
  <!-- Service type with conditional field -->
  <select name="service" data-shows-field="#project-budget" data-trigger-value="web-design">
    <option value="">Select Service</option>
    <option value="web-design">Web Design</option>
    <option value="consulting">Consulting</option>
  </select>
  
  <!-- Conditional field (hidden by default) -->
  <div id="project-budget" style="display: none;">
    <input type="text" name="budget" data-format="currency" placeholder="Project Budget">
  </div>
  
  <!-- Auto-resize textarea with character counter -->
  <textarea name="message" 
            data-auto-resize="true"
            data-character-counter="true"
            data-counter-format="Characters: {current}/{max}"
            maxlength="1000"
            placeholder="Tell us about your project..."></textarea>
  
  <!-- Company name that syncs to display name -->
  <input type="text" name="company" 
         data-field-sync="#display-company" 
         data-sync-type="uppercase">
         
  <input type="text" id="display-company" 
         placeholder="Company name will appear here" readonly>
  
  <!-- Webflow + Formly handle submission -->
  <input type="submit" value="Send Message">
</form>
```

## Custom Events

Listen to enhancement events:

```javascript
// Input formatting events
document.addEventListener('webflowField:formatted', (e) => {
    console.log('Field formatted:', e.detail.format);
});

// Character counter events
document.addEventListener('webflowField:characterCount', (e) => {
    console.log('Character count:', e.detail.current, '/', e.detail.max);
});

// Conditional field events
document.addEventListener('webflowField:conditionalChange', (e) => {
    console.log('Field visibility changed:', e.detail.visible);
});

// Auto-resize events
document.addEventListener('webflowField:resized', (e) => {
    console.log('Textarea resized to:', e.detail.height, 'px');
});
```

## API Methods

```javascript
// Refresh enhancements (useful after adding fields dynamically)
WebflowFieldEnhancer.refresh();

// Enhance a specific field
WebflowFieldEnhancer.enhanceSpecificField(document.getElementById('my-field'));
```

## Perfect Integration Stack

1. **Webflow** - Form structure, basic validation, styling
2. **This Library** - Advanced field behaviors and interactions  
3. **Formly** - Form submission, data processing, integrations

Each handles what it does best, with no conflicts or overlap!

## Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)
- IE11+ 