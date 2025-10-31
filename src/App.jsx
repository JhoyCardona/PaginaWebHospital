import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainPage from './pages/mainPage'
import LoginPage from './pages/loginPage' // <-- corregido: loginPage (case-sensitive)
import LoginMedicos from './pages/loginMedicos'
import LoginAdmin from './pages/loginAdmin'
import DashboardMedico from './pages/dashboardMedico'
import DashboardAdmin from './pages/dashboardAdmin'
import AtencionMedica from './pages/atencionMedica'
import HistoriaClinica from './pages/historiaClinica'
import PerfilPaciente from './pages/perfilPaciente'
import AgendaCitas from './pages/agendaCitas'
import SetupUsers from './pages/setupUsers'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas para médicos: ambas URL apuntan al mismo componente */}
            <Route path="/login-medicos" element={<LoginMedicos />} />
            <Route path="/medicos" element={<LoginMedicos />} />

            {/* Rutas para admin */}
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />

            <Route path="/dashboard-medico" element={<DashboardMedico />} />
            <Route path="/atencion-medica/:citaId" element={<AtencionMedica />} />
            <Route path="/historia-clinica/:pacienteId" element={<HistoriaClinica />} />
            <Route
              path="/perfil-paciente/:pacienteId"
              element={
                <ProtectedRoute>
                  <PerfilPaciente />
                </ProtectedRoute>
              }
            />
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