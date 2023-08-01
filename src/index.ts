import express from 'express'

const app = express()

app.use(express.json())

app.get('/', (_req, res) => {
  res.send('Express TS app')
})

app.listen(3000, () => {
  console.log('Server started')
})
