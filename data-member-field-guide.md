# Data-Member-Field Implementation Guide

## Overview

The `data-member-field` attribute is a **semantic labeling system** that categorizes form fields by their business meaning and data type. It identifies what type of member information each field represents, independent of validation rules or HTML structure.

## Purpose & Uses

### 1. **Data Organization**
- Categorizes fields by their semantic meaning
- Groups related data types together
- Provides consistent field identification across forms

### 2. **Data Processing**
- Facilitates backend form data processing
- Enables mapping to database fields
- Supports document generation and reporting
- Helps with data validation by field type

### 3. **Future Enhancement Potential**
- Auto-population between similar fields
- Field-type-specific validation rules
- Form analytics and user interaction tracking
- Dynamic form generation

## Current Data-Member-Field Values

### Individual/Person Fields

#### **firstName**
Used for all first name fields across the form:

```html
<!-- Main Contact -->
<input id="main-contact-first-name" data-member-field="firstName">

<!-- Member Individual Forms -->
<input id="member-1-individual-first-name" data-member-field="firstName">
<input id="member-2-individual-first-name" data-member-field="firstName">
<input id="member-3-individual-first-name" data-member-field="firstName">
<input id="member-4-individual-first-name" data-member-field="firstName">

<!-- Manager Individual Forms -->
<input id="manager-1-individual-first-name" data-member-field="firstName">
<input id="manager-2-individual-first-name" data-member-field="firstName">
<input id="manager-3-individual-first-name" data-member-field="firstName">
<input id="manager-4-individual-first-name" data-member-field="firstName">
```

#### **middleInitial**
Used for all middle initial fields:

```html
<!-- Main Contact -->
<input id="main-contact-middle-initial" data-member-field="middleInitial">

<!-- Member Individual Forms -->
<input id="member-1-individual-middle-name" data-member-field="middleInitial">
<input id="member-2-individual-middle-name" data-member-field="middleInitial">
<input id="member-3-individual-middle-name" data-member-field="middleInitial">
<input id="member-4-individual-middle-name" data-member-field="middleInitial">

<!-- Manager Individual Forms -->
<input id="manager-1-individual-middle-name" data-member-field="middleInitial">
<input id="manager-2-individual-middle-name" data-member-field="middleInitial">
<input id="manager-3-individual-middle-name" data-member-field="middleInitial">
<input id="manager-4-individual-middle-name" data-member-field="middleInitial">
```

#### **lastName**
Used for all last name fields:

```html
<!-- Main Contact -->
<input id="main-contact-last-name" data-member-field="lastName">

<!-- Member Individual Forms -->
<input id="member-1-individual-last-name" data-member-field="lastName">
<input id="member-2-individual-last-name" data-member-field="lastName">
<input id="member-3-individual-last-name" data-member-field="lastName">
<input id="member-4-individual-last-name" data-member-field="lastName">

<!-- Manager Individual Forms -->
<input id="manager-1-individual-last-name" data-member-field="lastName">
<input id="manager-2-individual-last-name" data-member-field="lastName">
<input id="manager-3-individual-last-name" data-member-field="lastName">
<input id="manager-4-individual-last-name" data-member-field="lastName">
```

### Entity/Company Fields

#### **entityName**
Used for all entity/company name fields:

```html
<!-- Member Entity Forms -->
<input id="member-1-entity-name" data-member-field="entityName">
<input id="member-2-entity-name" data-member-field="entityName">
<input id="member-3-entity-name" data-member-field="entityName">
<input id="member-4-entity-name" data-member-field="entityName">

<!-- Manager Entity Forms -->
<input id="manager-1-entity-name" data-member-field="entityName">
<input id="manager-2-entity-name" data-member-field="entityName">
<input id="manager-3-entity-name" data-member-field="entityName">
<input id="manager-4-entity-name" data-member-field="entityName">
```

#### **managerName**
Used for entity manager/managing member name fields:

```html
<!-- Member Entity Forms -->
<input id="member-1-member-manager-name" data-member-field="managerName">
<input id="member-2-member-manager-name" data-member-field="managerName">
<input id="member-3-member-manager-name" data-member-field="managerName">
<input id="member-4-member-manager-name" data-member-field="managerName">

<!-- Manager Entity Forms -->
<input id="manager-1-member-manager-name" data-member-field="managerName">
<input id="manager-2-member-manager-name" data-member-field="managerName">
<input id="manager-3-member-manager-name" data-member-field="managerName">
<input id="manager-4-member-manager-name" data-member-field="managerName">
```

### Trust Fields

#### **trustName**
Used for all trust name fields:

```html
<!-- Member Trust Forms -->
<input id="member-1-trust-name" data-member-field="trustName">
<input id="member-2-trust-name" data-member-field="trustName">
<input id="member-3-trust-name" data-member-field="trustName">
<input id="member-4-trust-name" data-member-field="trustName">

<!-- Manager Trust Forms -->
<input id="manager-1-trust-name" data-member-field="trustName">
<input id="manager-2-trust-name" data-member-field="trustName">
<input id="manager-3-trust-name" data-member-field="trustName">
<input id="manager-4-trust-name" data-member-field="trustName">
```

#### **trusteeName**
Used for all trustee name fields (multiple trustees per trust):

```html
<!-- Member Trust Forms -->
<input id="member-1-trustee-1-name" data-member-field="trusteeName">
<input id="member-1-trustee-2-name" data-member-field="trusteeName">
<input id="member-1-trustee-3-name" data-member-field="trusteeName">

<input id="member-2-trustee-1-name" data-member-field="trusteeName">
<input id="member-2-trustee-2-name" data-member-field="trusteeName">
<input id="member-2-trustee-3-name" data-member-field="trusteeName">

<input id="member-3-trustee-1-name" data-member-field="trusteeName">
<input id="member-3-trustee-2-name" data-member-field="trusteeName">
<input id="member-3-trustee-3-name" data-member-field="trusteeName">

<input id="member-4-trustee-1-name" data-member-field="trusteeName">
<input id="member-4-trustee-2-name" data-member-field="trusteeName">
<input id="member-4-trustee-3-name" data-member-field="trusteeName">

<!-- Manager Trust Forms -->
<input id="manager-1-trustee" data-member-field="trusteeName">
<input id="manager-1-trustee-2" data-member-field="trusteeName">
<input id="manager-1-trustee-3" data-member-field="trusteeName">

<input id="manager-2-trustee-1" data-member-field="trusteeName">
<input id="manager-2-trustee-2" data-member-field="trusteeName">
<input id="manager-2-trustee-3" data-member-field="trusteeName">

<input id="manager-3-trustee" data-member-field="trusteeName">
<input id="manager-3-trustee-2" data-member-field="trusteeName">
<input id="manager-3-trustee-3" data-member-field="trusteeName">

<input id="manager-4-trustee" data-member-field="trusteeName">
<input id="manager-4-trustee-2" data-member-field="trusteeName">
<input id="manager-4-trustee-3" data-member-field="trusteeName">
```

## Fields That Should NOT Have data-member-field

### Contact Information Fields
These are general contact fields, not member-specific data:
- Email addresses
- Mailing addresses
- City, state, country, postal code
- Phone numbers

### Company Setup Fields
These are company-level configuration fields:
- Company state
- Extension information
- Foreign qualification
- Tax classification
- Owner profile

### Form Control Fields
These are form navigation and control elements:
- Radio button selections for member types
- Checkboxes for preferences
- Submit buttons
- Navigation buttons

## Data-Member-Field vs Other Attributes

### **data-member-field vs data-require-for-subtypes**
- **data-member-field**: Identifies WHAT type of data the field contains
- **data-require-for-subtypes**: Identifies WHEN the field should be validated

### **data-member-field vs data-name**
- **data-member-field**: Semantic business meaning
- **data-name**: Webflow's form submission field name

### **data-member-field vs id/name**
- **data-member-field**: Business data category
- **id/name**: HTML identification and form submission

## Implementation Guidelines

### 1. **Consistency**
Use the same `data-member-field` value for the same type of data across all forms:
```html
<!-- All first name fields should use "firstName" -->
<input data-member-field="firstName">
```

### 2. **Semantic Meaning**
Choose values that reflect the business meaning, not the HTML structure:
```html
<!-- Good: Reflects what the data represents -->
<input data-member-field="entityName">

<!-- Avoid: Reflects HTML structure -->
<input data-member-field="inputField1">
```

### 3. **Future Compatibility**
Use descriptive values that will make sense for future enhancements:
```html
<!-- Good: Clear and extensible -->
<input data-member-field="trusteeName">

<!-- Avoid: Too generic -->
<input data-member-field="name">
```

## Current JavaScript Usage

**Note**: The `data-member-field` attribute is currently **NOT used** in the JavaScript validation system. The validation system uses `data-require-for-subtypes` instead.

However, the attribute is available for:
- Backend data processing
- Future JavaScript enhancements
- Form analytics
- Data mapping and export

## Potential Future Enhancements

### Auto-Population
```javascript
// Copy firstName from main contact to member 1
const mainFirstName = document.querySelector('[data-member-field="firstName"]').value;
const member1FirstName = document.querySelector('#member-1-individual-first-name');
member1FirstName.value = mainFirstName;
```

### Field-Type Validation
```javascript
// Apply specific validation rules based on field type
const entityFields = document.querySelectorAll('[data-member-field="entityName"]');
entityFields.forEach(field => {
    // Apply entity name validation rules
});
```

### Data Collection
```javascript
// Collect all data by field type
const allFirstNames = document.querySelectorAll('[data-member-field="firstName"]');
const firstNameValues = Array.from(allFirstNames).map(field => field.value);
```

This semantic labeling system provides a clean, consistent way to identify and work with form data based on its business meaning rather than its technical implementation.
