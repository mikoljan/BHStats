import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Header } from '@components/UI/Header'
import { BrowserRouter } from 'react-router'
import { Table } from '@components/Table'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Header />
        <Table data={[]} />
      </BrowserRouter>
    </>
  )
}

export default App
