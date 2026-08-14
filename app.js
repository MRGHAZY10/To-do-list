// Element Selectors
const input = document.getElementById("todo-input");
const submit = document.querySelector(".add-btn");
const todoListDiv = document.querySelector(".todo-list");
const clearAllBtn = document.querySelector(".clear-btn");
const controls = document.querySelector(".controls");
const pendingTodos = document.getElementById("pending");
const completedTodos = document.getElementById("completed");
const allTodos = document.getElementById("all");
const alert = document.querySelector(".alert");
const counter = document.getElementById("counter");

let todosArray = [];
let currentFilter = "all";

// Initialize Data
getTodosDataFromLocalStorage();

// Add or Update Todo Handler
submit.onclick = function () {
    const value = input.value.trim();

    if (value !== "") {
        if (isHTML(value)) {
            displayAlert("HTML tags are not allowed!", "danger");
        } else {
            if (submit.value === "update") {
                const editId = input.getAttribute("data-id");
                editTodoByID(editId, value);
                submit.value = "Add";
                input.removeAttribute("data-id");
                displayAlert("Todo updated successfully", "success");
            } else {
                addTodoItem(value);
                displayAlert("Todo added successfully", "success");
            }
            input.value = "";
        }
    } else {
        displayAlert("Please enter data", "danger");
    }
};

// Add Todo item to local state
function addTodoItem(todoTitle) {
    const todoItemObj = {
        id: Date.now(),
        title: todoTitle,
        completed: false
    };

    todosArray.push(todoItemObj);
    addTodosDataToLocalStorage(todosArray);
    setActiveFilter("all");
}

// Main Render Function
function renderTodos() {
    todoListDiv.innerHTML = "";

    let filteredTodos = todosArray;
    if (currentFilter === "pending") {
        filteredTodos = todosArray.filter(todo => !todo.completed);
    } else if (currentFilter === "completed") {
        filteredTodos = todosArray.filter(todo => todo.completed);
    }

    filteredTodos.forEach(todo => {
        const todoItem = document.createElement("div");
        todoItem.className = todo.completed ? "todo-item-done" : "todo-item";
        todoItem.setAttribute("data-id", todo.id);

        todoItem.innerHTML = `
            <div class="todo-text">
                <input type="checkbox" id="todo-checkbox-${todo.id}" class="todo-checkbox" ${todo.completed ? "checked" : ""}>
                <label for="todo-checkbox-${todo.id}" class="todo-title">${escapeHTML(todo.title)}</label>
            </div>
            <div class="btn-container">
                <button type="button" class="edit-btn" aria-label="Edit"></button>
                <button type="button" class="delete-btn" aria-label="Delete"></button>
            </div>
        `;

        todoListDiv.appendChild(todoItem);
    });

    updateCounter();
}

// Delegated Event Listener on Todo List Container
todoListDiv.addEventListener("click", (event) => {
    const target = event.target;
    const todoItemElement = target.closest(".todo-item, .todo-item-done");
    if (!todoItemElement) return;

    const id = todoItemElement.getAttribute("data-id");

    if (target.classList.contains("delete-btn")) {
        deleteTodoByID(id);
        displayAlert("Item removed", "danger");
    } else if (target.classList.contains("edit-btn")) {
        const titleText = todoItemElement.querySelector(".todo-title").innerText;
        input.value = titleText;
        input.setAttribute("data-id", id);
        submit.value = "update";
        input.focus();
    } else if (target.classList.contains("todo-checkbox")) {
        toggleTodoStatusByID(id);
    }
});

// Toggle Item State
function toggleTodoStatusByID(id) {
    todosArray = todosArray.map(todo => {
        if (todo.id == id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });

    addTodosDataToLocalStorage(todosArray);
    renderTodos();
}

// LocalStorage Sync
function addTodosDataToLocalStorage(todos) {
    window.localStorage.setItem("Todos", JSON.stringify(todos));
}

function getTodosDataFromLocalStorage() {
    const data = localStorage.getItem("Todos");
    if (data) {
        todosArray = JSON.parse(data);
    }
    renderTodos();
}

// Delete Item
function deleteTodoByID(todoId) {
    todosArray = todosArray.filter((todo) => todo.id != todoId);
    addTodosDataToLocalStorage(todosArray);
    renderTodos();
}

// Edit Item
function editTodoByID(id, text) {
    todosArray = todosArray.map(todo => {
        if (todo.id == id) {
            return { ...todo, title: text };
        }
        return todo;
    });
    addTodosDataToLocalStorage(todosArray);
    renderTodos();
}

// Clear All Items
clearAllBtn.addEventListener("click", clearAllTodos);

function clearAllTodos() {
    todosArray = [];
    addTodosDataToLocalStorage(todosArray);
    renderTodos();
    displayAlert("All items cleared", "danger");
}

// Filter Tab Selection
controls.addEventListener("click", (event) => {
    if (event.target.tagName === "SPAN" && event.target.parentElement.classList.contains("filters")) {
        setActiveFilter(event.target.id);
    }
});

function setActiveFilter(filterId) {
    currentFilter = filterId;
    allTodos.className = filterId === "all" ? "active" : "";
    pendingTodos.className = filterId === "pending" ? "active" : "";
    completedTodos.className = filterId === "completed" ? "active" : "";
    renderTodos();
}

// Notification System
function displayAlert(text, action) {
    alert.textContent = text;
    alert.className = `alert alert-${action}`;
    setTimeout(() => {
        alert.textContent = "";
        alert.className = "alert";
    }, 3000);
}

// Security Checkers & Helpers
function isHTML(str) {
    const doc = new DOMParser().parseFromString(str, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Counter Display Update
function updateCounter() {
    const countCompleted = todosArray.reduce((acc, todo) => todo.completed ? acc + 1 : acc, 0);
    const countPending = todosArray.length - countCompleted;

    counter.innerHTML = `
        <span class="counter-left">${countPending}</span> pending &amp;
        <span class="counter-completed">${countCompleted}</span> completed
    `;
}

// Enter Key Submit Support
input.addEventListener("keyup", (event) => {
    if (event.key === 'Enter') {
        submit.onclick();
    }
});