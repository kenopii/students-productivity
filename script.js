const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const priorityInput = document.getElementById("priorityInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterInput = document.getElementById("filterInput");
const sortInput = document.getElementById("sortInput");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const focusSessions = document.getElementById("focusSessions");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let sessions = Number(localStorage.getItem("focusSessions")) || 0;

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("focusSessions", sessions);
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    alert("Please enter a task.");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    deadline: deadlineInput.value,
    priority: priorityInput.value,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  taskInput.value = "";
  deadlineInput.value = "";
  priorityInput.value = "Low";

  saveData();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveData();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveData();
  renderTasks();
}

function getFilteredAndSortedTasks() {
  let displayedTasks = [...tasks];

  if (filterInput.value === "Active") {
    displayedTasks = displayedTasks.filter((task) => !task.completed);
  }

  if (filterInput.value === "Completed") {
    displayedTasks = displayedTasks.filter((task) => task.completed);
  }

  if (sortInput.value === "Deadline") {
    displayedTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }

  if (sortInput.value === "Priority") {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    displayedTasks.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }

  if (sortInput.value === "Newest") {
    displayedTasks.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  return displayedTasks;
}

function renderTasks() {
  taskList.innerHTML = "";
  const displayedTasks = getFilteredAndSortedTasks();

  if (displayedTasks.length === 0) {
    taskList.innerHTML = `<p class="task-meta">No tasks to show.</p>`;
  }

  displayedTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    li.innerHTML = `
          <div class="task-left">
            <input type="checkbox" ${task.completed ? "checked" : ""} />
            <div>
              <div class="task-text ${task.completed ? "completed" : ""}">${task.text}</div>
              <div class="task-meta">
                Priority: ${task.priority} ${task.deadline ? "| Deadline: " + task.deadline : "| No deadline"}
              </div>
            </div>
          </div>
          <button class="delete-btn">Delete</button>
        `;

    li.querySelector("input").addEventListener("change", () =>
      toggleTask(task.id),
    );
    li.querySelector("button").addEventListener("click", () =>
      deleteTask(task.id),
    );

    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const completedCount = tasks.filter((task) => task.completed).length;
  const goal = 3;
  const percentage = Math.min((completedCount / goal) * 100, 100);

  totalTasks.textContent = tasks.length;
  completedTasks.textContent = completedCount;
  focusSessions.textContent = sessions;
  progressFill.style.width = percentage + "%";
  progressText.textContent = Math.round(percentage) + "% completed";
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

filterInput.addEventListener("change", renderTasks);
sortInput.addEventListener("change", renderTasks);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// Timer
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimerBtn");
const pauseTimerBtn = document.getElementById("pauseTimerBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");

let timeLeft = 25 * 60;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval !== null) return;

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      sessions++;
      saveData();
      updateStats();
      alert("Good job! One focus session completed.");
      timeLeft = 25 * 60;
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timeLeft = 25 * 60;
  updateTimerDisplay();
}

startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);

renderTasks();
updateTimerDisplay();
