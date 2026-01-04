// Initialize variables
let tasks = [];
let selectedPriority = 'low';
let editingTaskId = null;

// DOM elements
const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime');
const taskDeadline = document.getElementById('taskDeadline');
const addTaskBtn = document.getElementById('addTaskBtn');
const todoList = document.getElementById('todoList');
const doneList = document.getElementById('doneList');
const overdueList = document.getElementById('overdueList');
const overdueSection = document.getElementById('overdueSection');
const overdueCount = document.getElementById('overdueCount');
const priorityBtns = document.querySelectorAll('.priority-btn');
const deleteAllTodoBtn = document.getElementById('deleteAllTodo');
const deleteAllDoneBtn = document.getElementById('deleteAllDone');
const deleteAllOverdueBtn = document.getElementById('deleteAllOverdue');
const currentDateEl = document.getElementById('currentDate');

// Modal elements
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const editTaskTime = document.getElementById('editTaskTime');
const editTaskDeadline = document.getElementById('editTaskDeadline');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Display current date
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Priority button selection
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('priority-btn')) {
        const container = e.target.closest('.priority-selector');
        container.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        if (container.closest('.task-input-section')) {
            selectedPriority = e.target.dataset.priority;
        }
    }
});

// Add task
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const now = new Date();
    const task = {
        id: Date.now(),
        text: taskText,
        priority: selectedPriority,
        completed: false,
        time: taskTime.value || null,
        deadline: taskDeadline.value || null,
        createdDate: now.toLocaleDateString('en-US'),
        createdTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskTime.value = '';
    taskDeadline.value = '';
}

// Check if task is overdue
function isOverdue(task) {
    if (task.completed || !task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
}

// Create task card
function createTaskCard(task) {
    const article = document.createElement('article');
    if (isOverdue(task)) {
        article.classList.add('overdue');
    }

    const timeInfo = task.time || task.deadline ? `
        <div class="task-time-info">
            ${task.time ? `<strong>Time:</strong> ${task.time}` : ''}
            ${task.time && task.deadline ? ' • ' : ''}
            ${task.deadline ? `<strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString('en-US')}` : ''}
        </div>
    ` : '';

    article.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
            <div class="task-details">
                <div class="task-header">
                    <span class="task-title ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </div>
                ${timeInfo}
                <div class="task-meta">
                    <div class="task-actions">
                        <span class="task-date">
                            ${task.createdDate} • ${task.createdTime}
                            ${isOverdue(task) ? '<span class="overdue-badge">OVERDUE</span>' : ''}
                        </span>
                        <div class="action-buttons">
                            <button class="edit-task-btn" data-id="${task.id}">✏️</button>
                            <button class="delete-task-btn" data-id="${task.id}">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return article;
}

// Render tasks
function renderTasks() {
    todoList.innerHTML = '';
    doneList.innerHTML = '';
    overdueList.innerHTML = '';

    // Filter overdue tasks
    const overdueTasks = tasks.filter(task => isOverdue(task));
    
    // Show/hide overdue section
    if (overdueTasks.length > 0) {
        overdueSection.style.display = 'block';
        overdueCount.textContent = overdueTasks.length;
        
        // Render overdue tasks
        overdueTasks.forEach(task => {
            const overdueCard = createTaskCard(task);
            overdueList.appendChild(overdueCard);
        });
    } else {
        overdueSection.style.display = 'none';
    }

    // Render all tasks in TO DO
    tasks.forEach(task => {
        const todoCard = createTaskCard(task);
        todoList.appendChild(todoCard);

        // Also show in DONE list if completed
        if (task.completed) {
            const doneCard = createTaskCard(task);
            doneList.appendChild(doneCard);
        }
    });

    // Add event listeners
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTask);
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });

    document.querySelectorAll('.edit-task-btn').forEach(btn => {
        btn.addEventListener('click', openEditModal);
    });
}

// Toggle task completion
function toggleTask(e) {
    const taskId = parseInt(e.target.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = e.target.checked;
        saveTasks();
        renderTasks();
    }
}

// Delete single task
function deleteTask(e) {
    const taskId = parseInt(e.target.dataset.id);
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

// Open edit modal
function openEditModal(e) {
    const taskId = parseInt(e.target.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    editTaskInput.value = task.text;
    editTaskTime.value = task.time || '';
    editTaskDeadline.value = task.deadline || '';

    const modalPriorityBtns = editModal.querySelectorAll('.priority-btn');
    modalPriorityBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.priority === task.priority) {
            btn.classList.add('active');
        }
    });

    editModal.classList.add('active');
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    editingTaskId = null;
}

// Save edited task
function saveEditedTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const newText = editTaskInput.value.trim();
    if (newText === '') return;

    task.text = newText;
    task.time = editTaskTime.value || null;
    task.deadline = editTaskDeadline.value || null;
    
    const activePriorityBtn = editModal.querySelector('.priority-btn.active');
    if (activePriorityBtn) {
        task.priority = activePriorityBtn.dataset.priority;
    }

    saveTasks();
    renderTasks();
    closeEditModal();
}

// Delete all TO DO tasks
function deleteAllTodoTasks() {
    if (tasks.length === 0) return;
    if (confirm('Delete all tasks from To Do list?')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// Delete all DONE tasks
function deleteAllDoneTasks() {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;
    if (confirm('Delete all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    }
}

// Delete all OVERDUE tasks
function deleteAllOverdueTasks() {
    const overdueTasks = tasks.filter(t => isOverdue(t));
    if (overdueTasks.length === 0) return;
    if (confirm('Delete all overdue tasks?')) {
        tasks = tasks.filter(t => !isOverdue(t));
        saveTasks();
        renderTasks();
    }
}

// Save to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
deleteAllTodoBtn.addEventListener('click', deleteAllTodoTasks);
deleteAllDoneBtn.addEventListener('click', deleteAllDoneTasks);
deleteAllOverdueBtn.addEventListener('click', deleteAllOverdueTasks);
cancelEditBtn.addEventListener('click', closeEditModal);
saveEditBtn.addEventListener('click', saveEditedTask);

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

// Initialize
updateCurrentDate();
loadTasks();