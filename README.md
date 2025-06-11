# Webflow Forms

Enhanced form functionality for Webflow sites with validation, loading states, and improved user experience.

## Features

- 📝 **Form Validation** - Client-side validation for required fields, email, and phone numbers
- 🔄 **Loading States** - Visual feedback during form submission
- ✅ **Success/Error Handling** - Proper success and error message display
- 🎨 **Customizable** - Easy to customize with CSS classes
- 📱 **Responsive** - Works on all devices
- 🚀 **Lightweight** - Minimal footprint

## Installation

### Via JSDelivr CDN

Add this script tag to your Webflow site's custom code (before `</body>`):

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

### Via NPM

```bash
npm install webflow-forms
```

## Usage

### Basic Usage

The library automatically enhances all Webflow forms on your page. Just include the script and it works!

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/webflow-forms@latest/dist/webflow-forms.min.js"></script>
```

### Manual Initialization

If you want to disable auto-initialization and control when forms are enhanced:

```javascript
// Disable auto-init
WebflowForms.config.autoInit = false;

// Initialize manually
WebflowForms.init({
    validationClass: 'custom-validation',
    errorClass: 'custom-error',
    successClass: 'custom-success',
    loadingClass: 'custom-loading'
});
```

### Custom Configuration

```javascript
WebflowForms.init({
    autoInit: true,
    validationClass: 'wf-form-validation',
    errorClass: 'wf-form-error',
    successClass: 'wf-form-success',
    loadingClass: 'wf-form-loading'
});
```

## CSS Classes

The library adds the following CSS classes that you can style:

- `.wf-form-error` - Applied to fields with validation errors
- `.wf-form-success` - Applied to forms after successful submission
- `.wf-form-loading` - Applied to forms during submission
- `.wf-form-error-message` - Error message elements

### Example CSS

```css
.wf-form-error {
    border-color: #ff4444 !important;
    box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.2) !important;
}

.wf-form-error-message {
    color: #ff4444;
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.wf-form-loading {
    opacity: 0.7;
    pointer-events: none;
}

.wf-form-loading .w-button {
    cursor: not-allowed;
}
```

## Validation Rules

The library includes built-in validation for:

- **Required fields** - Ensures required fields are not empty
- **Email validation** - Validates email format
- **Phone validation** - Validates phone number format

## Form Setup in Webflow

1. Create your form in Webflow as usual
2. Make sure your form has a `data-name` attribute (Webflow adds this automatically)
3. Add `required` attributes to fields that should be validated
4. Set input types correctly (`email`, `tel`, etc.)
5. Include the script in your site's custom code

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial release
- Form validation
- Loading states
- Success/error handling
- JSDelivr CDN support 