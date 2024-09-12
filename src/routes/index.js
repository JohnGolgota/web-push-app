const { Router } = require('express')
const router = Router()

const webPush = require('../controllers/webpush')
let pushSubscription;

router.post('/subscription', async (req, res) => {
    pushSubscription = req.body
    res.status(200).json()
})

router.post("/new-message", async (req, res) => {
    const { message } = req.body
    const payload = JSON.stringify({
        title: "¿Conoces las palabras?",
        message
    })
    try {
        await webPush.sendNotification(pushSubscription, payload)
    } catch (error) {
        console.log("🚀 ~ file: index.js:17 ~ router.post ~ error:", error)
    }
})

module.exports = router
