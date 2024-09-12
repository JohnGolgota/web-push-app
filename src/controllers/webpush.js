const webpush = require('web-push')

webpush.setVapidDetails(
	'mailto:js@js.com',
	process.env.PUBLIC_VAPID_KEY,
	process.env.PRIVATE_VAPID_KEY
)

module.exports = webpush

// const webpushController = async (req, res) => {
// 	const subscription = await webpush.getSubscription()
// 	if (subscription) {
// 		const subscriptionId = subscription.id
// 		const endpoint = subscription.endpoint
// 		const publicVapidKey = process.env.PUBLIC_VAPID_KEY
// 		const privateVapidKey = process.env.PRIVATE_VAPID_KEY

// 		webpush.sendNotification(subscriptionId, JSON.stringify(req.body), {
// 			TTL: 60,
// 			vapidDetails: {
// 				subject: 'web-push-app',
// 				publicKey: publicVapidKey,
// 				privateKey: privateVapidKey
// 			}
// 		}).then(function(result) {
// 			res.status(200).json(result)
// 		}).catch(function(err) {
// 			res.status(500).json(err)
// 		})
// 	} else {
// 		res.status(404).json({ message: 'Subscription not found' })
// 	}
// }

// module.exports = webpushController
