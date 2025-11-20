import './App.css'
import Layout from './layout/Layout'
import { AutoProvider } from './context/AutoContext'

function App() {
  return (
    <AutoProvider>
      <Layout />
    </AutoProvider>
  )
}

export default App
