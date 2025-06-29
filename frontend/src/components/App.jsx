import { useState } from 'react'
import '../css/App.css'
import Register from './register'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './Home'
import Login from './login'
import Header from './Header'
import LoggedHomePage from './loggedHomePage'
import SearchProfiles from './searchProfiles'


function App() {
  return (
    <div className='OIO'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path='/login' element = {<Login/>}/>
        <Route path='/homepage/:username' element = {<LoggedHomePage />}/>
        <Route path='/search_profiles' element= {<SearchProfiles/>}/>
      </Routes>
    </div>
  )
}

export default App
