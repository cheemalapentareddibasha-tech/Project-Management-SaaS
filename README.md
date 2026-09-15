# TaskFlow - Modern Project Management SaaS

A clean, responsive, and professional Project Management SaaS dashboard web application built with pure **HTML5**, **CSS3**, and **JavaScript (ES6+)**.

All data is stored directly in your browser's `localStorage`—no database, backend setup, or external dependencies are required.

---

## Features

- **Executive SaaS Dashboard**:
  - Key performance metrics: Total Projects, Total Tasks, Active/In-Progress count, and Overall Completion Rate percentage with live progress bar.
  - High-priority tasks quick-list.
  - Interactive project progress cards.
- **Projects Management**:
  - Create new projects with custom title, description, and custom color accents.
  - Delete projects (with automatic cleanup of associated tasks to avoid orphaned records).
  - Track individual project completion percentages and status breakdown.
- **Interactive Tasks Board (Kanban View)**:
  - 3 dynamic status stages: **To Do**, **In Progress**, and **Completed**.
  - Quick status dropdown on each task card to effortlessly move tasks between stages.
  - Real-time task count indicators per column.
- **Task Attributes & Priority**:
  - Color-coded priority badges: **High** (red), **Medium** (amber), and **Low** (blue).
  - Due date tracking with human-friendly formatting.
  - Link each task to a specific project.
  - Edit or delete existing tasks with confirmation modals.
- **Search & Filtering**:
  - Instant live keyword search (by task title and description).
  - Filter tasks by project.
  - Filter tasks by priority level.
  - Top header global search bar that immediately jumps to and filters the board.
- **Persistent Storage (`localStorage`)**:
  - Automatically saves all your additions, edits, and deletions in the browser.
  - Pre-loaded with realistic seed demo data on first launch so the dashboard looks vibrant right away.
  - "Reset Sample Data" option in the sidebar to restore default sample projects and tasks anytime.
- **Modern SaaS UI & Responsive Design**:
  - Dark slate sidebar with indigo accents, clean typography, and subtle box shadows.
  - Polished modals with backdrop blur and smooth keyboard navigation (`Escape` key support).
  - Non-intrusive toast notifications for user actions.
  - Mobile-responsive layout with slide-out navigation drawer.

---

## How to Run the Project

Since this project uses vanilla web standards, there are several simple ways to run it:

### Method 1: Direct File Open (Easiest - No Installation Needed)
1. Open File Explorer and navigate to `C:\Projects\`.
2. Double-click **`index.html`** to open it directly in your default browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari, etc.).
3. The app is ready to use immediately!

### Method 2: Using VS Code Live Server Extension
1. Open the `C:\Projects` folder in **Visual Studio Code**.
2. If you have the **Live Server** extension installed, right-click `index.html` and click **"Open with Live Server"**.
3. It will launch at `http://127.0.0.1:5500/index.html`.

### Method 3: Using Python Built-in Server (Terminal / PowerShell)
If you have Python installed, you can start a local development server:
```powershell
cd C:\Projects
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## Project Structure & How It Works

```
c:/Projects/
├── index.html         # Application layout, views (Dashboard, Tasks, Projects), modals, and markup
├── css/
│   └── style.css      # SaaS design tokens, layout grids, cards, modals, badges, and responsive queries
├── js/
│   ├── store.js       # LocalStorage data access layer, seed data generator, and CRUD helpers
│   ├── ui.js          # Dynamic DOM rendering (Dashboard metrics, Kanban board, project cards, toasts)
│   └── app.js         # Event orchestration, search/filtering, view switching, and modal management
└── README.md          # Project documentation and quick start guide
```

### Architecture Breakdown for Beginners:

1. **`js/store.js` (The Data Model)**:
   - Manages reading and writing JSON data to `localStorage` under `taskflow_projects` and `taskflow_tasks`.
   - Populates initial realistic mock projects and tasks if the browser storage is empty.
   - Provides clean methods like `saveProject()`, `deleteProject()`, `saveTask()`, `deleteTask()`, and `getStats()`.

2. **`js/ui.js` (The View Layer)**:
   - Takes raw project and task data from `store.js` and dynamically builds the HTML strings for metric cards, kanban columns, and project lists.
   - Handles toast alerts and formatting helpers (e.g., date formatting, priority badges).

3. **`js/app.js` (The Controller)**:
   - Listens to user interactions: clicking sidebar tabs, submitting modals, typing into the search bar, or changing dropdown filters.
   - Glues `store.js` and `ui.js` together.

---

## Browser Support
Supports all modern evergreen browsers:
- Google Chrome (latest)
- Microsoft Edge (latest)
- Mozilla Firefox (latest)
- Apple Safari (latest)
"# Project-Management-SaaS" 
"# Project-Management-SaaS" 
