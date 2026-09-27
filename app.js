// ===== Translations =====
const translations = {
    ru: {
        appTitle: 'Мои задачи',
        all: 'Все',
        today: 'Сегодня',
        planned: 'В планах',
        completed: 'Завершённые',
        deleted: 'Удалённые',
        task: 'Задача',
        taskPlaceholder: 'Введите задачу...',
        date: 'Дата',
        topic: 'Тема',
        noTopic: 'Без темы',
        work: 'Работа',
        study: 'Учёба',
        personal: 'Личное',
        priority: 'Приоритетность',
        low: '🟢 Низкая',
        medium: '🟡 Средняя',
        high: '🔴 Высокая',
        add: 'Добавить',
        noTasks: 'Нет задач',
        delete: 'Удалить',
        restore: 'Восстановить',
        deletePermanently: 'Удалить навсегда'
    },
    uk: {
        appTitle: 'Мої завдання',
        all: 'Усі',
        today: 'Сьогодні',
        planned: 'У планах',
        completed: 'Завершені',
        deleted: 'Видалені',
        task: 'Завдання',
        taskPlaceholder: 'Введіть завдання...',
        date: 'Дата',
        topic: 'Тема',
        noTopic: 'Без теми',
        work: 'Робота',
        study: 'Навчання',
        personal: 'Особисте',
        priority: 'Пріоритетність',
        low: '🟢 Низька',
        medium: '🟡 Середня',
        high: '🔴 Висока',
        add: 'Додати',
        noTasks: 'Немає завдань',
        delete: 'Видалити',
        restore: 'Відновити',
        deletePermanently: 'Видалити назавжди'
    },
    de: {
        appTitle: 'Meine Aufgaben',
        all: 'Alle',
        today: 'Heute',
        planned: 'Geplant',
        completed: 'Erledigt',
        deleted: 'Gelöscht',
        task: 'Aufgabe',
        taskPlaceholder: 'Aufgabe eingeben...',
        date: 'Datum',
        topic: 'Thema',
        noTopic: 'Kein Thema',
        work: 'Arbeit',
        study: 'Studium',
        personal: 'Persönlich',
        priority: 'Priorität',
        low: '🟢 Niedrig',
        medium: '🟡 Mittel',
        high: '🔴 Hoch',
        add: 'Hinzufügen',
        noTasks: 'Keine Aufgaben',
        delete: 'Löschen',
        restore: 'Wiederherstellen',
        deletePermanently: 'Endgültig löschen'
    },
    en: {
        appTitle: 'My Tasks',
        all: 'All',
        today: 'Today',
        planned: 'Planned',
        completed: 'Completed',
        deleted: 'Deleted',
        task: 'Task',
        taskPlaceholder: 'Enter a task...',
        date: 'Date',
        topic: 'Topic',
        noTopic: 'No topic',
        work: 'Work',
        study: 'Study',
        personal: 'Personal',
        priority: 'Priority',
        low: '🟢 Low',
        medium: '🟡 Medium',
        high: '🔴 High',
        add: 'Add',
        noTasks: 'No tasks',
        delete: 'Delete',
        restore: 'Restore',
        deletePermanently: 'Delete permanently'
    }
};

// ===== State =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentCategory = 'all';
let currentLang = localStorage.getItem('lang') || 'ru';
let currentTheme = localStorage.getItem('theme') || 'light';

// ===== DOM Elements =====
const appTitle = document.getElementById('app-title');
const languageSelect = document.getElementById('language-select');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const categoryBtns = document.querySelectorAll('.category-btn');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskTopic = document.getElementById('task-topic');
const taskPriority = document.getElementById('task-priority');
const tasksList = document.getElementById('tasks-list');
const emptyState = document.getElementById('empty-state');

// ===== Initialize =====
function init() {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    languageSelect.value = currentLang;
    renderTasks();
    updateCounts();
}

// ===== Theme =====
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
}

// ===== Language =====
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const t = translations[lang];

    // Title
    appTitle.textContent = t.appTitle;

    // Category buttons
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Form placeholder
    taskInput.placeholder = t.taskPlaceholder;

    // Select options - Topic
    taskTopic.options[0].textContent = t.noTopic;
    taskTopic.options[1].textContent = t.work;
    taskTopic.options[2].textContent = t.study;
    taskTopic.options[3].textContent = t.personal;

    // Select options - Priority
    taskPriority.options[0].textContent = t.low;
    taskPriority.options[1].textContent = t.medium;
    taskPriority.options[2].textContent = t.high;

    // Re-render tasks to update any topic badges
    renderTasks();
}

// ===== Tasks =====
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(e) {
    e.preventDefault();

    const title = taskInput.value.trim();
    if (!title) return;

    const task = {
        id: Date.now(),
        title,
        date: taskDate.value || null,
        topic: taskTopic.value,
        priority: taskPriority.value,
        completed: false,
        deleted: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateCounts();

    // Reset form
    taskForm.reset();
    taskInput.focus();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateCounts();
    }
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.deleted = true;
        task.completed = false;
        saveTasks();
        renderTasks();
        updateCounts();
    }
}

function restoreTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.deleted = false;
        saveTasks();
        renderTasks();
        updateCounts();
    }
}

function permanentlyDeleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateCounts();
}

function getFilteredTasks() {
    const today = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
        // Deleted tasks only show in deleted category
        if (task.deleted) {
            return currentCategory === 'deleted';
        }

        // Non-deleted categories
        switch (currentCategory) {
            case 'all':
                return !task.completed;
            case 'today':
                return task.date === today && !task.completed;
            case 'planned':
                return task.date && task.date > today && !task.completed;
            case 'completed':
                return task.completed;
            case 'deleted':
                return false; // Already handled above
            default:
                return true;
        }
    });
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    const t = translations[currentLang];

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.add('visible');
        return;
    }

    emptyState.classList.remove('visible');

    tasksList.innerHTML = filteredTasks.map(task => {
        const topicLabel = task.topic !== 'none' ? getTopicLabel(task.topic) : '';
        const isDeleted = task.deleted;

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                ${!isDeleted ? `
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         onclick="toggleComplete(${task.id})"></div>
                ` : ''}
                <div class="priority-dot ${task.priority}"></div>
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        ${task.date ? `<span class="task-date">📅 ${formatDate(task.date)}</span>` : ''}
                        ${topicLabel ? `<span class="task-topic-badge ${task.topic}">${topicLabel}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    ${isDeleted ? `
                        <button class="task-action-btn restore" onclick="restoreTask(${task.id})" title="${t.restore}">↩️</button>
                        <button class="task-action-btn delete" onclick="permanentlyDeleteTask(${task.id})" title="${t.deletePermanently}">🗑️</button>
                    ` : `
                        <button class="task-action-btn delete" onclick="deleteTask(${task.id})" title="${t.delete}">🗑️</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function getTopicLabel(topic) {
    const t = translations[currentLang];
    const labels = {
        work: t.work,
        study: t.study,
        personal: t.personal
    };
    return labels[topic] || '';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString(currentLang === 'uk' ? 'uk-UA' : currentLang, options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateCounts() {
    const today = new Date().toISOString().split('T')[0];
    const activeTasks = tasks.filter(t => !t.deleted);

    document.getElementById('count-all').textContent = activeTasks.filter(t => !t.completed).length;
    document.getElementById('count-today').textContent = activeTasks.filter(t => t.date === today && !t.completed).length;
    document.getElementById('count-planned').textContent = activeTasks.filter(t => t.date && t.date > today && !t.completed).length;
    document.getElementById('count-completed').textContent = activeTasks.filter(t => t.completed).length;
    document.getElementById('count-deleted').textContent = tasks.filter(t => t.deleted).length;
}

function setCategory(category) {
    currentCategory = category;
    categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderTasks();
}

// ===== Event Listeners =====
themeToggle.addEventListener('click', toggleTheme);

languageSelect.addEventListener('change', (e) => {
    applyLanguage(e.target.value);
    updateCounts();
});

taskForm.addEventListener('submit', addTask);

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => setCategory(btn.dataset.category));
});

// ===== Start =====
init();
