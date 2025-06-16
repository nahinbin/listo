// Initialize theme mode select
function initializeThemeModeSelect() {
    const button = document.getElementById('themeModeButton');
    const dropdown = document.getElementById('themeModeOptions');
    const options = dropdown.querySelectorAll('.select-option');
    const selectedOption = button.querySelector('.selected-option');
    const customColors = document.getElementById('customColors');
    const primaryColorPicker = document.getElementById('primaryColor');
    const secondaryColorPicker = document.getElementById('secondaryColor');

    if (!button || !dropdown) {
        console.error('Theme mode select elements not found');
        return;
    }

    // Load saved theme mode preference
    chrome.storage.local.get(['themeMode', 'customPrimaryColor', 'customSecondaryColor'], (result) => {
        // Set default theme mode if none exists
        const themeMode = result.themeMode || 'system';
        const option = dropdown.querySelector(`[data-value="${themeMode}"]`);
        if (option) {
            options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
            option.setAttribute('aria-selected', 'true');
            selectedOption.textContent = option.textContent;
            
            // Show/hide custom colors based on mode
            customColors.style.display = themeMode === 'custom' ? 'flex' : 'none';

            // Apply the appropriate theme
            applyThemeMode(themeMode, result.customPrimaryColor, result.customSecondaryColor);
        }

        // Set color picker values
        if (result.customPrimaryColor) {
            primaryColorPicker.value = result.customPrimaryColor;
        }
        if (result.customSecondaryColor) {
            secondaryColorPicker.value = result.customSecondaryColor;
        }
    });

    // Toggle dropdown
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        dropdown.hidden = isExpanded;
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            const value = option.dataset.value;
            const text = option.textContent;

            // Update button text and ARIA attributes
            selectedOption.textContent = text;
            options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
            option.setAttribute('aria-selected', 'true');

            // Show/hide custom colors based on mode
            customColors.style.display = value === 'custom' ? 'flex' : 'none';

            // Save preference and apply theme
            chrome.storage.local.set({ themeMode: value }, () => {
                applyThemeMode(value, primaryColorPicker.value, secondaryColorPicker.value);
            });
        });
    });

    // Handle color picker changes
    function handleColorChange() {
        const currentMode = selectedOption.textContent.toLowerCase();
        if (currentMode === 'custom') {
            const primaryColor = primaryColorPicker.value;
            const secondaryColor = secondaryColorPicker.value;
            applyCustomTheme(primaryColor, secondaryColor);
            chrome.storage.local.set({
                customPrimaryColor: primaryColor,
                customSecondaryColor: secondaryColor
            });
        }
    }

    // Add input event listeners for real-time updates
    primaryColorPicker.addEventListener('input', handleColorChange);
    secondaryColorPicker.addEventListener('input', handleColorChange);
    // Keep change event for final value
    primaryColorPicker.addEventListener('change', handleColorChange);
    secondaryColorPicker.addEventListener('change', handleColorChange);

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!button.contains(event.target) && !dropdown.contains(event.target)) {
            button.setAttribute('aria-expanded', 'false');
            dropdown.hidden = true;
        }
    });
}

// Apply theme mode
function applyThemeMode(mode, customPrimaryColor, customSecondaryColor) {
    console.log('Applying theme mode:', mode);
    
    // Reset any existing theme
    document.body.classList.remove('dark-mode');
    resetCustomTheme();
    
    // Apply the selected theme mode
    if (mode === 'custom' && customPrimaryColor && customSecondaryColor) {
        applyCustomTheme(customPrimaryColor, customSecondaryColor);
    } else if (mode === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (mode === 'light') {
        // Light mode is the default, just ensure dark mode is removed
        document.body.classList.remove('dark-mode');
    } else {
        // System mode
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', prefersDark);
    }
}

// Reset custom theme variables
function resetCustomTheme() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(document.body);
    
    // Reset all custom theme variables to their default values
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-secondary');
    root.style.removeProperty('--bg-hover');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--button-hover');
    root.style.removeProperty('--button-text-hover');
    root.style.removeProperty('--input-bg');
    root.style.removeProperty('--input-border');
    root.style.removeProperty('--input-text');
    root.style.removeProperty('--placeholder-color');
    root.style.removeProperty('--scrollbar-track');
    root.style.removeProperty('--scrollbar-thumb');
    root.style.removeProperty('--scrollbar-thumb-hover');
    root.style.removeProperty('--save-status-bg');
    root.style.removeProperty('--save-status-text');
}

// Apply custom theme colors
function applyCustomTheme(primaryColor, secondaryColor) {
    console.log('Applying custom theme:', { primaryColor, secondaryColor });
    
    // Remove dark mode class
    document.body.classList.remove('dark-mode');
    
    // Set custom CSS variables
    const root = document.documentElement;
    root.style.setProperty('--text-primary', primaryColor);
    root.style.setProperty('--bg-primary', secondaryColor);
    root.style.setProperty('--bg-secondary', adjustColor(secondaryColor, -10));
    root.style.setProperty('--bg-hover', adjustColor(secondaryColor, -20));
    root.style.setProperty('--text-secondary', adjustColor(primaryColor, 40));
    root.style.setProperty('--border-color', adjustColor(primaryColor, 20));
    root.style.setProperty('--button-hover', primaryColor);
    root.style.setProperty('--button-text-hover', secondaryColor);
    root.style.setProperty('--input-bg', secondaryColor);
    root.style.setProperty('--input-border', adjustColor(primaryColor, 20));
    root.style.setProperty('--input-text', primaryColor);
    root.style.setProperty('--placeholder-color', adjustColor(primaryColor, 40));
    root.style.setProperty('--scrollbar-track', adjustColor(secondaryColor, -5));
    root.style.setProperty('--scrollbar-thumb', adjustColor(primaryColor, 20));
    root.style.setProperty('--scrollbar-thumb-hover', adjustColor(primaryColor, 30));
    root.style.setProperty('--save-status-bg', secondaryColor);
    root.style.setProperty('--save-status-text', primaryColor);
    root.style.setProperty('--save-status-error-bg', '#ffebee');
    root.style.setProperty('--save-status-error-text', '#d32f2f');
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Initialize custom select
function initializeCustomSelect() {
    const button = document.getElementById('listStyleButton');
    const dropdown = document.getElementById('listStyleOptions');
    const options = dropdown.querySelectorAll('.select-option');
    const selectedOption = button.querySelector('.selected-option');

    if (!button || !dropdown) {
        console.error('Custom select elements not found');
        return;
    }

    // Set initial ARIA attributes
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('role', 'listbox');
    options.forEach(option => {
        option.setAttribute('role', 'option');
        option.setAttribute('tabindex', '-1');
    });

    // Load saved list style preference
    chrome.storage.local.get(['listStyle'], (result) => {
        if (result.listStyle) {
            const option = dropdown.querySelector(`[data-value="${result.listStyle}"]`);
            if (option) {
                options.forEach(opt => {
                    opt.setAttribute('aria-selected', 'false');
                    opt.setAttribute('tabindex', '-1');
                });
                option.setAttribute('aria-selected', 'true');
                option.setAttribute('tabindex', '0');
                selectedOption.textContent = option.textContent;
                button.setAttribute('aria-activedescendant', option.id);
            }
        }
    });

    // Toggle dropdown
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        dropdown.hidden = isExpanded;
        
        if (!isExpanded) {
            // Focus the selected option when opening
            const selectedOption = dropdown.querySelector('[aria-selected="true"]');
            if (selectedOption) {
                selectedOption.focus();
            }
        }
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            const value = option.dataset.value;
            const text = option.textContent;

            // Update button text and ARIA attributes
            selectedOption.textContent = text;
            button.setAttribute('aria-activedescendant', option.id);

            // Update selected state
            options.forEach(opt => {
                opt.setAttribute('aria-selected', 'false');
                opt.setAttribute('tabindex', '-1');
            });
            option.setAttribute('aria-selected', 'true');
            option.setAttribute('tabindex', '0');

            // Save preference
            chrome.storage.local.set({ listStyle: value });

            // Close dropdown and focus button
            button.setAttribute('aria-expanded', 'false');
            dropdown.hidden = true;
            button.focus();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!button.contains(event.target) && !dropdown.contains(event.target)) {
            button.setAttribute('aria-expanded', 'false');
            dropdown.hidden = true;
        }
    });

    // Handle keyboard navigation
    button.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'Enter':
            case ' ':
            case 'ArrowDown':
                event.preventDefault();
                if (button.getAttribute('aria-expanded') === 'false') {
                    button.click();
                }
                break;
            case 'Escape':
                event.preventDefault();
                button.setAttribute('aria-expanded', 'false');
                dropdown.hidden = true;
                button.focus();
                break;
        }
    });

    dropdown.addEventListener('keydown', (event) => {
        const currentOption = document.activeElement;
        const currentIndex = Array.from(options).indexOf(currentOption);

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (currentIndex < options.length - 1) {
                    currentOption.setAttribute('tabindex', '-1');
                    options[currentIndex + 1].setAttribute('tabindex', '0');
                    options[currentIndex + 1].focus();
                    button.setAttribute('aria-activedescendant', options[currentIndex + 1].id);
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (currentIndex > 0) {
                    currentOption.setAttribute('tabindex', '-1');
                    options[currentIndex - 1].setAttribute('tabindex', '0');
                    options[currentIndex - 1].focus();
                    button.setAttribute('aria-activedescendant', options[currentIndex - 1].id);
                }
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                currentOption.click();
                break;
            case 'Escape':
                event.preventDefault();
                button.setAttribute('aria-expanded', 'false');
                dropdown.hidden = true;
                button.focus();
                break;
            case 'Tab':
                event.preventDefault();
                button.setAttribute('aria-expanded', 'false');
                dropdown.hidden = true;
                button.focus();
                break;
        }
    });
}

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Settings page loaded');
    initializeCustomSelect();
    initializeThemeModeSelect();
    initializeEmojiSettings();
});

function initializeEmojiSettings() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiOptions = document.getElementById('emojiOptions');
    const selectedOption = emojiButton.querySelector('.selected-option');

    // Load saved emoji
    chrome.storage.local.get(['listEmoji'], (result) => {
        if (result.listEmoji) {
            selectedOption.textContent = result.listEmoji === 'none' ? 'None' : result.listEmoji;
        }
    });

    // Toggle dropdown
    emojiButton.addEventListener('click', () => {
        const isExpanded = emojiButton.getAttribute('aria-expanded') === 'true';
        emojiButton.setAttribute('aria-expanded', !isExpanded);
        emojiOptions.hidden = isExpanded;
    });

    // Handle option selection
    emojiOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.select-option');
        if (!option) return;

        const value = option.dataset.value;
        selectedOption.textContent = value === 'none' ? 'None' : value;
        
        // Save selection
        chrome.storage.local.set({ listEmoji: value });
        
        // Update all options
        emojiOptions.querySelectorAll('.select-option').forEach(opt => {
            opt.setAttribute('aria-selected', opt === option);
        });
        
        // Close dropdown
        emojiButton.setAttribute('aria-expanded', 'false');
        emojiOptions.hidden = true;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiButton.contains(e.target)) {
            emojiButton.setAttribute('aria-expanded', 'false');
            emojiOptions.hidden = true;
        }
    });
} 