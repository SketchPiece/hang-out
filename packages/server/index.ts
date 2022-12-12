import express from 'express'
import http from 'http'
import { createSocketServer } from './socket'

const PORT = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

createSocketServer(server)

app.get('/', (req, res) => {
  res.send('Hello from server')
})

server.listen(PORT, () => {
  console.log('listening on ' + PORT)
})
