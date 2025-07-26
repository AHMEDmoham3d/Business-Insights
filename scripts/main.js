// Main JavaScript functionality for Business Insights Hub

class BusinessInsightsHub {
    constructor() {
        this.articles = window.articlesData || [];
        this.filteredArticles = [...this.articles];
        this.articlesPerPage = 6;
        this.currentPage = 1;
        this.currentCategory = '';
        this.currentSort = 'newest';
        this.searchQuery = '';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderArticles();
        this.setupScrollAnimations();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Search functionality
        const heroSearch = document.getElementById('heroSearch');
        if (heroSearch) {
            heroSearch.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            heroSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Category filtering
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // Sort filtering
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.handleSortFilter(e.target.value);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });

        // Navigation
        this.setupNavigation();

        // Modal close events
        const modal = document.getElementById('articleModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeArticleModal();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeArticleModal();
            }
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                this.scrollToSection(target);
                this.setActiveNavLink(link);
            });
        });

        // Handle scroll for active nav states
        window.addEventListener('scroll', () => {
            this.handleScrollNavigation();
        });
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-active');
                mobileToggle.classList.toggle('active');
            });
        }
    }

    scrollToSection(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    setActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    handleScrollNavigation() {
        const sections = ['home', 'categories', 'articles', 'partnerships', 'about'];
        const headerHeight = document.querySelector('.header').offsetHeight;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            const navLink = document.querySelector(`[href="#${sectionId}"]`);
            
            if (section && navLink) {
                const sectionTop = section.getBoundingClientRect().top;
                const sectionBottom = section.getBoundingClientRect().bottom;
                
                if (sectionTop <= headerHeight + 100 && sectionBottom >= headerHeight + 100) {
                    this.setActiveNavLink(navLink);
                }
            }
        });
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    performSearch() {
        const articlesSection = document.getElementById('articles');
        if (articlesSection) {
            this.scrollToSection('#articles');
            this.applyFilters();
        }
    }

    handleCategoryFilter(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.applyFilters();
    }

    handleSortFilter(sort) {
        this.currentSort = sort;
        this.applyFilters();
    }

    filterByCategory(category) {
        // Update the category filter dropdown
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        
        // Apply the filter
        this.handleCategoryFilter(category);
        
        // Scroll to articles section
        this.scrollToSection('#articles');
    }

    applyFilters() {
        let filtered = [...this.articles];

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(this.searchQuery) ||
                article.summary.toLowerCase().includes(this.searchQuery) ||
                article.category.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply category filter
        if (this.currentCategory) {
            filtered = filtered.filter(article => article.category === this.currentCategory);
        }

        // Apply sorting
        filtered = this.sortArticles(filtered, this.currentSort);

        this.filteredArticles = filtered;
        this.currentPage = 1;
        this.renderArticles();
    }

    sortArticles(articles, sortType) {
        switch (sortType) {
            case 'newest':
                return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'oldest':
                return articles.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'title':
                return articles.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return articles;
        }
    }

    renderArticles() {
        const articlesGrid = document.getElementById('articlesGrid');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (!articlesGrid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.articlesPerPage;
        const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);

        if (articlesToShow.length === 0) {
            articlesGrid.innerHTML = `
                <div class="no-articles">
                    <h3>No articles found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        articlesGrid.innerHTML = articlesToShow.map(article => this.createArticleCard(article)).join('');

        // Show/hide load more button
        if (loadMoreBtn) {
            if (endIndex >= this.filteredArticles.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }

        // Add click listeners to article cards
        this.addArticleClickListeners();

        // Animate articles
        this.animateArticles();
    }

    createArticleCard(article) {
        const categoryNames = {
            'strategy': 'Business Strategy',
            'marketing': 'Marketing & Sales',
            'finance': 'Business Strategy',
            'leadership': 'Leadership & Management',
            'technology': 'Technology & Innovation',
            'operations': 'Operations & Efficiency'
        };

        const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <article class="article-card" data-article-id="${article.id}">
                <img src="${article.image}" alt="${article.title}" class="article-image" loading="lazy">
                <div class="article-content">
                    <span class="article-category">${categoryNames[article.category] || article.category}</span>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-summary">${article.summary}</p>
                    <div class="article-meta">
                        <span class="publish-date">${formattedDate}</span>
                        <span class="read-time">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${article.readTime}
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    addArticleClickListeners() {
        const articleCards = document.querySelectorAll('.article-card');
        articleCards.forEach(card => {
            card.addEventListener('click', () => {
                const articleId = parseInt(card.getAttribute('data-article-id'));
                this.openArticleModal(articleId);
            });
        });
    }

    openArticleModal(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        const modal = document.getElementById('articleModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;

        const categoryNames = {
            'strategy': 'Business Strategy',
            'marketing': 'Marketing & Sales',
            'finance': 'Business Strategy',
            'leadership': 'Leadership & Management',
            'technology': 'Technology & Innovation',
            'operations': 'Operations & Efficiency'
        };

        const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        modalContent.innerHTML = `
            <h2 class="modal-article-title">${article.title}</h2>
            <div class="modal-article-meta">
                <span class="article-category">${categoryNames[article.category] || article.category}</span>
                <span class="publish-date">${formattedDate}</span>
                <span class="read-time">${article.readTime}</span>
            </div>
            <div class="modal-article-content">
                ${article.content}
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeArticleModal() {
        const modal = document.getElementById('articleModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    loadMoreArticles() {
        this.currentPage++;
        this.renderArticles();
    }

    animateArticles() {
        const articleCards = document.querySelectorAll('.article-card');
        articleCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.category-card, .about-grid, .footer-section');
        animatedElements.forEach(el => observer.observe(el));
    }
}

// Global functions for HTML onclick handlers
window.performSearch = function() {
    if (window.businessHub) {
        window.businessHub.performSearch();
    }
};

window.filterByCategory = function(category) {
    if (window.businessHub) {
        window.businessHub.filterByCategory(category);
    }
};

window.closeArticleModal = function() {
    if (window.businessHub) {
        window.businessHub.closeArticleModal();
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.businessHub = new BusinessInsightsHub();
});

// Handle smooth scrolling for hash links
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && window.businessHub) {
        window.businessHub.scrollToSection(hash);
    }
});
window.addEventListener("DOMContentLoaded", () => {
  const animatedSections = document.querySelectorAll(".animate-fade");
  animatedSections.forEach((el, index) => {
    // تأخير بسيط بين كل عنصر والتاني
    el.style.animationDelay = `${index * 0.3}s`;
  });
});
