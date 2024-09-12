let deb = "service worker"
console.log("🚀 ~ file: worker.js:2 ~ deb:", deb)

self.addEventListener("push", e => {
    const data = e.data.json()
    console.log("🚀 ~ file: worker.js:6 ~ data:", data)
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: "/Cosmere_symbol.svg"
    })
})
