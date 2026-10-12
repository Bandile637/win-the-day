
const STORAGE_KEY = "winTheDayData";

const DEFAULT_TASKS = [
  { id: 1, title: "10 minutes of learning", done: false },
  { id: 2, title: "Read for 5–10 minutes", done: false },
  { id: 3, title: "60 minutes of focused study", done: false },
  { id: 4, title: "Future-building session", done: false },
  { id: 5, title: "Workout or recovery", done: false },
  { id: 6, title: "Stretch for 5–10 minutes", done: false },
  { id: 7, title: "Get enough protein", done: false },
  { id: 8, title: "Drink enough water", done: false },
  { id: 9, title: "Grooming and skincare", done: false },
  { id: 10, title: "Practice composure and protect sleep", done: false }
];

const PAGE_TITLES = {
  home: "Welcome home.",
  entries: "Recent entries",
  reflections: "Daily reflections",
  memories: "Moments & memories",
  knowledge: "Knowledge & learning",
  psychology: "Psychology & philosophy",
  culture: "Music & culture",
  ideas: "Ideas & discoveries",
  creativity: "Creativity",
  habits: "Habits & discipline",
  fitness: "Fitness & health",
  learning: "Skills I'm building",
  milestones: "Milestones",
  music: "My music",
  interests: "Things I love",
  inspiration: "Inspiration",
  archive: "Your archive"
};

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    return {
      days: saved.days || {},
      goals: Array.isArray(saved.goals) ? saved.goals : [],
      notes: typeof saved.notes === "string" ? saved.notes : "",
      pages: saved.pages && typeof saved.pages === "object"
        ? saved.pages
        : {}
    };
  } catch {
    return { days: {}, goals: [], notes: "", pages: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getToday() {
  const data = loadData();
  const key = todayKey();

  if (!data.days[key]) {
    data.days[key] = {
      tasks: DEFAULT_TASKS.map(task => ({ ...task }))
    };
  }

  const existingTasks = data.days[key].tasks || [];

  data.days[key].tasks = DEFAULT_TASKS.map(defaultTask => {
    const existing = existingTasks.find(task => task.id === defaultTask.id);
    return existing
      ? { ...defaultTask, done: Boolean(existing.done) }
      : { ...defaultTask };
  });

  saveData(data);
  return data.days[key];
}

/* HOME */

function renderToday() {
  const day = getToday();
  const completed = day.tasks.filter(task => task.done).length;
  const total = day.tasks.length;
  const percentage = Math.round((completed / total) * 100);

  document.getElementById("page-content").innerHTML = `
    <section class="content-card">
      <p class="eyebrow">YOUR OWN LITTLE WORLD</p>
      <h2 style="font-size:26px;margin-bottom:12px">
        A space of your own.
      </h2>
      <p class="muted">
        A place to collect your thoughts, follow your curiosity,
        remember the moments that matter, and become who you want to be.
        No audience required.
      </p>
    </section>

    <section class="content-card">
      <div class="card-heading">
        <div>
          <p class="eyebrow">YOUR DAILY SYSTEM</p>
          <h2>Today's mission</h2>
        </div>
        <strong>${percentage}%</strong>
      </div>

      <p class="muted">${completed} of ${total} tasks complete</p>

      <div style="height:7px;background:var(--border);border-radius:20px;overflow:hidden;margin-top:12px">
        <div style="width:${percentage}%;height:100%;background:var(--purple);transition:width .3s"></div>
      </div>

      <div id="task-list" style="margin-top:18px">
        ${day.tasks.map(task => `
          <label style="display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:10px;border:1px solid var(--border);border-radius:10px;cursor:pointer">
            <input type="checkbox" data-task-id="${task.id}" ${task.done ? "checked" : ""} style="width:18px;height:18px;flex:0 0 18px;accent-color:var(--purple)">
            <span style="flex:1;${task.done ? "text-decoration:line-through;opacity:.65" : ""}">${escapeHTML(task.title)}</span>
          </label>
        `).join("")}
      </div>

      ${percentage === 100 ? `
        <div class="completion-message">
          <strong>Mission complete.</strong>
          <p style="margin-top:6px">You showed up for yourself today.</p>
        </div>
      ` : ""}

      <button class="secondary-btn" id="reset-day" style="margin-top:12px">
        Reset today's checklist
      </button>
    </section>
  `;

  document.querySelectorAll("[data-task-id]").forEach(input => {
    input.addEventListener("change", () => {
      const data = loadData();
      const key = todayKey();
      const task = data.days[key]?.tasks?.find(
        item => item.id === Number(input.dataset.taskId)
      );

      if (task) {
        task.done = input.checked;
        saveData(data);
      }

      renderToday();
    });
  });

  document.getElementById("reset-day").addEventListener("click", () => {
    if (!confirm("Reset today's checklist? Previous days will be preserved.")) return;

    const data = loadData();
    data.days[todayKey()] = {
      tasks: DEFAULT_TASKS.map(task => ({ ...task }))
    };

    saveData(data);
    renderToday();
  });
}

/* MY GROWTH — EXISTING GOALS */

function renderGrowth() {
  const data = loadData();

  document.getElementById("page-content").innerHTML = `
    <section class="content-card">
      <p class="eyebrow">YOUR NEXT CHAPTER</p>
      <h2>Growth goals</h2>
      <p class="muted" style="margin:8px 0 18px">
        Build yourself one goal at a time.
      </p>

      <form id="goal-form" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
        <input id="goal-input" type="text" placeholder="Add a personal goal..." maxlength="120" required style="flex:1;min-width:160px">
        <button class="primary-btn" type="submit">Add goal</button>
      </form>

      <div id="goal-list">
        ${data.goals.length ? data.goals.map(goal => `
          <div style="display:flex;align-items:center;gap:10px;padding:13px;margin-bottom:10px;border:1px solid var(--border);border-radius:10px">
            <span style="flex:1">${escapeHTML(goal.title)}</span>
            <button class="secondary-btn" type="button" data-delete-goal="${escapeHTML(goal.id)}">Delete</button>
          </div>
        `).join("") : `<p class="muted">No goals yet. Add your first one.</p>`}
      </div>
    </section>
  `;

  document.getElementById("goal-form").addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("goal-input");
    const title = input.value.trim();
    if (!title) return;

    const updated = loadData();
    updated.goals.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title
    });

    saveData(updated);
    renderGrowth();
  });

  document.querySelectorAll("[data-delete-goal]").forEach(button => {
    button.addEventListener("click", () => {
      const updated = loadData();
      updated.goals = updated.goals.filter(
        goal => String(goal.id) !== button.dataset.deleteGoal
      );
      saveData(updated);
      renderGrowth();
    });
  });
}

/* JOURNAL — PRIVATE WRITING */

function renderJournal(page) {
  const data = loadData();

  const headings = {
    entries: "Your latest thoughts, all in one place.",
    reflections: "Pause. Reflect. Understand.",
    memories: "Keep the moments you don't want to lose."
  };

  document.getElementById("page-content").innerHTML = `
    <section class="content-card">
      <p class="eyebrow">YOUR PRIVATE JOURNAL</p>
      <h2>${escapeHTML(PAGE_TITLES[page])}</h2>
      <p class="muted" style="margin:10px 0 20px">
        ${escapeHTML(headings[page])}
      </p>

      <textarea id="journal-notes" rows="12" placeholder="Write freely. This space is yours...">${escapeHTML(data.notes)}</textarea>

      <p id="journal-status" class="muted" style="margin-top:10px">
        Saved locally in this browser.
      </p>
    </section>
  `;

  const textarea = document.getElementById("journal-notes");
  const status = document.getElementById("journal-status");

  textarea.addEventListener("input", () => {
    const updated = loadData();
    updated.notes = textarea.value;
    saveData(updated);
    status.textContent = "Saved locally in this browser.";
  });
}

/* EXPLORE, MY WORLD, AND OTHER PERSONAL COLLECTIONS */

function renderCollection(page) {
  const data = loadData();
  const value = typeof data.pages[page] === "string" ? data.pages[page] : "";

  const descriptions = {
    knowledge: "Things you learn and want to understand deeply.",
    psychology: "Ideas about the mind, human behaviour, and life.",
    culture: "Songs, artists, films, and culture worth remembering.",
    ideas: "Interesting discoveries and thoughts to revisit.",
    creativity: "Your creative experiments and unfinished ideas.",
    habits: "The routines and principles you're building.",
    fitness: "Training notes, personal records, and recovery.",
    learning: "Skills you're developing and lessons you've learned.",
    milestones: "Small wins and important moments in your progress.",
    music: "Songs for particular moods, seasons, and memories.",
    interests: "The things that make your world feel like yours.",
    inspiration: "Words, images, people, and ideas that move you."
  };

  document.getElementById("page-content").innerHTML = `
    <section class="content-card">
      <p class="eyebrow">YOUR PERSONAL COLLECTION</p>
      <h2>${escapeHTML(PAGE_TITLES[page])}</h2>
      <p class="muted" style="margin:10px 0 20px">
        ${escapeHTML(descriptions[page] || "A collection that belongs to you.")}
      </p>

      <textarea id="collection-notes" rows="12" placeholder="Collect your thoughts, links, lessons, song names, or ideas here...">${escapeHTML(value)}</textarea>

      <p id="collection-status" class="muted" style="margin-top:10px">
        Saved locally in this browser.
      </p>
    </section>
  `;

  const textarea = document.getElementById("collection-notes");
  const status = document.getElementById("collection-status");

  textarea.addEventListener("input", () => {
    const updated = loadData();
    updated.pages[page] = textarea.value;
    saveData(updated);
    status.textContent = "Saved locally in this browser.";
  });
}

/* ARCHIVE — SEVEN-DAY PROGRESS */

function calculateStreak(data) {
  let streak = 0;
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  const today = data.days[todayKey()];
  const complete = day => day?.tasks?.length > 0 && day.tasks.every(task => task.done);

  if (!complete(today)) date.setDate(date.getDate() - 1);

  while (complete(data.days[todayKey(date)])) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function renderArchive() {
  const data = loadData();
  const today = getToday();
  const completed = today.tasks.filter(task => task.done).length;
  const percentage = Math.round(completed / today.tasks.length * 100);

  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const key = todayKey(date);
    const tasks = data.days[key]?.tasks || [];
    const done = tasks.filter(task => task.done).length;

    days.push({
      key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      done,
      total: tasks.length,
      percent: tasks.length ? Math.round(done / tasks.length * 100) : 0
    });
  }

  const average = Math.round(days.reduce((sum, day) => sum + day.percent, 0) / 7);

  document.getElementById("page-content").innerHTML = `
    <section class="content-card">
      <p class="eyebrow">LOOK HOW FAR YOU'VE COME</p>
      <h2>Your progress</h2>

      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px">
        <div class="panel-card">
          <p class="muted">Current streak</p>
          <h2 style="margin-top:8px">${calculateStreak(data)} days</h2>
        </div>
        <div class="panel-card">
          <p class="muted">Today's progress</p>
          <h2 style="margin-top:8px">${percentage}%</h2>
        </div>
        <div class="panel-card">
          <p class="muted">7-day average</p>
          <h2 style="margin-top:8px">${average}%</h2>
        </div>
        <div class="panel-card">
          <p class="muted">Tasks completed this week</p>
          <h2 style="margin-top:8px">${days.reduce((sum, day) => sum + day.done, 0)}</h2>
        </div>
      </div>
    </section>

    <section class="content-card">
      <h2>Last seven days</h2>
      <p class="muted" style="margin:8px 0 22px">
        Days without recorded tasks are shown as 0%.
      </p>

      ${days.map(day => `
        <div style="margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:8px">
            <span>${escapeHTML(day.key)} · ${day.label}</span>
            <strong>${day.percent}%</strong>
          </div>
          <div style="height:7px;background:var(--border);border-radius:20px;overflow:hidden">
            <div style="height:100%;width:${day.percent}%;background:var(--purple);border-radius:20px"></div>
          </div>
          <p class="muted" style="margin-top:6px">${day.done} / ${day.total} tasks</p>
        </div>
      `).join("")}
    </section>
  `;
}

/* NAVIGATION */

function showPage(page) {
  const pageContent = document.getElementById("page-content");
  const pageTitle = document.getElementById("page-title");

  const journalPages = ["entries", "reflections", "memories"];
  const collectionPages = [
    "knowledge", "psychology", "culture", "ideas", "creativity",
    "fitness", "learning", "milestones", "music", "interests", "inspiration"
  ];

  if (page === "home") {
    pageTitle.textContent = "Welcome home.";
    renderToday();
  } else if (page === "habits") {
    pageTitle.textContent = "Habits & discipline";
    renderGrowth();
  } else if (page === "archive") {
    pageTitle.textContent = "Your archive";
    renderArchive();
  } else if (journalPages.includes(page)) {
    pageTitle.textContent = PAGE_TITLES[page];
    renderJournal(page);
  } else if (collectionPages.includes(page)) {
    pageTitle.textContent = PAGE_TITLES[page];
    renderCollection(page);
  } else {
    return;
  }

  document.querySelectorAll(".nav-item, .sub-nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  pageContent.classList.remove("page-enter");
  void pageContent.offsetWidth;
  pageContent.classList.add("page-enter");
}

/* Expand/collapse parent sections; open pages from subheadings. */

document.querySelectorAll(".nav-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const menuId = button.getAttribute("aria-controls");
    const menu = document.getElementById(menuId);

    button.setAttribute("aria-expanded", String(!expanded));
    menu.hidden = expanded;
  });
});

document.querySelectorAll(".nav-item:not(.nav-toggle), .sub-nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

/* DATE */

const dateElement = document.getElementById("today-date");

if (dateElement) {
  dateElement.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

/* START */

showPage("home");

/* KEEP THE EXISTING SERVICE WORKER */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => console.error("Service worker registration failed:", error));
  });
}
