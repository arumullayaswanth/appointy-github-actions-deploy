import assert from 'node:assert/strict'
import { once } from 'node:events'
import app from '../app.js'

const server = app.listen(0)

try {
  await once(server, 'listening')
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`

  const healthResponse = await fetch(`${baseUrl}/healthz`)
  const healthBody = await healthResponse.json()

  assert.equal(healthResponse.status, 200)
  assert.equal(healthBody.status, 'ok')

  const rootResponse = await fetch(`${baseUrl}/`)
  const rootBody = await rootResponse.text()

  assert.equal(rootResponse.status, 200)
  assert.equal(rootBody, 'API Working')

  console.log('Backend smoke tests passed.')
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
