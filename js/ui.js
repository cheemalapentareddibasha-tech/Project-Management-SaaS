/**
 * TaskFlow SaaS - UI Renderer Module
 * Generates dynamic HTML components, manages modals and toast alerts.
 */

const UI = {
  // Utility: Sanitize text to prevent HTML injection
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Format YYYY-MM-DD to friendly human date
  formatDate(dateStr) {
    if (!dateStr) return 'No due date';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  },

  // Priority badge styling helper
  getPriorityBadge(priority) {
    const map = {
      high: { label: 'High', class: 'badge-high' },
      medium: { label: 'Medium', class: 'badge-medium' },
      low: { label: 'Low', class: 'badge-low' }
    };
    const p = map[priority] || map.medium;
    return `<span class="badge ${p.class}"><span class="badge-dot"></span>${p.label}</span>`;
  },

  // Status badge styling helper
  getStatusBadge(status) {
    const map = {
      todo: { label: 'To Do', class: 'status-todo' },
      in_progress: { label: 'In Progress', class: 'status-inprogress' },
      completed: { label: 'Completed', class: 'status-completed' }
    };
    const s = map[status] || map.todo;
    return `<span class="status-pill ${s.class}">${s.label}</span>`;
  },

  // Show Toast Notification
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${this.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3.2s
    setTimeout(() => {
      toast.classList.add('toast-fade');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // --- RENDER DASHBOARD ---
  renderDashboard() {
    const stats = window.appStore.getStats();
    const projects = window.appStore.getProjects();
    const tasks = window.appStore.getTasks();

    // Render Stats Metric Cards
    const statsContainer = document.getElementById('dashboard-metrics');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Projects</span>
            <div class="stat-icon-wrap bg-indigo-soft">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <div class="stat-value">${stats.totalProjects}</div>
          <div class="stat-footer text-muted">Active in workspace</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Tasks</span>
            <div class="stat-icon-wrap bg-blue-soft">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="stat-value">${stats.totalTasks}</div>
          <div class="stat-footer">
            <span class="text-inprogress font-medium">${stats.inProgressTasks}</span> in progress
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Completed Tasks</span>
            <div class="stat-icon-wrap bg-emerald-soft">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div class="stat-value text-completed">${stats.completedTasks}</div>
          <div class="stat-footer text-muted">Successfully finished</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Overall Completion</span>
            <div class="stat-icon-wrap bg-purple-soft">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="stat-value">${stats.completionRate}%</div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${stats.completionRate}%"></div>
          </div>
        </div>
      `;
    }

    // Render Urgent / High Priority Tasks
    const urgentTasksList = document.getElementById('dashboard-urgent-tasks');
    if (urgentTasksList) {
      const highPriorityTasks = tasks
        .filter(t => t.priority === 'high' && t.status !== 'completed')
        .slice(0, 4);

      if (highPriorityTasks.length === 0) {
        urgentTasksList.innerHTML = `
          <div class="empty-state-sm">
            <div class="empty-check">✓</div>
            <p>No pending high-priority tasks. Great job!</p>
          </div>
        `;
      } else {
        urgentTasksList.innerHTML = highPriorityTasks.map(task => {
          const project = window.appStore.getProjectById(task.projectId);
          const projectColor = project ? project.color : '#6b7280';
          const projectName = project ? project.name : 'General';
          return `
            <div class="dashboard-task-item" onclick="window.app.editTask('${task.id}')">
              <div class="dash-task-left">
                <span class="project-tag-pill" style="border-left: 3px solid ${projectColor}">
                  ${this.escapeHTML(projectName)}
                </span>
                <span class="dash-task-title">${this.escapeHTML(task.title)}</span>
              </div>
              <div class="dash-task-right">
                ${this.getStatusBadge(task.status)}
                <span class="dash-task-due">${this.formatDate(task.dueDate)}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Projects Quick Progress
    const dashProjectsContainer = document.getElementById('dashboard-projects-list');
    if (dashProjectsContainer) {
      if (projects.length === 0) {
        dashProjectsContainer.innerHTML = `
          <div class="empty-state-sm">
            <p>No projects yet. Click "+ New Project" to get started.</p>
          </div>
        `;
      } else {
        dashProjectsContainer.innerHTML = projects.map(proj => {
          const pStats = window.appStore.getProjectStats(proj.id);
          return `
            <div class="dash-project-card" onclick="window.app.filterByProjectAndNavigate('${proj.id}')">
              <div class="dash-project-top">
                <div class="dash-project-title-group">
                  <span class="project-indicator" style="background-color: ${proj.color}"></span>
                  <h4 class="dash-project-name">${this.escapeHTML(proj.name)}</h4>
                </div>
                <span class="dash-project-pct font-medium">${pStats.progress}%</span>
              </div>
              <p class="dash-project-desc">${this.escapeHTML(proj.description || 'No description.')}</p>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${pStats.progress}%; background-color: ${proj.color}"></div>
              </div>
              <div class="dash-project-meta">
                <span>${pStats.completed}/${pStats.total} tasks done</span>
                <span class="view-link">View Tasks &rarr;</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // --- RENDER TASKS (KANBAN BOARD) ---
  renderTasks(searchQuery = '', filterProject = 'all', filterPriority = 'all') {
    let tasks = window.appStore.getTasks();

    // Apply Live Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Apply Project Filter
    if (filterProject !== 'all') {
      tasks = tasks.filter(t => t.projectId === filterProject);
    }

    // Apply Priority Filter
    if (filterPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === filterPriority);
    }

    // Segregate tasks by status
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Update column counters
    document.getElementById('count-todo').textContent = todoTasks.length;
    document.getElementById('count-inprogress').textContent = inProgressTasks.length;
    document.getElementById('count-completed').textContent = completedTasks.length;

    // Render each column
    this.renderTaskColumn('tasks-col-todo', todoTasks);
    this.renderTaskColumn('tasks-col-inprogress', inProgressTasks);
    this.renderTaskColumn('tasks-col-completed', completedTasks);
  },

  renderTaskColumn(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="kanban-empty">
          <p>No tasks here</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(task => {
      const project = window.appStore.getProjectById(task.projectId);
      const projectName = project ? project.name : 'General';
      const projectColor = project ? project.color : '#94a3b8';

      return `
        <div class="task-card" id="task-card-${task.id}">
          <div class="task-card-header">
            <span class="project-pill" style="border-color: ${projectColor}33; color: ${projectColor}; background: ${projectColor}12;">
              <span class="dot" style="background-color: ${projectColor}"></span>
              ${this.escapeHTML(projectName)}
            </span>
            <div class="task-card-actions">
              <button class="btn-icon" title="Edit task" onclick="window.app.editTask('${task.id}')">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger" title="Delete task" onclick="window.app.confirmDeleteTask('${task.id}')">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <h3 class="task-title">${this.escapeHTML(task.title)}</h3>
          ${task.description ? `<p class="task-desc">${this.escapeHTML(task.description)}</p>` : ''}

          <div class="task-card-meta">
            ${this.getPriorityBadge(task.priority)}
            <div class="task-due-date" title="Due date">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>${this.formatDate(task.dueDate)}</span>
            </div>
          </div>

          <div class="task-status-bar">
            <label class="status-quick-label">Move to:</label>
            <select class="status-select" onchange="window.app.moveTaskStatus('${task.id}', this.value)">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
      `;
    }).join('');
  },

  // --- RENDER PROJECTS VIEW ---
  renderProjects() {
    const projects = window.appStore.getProjects();
    const container = document.getElementById('projects-grid');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-full">
          <div class="empty-icon">📁</div>
          <h3>No projects created yet</h3>
          <p>Organize your work by creating your first project container.</p>
          <button class="btn btn-primary mt-3" onclick="window.app.openProjectModal()">
            + Create New Project
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(proj => {
      const stats = window.appStore.getProjectStats(proj.id);
      return `
        <div class="project-card">
          <div class="project-card-header">
            <div class="project-badge-title">
              <span class="project-avatar-dot" style="background-color: ${proj.color}"></span>
              <h3 class="project-card-name">${this.escapeHTML(proj.name)}</h3>
            </div>
            <button class="btn-icon btn-icon-danger" title="Delete project" onclick="window.app.confirmDeleteProject('${proj.id}')">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <p class="project-card-desc">${this.escapeHTML(proj.description || 'No description provided.')}</p>

          <div class="project-progress-section">
            <div class="project-progress-labels">
              <span>Progress</span>
              <span class="font-semibold">${stats.progress}%</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${stats.progress}%; background-color: ${proj.color}"></div>
            </div>
          </div>

          <div class="project-counts-grid">
            <div class="p-count-item">
              <span class="p-count-num">${stats.total}</span>
              <span class="p-count-label">Total</span>
            </div>
            <div class="p-count-item">
              <span class="p-count-num text-todo">${stats.todo}</span>
              <span class="p-count-label">To Do</span>
            </div>
            <div class="p-count-item">
              <span class="p-count-num text-inprogress">${stats.inProgress}</span>
              <span class="p-count-label">In Progress</span>
            </div>
            <div class="p-count-item">
              <span class="p-count-num text-completed">${stats.completed}</span>
              <span class="p-count-label">Done</span>
            </div>
          </div>

          <div class="project-card-footer">
            <button class="btn btn-sm btn-secondary w-full" onclick="window.app.filterByProjectAndNavigate('${proj.id}')">
              View Tasks Board &rarr;
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Populate project options in the task modal and filter dropdown
  populateProjectDropdowns() {
    const projects = window.appStore.getProjects();

    // 1. Task Modal Project Select
    const taskModalSelect = document.getElementById('task-project-select');
    if (taskModalSelect) {
      if (projects.length === 0) {
        taskModalSelect.innerHTML = `<option value="">No projects available (Create one first)</option>`;
      } else {
        taskModalSelect.innerHTML = projects.map(p => 
          `<option value="${p.id}">${this.escapeHTML(p.name)}</option>`
        ).join('');
      }
    }

    // 2. Filter Project Select in Tasks view
    const filterSelect = document.getElementById('filter-project');
    if (filterSelect) {
      const currentVal = filterSelect.value;
      let html = `<option value="all">All Projects</option>`;
      projects.forEach(p => {
        html += `<option value="${p.id}">${this.escapeHTML(p.name)}</option>`;
      });
      filterSelect.innerHTML = html;
      if (currentVal) filterSelect.value = currentVal;
    }
  }
};

window.UI = UI;
