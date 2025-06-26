# Data-Require-For-Subtypes Implementation Guide

## Overview

The `data-require-for-subtypes` attribute creates **conditional required fields** that are only validated when specific member types (subtypes) are selected. This allows different form sections to have different required fields based on whether the user selects "Individual", "Entity", or "Trust" options.

## How It Works

1. **Subtype Detection**: The system examines the current context to determine which member type is active
2. **Conditional Validation**: Fields are only validated if they match the current member subtype
3. **Smart Branching**: The system uses branching logic to skip validation when no branch option is selected

## HTML Elements That Need `data-require-for-subtypes`

### Member Forms

#### Individual Member Fields
**Use `data-require-for-subtypes="individual"`**

```html
<!-- Member 1 Individual Fields -->
<input id="member-1-individual-first-name" data-require-for-subtypes="individual">
<input id="member-1-individual-last-name" data-require-for-subtypes="individual">
<input id="member-1-individual-email-address" data-require-for-subtypes="individual">
<input id="member-1-individual-mailing-address" data-require-for-subtypes="individual">
<input id="member-1-individual-city" data-require-for-subtypes="individual">
<input id="member-1-individual-country" data-require-for-subtypes="individual">
<input id="member-1-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="member-1-individual-postal-code" data-require-for-subtypes="individual">
<input id="member-1-individual-phone-number" data-require-for-subtypes="individual">

<!-- Member 2 Individual Fields -->
<input id="member-2-individual-first-name" data-require-for-subtypes="individual">
<input id="member-2-individual-last-name" data-require-for-subtypes="individual">
<input id="member-2-individual-email-address" data-require-for-subtypes="individual">
<input id="member-2-individual-mailing-address" data-require-for-subtypes="individual">
<input id="member-2-individual-city" data-require-for-subtypes="individual">
<input id="member-2-individual-country" data-require-for-subtypes="individual">
<input id="member-2-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="member-2-individual-postal-code" data-require-for-subtypes="individual">
<input id="member-2-individual-phone-number" data-require-for-subtypes="individual">

<!-- Member 3 Individual Fields -->
<input id="member-3-individual-first-name" data-require-for-subtypes="individual">
<input id="member-3-individual-last-name" data-require-for-subtypes="individual">
<input id="member-3-individual-email-address" data-require-for-subtypes="individual">
<input id="member-3-individual-mailing-address" data-require-for-subtypes="individual">
<input id="member-3-individual-city" data-require-for-subtypes="individual">
<input id="member-3-individual-country" data-require-for-subtypes="individual">
<input id="member-3-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="member-3-individual-postal-code" data-require-for-subtypes="individual">
<input id="member-3-individual-phone-number" data-require-for-subtypes="individual">

<!-- Member 4 Individual Fields -->
<input id="member-4-individual-first-name" data-require-for-subtypes="individual">
<input id="member-4-individual-last-name" data-require-for-subtypes="individual">
<input id="member-4-individual-email-address" data-require-for-subtypes="individual">
<input id="member-4-individual-mailing-address" data-require-for-subtypes="individual">
<input id="member-4-individual-city" data-require-for-subtypes="individual">
<input id="member-4-individual-country" data-require-for-subtypes="individual">
<input id="member-4-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="member-4-individual-postal-code" data-require-for-subtypes="individual">
<input id="member-4-individual-phone-number" data-require-for-subtypes="individual">
```

#### Entity Member Fields
**Use `data-require-for-subtypes="entity"`**

```html
<!-- Member 1 Entity Fields -->
<input id="member-1-entity-name" data-require-for-subtypes="entity">
<input id="member-1-member-manager-name" data-require-for-subtypes="entity">

<!-- Member 2 Entity Fields -->
<input id="member-2-entity-name" data-require-for-subtypes="entity">
<input id="member-2-member-manager-name" data-require-for-subtypes="entity">

<!-- Member 3 Entity Fields -->
<input id="member-3-entity-name" data-require-for-subtypes="entity">
<input id="member-3-member-manager-name" data-require-for-subtypes="entity">

<!-- Member 4 Entity Fields -->
<input id="member-4-entity-name" data-require-for-subtypes="entity">
<input id="member-4-member-manager-name" data-require-for-subtypes="entity">
```

#### Trust Member Fields
**Use `data-require-for-subtypes="trust"`**

```html
<!-- Member 1 Trust Fields -->
<input id="member-1-trust-name" data-require-for-subtypes="trust">
<input id="member-1-trustee-1-name" data-require-for-subtypes="trust">
<input id="member-1-trustee-2-name" data-require-for-subtypes="trust">
<input id="member-1-trustee-3-name" data-require-for-subtypes="trust">

<!-- Member 2 Trust Fields -->
<input id="member-2-trust-name" data-require-for-subtypes="trust">
<input id="member-2-trustee-1-name" data-require-for-subtypes="trust">
<input id="member-2-trustee-2-name" data-require-for-subtypes="trust">
<input id="member-2-trustee-3-name" data-require-for-subtypes="trust">

<!-- Member 3 Trust Fields -->
<input id="member-3-trust-name" data-require-for-subtypes="trust">
<input id="member-3-trustee-1-name" data-require-for-subtypes="trust">
<input id="member-3-trustee-2-name" data-require-for-subtypes="trust">
<input id="member-3-trustee-3-name" data-require-for-subtypes="trust">

<!-- Member 4 Trust Fields -->
<input id="member-4-trust-name" data-require-for-subtypes="trust">
<input id="member-4-trustee-1-name" data-require-for-subtypes="trust">
<input id="member-4-trustee-2-name" data-require-for-subtypes="trust">
<input id="member-4-trustee-3-name" data-require-for-subtypes="trust">
```

### Manager Forms

#### Individual Manager Fields
**Use `data-require-for-subtypes="individual"`**

```html
<!-- Manager 1 Individual Fields -->
<input id="manager-1-individual-first-name" data-require-for-subtypes="individual">
<input id="manager-1-individual-last-name" data-require-for-subtypes="individual">
<input id="manager-1-individual-email-address" data-require-for-subtypes="individual">
<input id="manager-1-individual-mailing-address" data-require-for-subtypes="individual">
<input id="manager-1-individual-city" data-require-for-subtypes="individual">
<input id="manager-1-individual-country" data-require-for-subtypes="individual">
<input id="manager-1-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="manager-1-individual-postal-code" data-require-for-subtypes="individual">
<input id="manager-1-individual-phone-number" data-require-for-subtypes="individual">

<!-- Manager 2 Individual Fields -->
<input id="manager-2-individual-first-name" data-require-for-subtypes="individual">
<input id="manager-2-individual-last-name" data-require-for-subtypes="individual">
<input id="manager-2-individual-email-address" data-require-for-subtypes="individual">
<input id="manager-2-individual-mailing-address" data-require-for-subtypes="individual">
<input id="manager-2-individual-city" data-require-for-subtypes="individual">
<input id="manager-2-individual-country" data-require-for-subtypes="individual">
<input id="manager-2-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="manager-2-individual-postal-code" data-require-for-subtypes="individual">
<input id="manager-2-individual-phone-number" data-require-for-subtypes="individual">

<!-- Manager 3 Individual Fields -->
<input id="manager-3-individual-first-name" data-require-for-subtypes="individual">
<input id="manager-3-individual-last-name" data-require-for-subtypes="individual">
<input id="manager-3-individual-email-address" data-require-for-subtypes="individual">
<input id="manager-3-individual-mailing-address" data-require-for-subtypes="individual">
<input id="manager-3-individual-city" data-require-for-subtypes="individual">
<input id="manager-3-individual-country" data-require-for-subtypes="individual">
<input id="manager-3-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="manager-3-individual-postal-code" data-require-for-subtypes="individual">
<input id="manager-3-individual-phone-number" data-require-for-subtypes="individual">

<!-- Manager 4 Individual Fields -->
<input id="manager-4-individual-first-name" data-require-for-subtypes="individual">
<input id="manager-4-individual-last-name" data-require-for-subtypes="individual">
<input id="manager-4-individual-email-address" data-require-for-subtypes="individual">
<input id="manager-4-individual-mailing-address" data-require-for-subtypes="individual">
<input id="manager-4-individual-city" data-require-for-subtypes="individual">
<input id="manager-4-individual-country" data-require-for-subtypes="individual">
<input id="manager-4-individual-region" data-require-for-subtypes="individual"> <!-- REMOVE required="" -->
<input id="manager-4-individual-postal-code" data-require-for-subtypes="individual">
<input id="manager-4-individual-phone-number" data-require-for-subtypes="individual">
```

#### Entity Manager Fields
**Use `data-require-for-subtypes="entity"`**

```html
<!-- Manager 1 Entity Fields -->
<input id="manager-1-entity-name" data-require-for-subtypes="entity">
<input id="manager-1-member-manager-name" data-require-for-subtypes="entity">

<!-- Manager 2 Entity Fields -->
<input id="manager-2-entity-name" data-require-for-subtypes="entity">
<input id="manager-2-member-manager-name" data-require-for-subtypes="entity">

<!-- Manager 3 Entity Fields -->
<input id="manager-3-entity-name" data-require-for-subtypes="entity">
<input id="manager-3-member-manager-name" data-require-for-subtypes="entity">

<!-- Manager 4 Entity Fields -->
<input id="manager-4-entity-name" data-require-for-subtypes="entity">
<input id="manager-4-member-manager-name" data-require-for-subtypes="entity">
```

#### Trust Manager Fields
**Use `data-require-for-subtypes="trust"`**

```html
<!-- Manager 1 Trust Fields -->
<input id="manager-1-trust-name" data-require-for-subtypes="trust">
<input id="manager-1-trustee" data-require-for-subtypes="trust">
<input id="manager-1-trustee-2" data-require-for-subtypes="trust">
<input id="manager-1-trustee-3" data-require-for-subtypes="trust">

<!-- Manager 2 Trust Fields -->
<input id="manager-2-trust-name" data-require-for-subtypes="trust">
<input id="manager-2-trustee" data-require-for-subtypes="trust">
<input id="manager-2-trustee-2" data-require-for-subtypes="trust">
<input id="manager-2-trustee-3" data-require-for-subtypes="trust">

<!-- Manager 3 Trust Fields -->
<input id="manager-3-trust-name" data-require-for-subtypes="trust">
<input id="manager-3-trustee" data-require-for-subtypes="trust">
<input id="manager-3-trustee-2" data-require-for-subtypes="trust">
<input id="manager-3-trustee-3" data-require-for-subtypes="trust">

<!-- Manager 4 Trust Fields -->
<input id="manager-4-trust-name" data-require-for-subtypes="trust">
<input id="manager-4-trustee" data-require-for-subtypes="trust">
<input id="manager-4-trustee-2" data-require-for-subtypes="trust">
<input id="manager-4-trustee-3" data-require-for-subtypes="trust">
```

## Fields That Should NOT Use `data-require-for-subtypes`

### Keep Global `required=""` Attributes
These fields should remain required regardless of member type:

```html
<!-- Main Contact Information -->
<input id="main-contact-first-name" required="">
<input id="main-contact-last-name" required="">
<input id="main-contact-email-address" required="">
<input id="main-contact-mailing-address" required="">
<input id="main-contact-city" required="">
<input id="main-contact-country" required="">
<input id="main-contact-state" required="">
<input id="main-contact-postal-code" required="">
<input id="main-contact-phone-number" required="">

<!-- Company Information -->
<select id="Extension-1" required="">
<select id="holding-company-state" required="">

<!-- Radio Button Groups -->
<input name="Foreign-Qualification" required=""> <!-- Yes/No options -->
<input name="Taxed-As" required=""> <!-- Single Member, Partnership, etc. -->
<input name="Owner-Profile" required=""> <!-- Various profile options -->

<!-- Branching Radio Buttons -->
<input name="Member-Type" required=""> <!-- Individual/Entity/Trust selection -->
<input name="Manager-Type" required=""> <!-- Individual/Entity/Trust selection -->
```

## Important Implementation Notes

### 1. Remove Conflicting Attributes
Fields that get `data-require-for-subtypes` should **NOT** have `required=""`:

```html
<!-- WRONG -->
<input id="member-1-individual-region" required="" data-require-for-subtypes="individual">

<!-- CORRECT -->
<input id="member-1-individual-region" data-require-for-subtypes="individual">
```

### 2. Specific Fields to Update
These fields currently have `required=""` and should be changed:

```html
<!-- Change these from required="" to data-require-for-subtypes="individual" -->
<input id="member-1-individual-region" data-require-for-subtypes="individual">
<input id="member-2-individual-region" data-require-for-subtypes="individual">
<input id="member-3-individual-region" data-require-for-subtypes="individual">
<input id="member-4-individual-region" data-require-for-subtypes="individual">
<input id="manager-1-individual-region" data-require-for-subtypes="individual">
<input id="manager-2-individual-region" data-require-for-subtypes="individual">
<input id="manager-3-individual-region" data-require-for-subtypes="individual">
<input id="manager-4-individual-region" data-require-for-subtypes="individual">
```

### 3. Radio Buttons
Radio buttons use the existing branching logic with `data-go-to` attributes and should keep their `required=""` attributes. They don't need `data-require-for-subtypes`.

### 4. Already Configured Fields
Many fields already have the correct `data-require-for-subtypes` attributes based on the current HTML structure. Only add the attribute to fields that don't already have it.

## Validation Logic

The JavaScript validation system will:

1. **Detect Context**: Look at `data-answer` attributes (`individual-1`, `entity-2`, `trust-3`, etc.)
2. **Extract Subtype**: Convert values like `individual-1` to just `individual`
3. **Match Requirements**: Only validate fields where the `data-require-for-subtypes` value matches the current subtype
4. **Skip Hidden Fields**: Automatically skip validation for fields in inactive step_items

## Example Usage Scenarios

### Individual Member Selected
- Only fields with `data-require-for-subtypes="individual"` are validated
- Entity and trust fields are ignored
- User must fill out name, contact, and address information

### Entity Member Selected
- Only fields with `data-require-for-subtypes="entity"` are validated
- Individual and trust fields are ignored
- User must fill out entity name and manager name

### Trust Member Selected
- Only fields with `data-require-for-subtypes="trust"` are validated
- Individual and entity fields are ignored
- User must fill out trust name and trustee information

This system allows for flexible, intelligent form validation that adapts to user selections while maintaining a clean, user-friendly experience. 