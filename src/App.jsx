import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import SwissBanner from './components/SwissBanner';

// Pages
import Today from './pages/Today';
import Protocols from './pages/Protocols';
import Calculator from './pages/Calculator';
import Library from './pages/Library';
import Shop from './pages/Shop';
import Onboarding from './pages/Onboarding';
import ProtocolBuilder from './pages/ProtocolBuilder';
import Learn from './pages/Learn';

function App() {
  const hasCompletedOnboarding = localStorage.getItem('onboardingComplete') === 'true';

  return (
    <Router>
      <div className="flex-col h-full w-full">
        <SwissBanner />
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/app/*" element={
            <div className="flex-col h-full w-full">
              <div className="flex-1">
                <Routes>
                  <Route path="today" element={<Today />} />
                  <Route path="protocols" element={<Protocols />} />
                  <Route path="calculator" element={<Calculator />} />
                  <Route path="library" element={<Library />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="protocol-wizard" element={<ProtocolBuilder />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="*" element={<Navigate to="today" replace />} />
                </Routes>
              </div>
              <BottomNav />
            </div>
          } />
          <Route path="*" element={
            <Navigate to={hasCompletedOnboarding ? "/app/today" : "/onboarding"} replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
