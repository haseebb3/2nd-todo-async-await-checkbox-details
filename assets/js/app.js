const todoForm = document.getElementById("todoForm");
const updateTodoBtn = document.getElementById("updateTodoBtn");
const todoContainer = document.getElementById("listContainer");
const spinner = document.getElementById("spinner");
const cancelTodoBtn = document.getElementById("cancelTodoBtn");


const baseTodoUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const todoUrl = `${baseTodoUrl}/todowithcheckbox.json`;


function toggleSpinner(text = "Loading") {
    spinner.classList.toggle("d-none");
    spinner.innerHTML = `
        <button class="btn btn-primary" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ${text}
        </button>
    `;
}

function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000,
    });
}

const localState = {
    todoArray: [],
    editId: null,
};

function nesObjToArr(obj) {
    localState.todoArray = Object.entries(obj).map(t => ({ id: t[0], ...t[1] })).reverse();
}

// function handleNoTdos() {
//     if (localState.todoArray.length === 0) {
//         todoContainer.innerHTML = `<li class="list-group-item text-center text-danger noTodo" id="noTodoLi"><strong> No Todos Yet </strong></li>`
//     } else {
//         const noTodo = document.querySelector(".noTodo");
//         if(noTodo){
//             noTodo.remove();
//         }
//     }
// }

//read
async function fetTodos() {
    let response = await fetch(todoUrl, {
        method: "GET",
        body: null,
        headers: {
            "Content-Type": "application/json",
            "security": "jwt"
        }
    });
    if (!response.ok) {
        throw new Error(`Error : ${(await response).status}`)
    }

    let data = await response.json();
    nesObjToArr(data);
    renderTodos(localState.todoArray)
}
fetTodos();
function renderTodos(arr) {
    let res = "";
    arr.forEach(todo => {
        res += `
            <li class="list-group-item" id="${todo.id}">
                    <div class="accordion card">
                        <div class="card-header p-1" id="headingOne-${todo.todoId}">
                            <h2 class="mb-0 d-flex justify-content-between">
                                <button class="btn btn-block text-left" type="button"
                                    data-toggle="collapse" data-target="#collapseOne-${todo.todoId}"
                                    aria-expanded="true" aria-controls="collapseOne-${todo.todoId}">

                                    <input onclick="event.stopPropagation()" onchange="stateUpdate(this)" type="checkbox" ${todo.isCompleted ? "checked" : ""}>
                                    <strong class="h4">${todo.todoItem}</strong>
                                </button>
                                <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                                <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger mr-2">Remove</button>
                            </h2>
                        </div>

                        <div id="collapseOne-${todo.todoId}" class="collapse" aria-labelledby="headingOne-${todo.todoId}"
                            data-parent="#listContainer">
                            <div class="card-body bg-dark text-white">
                                <p>${todo.details}</p>
                            </div>
                        </div>
                 
            </li>
        `;
    });
    todoContainer.innerHTML = res;
}

// create
async function onSubmit(event) {
    try {
        const todoInputControl = document.getElementById("todoInput");
        const descriptionControl = document.getElementById("description");
        const statusControl = document.getElementById("status");
        event.preventDefault();
        const todoObj = {
            todoItem: todoInputControl.value,
            isCompleted: statusControl.value === "yes" ? true : false,
            details: descriptionControl.value,
            todoId: Date.now()
        }
        toggleSpinner("Adding Todo...")
        let response = await fetch(todoUrl, {
            method: "POST",
            body: JSON.stringify(todoObj),
            headers: {
                "Content-Type": "application/json",
                "security": "jwt"
            }
        })

        if (!response.ok) {
            throw new Error(`Error : ${response.status}`);
        }

        let data = await response.json();
        todoForm.reset();
        todoObj.id = data.name;
        localState.todoArray.unshift(todoObj);
        let newLi = document.createElement("li");
        newLi.className = "list-group-item";
        newLi.id = data.name;
        newLi.innerHTML = `
            <div class="accordion card">
            <div class="card-header p-1" id="headingOne-${todoObj.todoId}">
                <h2 class="mb-0 d-flex justify-content-between">
                    <button class="btn btn-block text-left" type="button"
                        data-toggle="collapse" data-target="#collapseOne-${todoObj.todoId}"
                        aria-expanded="true" aria-controls="collapseOne-${todoObj.todoId}">
                        
                        <input onclick="event.stopPropagation()" onchange="stateUpdate(this)" type="checkbox" ${todoObj.isCompleted ? "checked" : ""}>
                        <strong class="h4">${todoObj.todoItem}</strong>
                    </button>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger mr-2">Remove</button>
                </h2>
            </div>

            <div id="collapseOne-${todoObj.todoId}" class="collapse" aria-labelledby="headingOne-${todoObj.todoId}"
                data-parent="#listContainer">
                <div class="card-body bg-dark text-white">
                    <p>${todoObj.details}
                </div>
            </div>
    `
        todoContainer.prepend(newLi);
        snackBar(`Todo with id : ${data.name} is added successfully`, "success");
    } catch (err) {
        console.log(err);
        snackBar(`Error : ${err}`);
    } finally {
        toggleSpinner()
    }
}


//edit
function onEdit(ele) {
    const todoInputControl = document.getElementById("todoInput");
    const descriptionControl = document.getElementById("description");
    const statusControl = document.getElementById("status");
    const addTodoBtn = document.getElementById("addTodoBtn");
    const editId = ele.closest("li").id;
    localState.editId = editId;
    const editObj = localState.todoArray.find(t => t.id === editId);
    todoInputControl.value = editObj.todoItem;
    descriptionControl.value = editObj.details;
    statusControl.value = editObj.isCompleted ? "yes" : "no";
    addTodoBtn.classList.add("d-none");
    updateTodoBtn.classList.remove("d-none");
    updateTodoBtn.classList.remove("btn-outline-info");
    updateTodoBtn.classList.add("btn-info");
}

//update
async function onUpdate() {
    try {
        const todoInputControl = document.getElementById("todoInput");
        const descriptionControl = document.getElementById("description");
        const statusControl = document.getElementById("status");
        const updateId = localState.editId;
        const updateUrl = `${baseTodoUrl}/todowithcheckbox/${updateId}.json`;
        const existingObj = localState.todoArray.find(t => t.id === updateId);
        const updatedObj = {
            ...existingObj,
            todoItem: todoInputControl.value,
            isCompleted: statusControl.value === "yes" ? true : false,
            details: descriptionControl.value,
        }
        toggleSpinner(`Updating Todo...`)
        let res = await fetch(updateUrl, {
            method: "PATCH",
            body: JSON.stringify(updatedObj),
            headers: {
                "Content-Type": "application/json",
                "security": "jwt"
            }
        });
        if (!res.ok) {
            throw new Error("Error : " + res.status);
        }
        let data = await res.json();
        todoForm.reset();
        let updateIndex = localState.todoArray.findIndex(t => t.id === updateId);
        localState.todoArray[updateIndex] = updatedObj;
        let updateLi = document.getElementById(updateId);
        updateLi.innerHTML = `
            <div class="accordion card">
            <div class="card-header p-1" id="headingOne-${updatedObj.todoId}">
                <h2 class="mb-0 d-flex justify-content-between">
                    <button class="btn btn-block text-left" type="button"
                        data-toggle="collapse" data-target="#collapseOne-${updatedObj.todoId}"
                        aria-expanded="true" aria-controls="collapseOne-${updatedObj.todoId}">
                        
                        <input onclick="event.stopPropagation()" onchange="stateUpdate(this)" type="checkbox" ${updatedObj.isCompleted ? "checked" : ""}>
                        <strong class="h4">${updatedObj.todoItem}</strong>
                    </button>
                    <button onclick="onEdit(this)" class="btn btn-sm btn-outline-info mr-2">Edit</button>
                    <button onclick="onDelete(this)" class="btn btn-sm btn-outline-danger mr-2">Remove</button>
                </h2>
            </div>

            <div id="collapseOne-${updatedObj.todoId}" class="collapse" aria-labelledby="headingOne-${updatedObj.todoId}"
                data-parent="#listContainer">
                <div class="card-body bg-dark text-white">
                    <p>${updatedObj.details}
                </div>
            </div>
        `;
        snackBar(`Todo with id ${updateId} is updated successfully...`, "success");
        updateTodoBtn.classList.add("d-none");
        addTodoBtn.classList.remove("d-none")
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        toggleSpinner()
    }

}

//checkbox state update
async function stateUpdate(ele){
    try{
        const updateId = ele.closest("li").id;
        const updateUrl = `${baseTodoUrl}/todowithcheckbox/${updateId}.json`;
        const updatedObj = {
            isCompleted : ele.checked
        }
        toggleSpinner("Updating State...")
        let res = await fetch(updateUrl, {
            method : "PATCH",
            body : JSON.stringify(updatedObj),
            headers: {
                "Content-Type": "application/json",
                "security": "jwt"
            }
        });
        if(!res.ok){
            throw new Error(`Error : ${res.status}`);
        }
        let data = res.json();
        let updateIndex = localState.todoArray.findIndex(t => t.id === updateId);
        localState.todoArray[updateIndex].isCompleted = updatedObj.isCompleted;

    } catch(err){
        snackBar(err);
        console.log(err);
    } finally{
        toggleSpinner()
    }
}
//delete 
async function onDelete(ele) {
    try {
        const deleteId = ele.closest("li").id;
        let alert = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });
        if(alert.isConfirmed){
            const deleteUrl = `${baseTodoUrl}/todowithcheckbox/${deleteId}.json`;
            toggleSpinner(`Deleting Todo...`)
            let res = await fetch(deleteUrl, {
                method : "DELETE",
                body : null,
                headers: {
                "Content-Type": "application/json",
                "security": "jwt"
            }
            });
            if(!res.ok){
                throw new Error("Error : " + res.status);
            }
            let data = await res.json();
            let deleteIndex = localState.todoArray.findIndex(t => t.id === deleteId);
            localState.todoArray.splice(deleteIndex,1);
            ele.closest("li").remove();
        } else{
            toggleSpinner()
        }
    } catch (err) {
        console.log(err);
    } finally {
        toggleSpinner()
    }
}

function oncancel() {
    const addTodoBtn = document.getElementById("addTodoBtn");
    todoForm.reset();
    addTodoBtn.classList.remove("d-none");
    updateTodoBtn.classList.add("d-none");
}
todoForm.addEventListener("submit", onSubmit);
cancelTodoBtn.addEventListener("click", oncancel);
updateTodoBtn.addEventListener("click", onUpdate)

