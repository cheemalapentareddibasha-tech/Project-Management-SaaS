/**
 * TaskFlow SaaS - Data Store & LocalStorage Manager
 * Handles data persistence, CRUD operations, and initial seed data.
 */

const STORAGE_KEYS = {
  PROJECTS: 'taskflow_projects',
  TASKS: 'taskflow_tasks',
  INIT_FLAG: 'taskflow_initialized_v1'
};

// Realistic seed data to populate on first load
const SEED_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'Modernize marketing landing page, optimize SEO, and enhance responsive design.',
    color: '#6366f1', // Indigo
    createdAt: '2026-09-01'
  },
  {
    id: 'proj-2',
    name: 'Mobile App Launch',
    description: 'Prepare iOS and Android releases, test onboarding, and set up analytics.',
    color: '#0ea5e9', // Sky Blue
    createdAt: '2026-09-05'
  },
  {
    id: 'proj-3',
    name: 'Brand & Marketing Q3',
    description: 'Product marketing campaigns, customer interviews, and brand assets revamp.',
    color: '#10b981', // Emerald
    createdAt: '2026-09-10'
  }
];

const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Design high-fidelity wireframes',
    description: 'Create interactive Figma mockups for the homepage, pricing, and features sections.',
    projectId: 'proj-1',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-09-18'
  },
  {
    id: 'task-2',
    title: 'Implement responsive navigation bar',
    description: 'Build sticky mobile-friendly header with dropdown menus and smooth transitions.',
    projectId: 'proj-1',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2026-09-22'
  },
  {
    id: 'task-3',
    title: 'Setup user authentication flow',
    description: 'Integrate secure OAuth login, email verification, and password reset screens.',
    projectId: 'proj-2',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-09-25'
  },
  {
    id: 'task-4',
    title: 'Configure push notifications',
    description: 'Set up push service tokens and automated lifecycle notification triggers.',
    projectId: 'proj-2',
    priority: 'low',
    status: 'todo',
    dueDate: '2026-09-30'
  },
  {
    id: 'task-5',
    title: 'Draft social media campaign copy',
    description: 'Prepare launch announcement copy and visual banners for LinkedIn and Twitter/X.',
    projectId: 'proj-3',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-09-20'
  },
  {
    id: 'task-6',
    title: 'Conduct user feedback interviews',
    description: 'Schedule calls with 10 beta testers to evaluate dashboard usability.',
    projectId: 'proj-3',
    priority: 'high',
    status: 'completed',
    dueDate: '2026-09-15'
  },
  {
    id: 'task-7',
    title: 'Optimize Lighthouse score',
    description: 'Compress image assets, eliminate render-blocking CSS, and audit Core Web Vitals.',
    projectId: 'proj-1',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-09-28'
  }
];

class Store {
  constructor() {
    this.initialize();
  }

  initialize() {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INIT_FLAG);
    if (!isInitialized) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
    localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true');
  }

  // --- PROJECTS CRUD ---

  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading projects from localStorage', e);
      return [];
    }
  }

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id) || null;
  }

  saveProject(projectData) {
    const projects = this.getProjects();
    if (projectData.id) {
      // Update existing
      const index = projects.findIndex(p => p.id === projectData.id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
      }
    } else {
      // Create new
      const newProject = {
        ...projectData,
        id: 'proj-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      projects.unshift(newProject);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return projectData;
  }

  deleteProject(projectId) {
    // Delete project
    const projects = this.getProjects().filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

    // Also delete associated tasks to avoid orphans
    const tasks = this.getTasks().filter(t => t.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  // --- TASKS CRUD ---

  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading tasks from localStorage', e);
      return [];
    }
  }

  getTaskById(id) {
    return this.getTasks().find(t => t.id === id) || null;
  }

  saveTask(taskData) {
    const tasks = this.getTasks();
    if (taskData.id) {
      // Update
      const index = tasks.findIndex(t => t.id === taskData.id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...taskData };
      }
    } else {
      // Create new
      const newTask = {
        ...taskData,
        id: 'task-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      tasks.unshift(newTask);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return taskData;
  }

  updateTaskStatus(taskId, newStatus) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    }
    return false;
  }

  deleteTask(taskId) {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  // --- STATS & AGGREGATIONS ---

  getStats() {
    const projects = this.getProjects();
    const tasks = this.getTasks();

    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      completionRate
    };
  }

  getProjectStats(projectId) {
    const tasks = this.getTasks().filter(t => t.projectId === projectId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, progress };
  }
}

// Export singleton instance
window.appStore = new Store();
