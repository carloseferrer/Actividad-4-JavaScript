window.onload = function () {
  // Obtener referencias a los elementos del DOM
  var taskInput = document.getElementById("taskInput");
  var addTaskBtn = document.getElementById("addTaskBtn");
  var taskList = document.getElementById("taskList");
  var noTasksMessage = document.getElementById("noTasksMessage");

  // Agregar un evento de clic al botón "Agregar tarea"
  addTaskBtn.addEventListener("click", function () {
    // Obtener el texto de la tarea y eliminar los espacios en blanco al inicio y al final
    var taskText = taskInput.value.trim();
    // Si el texto de la tarea no está vacío, agregar la tarea y limpiar el campo de entrada
    if (taskText !== "") {
      addTask(taskText);
      taskInput.value = "";
    } else {
      displayErrorMessage("El campo de entrada está vacío");
    }
  });

  // Obtener referencias a los elementos del DOM para el modo oscuro
  var darkModeBtn = document.getElementById("darkModeBtn");
  var body = document.body;
  var h1 = document.getElementById("h1-main");

  darkModeBtn.addEventListener("click", function () {
    body.classList.toggle("dark-mode");
    h1.classList.toggle("dark-mode");
  });

  // Función para agregar una tarea
  function addTask(taskText) {
    // Generar un ID único para la tarea
    var taskId = generateTaskId();
    var taskItem = createTaskItem(taskId, taskText);
    taskList.appendChild(taskItem);
    saveTaskLocally(taskId, taskText);
    saveTaskRemotely(taskId, taskText);
  }

  // Función para crear el elemento HTML de una tarea
  function createTaskItem(taskId, taskText) {
    var col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    var card = document.createElement("div");
    card.className = "card mb-3";

    var cardBody = document.createElement("div");
    cardBody.className = "card-body";

    var taskTextSpan = document.createElement("span");
    taskTextSpan.innerText = "Nombre: " + taskText;
    cardBody.appendChild(taskTextSpan);

    var timestampSpan = document.createElement("span");
    timestampSpan.innerText = getTimestamp();
    cardBody.appendChild(timestampSpan);

    var deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Eliminar";
    deleteBtn.className = "btn btn-delete btn-sm";
    deleteBtn.addEventListener("click", function () {
      var taskId = col.getAttribute("data-task-id");
      deleteTask(taskId);
      col.remove();
    });
    cardBody.appendChild(deleteBtn);

    // Crear un botón de editar tarea
    var editBtn = document.createElement("button");
    editBtn.innerText = "Modificar";
    editBtn.className = "btn btn-edit btn-sm";
    editBtn.addEventListener("click", function () {
      var taskId = col.getAttribute("data-task-id");
      var currentText = taskText;
      var newText = prompt("Ingrese el nuevo nombre de la tarea", currentText);
      if (newText !== null && newText.trim() !== "") {
        updateTask(taskId, newText);
        taskTextSpan.innerText = `Nombre: ${newText}`;
      }
    });
    cardBody.appendChild(editBtn);

    // Construir la estructura de la tarjeta de la tarea
    col.appendChild(card);
    card.appendChild(cardBody);
    col.setAttribute("data-task-id", taskId);

    return col;
  }

  // Función para generar un ID único para la tarea
  function generateTaskId() {
    const random = Math.random().toString(36).substring(2);
    const fecha = Date.now().toString(36);
    return random + fecha;
  }

  // Función para formatear el tiempo al actual en Venezuela
  function getTimestamp() {
    var date = new Date().toLocaleString("es-VE", {
      timeZone: "America/Caracas",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
    return `
    Fecha de Creación: 
    ${date}
    `;
  }

  function saveTaskLocally(taskId, taskText) {
    var tasks = getSavedTasksLocally();
    tasks[taskId] = {
      text: taskText,
      timestamp: getTimestamp(),
    };
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function saveTaskRemotely(taskId, taskText) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "taskData.json", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
      }
    };
    var taskData = JSON.stringify({ id: taskId, text: taskText });
    xhr.send(taskData);
  }

  function deleteTask(taskId) {
    var tasks = getSavedTasksLocally();
    delete tasks[taskId];
    localStorage.setItem("tasks", JSON.stringify(tasks));

    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "taskData.json" + taskId, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 204) {
        console.log("Task deleted successfully");
      }
    };
    xhr.send();
  }

  // Función para actualizar una tarea
  function updateTask(taskId, newTaskText) {
    var tasks = getSavedTasksLocally();
    tasks[taskId].text = newTaskText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function getSavedTasksLocally() {
    var tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : {};
  }

  // Función para mostrar un mensaje de error
  function displayErrorMessage(message) {
    var errorMessage = document.createElement("div");
    errorMessage.className = "alert alert-danger";
    errorMessage.innerText = message;
    document.body.appendChild(errorMessage);

    setTimeout(function () {
      errorMessage.remove();
    }, 3000);
  }

  // Obtener las tareas guardadas localmente y mostrarlas en la lista de tareas
  var savedTasks = getSavedTasksLocally();
  for (var taskId in savedTasks) {
    var taskData = savedTasks[taskId];
    var taskItem = createTaskItem(taskId, taskData.text);
    taskList.appendChild(taskItem);
  }

};
