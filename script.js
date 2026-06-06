// Elementos del DOM
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

// Estado de la aplicación
let tasks = [];
let currentFilter = 'all';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateTaskCount();
    setupEventListeners();
});

// Configurar listeners de eventos
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearBtn.addEventListener('click', clearCompletedTasks);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });
}

// Agregar una nueva tarea
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Por favor, escribe una tarea');
        return;
    }

    if (taskText.length > 200) {
        alert('La tarea no puede tener más de 200 caracteres');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString('es-ES')
    };

    tasks.unshift(task);
    taskInput.value = '';
    taskInput.focus();

    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Eliminar una tarea
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Cambiar el estado de completado de una tarea
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}

// Limpiar tareas completadas
function clearCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        alert('No hay tareas completadas para limpiar');
        return;
    }

    if (confirm(`¿Deseas eliminar ${completedCount} tarea(s) completada(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}

// Renderizar tareas en el DOM
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks;

    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>📭 No hay tareas para mostrar</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
        `;

        taskList.appendChild(li);
    });
}

// Actualizar el contador de tareas
function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const totalTasks = tasks.length;

    if (activeTasks === 0) {
        taskCount.textContent = '✨ ¡Todas completadas!';
    } else if (activeTasks === 1) {
        taskCount.textContent = '1 tarea pendiente';
    } else {
        taskCount.textContent = `${activeTasks} tareas pendientes`;
    }

    clearBtn.disabled = tasks.filter(t => t.completed).length === 0;
}

// Guardar tareas en localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Cargar tareas desde localStorage
function loadTasks() {
    const saved = localStorage.getItem('tasks');
    tasks = saved ? JSON.parse(saved) : [];
}

// Función auxiliar para escapar HTML y evitar XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para limpiar todo el localStorage (opcional)
function clearAllData() {
    if (confirm('⚠️ ¿Deseas eliminar TODAS las tareas? Esta acción no se puede deshacer.')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}
