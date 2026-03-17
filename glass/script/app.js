class HubApp {
    constructor() {
        this.config = {
            dataPath: '/glass/data/hosting.json',
            linksPath: '/glass/data/links.json',
            exitOverlayDuration: 1500,
            searchDebounceDelay: 150,
            retryAttempts: 3,
            retryDelay: 1000
        };

        this.state = {
            services: [],
            links: [],
            filteredServices: [],
            viewMode: 'user',
            isLoading: true,
            searchTerm: '',
            retryCount: 0
        };

        this.elements = {
            loader: null,
            app: null,
            servicesGrid: null,
            searchInput: null,
            clearSearch: null,
            serviceCount: null,
            viewIndicator: null,
            errorState: null,
            retryBtn: null,
            exitOverlay: null,
            telemetryDashboard: null,
            linksSection: null,
            linksContainer: null
        };

        this.handleSearch = this.debounce(this.handleSearch.bind(this), this.config.searchDebounceDelay);
        this.handleServiceClick = this.handleServiceClick.bind(this);
        this.handleRetry = this.handleRetry.bind(this);
        this.handleClearSearch = this.handleClearSearch.bind(this);
    }

    async init() {
        this.detectViewMode();
        this.cacheElements();
        this.attachEventListeners();
        await this.loadData();
    }

    detectViewMode() {
        this.state.viewMode = window.location.pathname.includes('/admin') ? 'admin' : 'user';
    }

    cacheElements() {
        this.elements = {
            loader: document.getElementById('loader'),
            app: document.getElementById('app'),
            servicesGrid: document.getElementById('services-grid'),
            searchInput: document.getElementById('search-input'),
            clearSearch: document.getElementById('clear-search'),
            serviceCount: document.getElementById('service-count'),
            viewIndicator: document.getElementById('view-indicator'),
            errorState: document.getElementById('error-state'),
            retryBtn: document.getElementById('retry-btn'),
            exitOverlay: document.getElementById('exit-overlay'),
            telemetryDashboard: document.getElementById('telemetry-dashboard'),
            linksSection: document.getElementById('links-section'),
            linksContainer: document.getElementById('links-container')
        };
    }

    attachEventListeners() {
        this.elements.searchInput?.addEventListener('input', this.handleSearch);
        this.elements.clearSearch?.addEventListener('click', this.handleClearSearch);
        this.elements.retryBtn?.addEventListener('click', this.handleRetry);

        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.elements.searchInput?.focus();
            }
            if (e.key === 'Escape') {
                this.elements.searchInput?.blur();
                this.handleClearSearch();
            }
        });
    }

    async loadData() {
        try {
            const [servicesRes, linksRes] = await Promise.all([
                fetch(this.config.dataPath),
                fetch(this.config.linksPath)
            ]);

            if (!servicesRes.ok) throw new Error(`Services HTTP ${servicesRes.status}`);
            if (!linksRes.ok) throw new Error(`Links HTTP ${linksRes.status}`);

            const [servicesData, linksData] = await Promise.all([
                servicesRes.json(),
                linksRes.json()
            ]);

            this.state.services = servicesData.services || [];
            this.state.links = linksData.categories || [];

            this.filterServicesByView();
            this.renderServices();
            this.renderLinks();
            this.updateUIForView();
            this.showApp();

        } catch (error) {
            console.error('Failed to load data:', error);
            if (this.state.retryCount < this.config.retryAttempts) {
                this.state.retryCount++;
                setTimeout(() => this.loadData(), this.config.retryDelay);
            } else {
                this.showError();
            }
        }
    }

    filterServicesByView() {
        this.state.filteredServices = this.state.services.filter(
            this.state.viewMode === 'admin' 
                ? s => s.view_type === 'Admin' || s.view_type === 'Both'
                : s => s.view_type === 'User' || s.view_type === 'Both'
        );
    }

    renderServices() {
        if (!this.elements.servicesGrid) return;

        this.elements.servicesGrid.innerHTML = '';
        this.getDisplayServices().forEach(service => {
            this.elements.servicesGrid.appendChild(this.createServiceCard(service));
        });
        this.updateServiceCount();
    }

    renderLinks() {
        if (!this.state.links.length || !this.elements.linksContainer) return;

        this.elements.linksSection.classList.remove('hidden');
        this.elements.linksContainer.innerHTML = this.state.links.map(category => `
            <div class="link-category">
                <div class="category-header">
                    <i class="${category.icon}"></i>
                    <h3>${this.escapeHtml(category.name)}</h3>
                </div>
                <div class="link-grid">
                    ${category.links.map(link => `
                        <a href="${link.url}" 
                           class="link-card" 
                           data-external="true"
                           rel="noopener noreferrer">
                            <i class="${link.icon}"></i>
                            <span>${this.escapeHtml(link.name)}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.link-card[data-external="true"]').forEach(link => {
            link.addEventListener('click', this.handleExternalLink.bind(this));
        });
    }

    createServiceCard(service) {
        const card = document.createElement('article');
        card.className = 'service-card';
        card.dataset.url = service.url;
        card.dataset.hostType = service.host_type;

        card.innerHTML = `
            <div class="service-header">
                <i class="${service.icon} service-icon"></i>
                <div class="service-info">
                    <h3 class="service-name">${this.escapeHtml(service.name)}</h3>
                    <span class="service-url">${this.escapeHtml(service.url)}</span>
                </div>
            </div>
            <p class="service-description">${this.escapeHtml(service.description)}</p>
            <div class="service-tags">
                <span class="tag tag-${service.status_tag.toLowerCase()}">${service.status_tag}</span>
                <span class="tag tag-${service.host_type.toLowerCase().replace(' ', '-')}">${service.host_type}</span>
            </div>
        `;

        card.addEventListener('click', this.handleServiceClick);
        return card;
    }

    getDisplayServices() {
        if (!this.state.searchTerm) return this.state.filteredServices;

        const term = this.state.searchTerm.toLowerCase();
        return this.state.filteredServices.filter(service => 
            service.name.toLowerCase().includes(term) ||
            service.description.toLowerCase().includes(term) ||
            service.status_tag.toLowerCase().includes(term)
        );
    }

    async handleServiceClick(e) {
        const card = e.currentTarget;
        if (card.dataset.hostType === 'External') {
            await this.showExitOverlay();
        }
        window.open(card.dataset.url, '_blank', 'noopener,noreferrer');
    }

    async handleExternalLink(e) {
        e.preventDefault();
        await this.showExitOverlay();
        window.open(e.currentTarget.href, '_blank', 'noopener,noreferrer');
    }

    async showExitOverlay() {
        return new Promise(resolve => {
            this.elements.exitOverlay.classList.add('active');
            setTimeout(() => {
                this.elements.exitOverlay.classList.remove('active');
                resolve();
            }, this.config.exitOverlayDuration);
        });
    }

    handleSearch(e) {
        this.state.searchTerm = e.target.value;
        this.elements.clearSearch?.classList.toggle('hidden', !this.state.searchTerm);
        this.renderServices();
    }

    handleClearSearch() {
        this.state.searchTerm = '';
        this.elements.searchInput.value = '';
        this.elements.clearSearch?.classList.add('hidden');
        this.renderServices();
    }

    handleRetry() {
        this.state.retryCount = 0;
        this.elements.errorState?.classList.add('hidden');
        this.elements.loader?.classList.remove('hidden');
        this.loadData();
    }

    updateUIForView() {
        if (this.elements.viewIndicator) {
            this.elements.viewIndicator.textContent = this.state.viewMode === 'admin' 
                ? '/admin' 
                : '/hub';
        }

        if (this.state.viewMode === 'admin' && this.elements.telemetryDashboard) {
            this.elements.telemetryDashboard.classList.remove('hidden');
        }
    }

    updateServiceCount() {
        if (this.elements.serviceCount) {
            const count = this.getDisplayServices().length;
            this.elements.serviceCount.textContent = 
                `${count} ${count === 1 ? 'service' : 'services'}`;
        }
    }

    showApp() {
        this.elements.loader?.classList.add('hidden');
        this.elements.app?.classList.remove('hidden');
        this.state.isLoading = false;
    }

    showError() {
        this.elements.loader?.classList.add('hidden');
        this.elements.app?.classList.remove('hidden');
        this.elements.errorState?.classList.remove('hidden');
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new HubApp();
    app.init();
});