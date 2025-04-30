const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const dataFilePath = path.join(__dirname, 'data', 'tasks.json');

async function readTasks() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading tasks:', error);
        throw error;
    }
}

async function writeTasks(tasks) {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing tasks:', error);
        throw error;
    }
}

async function addTask(title) {
    const tasks = await readTasks();
    const newTask = {
        id: Date.now(),
        title: title,
        completed: false,
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    console.log(`Task "${title}" added.`);
}

async function listTasks() {
    const tasks = await readTasks();
    if (tasks.length === 0) {
        console.log('Your to-do list is empty!');
        return;
    }
    console.log('\n--- To-Do List ---');
    tasks.forEach(task => {
        const status = task.completed ? '[X]' : '[ ]';
        console.log(`${task.id}. ${status} ${task.title}`);
    });
    console.log('-------------------\n');
}

async function markTaskAsComplete(id) {
    const tasks = await readTasks();
    const taskIdToUpdate = parseInt(id);
    const taskIndex = tasks.findIndex(task => task.id === taskIdToUpdate);

    if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        await writeTasks(tasks);
        console.log(`Task with ID ${taskIdToUpdate} marked as complete.`);
    } else {
        console.log(`Task with ID ${taskIdToUpdate} not found.`);
    }
}

async function deleteTask(id) {
    const tasks = await readTasks();
    const taskIdToDelete = parseInt(id);
    const initialLength = tasks.length;
    const updatedTasks = tasks.filter(task => task.id !== taskIdToDelete);

    if (updatedTasks.length < initialLength) {
        await writeTasks(updatedTasks);
        console.log(`Task with ID ${taskIdToDelete} deleted.`);
    } else {
        console.log(`Task with ID ${taskIdToDelete} not found.`);
    }
}

function askQuestion(query) {
    return new Promise(resolve => {
        readline.question(query, resolve);
    });
}

async function main() {
    console.log('Welcome to your To-Do List!');

    while (true) {
        console.log('\nWhat would you like to do?');
        console.log('1. Add a new task');
        console.log('2. List all tasks');
        console.log('3. Mark a task as complete (by ID)');
        console.log('4. Delete a task (by ID)');
        console.log('5. Exit');

        const choice = await askQuestion('Enter your choice: ');

        switch (choice) {
            case '1':
                const title = await askQuestion('Enter the task title: ');
                await addTask(title);
                break;
            case '2':
                await listTasks();
                break;
            case '3':
                const completeId = await askQuestion('Enter the ID of the task to mark as complete: ');
                await markTaskAsComplete(completeId);
                break;
            case '4':
                const deleteId = await askQuestion('Enter the ID of the task to delete: ');
                await deleteTask(deleteId);
                break;
            case '5':
                console.log('Thank you for using the To-Do List!');
                readline.close();
                process.exit(0);
            default:
                console.log('Invalid choice. Please try again.');
        }
    }
}

main();