# Google Places API Integration Guide

## Overview

The webflow-forms library provides seamless integration with Google Places API for predictive address search and automatic population of address fields including street, city, state, postal code, and country.

## Features

✅ **Address Autocomplete**: Predictive address search as users type  
✅ **Auto-Population**: Automatically fills related address fields  
✅ **Country Integration**: Works with existing country dropdown functionality  
✅ **Flexible Configuration**: Support for various field types and layouts  
✅ **Error Handling**: Graceful fallbacks when API is unavailable  
✅ **Custom Events**: Listen for place selection and field population events  

## Prerequisites

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**
4. Create an **API Key**
5. **Important**: Restrict your API key for production use

### 2. API Key Restriction (Recommended)

For security, restrict your API key:
- **Application restrictions**: HTTP referrers (web sites)
- **Website restrictions**: Add your domains (e.g., `*.yoursite.com/*`)
- **API restrictions**: Select "Places API"

## Implementation

### Step 1: Include Google Maps API

Add this script tag to your HTML `<head>` section:

```html
<script async defer 
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initGooglePlaces">
</script>
```

**Replace `YOUR_API_KEY` with your actual Google Maps API key.**

### Step 2: Include Webflow Forms Library

```html
<script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

### Step 3: Set Up HTML Form Fields

#### Basic Address Search Field

```html
<input type="text" 
       name="address" 
       data-google-places="true" 
       data-populate-fields="true"
       placeholder="Start typing your address...">
```

#### Fields to Auto-Populate

```html
<!-- Street Address -->
<input type="text" 
       name="street" 
       data-address-component="street_number,route">

<!-- City -->
<input type="text" 
       name="city" 
       data-address-component="locality">

<!-- State/Province -->
<input type="text" 
       name="state" 
       data-address-component="administrative_area_level_1">

<!-- Postal Code -->
<input type="text" 
       name="postal-code" 
       data-address-component="postal_code">

<!-- Country -->
<input type="text" 
       name="country" 
       data-address-component="country">
```

### Step 4: Advanced Configuration

#### Country Dropdown Integration

```html
<select name="country" 
        data-country-code="true"
        data-address-component="country">
    <option value="">Select Country...</option>
    <!-- Options will be populated by the library -->
</select>
```

#### State Dropdown Integration

```html
<select name="state" 
        data-state-name="true"
        data-address-component="administrative_area_level_1">
    <option value="">Select State...</option>
</select>
```

## Data Attributes Reference

### Primary Google Places Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-google-places` | ✅ | Enables Google Places autocomplete | `"true"` |
| `data-populate-fields` | ✅ | Auto-populate related fields | `"true"` |
| `data-places-types` | ❌ | Restrict autocomplete types | `"address"` or `"establishment,geocode"` |
| `data-places-countries` | ❌ | Restrict to specific countries | `"us,ca"` (ISO codes) |

### Address Component Mapping

| Attribute | Description | Google Places Component | Example Value |
|-----------|-------------|------------------------|---------------|
| `data-address-component="street_number,route"` | Street address | Street number + route | `"123 Main St"` |
| `data-address-component="locality"` | City | Locality | `"New York"` |
| `data-address-component="administrative_area_level_1"` | State/Province | Admin level 1 | `"NY"` or `"New York"` |
| `data-address-component="postal_code"` | Postal/ZIP code | Postal code | `"10001"` |
| `data-address-component="country"` | Country | Country | `"US"` or `"United States"` |

### Additional Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-use-full-name` | Use full names instead of codes for states/countries | `false` |

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Google Places Integration</title>
    <!-- Google Maps API -->
    <script async defer 
            src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
    </script>
</head>
<body>
    <form>
        <!-- Address Search -->
        <div class="form-group">
            <label>Address</label>
            <input type="text" 
                   name="address" 
                   data-google-places="true" 
                   data-populate-fields="true"
                   data-places-types="address"
                   placeholder="Start typing your address...">
        </div>

        <!-- Auto-populated fields -->
        <div class="form-group">
            <label>Street Address</label>
            <input type="text" 
                   name="street" 
                   data-address-component="street_number,route">
        </div>

        <div class="form-group">
            <label>City</label>
            <input type="text" 
                   name="city" 
                   data-address-component="locality">
        </div>

        <div class="form-group">
            <label>State</label>
            <input type="text" 
                   name="state" 
                   data-address-component="administrative_area_level_1">
        </div>

        <div class="form-group">
            <label>ZIP Code</label>
            <input type="text" 
                   name="postal-code" 
                   data-address-component="postal_code">
        </div>

        <div class="form-group">
            <label>Country</label>
            <select name="country" 
                    data-country-code="true"
                    data-address-component="country">
                <option value="">Select Country...</option>
            </select>
        </div>
    </form>

    <!-- Webflow Forms Library -->
    <script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@latest/dist/webflow-forms.min.js"></script>
</body>
</html>
```

## JavaScript Events

### Listen for Events

```javascript
// Place selected event
document.addEventListener('webflowField:placeSelected', (e) => {
    console.log('Selected place:', e.detail.formattedAddress);
    console.log('Address components:', e.detail.addressComponents);
});

// Fields populated event
document.addEventListener('webflowField:addressFieldsPopulated', (e) => {
    console.log('Populated fields:', e.detail.populatedFields);
    console.log('Address map:', e.detail.addressMap);
});

// Google Places setup event
document.addEventListener('webflowField:googlePlacesSetup', (e) => {
    console.log('Google Places setup complete');
});
```

## Troubleshooting

### Common Issues

#### 1. "Google Places API not loaded" Error

**Problem**: The API script hasn't loaded yet or the API key is invalid.

**Solutions**:
- Verify your API key is correct
- Check that Places API is enabled in Google Cloud Console
- Ensure the script loads before initializing forms
- Check browser console for API errors

#### 2. Fields Not Auto-Populating

**Problem**: Address fields aren't filling automatically.

**Solutions**:
- Verify `data-populate-fields="true"` on the search field
- Check `data-address-component` values match Google's component types
- Use browser developer tools to check console logs
- Ensure fields are within the same `<form>` element

#### 3. Country Dropdown Not Working

**Problem**: Country dropdown doesn't populate with the selected country.

**Solutions**:
- Ensure country dropdown has `data-country-code="true"`
- Verify country dropdown is populated with country options
- Check that option values or text match the Google Places data

### Debug Mode

Enable detailed logging by opening browser developer tools. The library provides extensive console logging for debugging Google Places integration.

### API Quotas and Limits

- **Free tier**: $200/month credit (≈40,000 autocomplete requests)
- **Per request**: ~$0.017 for Autocomplete requests
- **Per session**: $0.017 for session-based pricing (recommended)

### Best Practices

1. **Use session-based pricing** to reduce costs
2. **Restrict API keys** for security
3. **Implement error handling** for API failures
4. **Cache results** when possible
5. **Monitor usage** in Google Cloud Console

## Support

For issues with the webflow-forms library:
- [GitHub Issues](https://github.com/CorporateDirect/webflow-forms/issues)
- [Documentation](https://github.com/CorporateDirect/webflow-forms)

For Google Places API issues:
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Support](https://cloud.google.com/support) 