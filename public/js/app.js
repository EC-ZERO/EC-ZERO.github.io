/**
 * Electrocatalysis Group - Content Loading Engine
 */

console.log("App.js loaded and running...");

// 1. Helper to fetch content
async function fetchContent(url) {
    try {
        console.log(`Fetching: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url} (Status: ${response.status})`);
        const text = await response.text();
        // Check if we accidentally got index.html (common in SPA fallback)
        if (text.trim().startsWith('<!DOCTYPE html>')) {
            throw new Error(`Fetched HTML instead of data for ${url}. Check file location.`);
        }
        return text;
    } catch (err) {
        console.error(`Error loading ${url}:`, err);
        return null;
    }
}

// 2. Load Research & Opportunities (HTML Snippets)
async function loadHtmlSnippets() {
    const researchContainer = document.getElementById('research-content');
    if (researchContainer) {
        const html = await fetchContent('/content/research.html');
        if (html) researchContainer.innerHTML = html;
    }

    const opportunitiesContainer = document.getElementById('opportunities-content');
    if (opportunitiesContainer) {
        const html = await fetchContent('/content/opportunities.html');
        if (html) opportunitiesContainer.innerHTML = html;
    }
}

// 3. Load News (JSON)
async function loadNews(limit = null) {
    const container = document.getElementById('news-container');
    if (!container) return;

    const jsonText = await fetchContent('/data/news.json');
    if (!jsonText) return;

    try {
        const newsData = JSON.parse(jsonText);
        const displayData = limit ? newsData.slice(0, limit) : newsData;

        container.innerHTML = displayData.map(item => `
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                <div class="relative h-48 overflow-hidden">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer">
                    <span class="absolute top-4 left-4 px-3 py-1 bg-brand text-white text-xs font-bold rounded-full uppercase tracking-wider">${item.tag}</span>
                </div>
                <div class="p-6">
                    <div class="text-sm text-gray-500 mb-2 font-medium"><i class="far fa-calendar-alt mr-2"></i>${item.date}</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors line-clamp-2">${item.title}</h3>
                    <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">${item.content}</p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("News JSON parsing error:", e);
    }
}

// 4. Load Publications (JSON)
async function loadPublications(limit = null) {
    const container = document.getElementById('publications-container');
    if (!container) return;

    const jsonText = await fetchContent('/data/publications.json');
    if (!jsonText) return;

    try {
        const pubData = JSON.parse(jsonText);
        const displayData = limit ? pubData.filter(p => p.highlight).slice(0, limit) : pubData;

        container.innerHTML = displayData.map(pub => `
            <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="w-full md:w-48 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50">
                        <img src="${pub.image}" alt="Publication highlight" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerpolicy="no-referrer">
                    </div>
                    <div class="flex-grow">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-3 py-1 bg-blue-50 text-brand text-xs font-bold rounded-md uppercase tracking-wider">${pub.year}</span>
                            <span class="text-gray-400 text-sm font-medium italic">${pub.journal}</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors leading-tight">
                            <a href="${pub.link}" target="_blank">${pub.title}</a>
                        </h3>
                        <p class="text-gray-600 text-sm mb-4 font-medium">${pub.authors}</p>
                        <div class="flex gap-4">
                            <a href="${pub.link}" target="_blank" class="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                                <i class="fas fa-external-link-alt text-xs"></i> View Online
                            </a>
                            <span class="text-gray-300">|</span>
                            <span class="text-sm text-gray-400 font-mono">DOI: ${pub.doi}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error("Publications JSON parsing error:", e);
    }
}

// 5. Load People (JSON)
async function loadPeople() {
    const container = document.getElementById('people-page-container');
    if (!container) return;

    const jsonText = await fetchContent('/data/people.json');
    if (!jsonText) return;
    
    try {
        const data = JSON.parse(jsonText);
        let html = `
            <!-- PI Section -->
            <div class="max-w-5xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 border border-gray-100 mb-24">
                <div class="w-64 h-64 flex-shrink-0 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img src="${data.pi.photo}" alt="${data.pi.name}" class="w-full h-full object-cover">
                </div>
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-2">${data.pi.name}</h3>
                    <p class="text-brand font-semibold text-lg mb-6">${data.pi.title}</p>
                    <p class="text-gray-600 leading-relaxed mb-8">${data.pi.bio}</p>
                    <div class="flex gap-4">
                        <a href="mailto:${data.pi.email}" class="px-6 py-2 bg-brand text-white rounded-full font-semibold hover:bg-brand-dark transition-colors">Email PI</a>
                        <a href="${data.pi.google_scholar}" class="px-6 py-2 border border-brand text-brand rounded-full font-semibold hover:bg-brand hover:text-white transition-colors">Scholar</a>
                    </div>
                </div>
            </div>

            <!-- Postdocs -->
            <div class="mb-20">
                <h3 class="text-2xl font-bold text-gray-900 mb-10 border-l-4 border-brand pl-4">Postdoctoral Fellows</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${data.postdocs.map(p => `
                        <div class="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
                            <img src="${p.photo}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
                            <h4 class="font-bold text-gray-900">${p.name}</h4>
                            <p class="text-sm text-gray-500">${p.details}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- PhD Students -->
            <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-10 border-l-4 border-brand pl-4">PhD Students</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${data.phd_students.map(s => `
                        <div class="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
                            <img src="${s.photo}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
                            <h4 class="font-bold text-gray-900">${s.name}</h4>
                            <p class="text-sm text-gray-500">${s.details}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML = html;
    } catch (e) {
        console.error("JSON parsing error:", e);
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing content...");
    loadHtmlSnippets();
    
    // Check which page we are on
    const path = window.location.pathname;
    console.log(`Current path: ${path}`);
    
    if (path.includes('news.html')) {
        loadNews();
    } else if (path.includes('people.html')) {
        loadPeople();
    } else if (path.includes('publications.html')) {
        loadPublications();
    } else {
        // Index page or root
        loadNews(3); // Show 3 news items
        loadPublications(2); // Show 2 publications
    }
});
