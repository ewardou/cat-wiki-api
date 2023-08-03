import express from 'express'
import fetch from 'node-fetch'
import { config } from 'dotenv'
import cors from 'cors'

config()

interface API {
  name: string
  id: string
  description: string
  reference_image_id: string
  url?: string
  gallery?: string[]
}

const app = express()

app.use(express.json())
app.use(cors())

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

app.get('/breeds/:breedID', (req, res, next) => {
  fetch(`https://api.thecatapi.com/v1/breeds/${req.params.breedID}`)
    .then(async (resp) => await resp.json())
    .then(async (json: API) => {
      const [referenceImg, galleryImg] = await Promise.all([
        fetch(`https://api.thecatapi.com/v1/images/${json.reference_image_id !== undefined ? json.reference_image_id : '056YfVlDT'}`).then(async (resp) => await resp.json()),
        fetch(`https://api.thecatapi.com/v1/images/search?limit=8&breed_ids=${req.params.breedID}&api_key=${process.env.API_KEY as string}`).then(async (resp) => await resp.json())
      ])
      json.url = referenceImg.url
      json.gallery = galleryImg.map((el: any) => el.url)
      res.json(json)
    })
    .catch(e => next(e))
})

app.listen(3000, () => {
  console.log('Server started')
})
