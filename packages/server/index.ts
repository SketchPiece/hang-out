import express from 'express'
import http from 'http'
import path from 'path'
import { createSocketServer } from './socket'

const PORT = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

createSocketServer(server)

app.use(
  express.static(path.resolve(__dirname, '../../packages', 'client/build'))
)

app.get('*', (_, res) => {
  res.sendFile(
    path.resolve(__dirname, '../../packages/', 'client/build/index.html')
  )
})

server.listen(PORT, () => {
  console.log('listening on ' + PORT)
})
