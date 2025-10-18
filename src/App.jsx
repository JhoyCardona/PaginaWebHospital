import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainPage from './pages/mainPage'
import LoginPage from './pages/loginPage'
import AgendaCitas from './pages/agendaCitas'
import SetupUsers from './pages/setupUsers'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup-users" element={<SetupUsers />} />
            <Route 
              path="/agenda-citas" 
              element={
                <ProtectedRoute>
                  <AgendaCitas />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
