import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import QuizApp from './QuizApp.jsx'
import Learn from './LearningArena/Learn.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/QuizApp' element={<QuizApp />} />
      <Route path='/Learn' element={<Learn />} />
    </Routes>
  </BrowserRouter>
)
