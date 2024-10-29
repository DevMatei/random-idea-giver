document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const messages = document.getElementById('messages');
    const spinner = document.getElementById('loading-spinner');
    const themeToggle = document.getElementById('theme-toggle');
    const historyList = document.getElementById('idea-history');
    const newChatBtn = document.getElementById('new-chat');
    
    let ideaHistory = [];
    let currentIndex = -1;

    // Theme handling
    function toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    // Initialize theme
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Add theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        initializeTheme();
    }

    function addMessageToUI(text, isAI = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function updateHistory() {
        historyList.innerHTML = '';
        ideaHistory.slice().reverse().forEach((idea, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = idea.substring(0, 30) + '...';
            historyItem.addEventListener('click', () => {
                messages.innerHTML = '';
                addMessageToUI(idea);
            });
            historyList.appendChild(historyItem);
        });
    }

    async function generateIdea() {
        try {
            // Update UI state
            generateBtn.disabled = true;
            spinner.style.display = 'inline-block';
            generateBtn.querySelector('.btn-text').textContent = 'Generating...';

            const response = await fetch('/api/generate-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add to history
            ideaHistory.push(data.idea);
            currentIndex = ideaHistory.length - 1;
            
            // Save to localStorage
            localStorage.setItem('ideaHistory', JSON.stringify(ideaHistory));

            // Display with animation
            displayIdea(data.idea);
        } catch (error) {
            console.error('Error:', error);
            displayError('Sorry, failed to generate an idea. Please try again.');
        } finally {
            spinner.style.display = 'none';
            ideaText.style.display = 'block';
            generateBtn.disabled = false;
        }
    }

    function displayIdea(text) {
        ideaText.classList.remove('fade-in');
        // Trigger reflow
        void ideaText.offsetWidth;
        ideaText.textContent = text;
        ideaText.classList.add('fade-in');
    }

    function displayError(message) {
        ideaText.style.color = '#e74c3c';
        ideaText.textContent = message;
        setTimeout(() => {
            ideaText.style.color = '#555';
        }, 3000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!generateBtn.disabled) {
                generateIdea();
            }
        }
    });

    // Load history from localStorage
    const savedHistory = localStorage.getItem('ideaHistory');
    if (savedHistory) {
        ideaHistory = JSON.parse(savedHistory);
        currentIndex = ideaHistory.length - 1;
        if (currentIndex >= 0) {
            displayIdea(ideaHistory[currentIndex]);
        }
    }

    generateBtn.addEventListener('click', generateIdea);

    // Update active navigation link
    const currentPage = window.location.pathname;
    document.querySelectorAll('.footer-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});
