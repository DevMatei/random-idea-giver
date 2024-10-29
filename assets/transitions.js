class PageTransitions {
    constructor() {
        this.transition = document.createElement('div');
        this.transition.className = 'page-transition';
        document.body.appendChild(this.transition);
        
        this.initializeLinks();
    }

    initializeLinks() {
        document.querySelectorAll('a').forEach(link => {
            // Skip external links and anchor links
            if (link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
                link.addEventListener('click', (e) => this.handleClick(e));
            }
        });
    }

    async handleClick(e) {
        e.preventDefault();
        const target = e.currentTarget.href;

        // Start transition
        this.transition.classList.add('active');

        // Wait for transition
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to new page
        window.location.href = target;
    }

    onPageLoad() {
        // Exit transition
        this.transition.classList.add('exit');
        
        // Remove transition after animation
        setTimeout(() => {
            this.transition.classList.remove('active', 'exit');
        }, 500);
    }
}

// Initialize transitions
document.addEventListener('DOMContentLoaded', () => {
    const transitions = new PageTransitions();
    transitions.onPageLoad();
}); 