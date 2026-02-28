import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import QuizApp from './QuizApp.jsx'
import Learn from './LearningArena/Learn.jsx'
import GrowthBlueprint from './GrowthBlueprint/GrowthBlueprint.jsx'
import CarrerCounsellor from './GrowthBlueprint/CarrerCounsellor.jsx';
import ExamPlanner from './GrowthBlueprint/ExamPlanner.jsx';
import DestinyDesigner from './GrowthBlueprint/DestinyDesigner.jsx';
import AppliedKnowledge from './LearningArena/AppliedKnowledge.jsx';
import Storyverse from './LearningArena/Storyverse.jsx';
import BrainBoard from './LearningArena/BrainBoard.jsx';
import BrainReset from './BrainReset/BrainReset.jsx';
import Badges from './Badges/Badges.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/QuizApp' element={<QuizApp />} />
      <Route path='/Learn' element={<Learn />} />
      <Route path='/Growth' element={<GrowthBlueprint />} />
      <Route path='/CarrerCounsellor' element={<CarrerCounsellor />} />
      <Route path='/ExamPlanner' element={<ExamPlanner onBack={() => window.history.back()} />} />
      <Route path='/DestinyDesigner' element={<DestinyDesigner onBack={() => window.history.back()} />} />
      <Route path='/AppliedKnowledge' element={<AppliedKnowledge onBack={() => window.history.back()} />} />
      <Route path='/Storyverse' element={<Storyverse onBack={() => window.history.back()} />} />
      <Route path='/BrainBoard' element={<BrainBoard onBack={() => window.history.back()} />} />
      <Route path='/BrainReset' element={<BrainReset />} />
      <Route path='/Badges' element={<Badges />} />
    </Routes>
  </BrowserRouter>
)
