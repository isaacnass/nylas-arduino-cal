const express = require('express')
const fetch = require('node-fetch')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT

app.get('/meeting-time', async (req, res) => {
	if (
		req.headers.authorization !== process.env.SECRET_KEY &&
		req.headers.authorization !== `Bearer ${process.env.SECRET_KEY}`
	) {
		return res.status(401).send('Invalid credentials')
	}

	const r = await fetch(
		'https://api.nylas.com/events?starts_after=1672466048&expand_recurring=true&show_cancelled=false&busy=true&limit=25',
		{
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${process.env.NYLAS_TOKEN}`,
			},
		}
	)

	let data = await r.json()
	data = data.filter((d) =>
		d.participants?.find(
			(p) => p.email === process.env.EMAIL_ADDRESS && p.status !== 'no'
		)
	)
	res.json(
		data[0]
			? { name: data[0].title, unix_timestamp: data[0].when.start_time }
			: {}
	)
})

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`)
})
