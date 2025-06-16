# Webflow Forms Library

**🚀 Enhanced form field behaviors for Webflow with Google Places integration and smart phone formatting**

A lightweight JavaScript library that enhances Webflow forms with intelligent address autocomplete, country-aware phone formatting, and international country dropdowns. Works seamlessly with any form submission service.

[![jsDelivr hits](https://data.jsdelivr.com/v1/package/gh/corporatedirect/webflow-forms/badge)](https://www.jsdelivr.com/package/gh/corporatedirect/webflow-forms)

## ✨ Key Features

- 🌍 **Google Places Autocomplete** - Global address search with auto-population
- 📱 **Smart Phone Formatting** - Country-aware phone number formatting (240+ countries)
- 🏳️ **Country Dropdowns** - Searchable dropdowns with 245+ countries and flags
- 🔄 **Phone Country Sync** - Auto-sync phone country when address country is selected
- ⚡ **Zero Configuration** - Just add data attributes to your Webflow form fields

## 📦 Installation

### CDN (Recommended)

```html
<!-- Add Google Maps API (required for Places functionality) -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

<!-- Add Webflow Forms Library -->
<script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@c4ee30b/dist/webflow-forms.min.js"></script>
```

## 🚀 Quick Start

The library automatically enhances form fields that include specific data attributes. No JavaScript configuration needed!

```html
<!-- Address field with Google Places autocomplete -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       placeholder="Start typing your address...">

<!-- Auto-populated address fields -->
<input type="text" name="city" data-address-component="locality">
<input type="text" name="state" data-address-component="administrative_area_level_1" data-use-full-name="true">
<input type="text" name="country" data-address-component="country" data-use-full-name="true">
<input type="text" name="postal-code" data-address-component="postal_code">

<!-- Country dropdown with phone sync -->
<select name="country-code" data-country-code="true">
  <option value="">Select Country</option>
</select>

<!-- Phone field with country-aware formatting -->
<input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
```

## 🌍 Google Places Integration

**The most powerful address input solution** - leverage Google's global address database for accurate, fast address entry.

### Prerequisites

1. **Google Maps API Key** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable Places API** in your project
3. **Include Google Maps JavaScript API** (see installation above)

### Basic Implementation

```html
<!-- Primary address search field -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       placeholder="Start typing your address...">

<!-- Auto-populated fields (all remain editable) -->
<input type="text" name="city" data-address-component="locality">
<input type="text" name="state" data-address-component="administrative_area_level_1">
<input type="text" name="country" data-address-component="country">
<input type="text" name="postal-code" data-address-component="postal_code">
```

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
<!-- Use full names instead of abbreviations -->
<input type="text" name="state" 
       data-address-component="administrative_area_level_1"
       data-use-full-name="true">
<!-- Shows "California" instead of "CA" -->

<input type="text" name="country" 
       data-address-component="country"
       data-use-full-name="true">
<!-- Shows "United States" instead of "US" -->

<!-- Restrict to specific countries and types -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       data-places-countries="US,CA,GB"
       data-places-types="address"
       placeholder="US, Canada, or UK addresses only">
```

### 🛡️ Built-in Failsafes

- ✅ **Click & Type**: Users can click any field and type directly to override
- ✅ **Manual Override Protection**: Won't overwrite user input once manually edited
- ✅ **API Failure Recovery**: Works 100% normally even if Google Places fails
- ✅ **Visual Feedback**: Auto-populated fields get blue styling, manually edited get green

## 🏳️ Country Dropdowns

Auto-populate select fields with **245+ countries** powered by libphonenumber data.

```html
<!-- Searchable country dropdown (default) -->
<select name="country" data-country-code="true">
  <option value="">Select Country</option>
</select>
<!-- Creates: 🇺🇸 United States (+1), 🇬🇧 United Kingdom (+44), etc. -->

<!-- Different display formats -->
<select data-country-code="true" data-country-format="name">
  <!-- Shows: United States -->
</select>

<select data-country-code="true" data-country-format="code">
  <!-- Shows: +1 -->
</select>

<select data-country-code="true" data-country-format="flag-name-code">
  <!-- Shows: 🇺🇸 United States (+1) -->
</select>

<!-- Disable search functionality -->
<select data-country-code="true" data-country-searchable="false">
  <!-- Standard dropdown -->
</select>
```

### Country Dropdown Options

| Attribute | Values | Description | Example |
|-----------|--------|-------------|---------|
| `data-country-format` | `"name"`, `"code"`, `"flag-code"`, `"name-code"`, `"flag-name-code"` | Display format | `data-country-format="name"` |
| `data-country-value` | `"code"`, `"name"`, `"full"` | Value to store when selected | `data-country-value="name"` |
| `data-country-searchable` | `"true"`, `"false"` | Enable search functionality | `data-country-searchable="false"` |

## 📱 Smart Phone Formatting

**Country-aware phone formatting with automatic phone country sync** - intelligent, international formatting that adapts to the selected country.

```html
<!-- Country selector (for address or phone) -->
<select name="country" data-country-code="true">
  <option value="">Select Country</option>
</select>

<!-- Phone field with country-aware formatting -->
<input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
```

### How It Works

1. 🌍 User selects country (e.g., United States (+1))
2. 📱 Phone field automatically updates formatting rules
3. ⌨️ User types their number: `5551234567`
4. 🎯 Formats in real-time: `+1 (555) 123-4567`
5. 🔄 Switching countries updates format automatically
6. 🚀 **Auto-sync**: When address country is populated via Google Places, phone country syncs automatically

### Supported Formats (240+ countries)

- **US/Canada**: `+1 (555) 123-4567`
- **UK**: `+44 7911 123456`
- **France**: `+33 6 12 34 56 78`
- **Germany**: `+49 30 12345678`
- **Japan**: `+81 90-1234-5678`
- **Australia**: `+61 4 1234 5678`
- And many more!

### Phone Formatting Options

| Attribute | Values | Description | Example |
|-----------|--------|-------------|---------|
| `data-phone-format` | `""` (empty) | Enable country-aware phone formatting | `<input data-phone-format="">` |
| `data-phone-type` | `"mobile"`, `"fixed_line"`, `"toll_free"` | Phone number type | `data-phone-type="mobile"` |

## 🔗 Address-Phone Integration

**Automatic phone country sync** - When Google Places populates a country field, the phone country dropdown automatically syncs.

```html
<!-- Address with Google Places -->
<input type="text" name="address" 
       data-google-places="true" 
       data-populate-fields="true">

<!-- Auto-populated country field -->
<input type="text" name="country" 
       data-address-component="country" 
       data-use-full-name="true">

<!-- Phone country dropdown (auto-syncs when address country is populated) -->
<select name="phone-country" data-country-code="true">
  <option value="">Select Country</option>
</select>

<!-- Phone field (auto-formats based on selected country) -->
<input type="tel" name="phone" data-phone-format="">
```

## 📋 Complete Data Attributes Reference

### Google Places Autocomplete

| Attribute | Element | Values | Description |
|-----------|---------|--------|-------------|
| `data-google-places` | Input | `"true"` | Enable Google Places autocomplete |
| `data-populate-fields` | Input | `"true"` | Auto-populate other form fields |
| `data-places-types` | Input | Comma-separated | Restrict place types |
| `data-places-countries` | Input | Comma-separated codes | Restrict to countries |

### Address Component Mapping

| Attribute | Element | Values | Description |
|-----------|---------|--------|-------------|
| `data-address-component` | Input/Select | Component type(s) | Map to address component |
| `data-use-full-name` | Input/Select | `"true"`, `"false"` | Use full names vs abbreviations |

### Country Dropdowns

| Attribute | Element | Values | Description |
|-----------|---------|--------|-------------|
| `data-country-code` | Select | `"true"` | Populate with countries |
| `data-country-format` | Select | Display format | How countries are shown |
| `data-country-value` | Select | Value type | What value is stored |
| `data-country-searchable` | Select | `"true"`, `"false"` | Enable search |

### Phone Formatting

| Attribute | Element | Values | Description |
|-----------|---------|--------|-------------|
| `data-phone-format` | Input | `""` (empty) | Enable phone formatting |
| `data-phone-type` | Input | Phone type | Type of phone number |

## 🎯 Complete Working Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Contact Form</title>
    <style>
        .wf-auto-populated { background-color: #f0f8ff; border-color: #007bff; }
        .wf-user-edited { border-color: #28a745; background-color: #f8fff9; }
    </style>
</head>
<body>
    <form data-name="contact-form">
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
        <input type="text" name="state" data-address-component="administrative_area_level_1" data-use-full-name="true" required>
        <input type="text" name="country" data-address-component="country" data-use-full-name="true" required>
        <input type="text" name="postal-code" data-address-component="postal_code" required>
        
        <!-- Phone country dropdown (auto-syncs with address country) -->
        <select name="phone-country" data-country-code="true">
            <option value="">Select Country</option>
        </select>
        
        <!-- Phone with country formatting -->
        <input type="tel" name="phone" data-phone-format="" placeholder="Phone Number">
        
        <!-- Email -->
        <input type="email" name="email" placeholder="Email Address" required>
        
        <button type="submit">Send Message</button>
    </form>

    <!-- Required Scripts -->
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
    <script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@c4ee30b/dist/webflow-forms.min.js"></script>
</body>
</html>
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

/* Country dropdown containers */
[data-country-select-container] {
    position: relative;
}

/* Searchable country input */
[data-country-search="true"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
}

/* Country dropdown options */
[data-country-dropdown="true"] {
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

## 🐛 Troubleshooting

### Google Places Not Working

1. **Check API Key**: Ensure your Google Maps API key is valid
2. **Enable Places API**: Verify Places API is enabled in Google Cloud Console
3. **Check Console**: Look for error messages in browser developer tools
4. **Fallback**: All fields remain functional as text inputs if API fails

### Phone Formatting Issues

1. **Country Selection**: Ensure country field has `data-country-code="true"`
2. **Phone Field**: Verify phone field has `data-phone-format=""`
3. **Auto-Sync**: For address-phone sync, ensure address country field has `data-address-component="country"` and `data-use-full-name="true"`

### Phone Country Not Auto-Syncing

1. **Address Field**: Ensure address field has both `data-google-places="true"` and `data-populate-fields="true"`
2. **Country Field**: Country field must have `data-address-component="country"` and `data-use-full-name="true"`
3. **Phone Country Dropdown**: Must have `data-country-code="true"`
4. **Field Names**: Library automatically detects related fields in the same form

## 📈 Performance

- **Bundle Size**: ~202KB minified (includes libphonenumber)
- **Dependencies**: Self-contained (no external dependencies except Google Maps for Places)
- **Initialization**: Automatic on DOM ready
- **Browser Support**: Modern browsers (ES6+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/CorporateDirect/webflow-forms)
- **Issues**: [Report Issues](https://github.com/CorporateDirect/webflow-forms/issues)
- **CDN**: [jsDelivr](https://www.jsdelivr.com/package/gh/corporatedirect/webflow-forms)

---

**Made with ❤️ for the Webflow community** 