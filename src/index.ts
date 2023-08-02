import express from 'express'
import fetch from 'node-fetch'

interface API {
  name: string
  id: string
  description: string
  reference_image_id: string
  url?: string
}

const app = express()

app.use(express.json())

app.get('/breeds', (_req, res, next) => {
  fetch('https://api.thecatapi.com/v1/breeds')
    .then((apiResponse: any) => apiResponse.json())
    .then(async (json: API[]) => {
      await Promise.all(json.map(async (el) => await fetch(`https://api.thecatapi.com/v1/images/${el.reference_image_id !== undefined ? el.reference_image_id : '056YfVlDT'}`)
        .then(async imageApiResp => await imageApiResp.json())
        .then(imageApiJson => { el.url = imageApiJson.url; return el })))
      const filtered = json.map((el: API): Omit<API, 'description' | 'reference_image_id' > => { return { id: el.id, name: el.name, url: el.url } })
      res.json(filtered)
    })
    .catch((e: any) => next(e))
})

app.listen(3000, () => {
  console.log('Server started')
})
