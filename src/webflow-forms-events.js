// Event handlers for searchable country dropdowns

const CountryDropdownEvents = {
    
    // Attach all event listeners for searchable country select
    attachSearchableEvents: function(searchInput, dropdownList, hiddenSelect, countries, originalField) {
        console.log('Attaching searchable events');
        
        try {
            // Show dropdown on focus
            searchInput.addEventListener('focus', () => {
                console.log('Search input focused');
                dropdownList.style.display = 'block';
                this.filterCountryOptions('', dropdownList, countries);
            });
            
            // Hide dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && 
                    !dropdownList.contains(e.target) && 
                    !e.target.closest('[data-country-select-container="true"]')) {
                    dropdownList.style.display = 'none';
                }
            });
            
            // Filter options as user types
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                console.log('Filtering countries for:', searchTerm);
                
                this.filterCountryOptions(searchTerm, dropdownList, countries);
                dropdownList.style.display = 'block';
                
                // Clear selection if input doesn't match any country
                if (hiddenSelect.value && !this.findMatchingCountry(searchTerm, countries)) {
                    hiddenSelect.value = '';
                    this.triggerEvent(searchInput, 'countrySelectionCleared');
                }
            });
            
            // Handle keyboard navigation
            searchInput.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e, dropdownList, searchInput, hiddenSelect);
            });
            
            // Add click handlers to dropdown options
            this.attachOptionClickHandlers(dropdownList, searchInput, hiddenSelect);
            
            console.log('All searchable events attached successfully');
            
        } catch (error) {
            console.error('Error attaching searchable events:', error);
        }
    },

    // Filter country options based on search term
    filterCountryOptions: function(searchTerm, dropdownList, countries) {
        const options = dropdownList.querySelectorAll('[data-country-option="true"]');
        const search = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        options.forEach((option, index) => {
            if (index < countries.length) {
                const country = countries[index];
                const matches = search === '' || country.searchText.includes(search);
                
                option.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            }
        });
        
        console.log(`Filtered countries: ${visibleCount} visible out of ${countries.length}`);
    },

    // Find matching country from search term
    findMatchingCountry: function(searchTerm, countries) {
        const search = searchTerm.toLowerCase().trim();
        return countries.find(country => 
            country.searchText.includes(search) ||
            country.name.toLowerCase() === search ||
            country.countryCode.toLowerCase() === search
        );
    },

    // Handle keyboard navigation
    handleKeyboardNavigation: function(e, dropdownList, searchInput, hiddenSelect) {
        const visibleOptions = Array.from(dropdownList.querySelectorAll('[data-country-option="true"]'))
            .filter(option => option.style.display !== 'none');
        
        if (visibleOptions.length === 0) return;
        
        let currentIndex = this.getCurrentHighlightedIndex(visibleOptions);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, visibleOptions.length - 1);
                this.highlightOption(visibleOptions, currentIndex);
                dropdownList.style.display = 'block';
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                this.highlightOption(visibleOptions, currentIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0 && visibleOptions[currentIndex]) {
                    this.selectCountryOption(visibleOptions[currentIndex], searchInput, hiddenSelect, dropdownList);
                }
                break;
                
            case 'Escape':
                dropdownList.style.display = 'none';
                searchInput.blur();
                break;
        }
    },

    // Get current highlighted option index
    getCurrentHighlightedIndex: function(options) {
        return options.findIndex(option => 
            option.style.backgroundColor === 'rgb(245, 245, 245)' || 
            option.classList.contains('highlighted')
        );
    },

    // Highlight specific option
    highlightOption: function(options, index) {
        options.forEach((option, i) => {
            if (i === index) {
                option.style.backgroundColor = '#f5f5f5';
                option.classList.add('highlighted');
                option.scrollIntoView({ block: 'nearest' });
            } else {
                option.style.backgroundColor = '';
                option.classList.remove('highlighted');
            }
        });
    },

    // Attach click handlers to dropdown options
    attachOptionClickHandlers: function(dropdownList, searchInput, hiddenSelect) {
        // Use event delegation for better performance
        dropdownList.addEventListener('click', (e) => {
            const option = e.target.closest('[data-country-option="true"]');
            if (option) {
                this.selectCountryOption(option, searchInput, hiddenSelect, dropdownList);
            }
        });
    },

    // Select a country option
    selectCountryOption: function(option, searchInput, hiddenSelect, dropdownList) {
        try {
            const value = option.dataset.value;
            const displayText = option.textContent;
            const countryData = {
                value: value,
                name: option.dataset.countryName,
                code: option.dataset.countryCode,
                flag: option.dataset.countryFlag,
                displayText: displayText
            };
            
            console.log('Selecting country:', countryData);
            
            // Update inputs
            searchInput.value = displayText;
            hiddenSelect.value = value;
            
            // Hide dropdown
            dropdownList.style.display = 'none';
            
            // Trigger custom event
            this.triggerEvent(searchInput, 'countrySelected', countryData);
            
            // Trigger change event on hidden select for form handling
            this.triggerChangeEvent(hiddenSelect);
            
            console.log('Country selection completed');
            
        } catch (error) {
            console.error('Error selecting country option:', error);
        }
    },

    // Trigger custom event
    triggerEvent: function(element, eventName, detail = {}) {
        try {
            const event = new CustomEvent(`webflowField:${eventName}`, {
                bubbles: true,
                detail: { ...detail, field: element }
            });
            element.dispatchEvent(event);
        } catch (error) {
            console.warn('Error triggering event:', eventName, error);
        }
    },

    // Trigger native change event
    triggerChangeEvent: function(element) {
        try {
            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);
        } catch (error) {
            console.warn('Error triggering change event:', error);
        }
    }
};

// Export the events object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountryDropdownEvents;
}

// Attach to window for browser usage
if (typeof window !== 'undefined') {
    window.CountryDropdownEvents = CountryDropdownEvents;
} 