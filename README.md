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
<script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@27cc5c4/dist/webflow-forms.min.js"></script>
```

**Note:** If the above URL doesn't work immediately, jsDelivr may need time to sync. You can also use:
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
| `data-country-code` | Select | `"true"` | Populates select with country options | `<select data-country-code="true">` |
| `data-country-format` | Select | `"name-code"`, `"name"`, `"code"` | How to display countries in options | `data-country-format="name"` |
| `data-country-value` | Select | `"code"`, `"name"`, `"full"` | What value to store when selected | `data-country-value="name"` |
| `data-country-sort-by` | Select | `"name"`, `"code"` | How to sort country list | `data-country-sort-by="name"` |
| `data-country-searchable` | Select | `"true"`, `"false"` | Enable/disable search functionality (default: true) | `data-country-searchable="false"` |
| `data-phone-format` | Input | `""` (empty) | Enable dynamic phone formatting based on country selection | `data-phone-format=""` |
| `data-phone-country-field` | Input | CSS selector | Specify which country field to listen to (optional) | `data-phone-country-field="#country-select"` |
| `data-phone-update-placeholder` | Input | `"true"`, `"false"` | Update placeholder with country format (default: true) | `data-phone-update-placeholder="false"` |
| `data-phone-type` | Input | `"mobile"`, `"fixed_line"`, `"toll_free"`, `"premium_rate"` | Phone number type for formatting (default: mobile) | `data-phone-type="fixed_line"` |
| `data-google-places` | Input | `"true"` | Enable Google Places Autocomplete | `<input data-google-places="true">` |
| `data-populate-fields` | Input | `"true"` | Auto-populate other form fields from selected address | `data-populate-fields="true"` |
| `data-address-component` | Input/Select | Google component type(s) | Map field to specific address component | `data-address-component="locality"` |
| `data-places-types` | Input | Comma-separated types | Restrict autocomplete to specific place types | `data-places-types="address,establishment"` |
| `data-places-countries` | Input | Comma-separated country codes | Restrict autocomplete to specific countries | `data-places-countries="US,CA,GB"` |
| `data-use-full-name` | Input/Select | `"true"`, `"false"` | Use full names instead of abbreviations (default: false) | `data-use-full-name="true"` |
| `data-postal-code` | Input | `"true"` | Enable postal code detection (fallback method) | `<input data-postal-code="true">` |
| `data-state-name` | Select | `"true"` | Mark field as state/province field for population | `<select data-state-name="true">` |

### Common Combinations

| Use Case | Combination | Example |
|----------|-------------|---------|
| **Dynamic Phone Formatting** | `data-country-code` + `data-phone-format` | `<select data-country-code="true">` + `<input data-phone-format="">` |
| **Static Phone Formatting** | `data-format="phone-us"` | `<input type="tel" name="phone" data-format="phone-us">` |
| **Smart Textarea** | `data-auto-resize` + `data-character-counter` | `<textarea data-auto-resize="true" data-character-counter="true" maxlength="500">` |
| **Conditional Field** | `data-shows-field` + `data-trigger-value` | `<select data-shows-field="#details" data-trigger-value="yes">` |
| **Real-time Validation** | `data-custom-validation` + `data-validate-on-input` | `<input data-custom-validation="^\d{4}$" data-validate-on-input="true">` |
| **Field Syncing** | `data-field-sync` + `data-sync-type` | `<input data-field-sync="#display" data-sync-type="uppercase">` |
| **Advanced Counter** | `data-character-counter` + `data-counter-format` | `<textarea data-character-counter="true" data-counter-format="Words: {current}/{max}">` |
| **Searchable Country Select** | `data-country-code` + `data-country-format` | `<select data-country-code="true" data-country-format="flag-name">` |

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

### Country Code Selects

Automatically populate select fields with **all 245 countries** supported by libphonenumber, each with proper country names and dialing codes. **By default, creates a searchable dropdown** where users can type to filter countries.

**Complete Country Coverage:**
- ✅ **245 countries mapped** with proper names (no ISO codes like "EH" or "DZ")
- 🇺🇸 **United States prioritized** - always appears first in the list
- 🌍 **Format: "Country Name (+Code)"** - e.g., "United States (+1)", "United Kingdom (+44)"
- 🔍 **Searchable by default** - users can type to filter countries
- 📱 **Mobile-friendly** with keyboard navigation

```html
<!-- Basic searchable country select (shows: United States (+1), United Kingdom (+44), etc.) -->
<select name="country" data-country-code="true">
  <option value="" disabled>Select Country</option>
</select>
<!-- Creates searchable input where users can type "United" or "+44" to filter -->
```

#### **Search Functionality (Default)**
- ✨ **Type to filter**: Users can type country names or codes to narrow options
- ⌨️ **Keyboard navigation**: Arrow keys to navigate, Enter to select, Escape to close
- 🎯 **Smart matching**: Searches both country names and dialing codes
- ♿ **Accessible**: Maintains form submission compatibility and screen reader support

#### **Configuration Options**

```html
<!-- Disable search functionality (standard dropdown) -->
<select data-country-code="true" data-country-searchable="false">
  <option value="" disabled>Select Country</option>
</select>

<!-- Custom display format -->
<select data-country-code="true" data-country-format="name">
  <!-- Shows: United States -->
</select>

<select data-country-code="true" data-country-format="code">
  <!-- Shows: +1 -->
</select>

<!-- Store country name instead of code -->
<select data-country-code="true" data-country-value="name">
  <!-- Value will be "United States" instead of "+1" -->
</select>

<!-- Sort by country code instead of name (US still appears first) -->
<select data-country-code="true" data-country-sort-by="code">
  <!-- Countries sorted by dialing code -->
</select>
```

**Available Formats:**
- `name-code` (default): United States (+1)
- `name`: United States
- `code`: +1

**Value Options:**
- `code` (default): Stores the dialing code (+1)
- `name`: Stores the country name (United States)
- `full`: Stores both (United States (+1))

### Dynamic Phone Formatting

Automatically format phone numbers based on the selected country code. **Replaces the old `data-format="phone-us"` with intelligent, country-aware formatting.**

```html
<!-- Country selector (searchable by default) -->
<select name="country" data-country-code="true">
  <option value="" disabled>Select Country</option>
</select>

<!-- Phone input with dynamic formatting -->
<input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
```

**How it works:**
1. 🌍 User selects a country (e.g., US (+1))
2. 📱 Phone field automatically updates placeholder to `(555) 123-4567`
3. ⌨️ As user types `5551234567`, it formats to `(555) 123-4567`
4. 🔄 If user changes country to GB (+44), formatting switches to `07911 123456`

**Comprehensive Country Support:**
Powered by Google's **libphonenumber** library, supporting **240+ countries** with accurate, up-to-date formatting rules:

- **US/Canada (+1)**: `(555) 123-4567`
- **UK (+44)**: `07911 123456`
- **France (+33)**: `06 12 34 56 78`
- **Germany (+49)**: `030 12345678`
- **Japan (+81)**: `090-1234-5678`
- **China (+86)**: `138 0013 8000`
- **India (+91)**: `98765 43210`
- **Brazil (+55)**: `(11) 99999-9999`
- **Australia (+61)**: `0412 345 678`
- **Russia (+7)**: `8 912 345-67-89`
- **...and 230+ more countries!**

✨ **Automatic Updates**: Phone formats stay current with international standards  
🎯 **Smart Formatting**: Handles mobile, landline, and special number formats  
🌍 **Global Coverage**: Every country with a dialing code is supported  
🚀 **Zero Maintenance**: No static data to update - everything comes from libphonenumber

```html
<!-- Advanced configuration -->
<input type="tel" 
       name="phone" 
       data-phone-format=""
       data-phone-country-field="#specific-country-select"
       data-phone-update-placeholder="false">
```

### Google Places Autocomplete

**🎯 The most powerful address input solution** - leverages Google's global address database for accurate, fast address entry with automatic field population.

**Why Google Places is Superior:**
- ✅ **Familiar UX**: Users recognize Google's autocomplete interface
- ✅ **Global coverage**: Accurate data for addresses worldwide  
- ✅ **Instant validation**: Only real addresses can be selected
- ✅ **Complete data**: Gets street, city, state, postal code, country in one interaction
- ✅ **Mobile optimized**: Works perfectly on mobile devices
- ✅ **Auto-population**: Fills multiple form fields automatically

#### **Basic Setup**

**Prerequisites:**
1. **Google API Key**: Get one from [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable Places API**: In your Google Cloud project
3. **Include Google Maps JavaScript API**:

```html
<!-- Add BEFORE your Webflow Field Enhancer script -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
<script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

#### **Implementation Examples**

**Single Address Field (Simplest):**
```html
<!-- User types address, gets autocomplete suggestions -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       placeholder="Start typing your address...">

<!-- These fields get auto-populated when user selects an address -->
<input type="text" name="street" data-address-component="street_number,route">
<input type="text" name="city" data-address-component="locality">
<select name="state" data-address-component="administrative_area_level_1" data-state-name="true">
  <option value="">Select State</option>
</select>
<input type="text" name="postal-code" data-address-component="postal_code">
<select name="country" data-address-component="country" data-country-code="true">
  <option value="">Select Country</option>
</select>
```

**Component-Based Fields (More Control):**
```html
<!-- Address search field -->
<input type="text" name="address-search" 
       data-google-places="true" 
       data-populate-fields="true"
       placeholder="Search for your address">

<!-- Individual address components (populated automatically) -->
<label>Street Address</label>
<input type="text" name="street" data-address-component="street_number,route" readonly>

<label>City</label>
<input type="text" name="city" data-address-component="locality" readonly>

<label>State/Province</label>
<select name="state" data-address-component="administrative_area_level_1" data-state-name="true">
  <option value="">Select State</option>
</select>

<label>Postal Code</label>
<input type="text" name="postal-code" data-address-component="postal_code" readonly>

<label>Country</label>
<select name="country" data-address-component="country" data-country-code="true">
  <option value="">Select Country</option>
</select>
```

**Advanced Configuration:**
```html
<!-- Restrict to specific countries and address types -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       data-places-countries="US,CA,GB"
       data-places-types="address"
       placeholder="Enter US, Canada, or UK address">

<!-- Use full state names instead of abbreviations -->
<select name="state" 
        data-address-component="administrative_area_level_1" 
        data-state-name="true"
        data-use-full-name="true">
  <!-- Will show "California" instead of "CA" -->
</select>
```

#### **Address Component Mapping**

| Component Type | Description | Example |
|----------------|-------------|---------|
| `street_number` | Street number | "123" |
| `route` | Street name | "Main Street" |
| `street_number,route` | Full street address | "123 Main Street" |
| `locality` | City | "Los Angeles" |
| `administrative_area_level_1` | State/Province | "CA" or "California" |
| `administrative_area_level_2` | County | "Los Angeles County" |
| `country` | Country | "US" or "United States" |
| `postal_code` | Postal/ZIP code | "90210" |
| `postal_code_suffix` | ZIP+4 extension | "1234" |
| `subpremise` | Apartment/Suite | "Apt 4B" |
| `premise` | Building number | "Building A" |

#### **User Experience Flow**

```
User types: "123 Main St, Los Ang..."
    ↓
Google suggests: "123 Main Street, Los Angeles, CA 90210, USA"
    ↓
User clicks suggestion
    ↓
✨ Auto-populate all fields:
   - Street: "123 Main Street"
   - City: "Los Angeles"
   - State: "CA" (or "California" if data-use-full-name="true")
   - Postal: "90210"
   - Country: "US" (matches existing country dropdown)
```

#### **Integration with Existing Features**

**Works seamlessly with:**
- ✅ **Country Code Dropdowns**: Auto-selects matching country
- ✅ **State Fields**: Auto-populates or creates state options
- ✅ **Phone Formatting**: Country selection triggers phone format updates
- ✅ **Form Validation**: Webflow's native validation still works
- ✅ **Custom Events**: Listen for address selection events

**Combined Example:**
```html
<!-- Address autocomplete -->
<input type="text" name="address" data-google-places="true" data-populate-fields="true">

<!-- Auto-populated country (triggers phone formatting) -->
<select name="country" data-country-code="true" data-address-component="country">
  <option value="">Select Country</option>
</select>

<!-- Phone field with dynamic formatting based on selected country -->
<input type="tel" name="phone" data-phone-format="" data-phone-type="mobile">

<!-- Auto-populated state -->
<select name="state" data-state-name="true" data-address-component="administrative_area_level_1">
  <option value="">Select State</option>
</select>
```

#### **Customization Options**

**Restrict Place Types:**
```html
<!-- Only addresses (no businesses) -->
<input data-google-places="true" data-places-types="address">

<!-- Only establishments (businesses) -->
<input data-google-places="true" data-places-types="establishment">

<!-- Multiple types -->
<input data-google-places="true" data-places-types="address,establishment">
```

**Restrict Countries:**
```html
<!-- US and Canada only -->
<input data-google-places="true" data-places-countries="US,CA">

<!-- European countries -->
<input data-google-places="true" data-places-countries="GB,FR,DE,IT,ES">
```

**Display Preferences:**
```html
<!-- Use full state names -->
<select data-address-component="administrative_area_level_1" data-use-full-name="true">
<!-- Shows "California" instead of "CA" -->

<!-- Use abbreviations (default) -->
<select data-address-component="administrative_area_level_1">
<!-- Shows "CA" -->
```

#### **Custom Events**

Listen to Google Places events:

```javascript
// Address selected
document.addEventListener('webflowField:placeSelected', (e) => {
    console.log('Address selected:', e.detail.formattedAddress);
    console.log('Address components:', e.detail.addressComponents);
});

// Fields populated
document.addEventListener('webflowField:addressFieldsPopulated', (e) => {
    console.log('Populated', e.detail.populatedFields, 'fields');
});

// Google Places setup complete
document.addEventListener('webflowField:googlePlacesSetup', (e) => {
    console.log('Google Places ready with options:', e.detail.options);
});
```

#### **Error Handling & Fallbacks**

**Graceful degradation:**
- ✅ **No Google API**: Fields work as normal text inputs
- ✅ **API key issues**: Console warning, manual entry still works
- ✅ **No internet**: Falls back to manual address entry
- ✅ **Unsupported browsers**: Progressive enhancement

**API Key Management:**
```html
<!-- Development -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_DEV_API_KEY&libraries=places"></script>

<!-- Production (restrict by domain) -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_PROD_API_KEY&libraries=places"></script>
```

#### **Cost Considerations**

**Google Places API Pricing (2024):**
- **Autocomplete**: $2.83 per 1,000 requests
- **Free tier**: $200/month credit (≈70,000 autocomplete requests)
- **Typical usage**: Most Webflow sites stay within free tier

**Cost optimization:**
- ✅ **Restrict by country**: Reduces irrelevant suggestions
- ✅ **Restrict by type**: Limits to addresses only
- ✅ **Session tokens**: Reduce costs for multiple requests (handled automatically)

This provides the most user-friendly, accurate address input experience possible! 🎯

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

/* Country select components */
.wf-country-select-container {
    position: relative;
    width: 100%;
}

.wf-country-search {
    /* Inherits styling from original select field */
}

.wf-country-dropdown {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wf-country-option {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}

.wf-country-option:hover,
.wf-country-option.highlighted {
    background-color: #f5f5f5;
}
```

## Complete Example

```html
<form data-name="Enhanced Contact Form">
  
  <!-- Standard Webflow field (no enhancement) -->
  <input type="text" name="name" required>
  
  <!-- Country selector with search -->
  <select name="country" data-country-code="true">
    <option value="" disabled>Select Country</option>
  </select>
  
  <!-- Dynamic phone formatting based on country -->
  <input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
  
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

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.1.0 (Latest)

**🌍 Complete Country Coverage Update**
- ✅ **All 245 countries mapped** with proper names (no more ISO codes like "EH" or "DZ")
- 🇺🇸 **United States prioritized** - always appears first in country lists
- 🌍 **Consistent format**: All countries display as "Country Name (+Code)"
- 📝 **Examples**: "United States (+1)", "United Kingdom (+44)", "Western Sahara (+212)"

**🔧 Enhanced Country Code Features**
- 🔍 **Searchable by default** - users can type to filter countries
- ⌨️ **Keyboard navigation** - arrow keys, enter, escape support
- 📱 **Mobile-friendly** interface
- ♿ **Accessibility** maintained for screen readers

**📚 Documentation Updates**
- 📖 **Comprehensive data attributes reference** with all 17+ attributes
- 🎯 **Clear examples** for every feature
- 🔗 **Common combinations** guide
- 🎨 **CSS styling** reference

**🚀 Technical Improvements**
- 📦 **158KB built file** with libphonenumber integration
- 🌐 **240+ countries** with accurate phone formatting
- 🔄 **Dynamic phone formatting** based on country selection
- ⚡ **Zero maintenance** - auto-updates with libphonenumber

### Previous Versions
- **v1.0.x**: Initial release with basic field enhancements
- **v0.x**: Development versions 