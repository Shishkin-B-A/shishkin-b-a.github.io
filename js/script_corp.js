let db;
const notification = document.getElementById('notification');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');

function showNotification(message, duration = 3000) {
    notification.textContent = message;
    notification.classList.add('active');
    setTimeout(() => {
        notification.classList.remove('active');
    }, duration);
}

async function initDB() {
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });
        const response = await fetch('../../Projects/Сorpora/corp.db');
        if (!response.ok) {
            throw new Error('Не удалось загрузить базу данных');
        }
        const buffer = await response.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buffer));
        populateLangs();
        populateWebsites();
        populateSources('');
        populateTypes();
        populateFeatures();
        populateTtvs();
        showNotification('База данных загружена успешно');
    } catch (error) {
        console.error(error);
        showNotification('Ошибка загрузки базы данных: ' + error.message);
    }
}

function populateLangs() {
    const stmt = db.prepare("SELECT id, name FROM lang ORDER BY name");
    const select = document.getElementById('lang');
    while (stmt.step()) {
        const row = stmt.getAsObject();
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name;
        select.appendChild(opt);
    }
    stmt.free();
}

function populateWebsites() {
    const stmt = db.prepare("SELECT id, name FROM website ORDER BY name");
    const select = document.getElementById('website');
    while (stmt.step()) {
        const row = stmt.getAsObject();
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name;
        select.appendChild(opt);
    }
    stmt.free();
}

function populateSources(websiteId) {
    const select = document.getElementById('source');
    select.innerHTML = '<option value="">Все</option>';
    let sql = "SELECT id, name FROM source";
    let params = {};
    if (websiteId) {
        sql += " WHERE website_id = :wid";
        params = { ':wid': websiteId };
    }
    sql += " ORDER BY name";
    const stmt = db.prepare(sql);
    stmt.bind(params);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name;
        select.appendChild(opt);
    }
    stmt.free();
}

function populateTypes() {
    const stmt = db.prepare("SELECT id, name FROM type ORDER BY name");
    const select = document.getElementById('type');
    while (stmt.step()) {
        const row = stmt.getAsObject();
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name;
        select.appendChild(opt);
    }
    stmt.free();
}

function populateFeatures() {
    const stmt = db.prepare("SELECT id, name FROM feature ORDER BY name");
    const select = document.getElementById('feature');
    while (stmt.step()) {
        const row = stmt.getAsObject();
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name;
        select.appendChild(opt);
    }
    stmt.free();
}

function populateTtvs() {
    const stmt = db.prepare("SELECT id, name FROM ttv ORDER BY name");
    const select = document.getElementById('ttv');
    while (stmt.step()) {
        const row = stmt.getAsObject();
        const opt = document.createElement('option');
        opt.value = row.id;
        opt.textContent = row.name;
        select.appendChild(opt);
    }
    stmt.free();
}

function extractConcordances(text, query, leftWords, rightWords, isTitle) {
    const concordances = [];
    if (!query) return concordances;

    // Разбиваем текст на слова
    const words = text.split(/\s+/);
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    words.forEach((word, index) => {
        if (regex.test(word)) {
            const leftArr = words.slice(Math.max(0, index - leftWords), index);
            const rightArr = words.slice(index + 1, index + 1 + rightWords);
            const left = leftArr.join(' ');
            const right = rightArr.join(' ');
            // Выделяем подстроку в слове
            const highlightedWord = word.replace(regex, match => `<span class="highlight">${match}</span>`);
            concordances.push({ left, keyword: highlightedWord, right, source: isTitle ? 'Инфоповод' : 'Содержание' });
        }
    });
    return concordances;
}

function showArticleDetails(articleId) {
    const sql = `
        SELECT m.id, m.newsbreak, m.date, m.url, m.content, 
               l.name as lang_name, w.name as website_name, s.name as source_name,
               t.comment as type_comment, f.comment as feature_comment, v.name as ttv_name
        FROM main m 
        JOIN lang l ON m.lang_id = l.id
        JOIN website w ON m.website_id = w.id
        JOIN source s ON m.source_id = s.id
        JOIN type t ON m.type_id = t.id
        JOIN feature f ON m.feature_id = f.id
        JOIN ttv v ON m.ttv_id = v.id
        WHERE m.id = :aid
    `;
    const stmt = db.prepare(sql);
    stmt.bind({ ':aid': articleId });
    if (stmt.step()) {
        const row = stmt.getAsObject();
        const detailView = document.getElementById('detail-view');
        detailView.innerHTML = '';

        const title = document.createElement('h3');
        title.className = 'title title-sm';
        title.textContent = row.newsbreak;
        detailView.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'meta-info text';
        meta.innerHTML = `
            Язык: ${row.lang_name}<br>
            Сайт: ${row.website_name}<br>
            Источник: ${row.source_name}<br>
            Тип: ${row.type_comment || 'N/A'}<br>
            КС: ${row.feature_comment || 'N/A'}<br>
            ТТН: ${row.ttv_name || 'N/A'}<br>
            Дата: ${row.date}
        `;
        detailView.appendChild(meta);

        const snippet = document.createElement('p');
        snippet.className = 'description';
        snippet.textContent = row.content.substring(0, 200) + '...';
        detailView.appendChild(snippet);

        const btn = document.createElement('a');
        btn.className = 'btn btn-primary';
        btn.href = row.url;
        btn.target = '_blank';
        btn.textContent = 'Перейти к статье';
        detailView.appendChild(btn);

        modal.style.display = "block";
    }
    stmt.free();
}

document.addEventListener('DOMContentLoaded', () => {
    initDB();

    const websiteSelect = document.getElementById('website');
    websiteSelect.addEventListener('change', () => {
        const wid = websiteSelect.value;
        populateSources(wid);
    });

    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!db) {
            showNotification('База данных не загружена');
            return;
        }

        const query = document.getElementById('query').value.trim();
        const lang = document.getElementById('lang').value;
        const website = document.getElementById('website').value;
        const source = document.getElementById('source').value;
        const type = document.getElementById('type').value;
        const feature = document.getElementById('feature').value;
        const ttv = document.getElementById('ttv').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const leftWords = parseInt(document.getElementById('left-context').value) || 5;
        const rightWords = parseInt(document.getElementById('right-context').value) || 5;

        let sql = `
            SELECT m.id, m.newsbreak, m.date, m.url, m.content, 
                   l.name as lang_name, w.name as website_name, s.name as source_name,
                   t.name as type_name, f.name as feature_name, v.name as ttv_name
            FROM main m 
            JOIN lang l ON m.lang_id = l.id
            JOIN website w ON m.website_id = w.id
            JOIN source s ON m.source_id = s.id
            JOIN type t ON m.type_id = t.id
            JOIN feature f ON m.feature_id = f.id
            JOIN ttv v ON m.ttv_id = v.id
        `;
        let where = [];
        let params = {};

        if (query) {
            where.push("(m.newsbreak LIKE :query OR m.content LIKE :query)");
            params[':query'] = `%${query}%`;
        }

        if (lang) {
            where.push("m.lang_id = :lang");
            params[':lang'] = lang;
        }

        if (website) {
            where.push("m.website_id = :website");
            params[':website'] = website;
        }

        if (source) {
            where.push("m.source_id = :source");
            params[':source'] = source;
        }

        if (type) {
            where.push("m.type_id = :type");
            params[':type'] = type;
        }

        if (feature) {
            where.push("m.feature_id = :feature");
            params[':feature'] = feature;
        }

        if (ttv) {
            where.push("m.ttv_id = :ttv");
            params[':ttv'] = ttv;
        }

        if (dateFrom) {
            where.push("m.date >= :dateFrom");
            params[':dateFrom'] = dateFrom;
        }

        if (dateTo) {
            where.push("m.date <= :dateTo");
            params[':dateTo'] = dateTo;
        }

        if (where.length > 0) {
            sql += " WHERE " + where.join(" AND ");
        }

        sql += " ORDER BY m.date DESC LIMIT 100";

        const stmt = db.prepare(sql);
        stmt.bind(params);

        const concordanceDiv = document.getElementById('concordance');
        concordanceDiv.innerHTML = '';

        modal.style.display = "none";

        let hasResults = false;

        while (stmt.step()) {
            const row = stmt.getAsObject();
            let concordances = [];

            if (query) {
                concordances = [
                    ...extractConcordances(row.newsbreak, query, leftWords, rightWords, true),
                    ...extractConcordances(row.content, query, leftWords, rightWords, false)
                ];
            } else {
                concordances.push({
                    left: '',
                    keyword: row.newsbreak,
                    right: '',
                    source: 'Инфоповод'
                });
            }

            concordances = concordances.slice(0, 10);

            concordances.forEach(conc => {
                hasResults = true;
                const item = document.createElement('div');
                item.className = 'concordance-item';
                item.dataset.articleId = row.id;

                const textDiv = document.createElement('div');
                textDiv.className = 'concordance-text';

                const leftSpan = document.createElement('span');
                leftSpan.className = 'left-context';
                leftSpan.textContent = conc.left;
                textDiv.appendChild(leftSpan);

                const kwSpan = document.createElement('span');
                kwSpan.className = 'keyword';
                kwSpan.innerHTML = conc.keyword;
                textDiv.appendChild(kwSpan);

                const rightSpan = document.createElement('span');
                rightSpan.className = 'right-context';
                rightSpan.textContent = conc.right;
                textDiv.appendChild(rightSpan);

                item.appendChild(textDiv);

                const tagSpan = document.createElement('span');
                tagSpan.className = 'source-tag';
                tagSpan.textContent = conc.source;
                item.appendChild(tagSpan);

                item.addEventListener('click', () => {
                    showArticleDetails(item.dataset.articleId);
                });

                concordanceDiv.appendChild(item);
            });
        }
        stmt.free();

        if (!hasResults) {
            concordanceDiv.innerHTML = '<p>Результаты не найдены.</p>';
        }
    });
});