/**
 * Electrocatalysis Group - Content Loading Engine
 */

let currentLang = localStorage.getItem('lab_lang') || 'en';
document.documentElement.setAttribute('lang', currentLang);

// 定义一个简单的翻译小工具
const t = (en, zh) => (currentLang === 'zh' ? zh : en);

/**
 * 核心：语言切换函数 (兼容你可能写的两个名字)
 */
window.handleToggleLanguage = window.switchLanguage = function(lang) {
    // 如果传了 lang 就用传的，没传就自动反转
    const targetLang = typeof lang === 'string' ? lang : (currentLang === 'en' ? 'zh' : 'en');
    console.log("Switching language to:", targetLang);
    localStorage.setItem('lab_lang', targetLang);
    window.location.reload();
};

// 1. Helper to fetch content (保留了你优秀的 404 拦截逻辑)
async function fetchContent(url) {
    try {
        let targetUrl = url;
        if (currentLang === 'zh' && !url.includes('_cn')) {
            targetUrl = url.replace(/\.(json|html)$/, '_cn.$1');
        }
        
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}: 找不到 ${targetUrl}`);

        const text = await response.text();

        if (url.endsWith('.json') && text.trim().startsWith('<!DOCTYPE html>')) {
            throw new Error(`JSON 路径配置错误：抓到了 index.html 的回退。检查: ${targetUrl}`);
        }
        return text;
    } catch (err) {
        console.error(`Error loading ${url}:`, err);
        return null;
    }
}

// 1*. Load Navbar and Footer
async function loadSharedComponents() {
    const navContainer = document.getElementById('navbar-placeholder');
    if (navContainer) {
        // 直接请求基础路径，fetchContent 会自动处理后缀
        const html = await fetchContent('/content/navbar.html');
        if (html) {
            navContainer.innerHTML = html;
            
            // 💡 关键：内容加载后，立刻更新切换按钮的文案
            const toggleText = document.getElementById('lang-toggle-text');
            if (toggleText) {
                toggleText.innerText = currentLang === 'en' ? '中文' : 'English';
            }
            
            initMobileMenu(); 
        }
    }

    const footerContainer = document.getElementById('footer-placeholder');
    if (footerContainer) {
        const html = await fetchContent('/content/footer.html');
        if (html) footerContainer.innerHTML = html;
    }
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.onclick = () => menu.classList.toggle('hidden');
    }
}

// 2. Load Research & Opportunities
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
// async function loadPublications(limit = null) {
//     const container = document.getElementById('publications-container');
//     if (!container) return;

//     const jsonText = await fetchContent('/data/publications.json');
//     if (!jsonText) return;

//     try {
//         const pubData = JSON.parse(jsonText);
//         const displayData = limit ? pubData.filter(p => p.highlight).slice(0, limit) : pubData;

//         container.innerHTML = displayData.map(pub => `
//             <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
//                 <div class="flex flex-col md:flex-row gap-8">
//                     <div class="w-full md:w-48 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50">
//                         <img src="${pub.image}" alt="${t('Publication highlight', '论文亮点')}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerpolicy="no-referrer">
//                     </div>
//                     <div class="flex-grow">
//                         <div class="flex items-center gap-3 mb-3">
//                             <span class="px-3 py-1 bg-blue-50 text-brand text-xs font-bold rounded-md uppercase tracking-wider">${pub.year}</span>
//                             <span class="text-gray-400 text-sm font-medium italic">${pub.journal}</span>
//                         </div>
//                         <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand transition-colors leading-tight">
//                             <a href="${pub.link}" target="_blank">${pub.title}</a>
//                         </h3>
//                         ${pub.title_cn ? `
//                         <p class="text-gray-400 text-sm mb-3 font-medium leading-snug">
//                             ${pub.title_cn}
//                         </p>
//                         ` : '<div class="mb-3"></div>'} 
//                         <p class="text-gray-600 text-sm mb-4 font-medium">${pub.authors}</p>
//                         <div class="flex gap-4">
//                             <a href="${pub.link}" target="_blank" class="text-sm font-bold text-brand hover:underline flex items-center gap-1">
//                                 <i class="fas fa-external-link-alt text-xs"></i> ${t('View Online', '在线阅读')}
//                             </a>
//                             <span class="text-gray-300">|</span>
//                             <span class="text-sm text-gray-400 font-mono">DOI: ${pub.doi}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `).join('');
//     } catch (e) {
//         console.error("Publications JSON parsing error:", e);
//     }
// }

async function loadPublications(limit = null) {
    const container = document.getElementById('publications-container');
    if (!container) return;

    // --- 1. 定义实验室成员名单 (请根据实际情况补充) ---
    const labMembers = [
        "Wu, T."
        //,""
    ];

    const jsonText = await fetchContent('/data/publications.json');
    if (!jsonText) return;

    try {
        const pubData = JSON.parse(jsonText);
        const displayData = limit ? pubData.filter(p => p.highlight).slice(0, limit) : pubData;

        container.innerHTML = displayData.map(pub => {
            // --- 2. 这里的逻辑用于处理作者字符串 ---
            let highlightedAuthors = pub.authors;
            labMembers.forEach(member => {
                // 使用正则表达式全局替换，并保留原样
                const regex = new RegExp(`(${member})`, 'g');
                highlightedAuthors = highlightedAuthors.replace(regex, '<strong>$1</strong>');
            });

            return `
            <div class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="w-full md:w-48 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50">
                        <img src="${pub.image}" alt="${t('Publication highlight', '论文亮点')}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerpolicy="no-referrer">
                    </div>
                    <div class="flex-grow">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-3 py-1 bg-blue-50 text-brand text-xs font-bold rounded-md uppercase tracking-wider">${pub.year}</span>
                            <span class="text-gray-400 text-sm font-medium italic">${pub.journal}</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand transition-colors leading-tight">
                            <a href="${pub.link}" target="_blank">${pub.title}</a>
                        </h3>
                        ${pub.title_cn ? `
                        <p class="text-gray-400 text-sm mb-3 font-medium leading-snug">
                            ${pub.title_cn}
                        </p>
                        ` : '<div class="mb-3"></div>'} 
                        <p class="text-gray-600 text-sm mb-4 font-medium">${highlightedAuthors}</p>
                        <div class="flex gap-4">
                            <a href="${pub.link}" target="_blank" class="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                                <i class="fas fa-external-link-alt text-xs"></i> ${t('View Online', '在线阅读')}
                            </a>
                            <span class="text-gray-300">|</span>
                            <span class="text-sm text-gray-400 font-mono">DOI: ${pub.doi}</span>
                        </div>
                    </div>
                </div>
            </div>
        `}).join(''); // 结束 map
    } catch (e) {
        console.error("Publications JSON parsing error:", e);
    }
}


// 5. Load People (JSON)
async function loadPeople() {
    const container = document.getElementById('people-page-container');
    if (!container) return;

    // 1. fetchContent 会自动根据当前语言决定拿 people.json 还是 people_cn.json
    const jsonText = await fetchContent('/data/people.json');
    if (!jsonText) return;
    
    try {
        const data = JSON.parse(jsonText);
        
        // --- A. 渲染 PI (导师) 部分 ---
        let html = `
            <div class="max-w-5xl mx-auto bg-gray-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 border border-gray-100 mb-24">
                <div class="w-64 h-64 flex-shrink-0 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img src="${data.pi.photo}" alt="${data.pi.name}" class="w-full h-full object-cover">
                </div>
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 mb-2">${data.pi.name}</h3>
                    <p class="text-brand font-semibold text-lg mb-6">${data.pi.title}</p>
                    <p class="text-gray-600 leading-relaxed mb-8">${data.pi.bio}</p>
                    <p class="text-brand font-semibold text-lg mb-6">${currentLang === 'zh' ? '荣誉奖项' : 'Awards'}</p>
                    <ul class="list-disc list-inside text-gray-600 leading-relaxed mb-8">
                        ${data.pi.awards.map(award => `<li>${award}</li>`).join('')}
                    </ul>
                    <div class="flex gap-4">
                        <a href="${data.pi.google_scholar}" target="_blank" class="px-6 py-2 border border-brand text-brand rounded-full font-semibold hover:bg-brand hover:text-white transition-colors text-sm">${t('Google Scholar', '谷歌学术')}</a>
                        <a href="${data.pi.scopus}" target="_blank" class="px-6 py-2 border border-brand text-brand rounded-full font-semibold hover:bg-brand hover:text-white transition-colors text-sm">Scopus</a>
                        <a href="${data.pi.orcid}" target="_blank" class="px-6 py-2 border border-brand text-brand rounded-full font-semibold hover:bg-brand hover:text-white transition-colors text-sm">ORCID</a>
                    </div>
                </div>
            </div>
        `;

        // --- NEW: 渲染 Lead AI Architect 部分 ---
        // 增加安全检查：只有当 data.lead_architect 存在时才渲染
        // if (data.lead_architect && data.lead_architect.name) {
        //     html += `
        //         <div class="max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-gray-100 mb-24 shadow-sm">
        //             <div class="w-48 h-48 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-100 shadow-lg">
        //                 <img src="${data.lead_architect.photo || '/images/people/default.jpg'}" 
        //                      alt="${data.lead_architect.name}" 
        //                      class="w-full h-full object-cover">
        //             </div>
        //             <div class="flex-1 text-center md:text-left">
        //                 <h3 class="text-2xl font-bold text-gray-900 mb-1">${data.lead_architect.name}</h3>
        //                 <p class="text-brand font-medium mb-3">${data.lead_architect.title}</p>
        //                 <p class="text-gray-600 text-sm leading-relaxed mb-4">${data.lead_architect.bio || ''}</p>
        //                 <div class="flex justify-center md:justify-start gap-3">
        //                      ${data.lead_architect.linkedin ? `<a href="${data.lead_architect.linkedin}" target="_blank" class="text-gray-400 hover:text-brand transition-colors"><i class="fab fa-linkedin text-xl"></i></a>` : ''}
        //                 </div>
        //             </div>
        //         </div>
        //     `;
        // }

        // --- B. 自动化渲染其他成员分类 ---
        // 定义顺序和对应的中英文标题 [JSON里的key, 英文名, 中文名]
        // const groupConfigs = [
        //     ['teachers', 'Teachers', '指导教师'],
        //     ['engineers', 'Engineers', '工程师'],
        //     ['postdocs', 'Postdoctoral Fellows', '博士后'],
        //     ['phd_students', 'PhD Students', '博士研究生'],
        //     ['master_students', 'Master Students', '硕士研究生'],
        //     ['undergraduate_students', 'Undergraduate Students', '本科生']
        // ];

        // groupConfigs.forEach(([key, enTitle, zhTitle]) => {
        //     const members = data[key];
        //     // 💡 只有当这个分类有人的时候才渲染标题和容器
        //     if (members && members.length > 0) {
        //         html += `
        //             <div class="mb-20">
        //                 <h3 class="text-2xl font-bold text-gray-900 mb-10 border-l-4 border-brand pl-4">
        //                     ${currentLang === 'zh' ? zhTitle : enTitle}
        //                 </h3>
        //                 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        //                     ${members.map(person => `
        //                         <div class="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100 hover:shadow-md transition-shadow group">
        //                             <div class="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-gray-50 group-hover:border-brand transition-colors">
        //                                 <img src="${person.photo || '/images/people/default.jpg'}" 
        //                                      class="w-full h-full object-cover" 
        //                                      alt="${person.name}">
        //                             </div>
        //                             <h4 class="font-bold text-gray-900 mb-1">${person.name}</h4>
        //                             <p class="text-sm text-gray-500">${person.details || ''}</p>
        //                         </div>
        //                     `).join('')}
        //                 </div>
        //             </div>
        //         `;
        //     }
        // });

        container.innerHTML = html;
    } catch (e) {
        console.error("People JSON parsing error:", e);
    }
}

// 入口初始化
// app.js 里的入口初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log("EC-ZERO Engine Starting (Optimized)...");
    
    // 1. 立即获取路径，决定我们要点什么“菜”
    const path = window.location.pathname;
    const tasks = [];

    // 2. 无论哪个页面，都要加载导航栏和页脚 (共享组件)
    tasks.push(loadSharedComponents());

    // 3. 根据路由，并行添加特定页面的加载任务
    if (path.includes('news.html')) {
        tasks.push(loadNews());
    } else if (path.includes('people.html')) {
        tasks.push(loadPeople());
    } else if (path.includes('publications.html')) {
        tasks.push(loadPublications());
    } else {
        // 首页逻辑：只有在首页才加载这些 HTML 片段
        tasks.push(loadHtmlSnippets()); 
        tasks.push(loadNews(3));
        tasks.push(loadPublications(4));
    }

    // 4. 【核心优化】并发执行所有任务，不使用 await 阻塞
    // 浏览器会同时发出这 3-5 个请求，谁先回来谁先渲染
    Promise.all(tasks).then(() => {
        console.log("🚀 All content loaded in parallel!");
    }).catch(err => {
        console.error("Critical loading error:", err);
    });
});