import { Route, Routes } from 'react-router-dom'
import { Root } from './pages/Root'
import { Room } from './pages/Room'

function App() {
  return (
    <div className="w-screen h-screen bg-gray-700 text-white">
      <header className="p-5 text-xl">
        <span>HangOut</span>
        <span className="bg-blue-600 rounded-md p-1 px-3 ml-3">Beta</span>
      </header>
      <div className="h-[calc(100vh-68px)] grid place-items-center bg-gray-700">
        <Routes>
          <Route index element={<Root />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
