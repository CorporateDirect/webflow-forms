# Webflow Implementation Guide - tryformly.com Compatible Multi-Step Forms

This guide shows you **exactly where to add data attributes** in Webflow Designer to create powerful multi-step forms with skip logic and branching.

## 🎯 Prerequisites

1. **Include the library** in your Webflow site:
   ```html
   <script src="https://cdn.jsdelivr.net/gh/CorporateDirect/webflow-forms@a452c943c36efb1c41b1cf9cee6c72248e2005bf/dist/webflow-forms-complete.js"></script>
   ```

2. **Add to** → **Project Settings** → **Custom Code** → **Footer Code**

## 📋 **Webflow Element Mapping**

### **Form Container** 
**Webflow Element:** Form Block  
**Location:** Form Block Settings → Custom Attributes  
**Add:** `data-multi-step` = (leave value empty)

```
Form Block
├── Custom Attributes
    └── Name: data-multi-step
        Value: (empty)
```

---

## 🔢 **Step Definition**

### **Step Containers**
**Webflow Element:** Div Block (containing each step's fields)  
**Location:** Div Block Settings → Custom Attributes  
**Add:** `data-step` = `1`, `2`, `3`, etc.

```
Form Block
├── Div Block (Step 1)
│   ├── Custom Attributes
│   │   └── Name: data-step
│   │       Value: 1
│   └── [Step 1 content]
├── Div Block (Step 2)
│   ├── Custom Attributes
│   │   └── Name: data-step
│   │       Value: 2
│   └── [Step 2 content]
```

**Alternative:** You can also use Webflow's built-in classes
- **Class Name:** `form-step` (the system will auto-number them)

---

## 🔀 **Navigation Buttons**

### **Next Button (Sequential Navigation)**
**Webflow Element:** Button Element  
**Location:** Button Settings → Custom Attributes  
**Add:** `data-next` = (leave value empty)

```
Button Element
├── Button Settings
│   ├── Type: Button (not Submit)
│   └── Custom Attributes
│       └── Name: data-next
│           Value: (empty)
```

**How it works:** `data-next` automatically goes to the **next sequential step** (current step + 1), but **skips over any steps** that have skip conditions. You don't specify which step to go to - the system calculates it automatically.

### **Direct Step Navigation**
**Webflow Element:** Button Element OR Link Element  
**Location:** Element Settings → Custom Attributes  
**Add:** `data-skip` = `3` (specific step number to jump to)

```
Button Element (or Link Element)
├── Element Settings
│   └── Custom Attributes
│       └── Name: data-skip
│           Value: 3
```

**How it works:** `data-skip` jumps **directly to a specific step number** (1-based). Use this when you want to bypass the sequential flow.

### **Previous Button**
**Webflow Element:** Button Element  
**Location:** Button Settings → Custom Attributes  
**Add:** `data-prev` = (leave value empty)

```
Button Element
├── Button Settings
│   ├── Type: Button (not Submit)
│   └── Custom Attributes
│       └── Name: data-prev
│           Value: (empty)
```

**How it works:** `data-prev` goes back to the **previous step in the user's history** (not necessarily current step - 1).

### **Submit Button**
**Webflow Element:** Button Element  
**Location:** Button Settings → Custom Attributes  
**Add:** `data-submit` = (leave value empty)

```
Button Element
├── Button Settings
│   ├── Type: Submit
│   └── Custom Attributes
│       └── Name: data-submit
│           Value: (empty)
```

---

## ⏭️ **Skip Functionality**

### **Radio Button Skip Logic**
**Webflow Element:** Radio Button Element  
**Location:** Radio Button Settings → Custom Attributes  
**Add:** `data-skip` = `4` (step to skip to when selected)

```
Radio Button Element
├── Radio Button Settings
│   ├── Name: user-type
│   ├── Value: individual
│   └── Custom Attributes
│       └── Name: data-skip
│           Value: 4
```

### **Conditional Step Skipping**
**Webflow Element:** Div Block (step container)  
**Location:** Div Block Settings → Custom Attributes  
**Add:** `data-skip-if` = `field-name=value`

```
Div Block (Step Container)
├── Custom Attributes
│   ├── Name: data-step
│   │   Value: 3
│   └── Name: data-skip-if
│       Value: user-type=individual
```

---

## 🌿 **Branching Logic**

### **Method 1: Simple Step Jumping**
**Webflow Element:** Radio Button Element  
**Location:** Radio Button Settings → Custom Attributes  
**Add Two Attributes:**
1. `data-go-to` = `3` (step number to jump to)
2. `data-answer` = `business` (must match the radio value)

```
Radio Button Element
├── Radio Button Settings
│   ├── Name: account-type
│   ├── Value: business
│   └── Custom Attributes
│       ├── Name: data-go-to
│       │   Value: 3
│       └── Name: data-answer
│           Value: business
```

### **Method 2: Step-Wrapper Branching (tryformly.com Style)**
**Use Case:** Individual Manager vs Entity Manager vs Trust Manager - each needs different fields but should return to the main flow.

#### **Step 1: Create Branch Selection**
```
Step 2 - Manager Type Selection
├── Radio Button [name="manager-type", value="individual", data-go-to="individual-branch"]
├── Radio Button [name="manager-type", value="entity", data-go-to="entity-branch"]
└── Radio Button [name="manager-type", value="trust", data-go-to="trust-branch"]
```

#### **Step 2: Create Step-Wrappers in Next Step**
**Webflow Element:** Div Block (inside the step)  
**Location:** Div Block Settings → Custom Attributes  
**Add:** `data-answer` = `individual-branch` (matches the data-go-to value)

```
Step 3 - Manager Details (contains multiple wrappers)
├── Div Block [data-answer="individual-branch"]
│   ├── Text Input [name="individual-name"]
│   ├── Text Input [name="individual-ssn"]
│   └── [Individual-specific fields]
├── Div Block [data-answer="entity-branch"]
│   ├── Text Input [name="entity-name"]
│   ├── Text Input [name="entity-ein"]
│   └── [Entity-specific fields]
├── Div Block [data-answer="trust-branch"]
│   ├── Text Input [name="trust-name"]
│   ├── Text Input [name="trustee-name"]
│   └── [Trust-specific fields]
└── Button [data-next] (continues to Step 4 for everyone)
```

#### **Step 3: Continue Main Flow**
```
Step 4 - Contact Information (everyone continues here)
├── Text Input [name="email"]
├── Text Input [name="phone"]
└── Button [data-next]
```

### **How Step-Wrapper Branching Works:**
1. **User selects** "Entity Manager" (value="entity")
2. **Radio has** `data-go-to="entity-branch"`
3. **System goes to** next step (Step 3)
4. **System shows only** the Div Block with `data-answer="entity-branch"`
5. **User fills** entity-specific fields
6. **User clicks Next** and continues to Step 4 (main flow)

### **First Step Wrapper**
**Webflow Element:** Div Block (first wrapper in any step)  
**Location:** Div Block Settings → Custom Attributes  
**Add:** `data-answer` = `""` (empty value for first step)

```
Step 1 - Welcome
└── Div Block [data-answer=""]
    ├── Heading: "Welcome"
    ├── Text: "Let's get started"
    └── Button [data-next]
```

---

## 📊 **Progress Indicators**

### **Progress Bars**
**Webflow Element:** Div Block  
**Location:** Div Block Settings → Custom Attributes  
**Add:** `data-progress` = (leave value empty)

```
Div Block (Progress Bar)
├── Custom Attributes
│   └── Name: data-progress
│       Value: (empty)
├── Styling
│   ├── Width: 100%
│   ├── Height: 8px
│   └── Background: #e9ecef
```

### **Step Counter Text**
**Webflow Element:** Text Element  
**Location:** Text Element Settings → Custom Attributes  
**Add:** `data-step-counter` = (leave value empty)

```
Text Element
├── Custom Attributes
│   └── Name: data-step-counter
│       Value: (empty)
└── Default Text: "Step 1 of 5"
```

### **Step Indicators**
**Webflow Element:** Div Block (for each step indicator)  
**Location:** Div Block Settings → Custom Attributes  
**Add:** `data-step-indicator` = (leave value empty)

```
Div Block (Step Indicator)
├── Custom Attributes
│   └── Name: data-step-indicator
│       Value: (empty)
├── Styling
│   ├── Width: 30px
│   ├── Height: 30px
│   └── Border-radius: 50%
```

---

## 🎨 **Webflow-Specific Styling**

### **CSS Classes for Transitions**
Add these classes in Webflow Designer:

#### **Step Classes**
- **Class:** `form-step` (add to each step Div Block)
- **Class:** `step-visible` (auto-applied by script)
- **Class:** `step-hidden` (auto-applied by script)

#### **Progress Classes**
- **Class:** `step-indicator` (add to indicator Div Blocks)
- **Class:** `active` (auto-applied to current step)
- **Class:** `completed` (auto-applied to completed steps)

#### **Error Classes**
- **Class:** `field-error` (auto-applied to invalid fields)

---

## 🛠️ **Step-by-Step Implementation in Webflow**

### **Step 1: Create Form Structure**

1. **Add Form Block** to your page
2. **Form Block Settings** → **Custom Attributes**
   - Name: `data-multi-step`
   - Value: (empty)

### **Step 2: Create Step Containers**

1. **Inside Form Block**, add **Div Block** for each step
2. **For each Div Block** → **Custom Attributes**
   - Name: `data-step`
   - Value: `1`, `2`, `3`, etc.
3. **Add Class** `form-step` to each step Div Block

### **Step 3: Add Form Fields**

1. **Inside each step Div Block**, add your form elements:
   - Text Input, Email Input, Select, Radio Buttons, etc.
2. **Set Name attributes** for all form fields
3. **Add Required** attribute where needed

### **Step 4: Add Navigation Buttons**

1. **Add Button Elements** to each step
2. **Next Button** → **Custom Attributes**
   - Name: `data-next`
   - Value: (empty)
3. **Previous Button** → **Custom Attributes**
   - Name: `data-prev`  
   - Value: (empty)
4. **Final Submit Button** → **Custom Attributes**
   - Name: `data-submit`
   - Value: (empty)

### **Step 5: Add Skip Logic (Optional)**

1. **For Radio Button Skip:**
   - **Radio Button** → **Custom Attributes**
   - Name: `data-skip`
   - Value: `4` (step number)

2. **For Step Skip Conditions:**
   - **Step Div Block** → **Custom Attributes**
   - Name: `data-skip-if`
   - Value: `field-name=value`

### **Step 6: Add Progress Indicators (Optional)**

1. **Add Div Block** for progress bar
2. **Custom Attributes**
   - Name: `data-progress`
   - Value: (empty)
3. **Style** with width, height, background color

---

## 📝 **Complete Webflow Example Structure**

### **Example 1: Simple Multi-Step Form**
```
Form Block [data-multi-step]
├── Div Block [data-step="1", class="form-step"]
│   ├── Heading: "Step 1: Account Type"
│   ├── Radio Button [name="account-type", value="individual", data-skip="3"]
│   ├── Radio Button [name="account-type", value="business", data-go-to="2", data-answer="business"]
│   └── Button [data-next]
│
├── Div Block [data-step="2", class="form-step", data-skip-if="account-type=individual"]
│   ├── Heading: "Step 2: Business Info"
│   ├── Text Input [name="company-name", required]
│   ├── Select [name="company-size"]
│   ├── Button [data-prev]
│   └── Button [data-next]
│
├── Div Block [data-step="3", class="form-step"]
│   ├── Heading: "Step 3: Contact Details"
│   ├── Email Input [name="email", required]
│   ├── Text Input [name="phone", data-phone-format]
│   ├── Link [data-skip="4"] "Skip phone verification"
│   ├── Button [data-prev]
│   └── Button [data-next]
│
├── Div Block [data-step="4", class="form-step"]
│   ├── Heading: "Step 4: Final Details"
│   ├── Textarea [name="message", data-auto-resize="true"]
│   ├── Button [data-prev]
│   └── Button [data-submit, type="submit"]
│
└── Div Block [class="progress-container"]
    ├── Div Block [data-progress, class="progress-bar"]
    ├── Text [data-step-counter] "Step 1 of 4"
    └── Div Block [class="step-indicators"]
        ├── Div Block [data-step-indicator, class="step-indicator"]
        ├── Div Block [data-step-indicator, class="step-indicator"]
        ├── Div Block [data-step-indicator, class="step-indicator"]
        └── Div Block [data-step-indicator, class="step-indicator"]
```

### **Example 2: Step-Wrapper Branching (Manager Selection)**
```
Form Block [data-multi-step]
├── Div Block [data-step="1", class="form-step"]
│   └── Div Block [data-answer=""]
│       ├── Heading: "Step 1: Welcome"
│       ├── Text: "Let's set up your account"
│       └── Button [data-next]
│
├── Div Block [data-step="2", class="form-step"]
│   └── Div Block [data-answer="step-2"]
│       ├── Heading: "Step 2: Manager Type"
│       ├── Radio Button [name="manager-type", value="individual", data-go-to="individual-branch"]
│       ├── Radio Button [name="manager-type", value="entity", data-go-to="entity-branch"]
│       ├── Radio Button [name="manager-type", value="trust", data-go-to="trust-branch"]
│       └── Button [data-next]
│
├── Div Block [data-step="3", class="form-step"]
│   ├── Div Block [data-answer="individual-branch"]
│   │   ├── Heading: "Individual Manager Details"
│   │   ├── Text Input [name="individual-name", required]
│   │   ├── Text Input [name="individual-ssn", required]
│   │   ├── Date Input [name="individual-dob", required]
│   │   ├── Button [data-prev]
│   │   └── Button [data-next]
│   ├── Div Block [data-answer="entity-branch"]
│   │   ├── Heading: "Entity Manager Details"
│   │   ├── Text Input [name="entity-name", required]
│   │   ├── Text Input [name="entity-ein", required]
│   │   ├── Select [name="entity-type", required]
│   │   ├── Button [data-prev]
│   │   └── Button [data-next]
│   └── Div Block [data-answer="trust-branch"]
│       ├── Heading: "Trust Manager Details"
│       ├── Text Input [name="trust-name", required]
│       ├── Text Input [name="trustee-name", required]
│       ├── Date Input [name="trust-date", required]
│       ├── Button [data-prev]
│       └── Button [data-next]
│
├── Div Block [data-step="4", class="form-step"]
│   └── Div Block [data-answer="step-4"]
│       ├── Heading: "Step 4: Contact Information"
│       ├── Email Input [name="email", required]
│       ├── Text Input [name="phone", data-phone-format]
│       ├── Button [data-prev]
│       └── Button [data-submit, type="submit"]
│
└── Div Block [class="progress-container"]
    ├── Div Block [data-progress, class="progress-bar"]
    ├── Text [data-step-counter] "Step 1 of 4"
    └── Div Block [class="step-indicators"]
        ├── Div Block [data-step-indicator, class="step-indicator"]
        ├── Div Block [data-step-indicator, class="step-indicator"]
        ├── Div Block [data-step-indicator, class="step-indicator"]
        └── Div Block [data-step-indicator, class="step-indicator"]
```

---

## ⚠️ **Common Webflow Gotchas**

### **1. Button Types**
- **Next/Prev buttons** must be `type="button"` (not submit)
- **Only final button** should be `type="submit"`

### **2. Form Submission**
- **Form Block Settings** → **Action**: Set your form submission URL
- **Method**: Usually POST
- The script will inject hidden fields with all collected data

### **3. Field Names**
- **Always set Name attributes** on form fields
- **Names must match** what you use in `data-skip-if` conditions
- Use lowercase, hyphenated names: `user-type`, `company-size`

### **4. Custom Attributes in Webflow**
- **Found under** Element Settings → **Custom Attributes**
- **Click "+ Add Custom Attribute"**
- **Name**: The data attribute name (without `data-`)
- **Value**: The attribute value

### **5. Classes vs Attributes**
- **Use classes** for styling: `form-step`, `step-indicator`
- **Use attributes** for functionality: `data-step`, `data-next`

---

## 🧭 **Navigation Methods Explained**

### **1. Sequential Navigation (`data-next`)**
- **Goes to:** Next step in sequence (current + 1)
- **Automatically skips:** Steps with `data-skip-if` conditions
- **Use for:** Standard "Next" buttons
- **Example:** Step 1 → Step 2 → Step 3 (but skips Step 2 if condition met)

### **2. Direct Navigation (`data-skip`)**
- **Goes to:** Specific step number you specify
- **Ignores:** Sequential order and skip conditions
- **Use for:** "Skip to end", "Jump to summary", custom navigation
- **Example:** Step 1 → Step 5 (directly)

### **3. Conditional Navigation (`data-go-to` + `data-answer`)**
- **Goes to:** Specific step when field value matches
- **Triggers:** Automatically when radio/select value changes
- **Use for:** Branching logic based on user choices
- **Example:** "Business" → Step 3, "Individual" → Step 5

### **4. History Navigation (`data-prev`)**
- **Goes to:** Previous step the user actually visited
- **Remembers:** User's navigation path (not just step numbers)
- **Use for:** "Back" buttons
- **Example:** User went 1→3→5, back button goes 5→3→1

---

## 🧪 **Testing Your Implementation**

### **1. Console Check**
Open browser console and look for:
```
🎯 Tryformly-compatible multi-step system initialized
✅ Form form-xxxxx initialized with X steps
```

### **2. Manual Testing**
1. **Navigation** - Click Next/Previous buttons
2. **Skip logic** - Select radio buttons with skip attributes
3. **Validation** - Try submitting with required fields empty
4. **Progress** - Watch progress bar and step indicators update

### **3. Form Data**
Test in console:
```javascript
const form = document.querySelector('[data-multi-step]');
console.log('Current step:', window.Formly.getCurrentStep(form));
console.log('Form data:', window.Formly.getFormData(form));
```

---

## 🎯 **Quick Reference**

| Webflow Element | Data Attribute | Value | Purpose |
|-----------------|----------------|-------|---------|
| Form Block | `data-multi-step` | (empty) | Enable multi-step |
| Div Block | `data-step` | `1`, `2`, `3` | Define step |
| Button | `data-next` | (empty) | Next sequential step (auto-calculated) |
| Button | `data-prev` | (empty) | Previous step (from history) |
| Button | `data-submit` | (empty) | Submit button |
| Button/Link | `data-skip` | `3` | Jump directly to step 3 |
| Radio Button | `data-skip` | `4` | Skip to step 4 when selected |
| Radio Button | `data-go-to` | `branch-name` | Go to named branch or step number |
| Radio Button | `data-answer` | `business` | Required value for data-go-to |
| **Div Block** | **`data-answer`** | **`branch-name`** | **Step-wrapper for branching logic** |
| **Div Block** | **`data-answer`** | **`""`** | **First step-wrapper (empty value)** |
| Div Block | `data-skip-if` | `field=value` | Skip step condition |
| Div Block | `data-progress` | (empty) | Progress bar |
| Text Element | `data-step-counter` | (empty) | Step counter |
| Div Block | `data-step-indicator` | (empty) | Step indicator |

---

## 🚀 **You're Ready!**

With these data attributes properly set in Webflow Designer, your multi-step forms will have:

- ✅ **Smooth step transitions**
- ✅ **Skip logic and branching**
- ✅ **Progress tracking**
- ✅ **Form validation**
- ✅ **All your existing field enhancements**

**Just publish your Webflow site and test!** 🎉 