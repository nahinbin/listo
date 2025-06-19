// List Management
const ListManager = {
    currentStyle: 'tickmarks', // Default style - changed to checkboxes
    draggedElement: null,
    dragOverElement: null,

    // Function to convert numbers to Roman numerals
    toRoman(num) {
        const romanNumerals = [
            { value: 1000, numeral: 'M' },
            { value: 900, numeral: 'CM' },
            { value: 500, numeral: 'D' },
            { value: 400, numeral: 'CD' },
            { value: 100, numeral: 'C' },
            { value: 90, numeral: 'XC' },
            { value: 50, numeral: 'L' },
            { value: 40, numeral: 'XL' },
            { value: 10, numeral: 'X' },
            { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },
            { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' }
        ];

        let result = '';
        for (let i = 0; i < romanNumerals.length; i++) {
            while (num >= romanNumerals[i].value) {
                result += romanNumerals[i].numeral;
                num -= romanNumerals[i].value;
            }
        }
        return result;
    },

    getListPrefix(index) {
        switch (this.currentStyle) {
            case 'none':
                return '';
            case 'numbers':
                return `${index + 1}.`;
            case 'alphabets':
                return `${String.fromCharCode(97 + index)}.`;
            case 'roman':
                return `${this.toRoman(index + 1)}.`;
            case 'bullets':
                return '•';
            case 'tickmarks':
                return '';
            case 'dashes':
                return '— ';
            case 'arrows':
                return '→ ';
            case 'stars':
                return '★ ';
            case 'hearts':
                return '♥ ';
            case 'circles':
                return '● ';
            case 'squares':
                return '■ ';
            case 'diamonds':
                return '◆ ';
            case 'triangles':
                return '▲ ';
            case 'dots':
                return '• ';
            case 'lines':
                return '| ';
            default:
                return `${index + 1}.`;
        }
    },

    // Helper to get content without any prefix
    getContentWithoutPrefix(text) {
        return text.replace(/^(\d+\.\s*|[a-z]\.\s*|[IVXLCMD]+\.\s*|•\s*|—\s*|→\s*|★\s*|♥\s*|●\s*|■\s*|◆\s*|▲\s*|\|\s*)/, '');
    },

    // Drag and Drop functionality
    initDragAndDrop() {
        const container = document.getElementById('listsContainer');
        if (!container) {
            console.log('Container not found for drag and drop');
            return;
        }

        console.log('Initializing drag and drop');
        // No need for dragover/drop events with mouse-based approach
    },

    handleDragOver(e) {
        // Not used in mouse-based approach
    },

    handleDrop(e) {
        // Not used in mouse-based approach
    },

    handleDragLeave(e) {
        // Simple - no complex logic needed
    },

    makeListDraggable(listLine) {
        let isDragging = false;
        let startY = 0;
        let startIndex = 0;
        let draggedElement = null;
        let lastTargetIndex = -1;
        let animationFrameId = null;
        
        // Create a small drag handle on the left
        const dragHandle = document.createElement('div');
        dragHandle.innerHTML = '⋮';
        dragHandle.style.cssText = `
            position: absolute;
            left: 2px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            background: transparent;
            cursor: grab;
            z-index: 10;
            color: #999;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            opacity: 0;
            transition: opacity 0.2s;
        `;
        listLine.appendChild(dragHandle);
        
        // Hover effects for the dots
        listLine.addEventListener('mouseenter', () => {
            dragHandle.style.opacity = '0.8';
        });
        
        listLine.addEventListener('mouseleave', () => {
            dragHandle.style.opacity = '0';
        });
        
        dragHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            startY = e.clientY;
            draggedElement = listLine;
            startIndex = Array.from(listLine.parentNode.children).indexOf(listLine);
            lastTargetIndex = startIndex;
            
            listLine.classList.add('dragging');
            listLine.style.opacity = '0.5';
            listLine.style.transform = 'rotate(2deg)';
            listLine.style.zIndex = '1000';
            listLine.style.transition = 'none';
            
            console.log('Mouse down on drag handle, start index:', startIndex);
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Use requestAnimationFrame for smooth updates
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            animationFrameId = requestAnimationFrame(() => {
                const currentY = e.clientY;
                const container = listLine.parentNode;
                const allLists = Array.from(container.children);
                const currentIndex = allLists.indexOf(draggedElement);
                
                // Find the target position with better precision
                let targetIndex = startIndex;
                const containerRect = container.getBoundingClientRect();
                
                for (let i = 0; i < allLists.length; i++) {
                    const rect = allLists[i].getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    
                    if (currentY < midY) {
                        targetIndex = i;
                        break;
                    }
                }
                
                // Handle dropping at the very end
                if (currentY > containerRect.bottom - 10) {
                    targetIndex = allLists.length;
                }
                
                // Only move if target position actually changed
                if (targetIndex !== lastTargetIndex && targetIndex !== currentIndex) {
                    if (targetIndex === allLists.length) {
                        container.appendChild(draggedElement);
                    } else {
                        container.insertBefore(draggedElement, allLists[targetIndex]);
                    }
                    
                    lastTargetIndex = targetIndex;
                    console.log('Moved from', currentIndex, 'to', targetIndex);
                }
            });
        };
        
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            // Cancel any pending animation frame
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            isDragging = false;
            draggedElement.classList.remove('dragging');
            draggedElement.style.opacity = '';
            draggedElement.style.transform = '';
            draggedElement.style.zIndex = '';
            draggedElement.style.transition = '';
            
            // Only update and save if position actually changed
            if (lastTargetIndex !== startIndex) {
                this.updateListNumbers();
                this.saveLists();
                console.log('Final position saved:', lastTargetIndex);
            }
            
            draggedElement = null;
            console.log('Mouse up, drag ended');
        });
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
            this.currentStyle = result.listStyle || 'tickmarks';
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
                    
                    // Make the list draggable
                    this.makeListDraggable(listLine);
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

            // Make the new list draggable
            this.makeListDraggable(newList);

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
        ListManager.initDragAndDrop(); // Initialize drag and drop
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