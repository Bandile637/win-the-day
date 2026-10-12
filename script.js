
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

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return {
      days: saved?.days || {},
      goals: Array.isArray(saved?.goals) ? saved.goals : [],
      notes: typeof saved?.notes === "string" ? saved.notes : ""
    };
  } catch {
    return { days: {}, goals: [], notes: "" };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getToday() {
  const data = loadData();
  const key = todayKey();

  if (!data.days[key]) {
    data.days[key] = {
      tasks: DEFAULT_TASKS.map(task => ({ ...task }))
    };
    saveData(data);
  }

  // Keep older saved days compatible with the current checklist.
  const tasks = data.days[key].tasks || [];
  const existingIds = new Set(tasks.map(task => task.id));

  DEFAULT_TASKS.forEach(task => {
    if (!existingIds.has(task.id)) {
      tasks.push({ ...task });
    }
  });

  data.days[key].tasks = DEFAULT_TASKS.map(defaultTask => {
    const existing = tasks.find(task => task.id === defaultTask.id);
    return existing
      ? { ...defaultTask, done: Boolean(existing.done) }
      : { ...defaultTask };
  });

  saveData(data);
  return data.days[key];
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

function renderToday() {
  const day = getToday();
  const completed = day.tasks.filter(task => task.done).length;
  const total = day.tasks.length;
  const percentage = total
    ? Math.round((completed / total) * 100)
    : 0;

  document.getElementById("page-content").innerHTML = `
    <section class="progress-card">
      <h2>Today's Mission</h2>
      <p style="margin:8px 0 14px">
        ${completed} of ${total} tasks complete
      </p>

      <div style="
        height:8px;
        background:var(--border, #30303d);
        border-radius:20px;
        overflow:hidden;
      ">
        <div style="
          width:${percentage}%;
          height:100%;
          background:var(--purple, #8b5cf6);
          border-radius:20px;
          transition:width .3s ease;
        "></div>
      </div>

      <p style="margin-top:10px;font-weight:700">${percentage}%</p>
    </section>

    <section class="progress-card" style="margin-top:20px">
      <h2>Daily Checklist</h2>

      <div id="task-list" style="
        display:flex;
        flex-direction:column;
        gap:12px;
        margin-top:16px;
      ">
        ${day.tasks.map(task => `
          <label style="
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px;
            border-radius:10px;
            cursor:pointer;
            background:var(--card-hover, rgba(255,255,255,.03));
          ">
            <input
              type="checkbox"
              data-task-id="${task.id}"
              ${task.done ? "checked" : ""}
              style="accent-color:var(--green, #62d6a5)"
            >
            <span style="
              flex:1;
              ${task.done ? "text-decoration:line-through;opacity:.75;" : ""}
            ">${escapeHTML(task.title)}</span>
          </label>
        `).join("")}
      </div>

      ${percentage === 100 ? `
        <div class="completion-message">
          <strong>🔥 Mission complete.</strong>
          <p style="margin-top:6px;font-size:13px">
            You showed up for yourself today. That's the standard.
          </p>
        </div>
      ` : ""}
      
      <button id="reset-day" style="margin-top:18px">
        Reset today's checklist
      </button>
    </section>
  `;

  document.querySelectorAll("#task-list input[type='checkbox']").forEach(input => {
    input.addEventListener("change", () => {
      const data = loadData();
      const key = todayKey();
      const currentDay = data.days[key] || { tasks: [] };
      const task = currentDay.tasks.find(
        item => item.id === Number(input.dataset.taskId)
      );

      if (task) {
        task.done = input.checked;
        data.days[key] = currentDay;
        saveData(data);
      }

      renderToday();
    });
  });

  document.getElementById("reset-day").addEventListener("click", () => {
    if (confirm("Reset all of today's tasks?")) {
      const data = loadData();
      data.days[todayKey()] = {
        tasks: DEFAULT_TASKS.map(task => ({ ...task }))
      };
      saveData(data);
      renderToday();
    }
  });
}

function renderGrowth() {
  const data = loadData();

  document.getElementById("page-content").innerHTML = `
    <section class="progress-card">
      <h2>Growth Goals</h2>
      <p style="margin:8px 0 16px">
        Build yourself one goal at a time.
      </p>

      <form id="goal-form" style="
        display:flex;
        gap:10px;
        margin-bottom:18px;
        flex-wrap:wrap;
      ">
        <input
          id="goal-input"
          type="text"
          placeholder="Add a personal goal..."
          maxlength="120"
          required
          style="flex:1;min-width:160px"
        >
        <button type="submit">Add goal</button>
      </form>

      <div id="goal-list" style="
        display:flex;
        flex-direction:column;
        gap:10px;
      ">
        ${data.goals.length ? data.goals.map(goal => `
          <div style="
            display:flex;
            align-items:center;
            gap:10px;
            padding:12px;
            border-radius:10px;
            background:var(--card-hover, rgba(255,255,255,.03));
          ">
            <span style="flex:1">${escapeHTML(goal.title)}</span>
            <button
              type="button"
              data-delete-goal="${escapeHTML(goal.id)}"
              aria-label="Delete goal"
            >Delete</button>
          </div>
        `).join("") : `
          <p>No goals yet. Add your first one above.</p>
        `}
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

function renderVault() {
  const data = loadData();

  document.getElementById("page-content").innerHTML = `
    <section class="progress-card">
      <h2>Your Private Vault</h2>
      <p style="margin:8px 0 16px">
        Write privately. Think clearly. You don't have to share everything.
      </p>

      <textarea
        id="vault-notes"
        placeholder="Write your thoughts, lessons, ideas, or reflections..."
        rows="12"
        style="width:100%;resize:vertical"
      >${escapeHTML(data.notes)}</textarea>

      <p id="vault-status" style="margin-top:10px;font-size:13px">
        Saved locally in this browser.
      </p>
    </section>
  `;

  const textarea = document.getElementById("vault-notes");
  const status = document.getElementById("vault-status");

  textarea.addEventListener("input", () => {
    const updated = loadData();
    updated.notes = textarea.value;
    saveData(updated);
    status.textContent = "Saved locally in this browser.";
  });
}

function calculateStreak(data) {
  let streak = 0;
  const checkDate = new Date();
  const today = data.days[todayKey()];

  // If today's checklist is unfinished, allow yesterday's streak
  // to remain visible until the current day is completed or missed.
  const todayComplete = today &&
    today.tasks.length > 0 &&
    today.tasks.every(task => task.done);

  if (!todayComplete) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = todayKey(checkDate);
    const day = data.days[key];

    if (
      !day ||
      !Array.isArray(day.tasks) ||
      day.tasks.length === 0 ||
      !day.tasks.every(task => task.done)
    ) {
      break;
    }

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

function renderProgress() {
  const data = loadData();
  const today = getToday();
  const completedToday = today.tasks.filter(task => task.done).length;
  const totalToday = today.tasks.length;
  const percentage = totalToday
    ? Math.round((completedToday / totalToday) * 100)
    : 0;

  const streak = calculateStreak(data);
  const dates = Object.keys(data.days || {}).sort().reverse();
  const recentDates = dates.slice(0, 7);

  document.getElementById("page-content").innerHTML = `
    <section class="progress-card">
      <h2>🔥 Current Streak</h2>
      <p style="font-size:36px;font-weight:700;margin:12px 0">
        ${streak} day${streak === 1 ? "" : "s"}
      </p>
      <p>Complete every daily task to build your streak.</p>

      <div style="margin-top:20px">
        <h3>Today's Completion</h3>
        <p style="font-size:24px;font-weight:700;margin-top:8px">
          ${percentage}%
        </p>
        <p>${completedToday} of ${totalToday} tasks completed</p>
      </div>
    </section>

    <section class="progress-card" style="margin-top:20px">
      <h2>Recent History</h2>
      <p style="margin:8px 0 14px">
        Days recorded: <strong>${dates.length}</strong>
      </p>

      ${recentDates.length ? `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${recentDates.map(key => {
            const day = data.days[key];
            const total = day?.tasks?.length || 0;
            const completed = day?.tasks?.filter(task => task.done).length || 0;
            const percent = total ? Math.round(completed / total * 100) : 0;

            return `
              <div style="
                padding:12px;
                border-radius:10px;
                background:var(--card-hover, rgba(255,255,255,.03));
              ">
                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:12px;
                  margin-bottom:8px;
                ">
                  <span>${escapeHTML(key)}</span>
                  <strong>${percent}%</strong>
                </div>

                <div style="
                  height:6px;
                  background:var(--border, #30303d);
                  border-radius:20px;
                  overflow:hidden;
                ">
                  <div style="
                    height:100%;
                    width:${percent}%;
                    background:var(--purple, #8b5cf6);
                    border-radius:20px;
                  "></div>
                </div>

                <p style="font-size:12px;margin-top:6px">
                  ${completed} / ${total} tasks
                </p>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <p>Your daily history will appear here as you use the app.</p>
      `}
    </section>
  `;
}

function showPage(page) {
  const pageContent = document.getElementById("page-content");
  const pageTitle = document.getElementById("page-title");

  const pages = {
    today: { title: "Today", render: renderToday },
    growth: { title: "Growth", render: renderGrowth },
    vault: { title: "Vault", render: renderVault },
    progress: { title: "Progress", render: renderProgress }
  };

  if (!pages[page]) return;

  pageTitle.textContent = pages[page].title;
  pages[page].render();

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  pageContent.classList.remove("page-enter");
  void pageContent.offsetWidth;
  pageContent.classList.add("page-enter");
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

const dateElement = document.getElementById("today-date");

if (dateElement) {
  dateElement.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

showPage("today");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => console.error("Service worker registration failed:", error));
  });
}
