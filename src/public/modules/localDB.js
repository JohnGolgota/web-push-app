const indexedDB = window.indexedDB

let db

const conexion = indexedDB.open("Notifications", 2)

conexion.onsuccess = () => {
    db = conexion.result
    console.log("gg")
}

conexion.onupgradeneeded  = (e) => {
    db = e.target.result
    console.log("create db")
    const coleccionObj = db.createObjectStore("tareas", {
        keyPath: "clave"
    })
}

conexion.onerror = (error) => {
    console.log("Error ")
}


const save = (data) => {
    console.log("🚀 ~ file: localDB.js:27 ~ save ~ db:", db)
    const transaction = db.transaction(["todo"], "readwrite")
    const colecction = transaction.objectStore("todo")
    const conexion = colecction.add(data)
    getFromColection()
}

const getFromColection = () => {
    const transaction = db.transaction(["todo"], "readonly")
    const colecction = transaction.objectStore("todo")
    const conexion = colecction.openCursor()

    conexion.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
            console.log("🚀 ~ file: localDB.js:39 ~ getFromColection ~ cursor:", cursor)
        } else {
            console.log("nah");
        }
    }
}