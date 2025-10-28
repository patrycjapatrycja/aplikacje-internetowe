
class ToDo {
    constructor() {
        this.taskList = document.getElementById('list-container');
        this.tasks = [];
        this.localStorageKey = 'tasks';
        this.searchQuery = '';
        this.editIndex = -1;

        this.readFromLocalStorage();
        this.draw();
    };

    getTasksFilteredBySearchQuery() {
        if (this.searchQuery.length < 2){
            return this.tasks;
        }
        return this.tasks.filter(task => task.task.toLowerCase().includes(this.searchQuery));
    };

    draw() {
        this.taskList.innerHTML = '';

        this.getTasksFilteredBySearchQuery().forEach((task, index) => {
            const newTask = this.createNewTask(task.task, task.date, index);
            this.taskList.appendChild(newTask);
        })
    };

    createNewTask(task, date, index) {
        const newTask = document.createElement('li');
        newTask.className = 'task-card';

        newTask.innerHTML = `
        <p class="task-name">${this.highlightMatch(task)}</p>
        <p class="date">${date}</p>
    `;

        const trashButton = document.createElement('button');
        trashButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        trashButton.className = 'trash-button';

        newTask.appendChild(trashButton);

        // handle delete
        newTask.querySelector('.trash-button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(index);
        });


        // handle edit
        newTask.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.editIndex >= 0 && this.editIndex !== index) {
                this.forceStopEdit();
            }
            this.edit(newTask, index, task, date);
        });

        return newTask;
    };

    validateInputTask(task) {
        return task.length >= 3 && task.length <= 255;
    };

    validateDate(date) {
        if (date.length === 0) {
            return true
        }
        const currentDate = new Date();
        const givenDate = new Date(date);

        return currentDate < givenDate;
    };

    addTask(task, date) {
        if (!this.validateInputTask(task) || !this.validateDate(date)) {
            return;
        }
        this.tasks.push({task, date});
        this.saveToLocalStorage();
        this.draw();
    };

    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.saveToLocalStorage();
        this.draw();
    };

    editTask(index, updatedTask, updatedDate) {
        if (this.validateInputTask(updatedTask)) {
            this.tasks[index].task = updatedTask;
        }
        if (this.validateDate(updatedDate)) {
            this.tasks[index].date = updatedDate;
        }
        this.saveToLocalStorage();
        this.draw();
    };

    forceStopEdit() {
        const placeToClick = document.querySelector('.main-container');
        placeToClick.click();
        this.editIndex = -1;
    }

    edit(taskElement, index, task, date) {
        this.editIndex = index;
        taskElement.innerHTML = `
            <input id="text-edit-input" type="text" value="${task}">
            <input id="date-edit-input" type="date" value="${date}">
        `;

        const textInput = taskElement.querySelector('#text-edit-input');
        const dateInput = taskElement.querySelector('#date-edit-input');

        const finishEditing = () => {
            let updatedTask = textInput.value;
            let updatedDate = dateInput.value;

            this.editTask(index, updatedTask, updatedDate);
            document.removeEventListener('click', handleClickOutside);
            this.editIndex = -1;
        };

        // handle click outside
        const handleClickOutside = (e) => {
            if (!taskElement.contains(e.target)) {
                finishEditing();
            }
        };

        // handle click on the input fields
        const handleInputClick = (e) => {
            e.stopPropagation();
        };

        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
            textInput.addEventListener('click', handleInputClick);
            dateInput.addEventListener('click', handleInputClick);
        }, 0);
    };

    highlightMatch(task) {
        if (this.searchQuery.length < 2) return task;

        const taskLower = task.toLowerCase();

        if (!taskLower.includes(this.searchQuery)) {
            return task;
        }

        const startIdx = taskLower.indexOf(this.searchQuery);
        const endIdx = startIdx + this.searchQuery.length;

        const before = task.slice(0, startIdx);
        const match = task.slice(startIdx, endIdx);
        const after = task.slice(endIdx);

        return `${before}<span class="highlight">${match}</span>${after}`
    };

    saveToLocalStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.tasks));
    };

    readFromLocalStorage() {
        const saved = localStorage.getItem(this.localStorageKey);
        if (saved) {
            this.tasks = JSON.parse(saved);
        }
    };
}


const todo = new ToDo();

const addButton = document.getElementById('add-button');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const searchInput = document.getElementById('search-input');

addButton.addEventListener('click', () => {
    todo.addTask(taskInput.value, dateInput.value);
    taskInput.value = '';
    dateInput.value = '';
});

searchInput.addEventListener('input', () => {
    todo.searchQuery = searchInput.value.toLowerCase();
    todo.draw();
});

