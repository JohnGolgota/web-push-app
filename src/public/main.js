// import "./modules/localDB.js"

const PUBLIC_VAPID_KEY = "BLvouvxX-YJvpyP9SF-q5WCDYuNvqy0r0sZlur59928YLB0YD0-FjpCLnRXxlnmhRoH6nQ6gJ87aDcz81Ryusag"


const subscription = async () => {
    const register = await navigator.serviceWorker.register("/worker.js", {
        scope: "/"
    })
    // let deb = "new service worker"
    // console.log("🚀 ~ file: main.js:8 ~ subscription ~ deb:", deb)

    const sub = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY
    })

    await fetch("/subscription", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: {
            "Content-Type": "application/json"
        }
    })
    console.log("sus")
}

const form = document.querySelector("#myform")
const message = document.querySelector("#message")

form.addEventListener("submit", e => {
    e.preventDefault()
    fetch('/new-message', {
        method: "POST",
        body: JSON.stringify({
            message: message.value
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    form.reset()
})

subscription()