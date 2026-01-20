import './App.css'
import Layout from '@/shared/layout/Layout'
import { AutoProvider } from '@/vehicles/store/AutoContext'
import ScrollToTop from "react-scroll-to-top";

function App() {
  return (
    <AutoProvider>
      <Layout />
      <ScrollToTop smooth className="!bg-white !w-11 !h-11 !rounded-full !shadow-md !border !border-gray-300 !flex !items-center !justify-center
             hover:!shadow-lg transition" component={<span className="text-gray-700 text-xl">↑</span>} />
    </AutoProvider>

  )
}

export default App
