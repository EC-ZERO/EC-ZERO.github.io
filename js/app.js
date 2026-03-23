/**
 * Electrocatalysis Group - Content Loading Engine
 */

// 1. Helper to fetch content
async function fetchContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.text();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// 2. Load Navbar & Footer (Optional, but good for consistency)
// For this static site, we'll keep them in the HTML but could move them here.

// 3. Load Research & Opportunities (HTML Snippets)
async function loadHtmlSnippets() {
    const researchContainer = document.getElementById('research-content');
    if (researchContainer) {
        const html = await fetchContent('content/research.html');
        if (html) researchContainer.innerHTML = html;
    }

    const opportunitiesContainer = document.getElementById('opportunities-content');
    if (opportunitiesContainer) {
        const html = await fetchContent('content/opportunities.html');
        if (html) opportunitiesContainer.innerHTML = html;
    }
}

// 4. Load News (Markdown)
async function loadNews(limit = null) {
    const container = document.getElementById('news-container');
    if (!container) return;

    const md = await fetchContent('data/news.md');
    if (!md) return;

    // If limit is set (for index page), we split by '###' and take the first few
    if (limit) {
        const items = md.split('###').filter(i => i.trim()).slice(0, limit);
        const limitedMd = items.map(i => '###' + i).join('\n\n');
        container.innerHTML = marked.parse(limitedMd);
    } else {
        container.innerHTML = marked.parse(md);
    }
}

// 5. Load Publications (Markdown)
async function loadPublications(limit = null) {
    const container = document.getElementById('publications-container');
    if (!container) return;

    const md = await fetchContent('data/publications.md');
    if (!md) return;

    if (limit) {
        // Simple extraction for index page: take the first few items after the first '###'
        // This is a bit hacky but works for simple lists
        const items = md.split('###').filter(i => i.trim()).slice(0, limit);
        const limitedMd = items.map(i => '###' + i).join('\n\n');
        container.innerHTML = marked.parse(limitedMd);
    } else {
        container.innerHTML = marked.parse(md);
    }
}

// 6. Load People (JSON)
async function loadPeople() {
    const container = document.getElementById('people-page-container');
    if (!container) return;

    const jsonText = await fetchContent('data/people.json');
    if (!jsonText) return;
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
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    loadHtmlSnippets();
    
    // Check which page we are on
    const path = window.location.pathname;
    if (path.includes('news.html')) {
        loadNews();
    } else if (path.includes('people.html')) {
        loadPeople();
    } else if (path.includes('publications.html')) {
        loadPublications();
    } else {
        // Index page
        loadNews(3); // Show 3 news items
        loadPublications(2); // Show 2 publications
    }
});
