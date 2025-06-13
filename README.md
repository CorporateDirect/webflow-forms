# Webflow Field Enhancer

**🚀 Advanced form field behaviors for Webflow that go beyond native functionality**

Enhance your Webflow forms with intelligent features like Google Places autocomplete, dynamic phone formatting, country dropdowns, input validation, conditional fields, and more. Works seamlessly alongside Webflow's core functionality and any form submission service.

[![npm version](https://badge.fury.io/js/webflow-forms.svg)](https://www.npmjs.com/package/webflow-forms)
[![jsDelivr hits](https://data.jsdelivr.com/v1/package/gh/chrisbrummer/webflow-forms/badge)](https://www.jsdelivr.com/package/gh/chrisbrummer/webflow-forms)

## ✨ Key Features

- 🌍 **Google Places Autocomplete** - Global address search with auto-population
- 📱 **Smart Phone Formatting** - Country-aware phone number formatting with auto-injection
- 🏳️ **Country Dropdowns** - Searchable dropdowns with 245+ countries
- ✅ **Advanced Validation** - Custom regex patterns with real-time feedback
- 🔗 **Conditional Fields** - Show/hide fields based on user input
- 📊 **Character Counters** - Live character count with visual indicators
- 📏 **Auto-Resize Textareas** - Dynamic height adjustment
- 🎨 **Input Formatting** - Currency, credit cards, and custom patterns
- 🔄 **Field Syncing** - Copy and transform values between fields
- ⚡ **Zero Configuration** - Just add data attributes to your Webflow form fields

## 📦 Installation

### CDN (Recommended)

```html
<!-- Latest stable version -->
<script src="https://cdn.jsdelivr.net/gh/chrisbrummer/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

### NPM

```bash
npm install webflow-forms
```

```javascript
import WebflowFieldEnhancer from 'webflow-forms';
// Auto-initializes on load
```

## 🚀 Quick Start

The library automatically enhances form fields that include specific data attributes. No JavaScript configuration needed!

```html
<!-- Regular Webflow field (unchanged) -->
<input type="email" name="email" required>

<!-- Enhanced with phone formatting -->
<input type="tel" name="phone" data-format="phone-us">

<!-- Enhanced with character counter -->
<textarea name="message" data-character-counter="true" maxlength="500"></textarea>

<!-- Enhanced with Google Places autocomplete -->
<input type="text" name="address" data-google-places="true" data-populate-fields="true">
```

## 📋 Complete Data Attributes Reference

### 🔍 Quick Reference by Category

| Category | Primary Attributes | Usage |
|----------|-------------------|-------|
| **🌍 Google Places** | `data-google-places`, `data-populate-fields` | Address autocomplete & field population |
| **🏳️ Country Dropdowns** | `data-country-code`, `data-country-searchable` | International country selection |
| **📱 Phone Formatting** | `data-phone-format`, `data-format="phone-us"` | Smart phone number formatting |
| **📊 Character Counters** | `data-character-counter`, `data-counter-format` | Live character counting |
| **🔗 Conditional Fields** | `data-shows-field`, `data-trigger-value` | Show/hide fields dynamically |
| **✅ Custom Validation** | `data-custom-validation`, `data-validate-on-input` | Advanced form validation |
| **🔄 Field Syncing** | `data-field-sync`, `data-sync-type` | Copy values between fields |
| **📏 Auto-Resize** | `data-auto-resize`, `data-min-height` | Dynamic textarea sizing |

### Core Enhancement Attributes

| Attribute | Element | Values | Description |
|-----------|---------|--------|-------------|
| `data-webflow-fields-disable` | Form/Field | `"true"` | Disables all enhancements |

### 🎨 Input Formatting

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-format` | Input | `"phone-us"`, `"currency"`, `"credit-card"` | Format input as user types | `<input data-format="phone-us">` |
| `data-input-mask` | Input | Mask pattern | Apply custom input masking | `data-input-mask="(000) 000-0000"` |

### 📊 Character Counters

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-character-counter` | Textarea | `"true"` | Show live character count | `<textarea data-character-counter="true">` |
| `data-counter-format` | Textarea | String template | Custom counter display | `data-counter-format="{current}/{max} chars"` |
| `data-counter-position` | Textarea | `"before"`, `"after"` | Counter position | `data-counter-position="before"` |
| `data-max-length` | Textarea | Number | Alternative to maxlength attribute | `data-max-length="500"` |

### 📏 Auto-Resize Textareas

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-auto-resize` | Textarea | `"true"` | Auto-resize height based on content | `<textarea data-auto-resize="true">` |
| `data-min-height` | Textarea | Number (px) | Minimum height constraint | `data-min-height="100"` |
| `data-max-height` | Textarea | Number (px) | Maximum height constraint | `data-max-height="300"` |

### 🔗 Conditional Fields

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-shows-field` | Any Field | CSS selector | Show target field when condition met | `data-shows-field="#details"` |
| `data-hides-field` | Any Field | CSS selector | Hide target field when condition met | `data-hides-field="#optional"` |
| `data-trigger-value` | Any Field | String | Specific value that triggers action | `data-trigger-value="yes"` |
| `data-trigger-values` | Any Field | Comma-separated | Multiple trigger values | `data-trigger-values="option1,option2"` |

### ✅ Advanced Validation

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-custom-validation` | Input/Textarea | Regex pattern | Custom validation rule | `data-custom-validation="^[A-Z][a-z]+$"` |
| `data-validation-message` | Input/Textarea | String | Custom error message | `data-validation-message="Invalid format"` |
| `data-validate-on-input` | Input/Textarea | `"true"` | Real-time validation | `data-validate-on-input="true"` |

### 🔄 Field Syncing

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-field-sync` | Input/Textarea | CSS selector | Target field to sync with | `data-field-sync="#target"` |
| `data-sync-type` | Input/Textarea | `"copy"`, `"uppercase"`, `"lowercase"` | How to transform value | `data-sync-type="uppercase"` |

### 🌍 Country Dropdowns

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-country-code` | Select | `"true"` | Populate with 245+ countries | `<select data-country-code="true">` |
| `data-country-format` | Select | `"name-code"`, `"name"`, `"code"`, `"flag-name"`, `"flag-code"` | Display format | `data-country-format="name"` |
| `data-country-value` | Select | `"code"`, `"name"`, `"full"` | Value to store when selected | `data-country-value="name"` |
| `data-country-sort-by` | Select | `"name"`, `"code"` | Sort order | `data-country-sort-by="name"` |
| `data-country-searchable` | Select | `"true"`, `"false"` | Enable search functionality | `data-country-searchable="false"` |

### 📱 Dynamic Phone Formatting

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-phone-format` | Input | `""` (empty) | Enable country-aware phone formatting | `<input data-phone-format="">` |
| `data-phone-country-field` | Input | CSS selector | Specify country field to watch | `data-phone-country-field="#country"` |
| `data-phone-update-placeholder` | Input | `"true"`, `"false"` | Update placeholder with format | `data-phone-update-placeholder="false"` |
| `data-phone-type` | Input | `"mobile"`, `"fixed_line"`, `"toll_free"` | Phone number type | `data-phone-type="mobile"` |

### 🎯 Google Places Autocomplete

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-google-places` | Input | `"true"` | Enable Google Places autocomplete | `<input data-google-places="true">` |
| `data-populate-fields` | Input | `"true"` | Auto-populate other form fields | `data-populate-fields="true"` |
| `data-places-types` | Input | Comma-separated | Restrict place types | `data-places-types="address,establishment"` |
| `data-places-countries` | Input | Comma-separated codes | Restrict to countries | `data-places-countries="US,CA,GB"` |

### 📍 Address Component Mapping

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-address-component` | Input/Select | Component type(s) | Map to address component | `data-address-component="locality"` |
| `data-use-full-name` | Input/Select | `"true"`, `"false"` | Use full names vs abbreviations | `data-use-full-name="true"` |
| `data-state-name` | Select | `"true"` | Mark as state/province field | `<select data-state-name="true">` |
| `data-postal-code` | Input | `"true"` | Mark as postal code field | `<input data-postal-code="true">` |
| `data-auto-populate` | Input/Select | `"false"` | Prevent auto-population (internal) | Used internally by library |
| `data-auto-populated` | Input/Select | `"true"` | Mark field as auto-populated (internal) | Added automatically by library |

### 🔧 Advanced Options

| Attribute | Element | Values | Description | Example |
|-----------|---------|--------|-------------|---------|
| `data-auto-complete` | Input | Custom type | Enhanced autocomplete behavior | `data-auto-complete="company-names"` |

## 🌍 Google Places Integration

**The most powerful address input solution** - leverage Google's global address database for accurate, fast address entry.

### Prerequisites

1. **Google Maps API Key** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable Places API** in your project
3. **Include Google Maps JavaScript API**:

```html
<!-- Add BEFORE webflow-forms script -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
<script src="https://cdn.jsdelivr.net/gh/chrisbrummer/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

### Basic Implementation

```html
<!-- Address search field -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       placeholder="Start typing your address...">

<!-- Auto-populated fields (all editable as text inputs) -->
<input type="text" name="city" data-address-component="locality">
<input type="text" name="state" data-address-component="administrative_area_level_1">
<input type="text" name="country" data-address-component="country">
<input type="text" name="postal-code" data-address-component="postal_code">
```

### 🛡️ Built-in Failsafes

**All address fields are always directly editable:**
- ✅ **Click & Type**: Users can click any field and type directly to override
- ✅ **Manual Override Protection**: Won't overwrite user input once manually edited
- ✅ **API Failure Recovery**: Works 100% normally even if Google Places fails
- ✅ **Visual Feedback**: Auto-populated fields get blue styling, manually edited get green
- ✅ **No Dropdowns**: All fields are simple text inputs for maximum flexibility

### Address Component Types

| Component | Description | Example Output |
|-----------|-------------|----------------|
| `street_number,route` | Full street address | "123 Main Street" |
| `locality` | City | "Los Angeles" |
| `administrative_area_level_1` | State/Province | "CA" or "California" |
| `country` | Country | "US" or "United States" |
| `postal_code` | Postal/ZIP code | "90210" |
| `subpremise` | Apartment/Suite | "Apt 4B" |

### Advanced Configuration

```html
<!-- Restrict to specific countries and types -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       data-places-countries="US,CA,GB"
       data-places-types="address"
       placeholder="US, Canada, or UK addresses only">

<!-- Use full names instead of abbreviations -->
<input type="text" name="state" 
       data-address-component="administrative_area_level_1"
       data-use-full-name="true">
<!-- Shows "California" instead of "CA" -->
```

## 🏳️ Country Dropdowns

Auto-populate select fields with **245+ countries** powered by libphonenumber data.

```html
<!-- Searchable country dropdown (default) -->
<select name="country" data-country-code="true">
  <option value="">Select Country</option>
</select>
<!-- Creates: United States (+1), United Kingdom (+44), etc. -->

<!-- Different display formats -->
<select data-country-code="true" data-country-format="name">
  <!-- Shows: United States -->
</select>

<select data-country-code="true" data-country-format="code">
  <!-- Shows: +1 -->
</select>

<!-- Disable search functionality -->
<select data-country-code="true" data-country-searchable="false">
  <!-- Standard dropdown -->
</select>
```

## 📱 Smart Phone Formatting

**Country-aware phone formatting with automatic country code injection** - replaces static formatting with intelligent, international formatting.

```html
<!-- Country selector -->
<select name="country" data-country-code="true">
  <option value="">Select Country</option>
</select>

<!-- Phone field with country code injection -->
<input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
```

**How it works:**
1. 🌍 User selects country (e.g., United States (+1))
2. 📱 Phone field auto-injects country code: `+1` 
3. ⌨️ User types their number: `5551234567`
4. 🎯 Formats in real-time: `+1 (555) 123-4567`
5. 🔄 Switching countries updates format automatically

**Supports 240+ countries** with accurate formatting:
- **US/Canada**: `+1 (555) 123-4567`
- **UK**: `+44 7911 123456`
- **France**: `+33 6 12 34 56 78`
- **Germany**: `+49 30 12345678`
- **Japan**: `+81 90-1234-5678`
- And many more!

## 🔗 Conditional Fields

Show or hide form sections based on user input:

```html
<!-- Trigger field -->
<select data-shows-field="#project-details" data-trigger-value="project">
  <option value="">Select inquiry type</option>
  <option value="project">New Project</option>
  <option value="support">Support</option>
</select>

<!-- Hidden section (shows when "project" is selected) -->
<div id="project-details" style="display: none;">
  <label>Project Description</label>
  <textarea name="project-description"></textarea>
</div>

<!-- Multiple trigger values -->
<select data-shows-field="#advanced-options" data-trigger-values="advanced,expert">
  <option value="basic">Basic</option>
  <option value="advanced">Advanced</option>
  <option value="expert">Expert</option>
</select>
```

## ✅ Custom Validation

Extend Webflow's basic validation with custom patterns:

```html
<!-- Custom regex validation -->
<input type="text" 
       data-custom-validation="^[A-Z][a-z]+$"
       data-validation-message="Must start with capital letter"
       placeholder="First Name">

<!-- Real-time validation -->
<input type="text" 
       data-custom-validation="^\d{4}$"
       data-validate-on-input="true"
       data-validation-message="Must be 4 digits"
       placeholder="PIN">
```

## 📊 Character Counters

Add live character counting to textareas:

```html
<!-- Basic counter -->
<textarea data-character-counter="true" maxlength="500"></textarea>

<!-- Custom format and positioning -->
<textarea data-character-counter="true" 
          data-counter-format="Words: {current}/{max}"
          data-counter-position="before"
          maxlength="500"></textarea>
```

## 🎨 Input Formatting

Format inputs as users type:

```html
<!-- US Phone -->
<input type="tel" data-format="phone-us" placeholder="(555) 123-4567">

<!-- Currency -->
<input type="text" data-format="currency" placeholder="$0.00">

<!-- Credit Card -->
<input type="text" data-format="credit-card" placeholder="1234 5678 9012 3456">
```

## 🔄 Field Syncing

Copy and transform values between fields:

```html
<!-- Source field -->
<input type="text" name="username" 
       data-field-sync="#display-name" 
       data-sync-type="uppercase"
       placeholder="Enter username">

<!-- Target field (auto-populated) -->
<input type="text" id="display-name" readonly>
```

## 📏 Auto-Resize Textareas

Dynamically adjust textarea height:

```html
<!-- Basic auto-resize -->
<textarea data-auto-resize="true"></textarea>

<!-- With constraints -->
<textarea data-auto-resize="true" 
          data-min-height="100" 
          data-max-height="300"></textarea>
```

## 🎯 Common Use Cases

### Complete Contact Form with Address

```html
<form>
  <!-- Name fields -->
  <input type="text" name="first-name" placeholder="First Name" required>
  <input type="text" name="last-name" placeholder="Last Name" required>
  
  <!-- Address with Google Places -->
  <input type="text" name="address" 
         data-google-places="true" 
         data-populate-fields="true"
         placeholder="Start typing your address..." required>
  
  <!-- Auto-populated address fields -->
  <input type="text" name="city" data-address-component="locality" required>
  <input type="text" name="state" data-address-component="administrative_area_level_1" required>
  <input type="text" name="country" data-address-component="country" required>
  <input type="text" name="postal-code" data-address-component="postal_code" required>
  
  <!-- Phone with country formatting -->
  <input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
  
  <!-- Message with counter -->
  <textarea name="message" 
            data-character-counter="true" 
            data-auto-resize="true"
            maxlength="1000"
            placeholder="Your message"></textarea>
            
  <button type="submit">Send Message</button>
</form>
```

### Project Inquiry Form with Conditional Fields

```html
<form>
  <!-- Project type selector -->
  <select name="project-type" data-shows-field="#project-details" data-trigger-value="custom">
    <option value="">Select project type</option>
    <option value="template">Template Customization</option>
    <option value="custom">Custom Development</option>
  </select>
  
  <!-- Conditional project details -->
  <div id="project-details" style="display: none;">
    <input type="text" name="budget" data-format="currency" placeholder="Budget">
    <textarea name="requirements" 
              data-character-counter="true"
              maxlength="2000"></textarea>
  </div>
  
  <!-- Contact info -->
  <input type="email" name="email" required>
  <input type="tel" name="phone" data-format="phone-us">
</form>
```

## 🎨 Styling Enhanced Fields

The library adds CSS classes for styling:

```css
/* Auto-populated fields */
.wf-auto-populated {
  background-color: #f0f8ff;
  border-color: #007bff;
}

/* User-edited fields */
.wf-user-edited {
  border-color: #28a745;
  background-color: #f8fff9;
}

/* Character counter */
.wf-character-counter {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

/* Counter warnings */
.wf-counter-warning { color: #ffc107; }
.wf-counter-danger { color: #dc3545; }

/* Country dropdown */
.wf-country-dropdown {
  position: relative;
}

.wf-country-search {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
}

.wf-country-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}
```

## 🔧 JavaScript API

Access the library programmatically:

```javascript
// Access the main object
const enhancer = window.WebflowFieldEnhancer;

// Manually enhance new fields
enhancer.enhanceSpecificField(document.getElementById('new-field'));

// Refresh all enhancements
enhancer.refresh();
```

### 📡 Available Events

Listen for library events to integrate with your application:

```javascript
// Google Places events
document.addEventListener('webflowField:placeSelected', (e) => {
  console.log('Address selected:', e.detail.formattedAddress);
  console.log('Place details:', e.detail.place);
});

document.addEventListener('webflowField:addressFieldsPopulated', (e) => {
  console.log('Fields populated:', e.detail.populatedFields);
  console.log('Address components:', e.detail.addressComponents);
});

document.addEventListener('webflowField:googlePlacesSetup', (e) => {
  console.log('Google Places initialized on field:', e.detail.field);
});

// Field enhancement events
document.addEventListener('webflowField:fieldEnhanced', (e) => {
  console.log('Field enhanced:', e.detail.field, 'Type:', e.detail.type);
});

document.addEventListener('webflowField:countryChanged', (e) => {
  console.log('Country changed to:', e.detail.country);
  console.log('Country code:', e.detail.countryCode);
});

document.addEventListener('webflowField:phoneFormatted', (e) => {
  console.log('Phone formatted:', e.detail.formattedNumber);
  console.log('Original:', e.detail.originalNumber);
});
```

## 🐛 Troubleshooting

### Google Places Not Working

1. **Check API Key**: Ensure your Google Maps API key is valid
2. **Enable Places API**: Verify Places API is enabled in Google Cloud Console
3. **Check Console**: Look for error messages in browser developer tools
4. **Fallback**: All fields remain functional as text inputs if API fails

### Phone Formatting Issues

1. **Country Selection**: Ensure country field has `data-country-code="true"`
2. **Phone Field**: Verify phone field has `data-phone-format=""`
3. **libphonenumber**: Library handles 240+ countries automatically

### Fields Not Enhancing

1. **Data Attributes**: Check spelling of data attributes
2. **Script Loading**: Ensure library loads after DOM is ready
3. **Form Structure**: Fields should be within a `<form>` element
4. **Console Errors**: Check browser console for JavaScript errors

## 📈 Performance

- **Bundle Size**: ~187KB minified (includes libphonenumber)
- **Dependencies**: Self-contained (no external dependencies except Google Maps for Places)
- **Initialization**: Automatic on DOM ready
- **Memory**: Efficient event handling with cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/chrisbrummer/webflow-forms)
- **Issues**: [Report Issues](https://github.com/chrisbrummer/webflow-forms/issues)
- **CDN**: [jsDelivr](https://www.jsdelivr.com/package/gh/chrisbrummer/webflow-forms)
- **NPM**: [Package](https://www.npmjs.com/package/webflow-forms)

---

**Made with ❤️ for the Webflow community** 