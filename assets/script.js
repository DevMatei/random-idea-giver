document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const messages = document.getElementById('messages');
    const spinner = document.getElementById('loading-spinner');
    const themeToggle = document.getElementById('theme-toggle');
    const historyList = document.getElementById('idea-history');
    const newChatBtn = document.getElementById('new-chat');
    
    let ideaHistory = [];

    // Theme handling
    function toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
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
        ideaHistory.slice().reverse().forEach((idea) => {
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
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Add to history and UI
            ideaHistory.push(data.idea);
            localStorage.setItem('ideaHistory', JSON.stringify(ideaHistory));
            addMessageToUI(data.idea);
            updateHistory();

        } catch (error) {
            console.error('Error:', error);
            addMessageToUI('Sorry, failed to generate an idea. Please try again.', false);
        } finally {
            // Reset UI state
            generateBtn.disabled = false;
            spinner.style.display = 'none';
            generateBtn.querySelector('.btn-text').textContent = 'Generate Idea';
        }
    }

    // Event Listeners
    if (generateBtn) {
        generateBtn.addEventListener('click', generateIdea);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        initializeTheme();
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            messages.innerHTML = '';
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <h2>Welcome to IdeaGPT</h2>
                <p>Your AI-powered idea generator. Click "Generate" to get started!</p>
            `;
            messages.appendChild(welcomeDiv);
        });
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem('ideaHistory');
    if (savedHistory) {
        ideaHistory = JSON.parse(savedHistory);
        updateHistory();
    }
});
