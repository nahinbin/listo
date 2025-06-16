// List Management
const ListManager = {
    currentStyle: 'numbers', // Default style

    getListPrefix(index) {
        switch (this.currentStyle) {
            case 'numbers':
                return `${index + 1}.`;
            case 'alphabets':
                return `${String.fromCharCode(97 + index)}.`;
            case 'bullets':
                return '•';
            case 'tickmarks':
                return '';
            default:
                return `${index + 1}.`;
        }
    },

    // Helper to get content without any prefix
    getContentWithoutPrefix(text) {
        return text.replace(/^(\d+\.\s*|[a-z]\.\s*|•\s*)/, '');
    },

    async saveLists() {
        try {
            const lists = {};
            document.querySelectorAll('.list-content').forEach(list => {
                const id = list.dataset.listId;
                const content = this.getContentWithoutPrefix(list.textContent);
                // Only save non-empty lists
                if (content.trim()) {
                    lists[id] = {
                        content: content,
                        completed: list.classList.contains('completed')
                    };
                }
            });
            
            await chrome.storage.local.set({ 
                lists,
                listStyle: this.currentStyle 
            });
            console.log('Lists saved successfully:', lists);
            return true;
        } catch (error) {
            console.error('Error saving lists:', error);
            return false;
        }
    },

    async loadLists() {
        try {
            const result = await chrome.storage.local.get(['lists', 'listStyle']);
            const lists = result.lists || {};
            this.currentStyle = result.listStyle || 'numbers';
            console.log('Loaded lists:', lists);
            
            const container = document.getElementById('listsContainer');
            container.innerHTML = ''; // Clear existing lists

            // Only create list elements for non-empty lists
            Object.entries(lists).forEach(([id, data], index) => {
                if (data.content && data.content.trim()) {
                    const listLine = document.createElement('div');
                    listLine.className = 'list-line';

                    const content = document.createElement('div');
                    content.className = 'list-content';
                    content.contentEditable = true;
                    content.dataset.listId = id;
                    content.dataset.style = this.currentStyle;
                    content.dataset.prefix = this.getListPrefix(index);
                    content.textContent = data.content;
                    content.spellcheck = true;

                    // Create checkbox for tickmarks style
                    if (this.currentStyle === 'tickmarks') {
                        const checkbox = document.createElement('div');
                        checkbox.className = 'list-checkbox';
                        if (data.completed) {
                            checkbox.classList.add('checked');
                            content.classList.add('completed');
                        }
                        
                        checkbox.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            checkbox.classList.toggle('checked');
                            content.classList.toggle('completed');
                            this.saveLists();
                        });
                        listLine.appendChild(checkbox);
                    }

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.dataset.action = 'delete';
                    deleteBtn.title = 'Delete list';
                    deleteBtn.textContent = '-';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteList(deleteBtn);
                    });

                    listLine.appendChild(content);
                    listLine.appendChild(deleteBtn);
                    container.appendChild(listLine);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error loading lists:', error);
            return false;
        }
    },

    deleteList(button) {
        try {
            const listLine = button.closest('.list-line');
            if (!listLine) return;
            
            listLine.remove();
            this.updateListNumbers();
            this.saveLists();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    },

    updateListNumbers() {
        const lists = document.querySelectorAll('.list-content');
        lists.forEach((list, index) => {
            // Get the current content without any prefix
            let content = list.textContent;
            // Remove any existing prefix (numbers, alphabets, bullets)
            content = content.replace(/^(\d+\.\s*|[a-z]\.\s*|•\s*)/, '');
            
            // Update the list ID and prefix
            list.dataset.listId = index + 1;
            list.dataset.prefix = this.getListPrefix(index);
            
            // Set the content without the prefix (the prefix will be added by CSS)
            list.textContent = content;
        });
    },

    async addNewList() {
        try {
            const container = document.getElementById('listsContainer');
            if (!container) {
                throw new Error('Container not found');
            }

            const currentLists = container.getElementsByClassName('list-line');
            const newNumber = currentLists.length + 1;

            const newList = document.createElement('div');
            newList.className = 'list-line';

            const content = document.createElement('div');
            content.className = 'list-content';
            content.contentEditable = true;
            content.dataset.listId = newNumber;
            content.dataset.style = this.currentStyle;
            content.dataset.prefix = this.getListPrefix(currentLists.length);
            content.textContent = ''; // Start with empty content
            content.spellcheck = true;

            // Create checkbox for tickmarks style
            if (this.currentStyle === 'tickmarks') {
                const checkbox = document.createElement('div');
                checkbox.className = 'list-checkbox';
                checkbox.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    checkbox.classList.toggle('checked');
                    content.classList.toggle('completed');
                    this.saveLists();
                });
                newList.appendChild(checkbox);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.action = 'delete';
            deleteBtn.title = 'Delete list';
            deleteBtn.textContent = '-';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteList(deleteBtn);
            });

            newList.appendChild(content);
            newList.appendChild(deleteBtn);
            container.appendChild(newList);

            content.focus();
            const range = document.createRange();
            range.selectNodeContents(content);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            await this.saveLists();
        } catch (error) {
            console.error('Error adding new list:', error);
        }
    },

    toggleCompletion(list) {
        console.log('Toggling completion for list:', list);
        if (this.currentStyle === 'tickmarks') {
            console.log('Current style is tickmarks, proceeding with toggle');
            list.classList.toggle('completed');
            console.log('ClassList after toggle:', list.classList.toString());
            const content = this.getContentWithoutPrefix(list.textContent);
            list.textContent = content;
            this.saveLists();
        }
    },

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Handle content editable input
        document.addEventListener('input', (event) => {
            const list = event.target.closest('.list-content');
            if (!list) return;

            // Get the current content without any prefix
            let content = list.textContent;
            // Remove any existing prefix (numbers, alphabets, bullets)
            content = content.replace(/^(\d+\.\s*|[a-z]\.\s*|•\s*)/, '');
            
            // Update the content without the prefix
            list.textContent = content;
            
            // Update the prefix in the dataset
            const index = Array.from(document.querySelectorAll('.list-content')).indexOf(list);
            list.dataset.prefix = this.getListPrefix(index);

            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => this.saveLists(), 500);
        });

        // Handle clicks on the container
        document.getElementById('listsContainer').addEventListener('click', (event) => {
            const list = event.target.closest('.list-content');
            if (!list) return;
            
            // Only handle clicks on the list content itself
            if (event.target === list) {
                if (this.currentStyle === 'tickmarks') {
                    const rect = list.getBoundingClientRect();
                    const clickX = event.clientX - rect.left;
                    
                    // If clicked within the checkbox area (first 28px)
                    if (clickX <= 28) {
                        list.classList.toggle('completed');
                        this.saveLists();
                    }
                }
            }
        });

        // Listen for style changes
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.listStyle) {
                console.log('List style changed to:', changes.listStyle.newValue);
                this.currentStyle = changes.listStyle.newValue;
                // Update all lists with new style
                const container = document.getElementById('listsContainer');
                container.innerHTML = ''; // Clear existing lists
                this.loadLists(); // Reload lists with new style
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ListManager.loadLists().then(() => {
        ListManager.setupEventListeners();
        // Attach add button event listener only once
        const addBtn = document.getElementById('addListBtn');
        if (addBtn && !addBtn.hasAttribute('data-listener')) {
            addBtn.addEventListener('click', () => {
                ListManager.addNewList();
            });
            addBtn.setAttribute('data-listener', 'true');
        }
    });
}); 