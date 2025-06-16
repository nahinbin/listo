// Debug logging
console.log('Todo list extension loaded');

// Theme Manager
const ThemeManager = {
    init() {
        // Load initial theme
        this.loadTheme();
        
        // Listen for theme changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                if (changes.themeMode || changes.customPrimaryColor || changes.customSecondaryColor) {
                    console.log('Theme settings changed:', changes);
                    this.loadTheme();
                }
            }
        });
    },

    loadTheme() {
        chrome.storage.local.get(['themeMode', 'customPrimaryColor', 'customSecondaryColor'], (result) => {
            console.log('Loading theme settings:', result);
            this.applyThemeMode(result.themeMode || 'system', result.customPrimaryColor, result.customSecondaryColor);
        });
    },

    applyThemeMode(mode, customPrimaryColor, customSecondaryColor) {
        console.log('Applying theme mode:', mode);
        
        // Reset any existing theme
        document.body.classList.remove('dark-mode');
        this.resetCustomTheme();
        
        // Apply the selected theme mode
        if (mode === 'custom' && customPrimaryColor && customSecondaryColor) {
            this.applyCustomTheme(customPrimaryColor, customSecondaryColor);
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
    },

    resetCustomTheme() {
        const root = document.documentElement;
        
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
    },

    applyCustomTheme(primaryColor, secondaryColor) {
        console.log('Applying custom theme:', { primaryColor, secondaryColor });
        
        // Remove dark mode class
        document.body.classList.remove('dark-mode');
        
        // Set custom CSS variables
        const root = document.documentElement;
        root.style.setProperty('--text-primary', primaryColor);
        root.style.setProperty('--bg-primary', secondaryColor);
        root.style.setProperty('--bg-secondary', this.adjustColor(secondaryColor, -10));
        root.style.setProperty('--bg-hover', this.adjustColor(secondaryColor, -20));
        root.style.setProperty('--text-secondary', this.adjustColor(primaryColor, 40));
        root.style.setProperty('--border-color', this.adjustColor(primaryColor, 20));
        root.style.setProperty('--button-hover', primaryColor);
        root.style.setProperty('--button-text-hover', secondaryColor);
        root.style.setProperty('--input-bg', secondaryColor);
        root.style.setProperty('--input-border', this.adjustColor(primaryColor, 20));
        root.style.setProperty('--input-text', primaryColor);
        root.style.setProperty('--placeholder-color', this.adjustColor(primaryColor, 40));
        root.style.setProperty('--scrollbar-track', this.adjustColor(secondaryColor, -5));
        root.style.setProperty('--scrollbar-thumb', this.adjustColor(primaryColor, 20));
        root.style.setProperty('--scrollbar-thumb-hover', this.adjustColor(primaryColor, 30));
        root.style.setProperty('--save-status-bg', secondaryColor);
        root.style.setProperty('--save-status-text', primaryColor);
    },

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
};

// Storage Manager with enhanced saving
const StorageManager = {
    STORAGE_KEY: 'todoListData',
    
    async saveTodos(todos) {
        try {
            console.log('Attempting to save todos:', todos);
            
            // Create data object with metadata
            const data = {
                todos: todos,
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                checksum: this.generateChecksum(todos)
            };
            
            // Save the data
            await chrome.storage.local.set({ [this.STORAGE_KEY]: data });
            console.log('Initial save completed');
            
            // Verify the save
            const verification = await chrome.storage.local.get([this.STORAGE_KEY]);
            if (!verification[this.STORAGE_KEY]) {
                throw new Error('Verification failed - no data found after save');
            }
            
            const savedData = verification[this.STORAGE_KEY];
            if (savedData.checksum !== data.checksum) {
                throw new Error('Verification failed - data mismatch');
            }
            
            console.log('Save verified successfully');
            return true;
        } catch (error) {
            console.error('Save operation failed:', error);
            return false;
        }
    },

    generateChecksum(todos) {
        // Simple checksum to verify data integrity
        return JSON.stringify(todos).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    },

    async loadTodos() {
        try {
            console.log('Attempting to load todos...');
            const result = await chrome.storage.local.get([this.STORAGE_KEY]);
            console.log('Raw storage data:', result);
            
            if (!result[this.STORAGE_KEY]) {
                console.log('No saved data found, initializing new storage');
                await this.saveTodos([]);
                return [];
            }
            
            const data = result[this.STORAGE_KEY];
            const currentChecksum = this.generateChecksum(data.todos);
            
            if (currentChecksum !== data.checksum) {
                console.error('Data integrity check failed');
                throw new Error('Data integrity check failed');
            }
            
            console.log('Todos loaded successfully:', data.todos);
            return data.todos || [];
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    },

    async clearStorage() {
        try {
            await chrome.storage.local.remove([this.STORAGE_KEY]);
            console.log('Storage cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};

// Save status management with enhanced feedback
const SaveStatus = {
    element: null,
    timeout: null,

    init() {
        this.element = document.getElementById('save-status');
        if (!this.element) {
            console.error('Save status element not found!');
            return;
        }
    },

    show(message, isError = false) {
        if (!this.element) return;
        
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.element.textContent = message;
        this.element.className = 'save-status visible' + (isError ? ' error' : '');
        
        // Keep error messages visible longer
        const duration = isError ? 5000 : 3000;
        this.timeout = setTimeout(() => {
            this.element.className = 'save-status';
        }, duration);
    }
};

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Initializing extension...');
    
    try {
        // Initialize theme manager
        ThemeManager.init();
        
        // Initialize SaveStatus
        SaveStatus.init();
        
        // Initialize emoji
        initializeEmoji();
        
        // Load saved lists and setup event listeners
        await ListManager.loadLists();
        ListManager.setupEventListeners();
        
        console.log('Extension initialized successfully');
    } catch (error) {
        console.error('Error initializing extension:', error);
        SaveStatus.show('Error initializing extension', true);
    }
});

// Initialize the todo list
let todos = [];
let isSaving = false;
let lastSavedState = null;

// Get DOM elements
const todoInput = document.getElementById('new-todo');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');
const filterButtons = document.querySelectorAll('.filter-btn');
const saveButton = document.getElementById('save-button');

// Debug check if elements exist
console.log('Input element:', todoInput);
console.log('Add button:', addButton);
console.log('Todo list:', todoList);

// Initialize the extension
async function initializeExtension() {
    console.log('Initializing extension...');
    try {
        SaveStatus.init();
        
        // Load saved todos
        todos = await StorageManager.loadTodos();
        lastSavedState = JSON.stringify(todos);
        console.log('Initial todos loaded:', todos);
        
        // Display todos
        displayTodos();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Extension initialized successfully');
        SaveStatus.show('Data loaded successfully');
    } catch (error) {
        console.error('Error initializing extension:', error);
        SaveStatus.show('Error loading data', true);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Add todo when clicking the add button
    addButton.addEventListener('click', async () => {
        const text = todoInput.value.trim();
        if (text) {
            await addTodo(text);
        }
    });

    // Add todo when pressing Enter
    todoInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const text = todoInput.value.trim();
            if (text) {
                await addTodo(text);
            }
        }
    });

    // Filter button listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTodos();
        });
    });

    // Save button click handler with enhanced feedback
    saveButton.addEventListener('click', async () => {
        if (isSaving) {
            SaveStatus.show('Save in progress...', true);
            return;
        }
        
        isSaving = true;
        saveButton.disabled = true;
        saveButton.style.opacity = '0.5';
        SaveStatus.show('Saving...');
        
        try {
            const saved = await StorageManager.saveTodos(todos);
            if (saved) {
                lastSavedState = JSON.stringify(todos);
                SaveStatus.show('All data saved successfully!');
                console.log('Manual save successful');
            } else {
                throw new Error('Save operation failed');
            }
        } catch (error) {
            console.error('Error during manual save:', error);
            SaveStatus.show('Error saving data - please try again', true);
        } finally {
            isSaving = false;
            saveButton.disabled = false;
            saveButton.style.opacity = '1';
        }
    });

    // Auto-save on changes with state tracking
    const autoSave = async () => {
        if (isSaving) return;
        
        const currentState = JSON.stringify(todos);
        if (currentState === lastSavedState) {
            console.log('No changes to save');
            return;
        }
        
        try {
            const saved = await StorageManager.saveTodos(todos);
            if (saved) {
                lastSavedState = currentState;
                console.log('Auto-save successful');
            } else {
                throw new Error('Auto-save failed');
            }
        } catch (error) {
            console.error('Error during auto-save:', error);
            SaveStatus.show('Error auto-saving data', true);
        }
    };

    // Debounce function for auto-save
    let saveTimeout;
    const debouncedAutoSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(autoSave, 1000);
    };

    // Add auto-save to all todo modifications
    const originalAddTodo = addTodo;
    addTodo = async (text) => {
        await originalAddTodo(text);
        debouncedAutoSave();
    };

    const originalToggleTodo = toggleTodo;
    toggleTodo = async (id) => {
        await originalToggleTodo(id);
        debouncedAutoSave();
    };

    const originalDeleteTodo = deleteTodo;
    deleteTodo = async (id) => {
        await originalDeleteTodo(id);
        debouncedAutoSave();
    };

    // Save before unload
    window.addEventListener('beforeunload', async () => {
        if (JSON.stringify(todos) !== lastSavedState) {
            await StorageManager.saveTodos(todos);
        }
    });
}

// Function to add a new todo
async function addTodo(text) {
    console.log('Adding new todo:', text);
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    console.log('Updated todos array:', todos);

    // Save to storage
    const saved = await StorageManager.saveTodos(todos);
    if (!saved) {
        console.error('Failed to save todo');
        return;
    }

    // Clear input and update display
    todoInput.value = '';
    displayTodos();
}

// Function to toggle todo completion
async function toggleTodo(id) {
    console.log('Toggling todo:', id);
    
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    // Save to storage
    const saved = await StorageManager.saveTodos(todos);
    if (!saved) {
        console.error('Failed to save todo state');
        return;
    }

    displayTodos();
}

// Function to delete todo
async function deleteTodo(id) {
    console.log('Deleting todo:', id);
    
    todos = todos.filter(todo => todo.id !== id);

    // Save to storage
    const saved = await StorageManager.saveTodos(todos);
    if (!saved) {
        console.error('Failed to delete todo');
        return;
    }

    displayTodos();
}

// Function to display todos
function displayTodos() {
    console.log('Displaying todos:', todos);
    
    // Clear the list
    todoList.innerHTML = '';

    if (todos.length === 0) {
        console.log('No todos to display');
        emptyState.style.display = 'block';
        todoList.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    todoList.style.display = 'block';

    // Add each todo to the list
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });

    updateStats();
}

// Functions
function renderTodos() {
    console.log('Rendering todos:', todos); // Debug log
    
    // Clear the list
    todoList.innerHTML = '';
    
    // Filter todos based on current filter
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // Show/hide empty state
    if (filteredTodos.length === 0) {
        emptyState.classList.add('visible');
        todoList.style.display = 'none';
    } else {
        emptyState.classList.remove('visible');
        todoList.style.display = 'flex';
    }

    // Render each todo
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        // Create text span
        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));

        // Append elements
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);
        todoList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    
    totalTasksSpan.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    completedTasksSpan.textContent = `${completed} completed`;
}

// Initialize state
let currentFilter = 'all';

// Initialize emoji display
function initializeEmoji() {
    const emojiIcon = document.getElementById('emojiIcon');
    
    // Load and display saved emoji
    chrome.storage.local.get(['listEmoji'], (result) => {
        if (result.listEmoji && result.listEmoji !== 'none') {
            emojiIcon.textContent = result.listEmoji;
        } else {
            emojiIcon.style.display = 'none';
        }
    });
    
    // Listen for emoji changes
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.listEmoji) {
            const newEmoji = changes.listEmoji.newValue;
            if (newEmoji && newEmoji !== 'none') {
                emojiIcon.textContent = newEmoji;
                emojiIcon.style.display = 'flex';
            } else {
                emojiIcon.style.display = 'none';
            }
        }
    });
}