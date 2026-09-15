/**
 * TaskFlow SaaS - Main Application Controller
 * Handles routing between views, modal interactions, and event orchestration.
 */

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.deleteTarget = null; // { type: 'project' | 'task', id: string }
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupViewNavigation();
    this.renderCurrentView();
    window.UI.populateProjectDropdowns();
  }

  // --- VIEW SWITCHING ---
  switchView(viewName) {
    this.currentView = viewName;

    // Update view container visibility
    document.querySelectorAll('.view-content').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update sidebar navigation active item
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      }
    });

    // Close mobile sidebar if open
    this.closeMobileSidebar();

    // Render contents
    this.renderCurrentView();
  }

  renderCurrentView() {
    window.UI.populateProjectDropdowns();
    if (this.currentView === 'dashboard') {
      window.UI.renderDashboard();
    } else if (this.currentView === 'tasks') {
      this.filterTasks();
    } else if (this.currentView === 'projects') {
      window.UI.renderProjects();
    }
  }

  // Filter tasks in tasks view based on current inputs
  filterTasks() {
    const searchVal = document.getElementById('search-tasks-input')?.value || '';
    const projVal = document.getElementById('filter-project')?.value || 'all';
    const priorityVal = document.getElementById('filter-priority')?.value || 'all';

    window.UI.renderTasks(searchVal, projVal, priorityVal);
  }

  // Jump from project card or dashboard to tasks filtered by that project
  filterByProjectAndNavigate(projectId) {
    this.switchView('tasks');
    const filterSelect = document.getElementById('filter-project');
    if (filterSelect) {
      filterSelect.value = projectId;
      this.filterTasks();
    }
  }

  // --- MODAL MANAGEMENT ---

  // Task Modal
  openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('task-modal-title');
    const form = document.getElementById('task-form');
    
    window.UI.populateProjectDropdowns();
    form.reset();

    if (taskId) {
      // Edit mode
      const task = window.appStore.getTaskById(taskId);
      if (!task) return;

      modalTitle.textContent = 'Edit Task';
      document.getElementById('task-id-input').value = task.id;
      document.getElementById('task-title-input').value = task.title;
      document.getElementById('task-desc-input').value = task.description || '';
      document.getElementById('task-project-select').value = task.projectId;
      document.getElementById('task-priority-select').value = task.priority;
      document.getElementById('task-status-select').value = task.status;
      document.getElementById('task-due-date-input').value = task.dueDate || '';
    } else {
      // Create mode
      modalTitle.textContent = 'Create New Task';
      document.getElementById('task-id-input').value = '';
      
      // Default to currently selected project filter if in tasks view
      const currentProjectFilter = document.getElementById('filter-project')?.value;
      if (currentProjectFilter && currentProjectFilter !== 'all') {
        document.getElementById('task-project-select').value = currentProjectFilter;
      }

      // Default due date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      document.getElementById('task-due-date-input').value = defaultDate.toISOString().split('T')[0];
    }

    modal.classList.add('open');
    document.getElementById('task-title-input').focus();
  }

  closeTaskModal() {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('open');
  }

  saveTaskFromModal(e) {
    e.preventDefault();
    const id = document.getElementById('task-id-input').value;
    const title = document.getElementById('task-title-input').value.trim();
    const description = document.getElementById('task-desc-input').value.trim();
    const projectId = document.getElementById('task-project-select').value;
    const priority = document.getElementById('task-priority-select').value;
    const status = document.getElementById('task-status-select').value;
    const dueDate = document.getElementById('task-due-date-input').value;

    if (!title) {
      window.UI.showToast('Please enter a task title', 'error');
      return;
    }

    if (!projectId) {
      window.UI.showToast('Please create a project first!', 'error');
      return;
    }

    const taskData = {
      title,
      description,
      projectId,
      priority,
      status,
      dueDate
    };

    if (id) {
      taskData.id = id;
      window.appStore.saveTask(taskData);
      window.UI.showToast('Task updated successfully');
    } else {
      window.appStore.saveTask(taskData);
      window.UI.showToast('New task added successfully');
    }

    this.closeTaskModal();
    this.renderCurrentView();
  }

  editTask(taskId) {
    this.openTaskModal(taskId);
  }

  moveTaskStatus(taskId, newStatus) {
    const updated = window.appStore.updateTaskStatus(taskId, newStatus);
    if (updated) {
      window.UI.showToast(`Task moved to ${newStatus.replace('_', ' ')}`);
      this.renderCurrentView();
    }
  }

  // Project Modal
  openProjectModal() {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    form.reset();
    modal.classList.add('open');
    document.getElementById('project-name-input').focus();
  }

  closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('open');
  }

  saveProjectFromModal(e) {
    e.preventDefault();
    const name = document.getElementById('project-name-input').value.trim();
    const description = document.getElementById('project-desc-input').value.trim();
    const color = document.getElementById('project-color-input').value;

    if (!name) {
      window.UI.showToast('Please enter a project name', 'error');
      return;
    }

    window.appStore.saveProject({
      name,
      description,
      color
    });

    window.UI.showToast('Project created successfully!');
    this.closeProjectModal();
    this.renderCurrentView();
  }

  // Deletion Confirmation Dialogs
  confirmDeleteTask(taskId) {
    const task = window.appStore.getTaskById(taskId);
    if (!task) return;

    this.deleteTarget = { type: 'task', id: taskId };
    document.getElementById('confirm-modal-title').textContent = 'Delete Task';
    document.getElementById('confirm-modal-message').textContent = 
      `Are you sure you want to permanently delete the task "${task.title}"?`;

    document.getElementById('confirm-modal').classList.add('open');
  }

  confirmDeleteProject(projectId) {
    const project = window.appStore.getProjectById(projectId);
    if (!project) return;

    this.deleteTarget = { type: 'project', id: projectId };
    document.getElementById('confirm-modal-title').textContent = 'Delete Project';
    document.getElementById('confirm-modal-message').textContent = 
      `Are you sure you want to delete "${project.name}"? All tasks associated with this project will also be deleted.`;

    document.getElementById('confirm-modal').classList.add('open');
  }

  executeConfirmedDelete() {
    if (!this.deleteTarget) return;

    if (this.deleteTarget.type === 'task') {
      window.appStore.deleteTask(this.deleteTarget.id);
      window.UI.showToast('Task removed', 'info');
    } else if (this.deleteTarget.type === 'project') {
      window.appStore.deleteProject(this.deleteTarget.id);
      window.UI.showToast('Project and related tasks removed', 'info');
    }

    this.closeConfirmModal();
    this.renderCurrentView();
  }

  closeConfirmModal() {
    this.deleteTarget = null;
    document.getElementById('confirm-modal').classList.remove('open');
  }

  // Demo Data Reset
  handleResetDemoData() {
    if (confirm('Reset workspace to initial sample projects and tasks? Any custom data will be replaced.')) {
      window.appStore.resetToDefaults();
      window.UI.showToast('Workspace reset to sample demo data');
      this.renderCurrentView();
    }
  }

  // Mobile sidebar controls
  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // --- EVENT BINDING ---
  bindEvents() {
    // Navigation items
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = link.dataset.view;
        if (viewName) {
          this.switchView(viewName);
        }
      });
    });

    // Top action buttons
    document.getElementById('btn-new-task')?.addEventListener('click', () => this.openTaskModal());
    document.getElementById('btn-new-project')?.addEventListener('click', () => this.openProjectModal());
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => this.handleResetDemoData());

    // Modal submit forms
    document.getElementById('task-form')?.addEventListener('submit', (e) => this.saveTaskFromModal(e));
    document.getElementById('project-form')?.addEventListener('submit', (e) => this.saveProjectFromModal(e));

    // Modal close buttons
    document.getElementById('btn-close-task-modal')?.addEventListener('click', () => this.closeTaskModal());
    document.getElementById('btn-cancel-task')?.addEventListener('click', () => this.closeTaskModal());
    
    document.getElementById('btn-close-project-modal')?.addEventListener('click', () => this.closeProjectModal());
    document.getElementById('btn-cancel-project')?.addEventListener('click', () => this.closeProjectModal());

    document.getElementById('btn-confirm-delete')?.addEventListener('click', () => this.executeConfirmedDelete());
    document.getElementById('btn-cancel-confirm')?.addEventListener('click', () => this.closeConfirmModal());
    document.getElementById('btn-close-confirm-modal')?.addEventListener('click', () => this.closeConfirmModal());

    // Filter and search handlers in Tasks view
    const searchInput = document.getElementById('search-tasks-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterTasks());
    }

    const filterProject = document.getElementById('filter-project');
    if (filterProject) {
      filterProject.addEventListener('change', () => this.filterTasks());
    }

    const filterPriority = document.getElementById('filter-priority');
    if (filterPriority) {
      filterPriority.addEventListener('change', () => this.filterTasks());
    }

    // Global search input in top header (jumps to tasks view and filters)
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        if (this.currentView !== 'tasks') {
          this.switchView('tasks');
        }
        const taskSearch = document.getElementById('search-tasks-input');
        if (taskSearch) {
          taskSearch.value = e.target.value;
          this.filterTasks();
        }
      });
    }

    // Mobile sidebar toggle
    document.getElementById('btn-mobile-menu')?.addEventListener('click', () => this.toggleMobileSidebar());
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeMobileSidebar());

    // Modal backdrop clicks & Escape key
    document.querySelectorAll('.modal-overlay').forEach(modalOverlay => {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          modalOverlay.classList.remove('open');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTaskModal();
        this.closeProjectModal();
        this.closeConfirmModal();
      }
    });
  }

  setupViewNavigation() {
    // Quick buttons like "+ Add Project" or "+ Add Task" inside empty states or sub-views
    document.querySelectorAll('[data-action="new-task"]').forEach(btn => {
      btn.addEventListener('click', () => this.openTaskModal());
    });
    document.querySelectorAll('[data-action="new-project"]').forEach(btn => {
      btn.addEventListener('click', () => this.openProjectModal());
    });
  }
}

// Instantiate app after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
