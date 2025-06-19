// Example usage of the modular branching logic system
// This demonstrates how the WebflowFieldEnhancer handles your multi-step form branching

// ======================
// AUTOMATIC INITIALIZATION
// ======================

// The system automatically initializes when the page loads
// It will:
// 1. Scan for forms with data-form="multistep"
// 2. Map all steps with data-go-to and data-answer attributes
// 3. Set up event listeners for branching inputs
// 4. Initialize proper step visibility

// ======================
// BRANCHING PATTERNS SUPPORTED
// ======================

// 1. SIMPLE SEQUENTIAL BRANCHING
// HTML: <div data-go-to="step-2" data-answer="step-1">
// This creates a simple progression from step-1 to step-2

// 2. CONDITIONAL RADIO BUTTON BRANCHING
// HTML: 
// <input type="radio" data-go-to="individual-1" value="An Individual">
// <input type="radio" data-go-to="entity-1" value="An Entity">
// <input type="radio" data-go-to="trust-1" value="A Trust">
// 
// This creates three different paths based on user selection

// 3. STEP ITEMS WITH CONDITIONS
// HTML:
// <div data-go-to="step-7" data-answer="individual-1" class="step-item">
// <div data-go-to="step-7" data-answer="entity-1" class="step-item">
// <div data-go-to="step-7" data-answer="trust-1" class="step-item">
//
// This shows different content based on previous selections

// ======================
// CUSTOM EVENT LISTENERS
// ======================

// Listen for branching changes
document.addEventListener('webflowField:branchingChange', (event) => {
    console.log('Branching occurred:', event.detail);
    // event.detail contains: { from, to, input }
});

// Listen for step navigation
document.addEventListener('webflowField:stepNavigation', (event) => {
    console.log('Step navigation:', event.detail);
    // event.detail contains: { stepId, direction, step }
});

// ======================
// PROGRAMMATIC CONTROL
// ======================

// Access the branching system
const branchingSystem = WebflowFieldEnhancer;

// Navigate to a specific step programmatically
function goToStep(stepId) {
    branchingSystem.navigateToStep(stepId, 'forward');
}

// Get current branching analytics
function getBranchingStats() {
    return branchingSystem.getBranchingAnalytics();
}

// Validate current step before proceeding
function validateAndProceed() {
    if (branchingSystem.validateCurrentStep()) {
        console.log('Current step is valid');
        // Proceed with form submission or next step
    } else {
        console.log('Current step has validation errors');
        // Show error messages
    }
}

// Reset form to beginning
function resetForm() {
    branchingSystem.resetBranchingState();
}

// ======================
// ADVANCED CUSTOMIZATION
// ======================

// Add custom branching rules
function addCustomBranchingRule(containerId, rules) {
    branchingSystem.branchingState.branchingRules.set(containerId, rules);
}

// Custom step visibility logic
function customStepLogic() {
    // Get current step data
    const currentStepId = branchingSystem.getCurrentStepId();
    const analytics = branchingSystem.getBranchingAnalytics();
    
    console.log('Current step:', currentStepId);
    console.log('Step history:', analytics.stepHistory);
    
    // Implement custom logic based on user's path
    if (analytics.stepHistory.includes('individual-1')) {
        console.log('User selected individual path');
        // Custom logic for individual users
    } else if (analytics.stepHistory.includes('entity-1')) {
        console.log('User selected entity path');
        // Custom logic for entity users
    }
}

// ======================
// CONFIGURATION OPTIONS
// ======================

// Initialize with custom configuration
function initializeWithCustomConfig() {
    WebflowFieldEnhancer.init({
        branchingEnabled: true,  // Enable/disable branching system
        autoInit: true,          // Auto-initialize on page load
        enhancedClass: 'wf-field-enhanced',
        focusClass: 'wf-field-focus',
        typingClass: 'wf-field-typing'
    });
}

// ======================
// DEBUGGING HELPERS
// ======================

// Debug current state
function debugBranchingState() {
    console.log('=== BRANCHING DEBUG INFO ===');
    console.log('Current step:', branchingSystem.getCurrentStepId());
    console.log('Step history:', branchingSystem.branchingState.stepHistory);
    console.log('Conditional steps:', branchingSystem.branchingState.conditionalSteps);
    console.log('Branching rules:', branchingSystem.branchingState.branchingRules);
    console.log('Analytics:', branchingSystem.getBranchingAnalytics());
}

// Log all form steps
function logAllSteps() {
    const form = document.querySelector('[data-form="multistep"]');
    const steps = form.querySelectorAll('[data-form="step"]');
    
    console.log('=== ALL FORM STEPS ===');
    steps.forEach((step, index) => {
        const wrapper = step.querySelector('[data-go-to], [data-answer]');
        console.log(`Step ${index}:`, {
            element: step,
            goTo: wrapper?.dataset.goTo,
            answer: wrapper?.dataset.answer,
            visible: step.style.display !== 'none'
        });
    });
}

// ======================
// INTEGRATION EXAMPLES
// ======================

// Example: Custom validation before step navigation
document.addEventListener('webflowField:branchingChange', (event) => {
    const { from, to, input } = event.detail;
    
    // Custom validation logic
    if (to === 'entity-1' && !validateEntityRequirements()) {
        // Prevent navigation or show warning
        console.warn('Entity requirements not met');
        return false;
    }
    
    // Log user choices for analytics
    trackUserChoice(from, to);
});

// Example: Dynamic content loading based on branch
document.addEventListener('webflowField:stepNavigation', (event) => {
    const { stepId, direction } = event.detail;
    
    // Load dynamic content based on step
    if (stepId.includes('individual')) {
        loadIndividualContent();
    } else if (stepId.includes('entity')) {
        loadEntityContent();
    } else if (stepId.includes('trust')) {
        loadTrustContent();
    }
});

// Helper functions for examples
function validateEntityRequirements() {
    // Custom validation logic
    return true;
}

function trackUserChoice(from, to) {
    // Analytics tracking
    console.log(`User chose ${to} from ${from}`);
}

function loadIndividualContent() {
    console.log('Loading individual-specific content...');
}

function loadEntityContent() {
    console.log('Loading entity-specific content...');
}

function loadTrustContent() {
    console.log('Loading trust-specific content...');
}

// ======================
// EXPORT FOR TESTING
// ======================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        goToStep,
        getBranchingStats,
        validateAndProceed,
        resetForm,
        debugBranchingState,
        logAllSteps,
        customStepLogic
    };
} 