document.addEventListener("DOMContentLoaded", loadTasks);

let timers = [];

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const hours = parseInt(document.getElementById("hours").value || 0);
  const minutes = parseInt(document.getElementById("minutes").value || 0);
  const seconds = parseInt(document.getElementById("seconds").value || 0);

  const duration = hours * 3600 + minutes * 60 + seconds;

  if (!text || duration <= 0) return;

  const tasks = getTasksFromStorage();
  tasks.push({ text, duration, completed: false, created: Date.now() });
  saveTasksToStorage(tasks);

  // Clear input fields
  document.getElementById("taskInput").value = '';
  document.getElementById("hours").value = '';
  document.getElementById("minutes").value = '';
  document.getElementById("seconds").value = '';

  renderTasks();
}

function renderTasks() {
  clearAllTimers();
  const taskList = document.getElementById("taskList");
  const tasks = getTasksFromStorage();
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const remaining = task.duration - Math.floor((Date.now() - task.created) / 1000);
    const percent = task.completed ? 100 : Math.min(100, (100 * (task.duration - remaining)) / task.duration);

    li.innerHTML = `
      <div><strong>${task.text}</strong></div>
      <div class="progress-container">
        <div class="progress-bar" id="progress-${index}" style="width:${percent}%;"></div>
      </div>
      <div class="task-buttons">
        <button class="complete-btn" onclick="toggleComplete(${index})">
          ${task.completed ? "Undo" : "Done"}
        </button>
        <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);

    if (!task.completed && remaining > 0) {
      startProgressTimer(index, task.duration, task.created);
    } else if (remaining <= 0 && !task.completed) {
      autoComplete(index);
    }
  });
}

function startProgressTimer(index, duration, createdTime) {
  const bar = document.getElementById(`progress-${index}`);
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - createdTime) / 1000);
    const percent = Math.min(100, (elapsed / duration) * 100);
    if (bar) bar.style.width = `${percent}%`;
    if (elapsed >= duration) {
      clearInterval(interval);
      autoComplete(index);
    }
  }, 1000);
  timers.push(interval);
}

function autoComplete(index) {
  const tasks = getTasksFromStorage();
  tasks[index].completed = true;
  saveTasksToStorage(tasks);
  renderTasks();
}

function toggleComplete(index) {
  const tasks = getTasksFromStorage();
  tasks[index].completed = !tasks[index].completed;
  saveTasksToStorage(tasks);
  renderTasks();
}

function deleteTask(index) {
  const tasks = getTasksFromStorage();
  tasks.splice(index, 1);
  saveTasksToStorage(tasks);
  renderTasks();
}

function getTasksFromStorage() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function clearAllTimers() {
  timers.forEach(timer => clearInterval(timer));
  timers = [];
}

function loadTasks() {
  renderTasks();
}
