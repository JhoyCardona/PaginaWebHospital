# 🏥 Sistema Médico Integrado - Hospital Digital

## 📖 Descripción
Sistema web completo para la gestión hospitalaria que incluye:
- **Frontend**: Aplicación React con Vite para pacientes, médicos y administradores
- **Backend PHP**: API REST para gestión de usuarios, citas e historias clínicas
- **Backend Python**: Sistema de estadísticas con FastAPI, pandas y visualizaciones
- **Base de datos**: MySQL con sistema de bloqueos y control de accesos

## ⚙️ Características Principales
- **👥 Gestión de usuarios**: Pacientes, médicos y administradores con autenticación separada
- **📅 Sistema de citas**: Agendamiento con prevención de conflictos y slots ocupados
- **📋 Historia clínica digital**: Documentación médica completa integrada con citas
- **📄 Generación de PDF**: Reportes médicos descargables
- **🔐 Sistema de bloqueos**: Administrador puede bloquear usuarios temporalmente
- **📊 Estadísticas avanzadas**: Reportes con gráficos profesionales (Matplotlib/Seaborn)
- **🎨 Interfaz moderna**: Diseño responsivo con Bootstrap
- **🩺 Gestión de CUPS**: Códigos únicos de procedimientos en salud
- **💊 Prescripciones**: Tabla interactiva de medicamentos
- **🚫 Incapacidades**: Gestión de licencias médicas.

## 📁 Estructura del Proyecto

```text
my-react-app-citas/
├── backend/                     # Backend del proyecto
├── public/
│   ├── index.html
│   └── imagenes/               # Recursos gráficos
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── ProtectedRoute.jsx  # Rutas protegidas
│   │   ├── AppointmentsList/   # Lista de citas
│   │   ├── Calendar/           # Componente calendario
│   │   ├── CupsSelector/       # Selector de códigos CUPS
│   │   ├── IncapacidadManager/ # Gestión de incapacidades
│   │   ├── MainPage/           # Componentes página principal
│   │   ├── MedicationTable/    # Tabla de medicamentos
│   │   └── TimeSlots/          # Horarios disponibles
│   ├── contexts/
│   │   └── AuthContext.jsx     # Contexto de autenticación
│   ├── pages/                  # Páginas principales
│   │   ├── agendaCitas.jsx     # Agendamiento de citas
│   │   ├── atencionMedica.jsx  # Atención médica
│   │   ├── dashboardMedico.jsx # Dashboard médico
│   │   ├── historiaClinica.jsx # Historia clínica
│   │   ├── InitializeData.jsx  # Inicialización de datos
│   │   ├── loginMedicos.jsx    # Login médicos
│   │   ├── loginPage.jsx       # Login pacientes
│   │   ├── mainPage.jsx        # Página principal
│   │   ├── perfilPaciente.jsx  # Perfil del paciente
│   │   └── setupUsers.jsx      # Configuración usuarios
│   ├── services/               # Servicios de la aplicación
│   │   ├── cupsService.js      # Servicio CUPS
│   │   └── pdfServiceWorking.js # Generación PDF optimizada
│   ├── styles/                 # Estilos CSS personalizados
│   ├── App.jsx                 # Componente principal
│   └── main.jsx                # Punto de entrada
├── eslint.config.js            # Configuración ESLint
├── package.json                # Dependencias del proyecto
├── vite.config.js              # Configuración Vite
└── README.md                   # Documentación
```

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

#### Para Windows:
- [XAMPP](https://www.apachefriends.org/es/download.html) (incluye Apache, MySQL y PHP)
- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [Python 3.8+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/download/win)

#### Para Linux (Ubuntu/Debian):
- XAMPP o MySQL Server
- Node.js y npm
- Python 3.8+ y pip
- Git

```bash
# Linux - Instalar requisitos
sudo apt update
sudo apt install git nodejs npm python3 python3-pip python3-venv
```

---

## 📦 Instalación Paso a Paso

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/JhoyCardona/PaginaWebHospital.git
cd PaginaWebHospital
```

---

### 2️⃣ Configurar Base de Datos (MySQL)

#### Windows:
1. Inicia XAMPP Control Panel
2. Inicia **Apache** y **MySQL**
3. Abre http://localhost/phpmyadmin
4. Crea una base de datos llamada `hospital_db`
5. Importa el archivo SQL:
   - Ve a la pestaña "Importar"
   - Selecciona `database/medilink_db_full.sql`
   - Clic en "Continuar"

#### Linux:
```bash
# Iniciar XAMPP
sudo /opt/lampp/lampp start

# O si usas MySQL nativo
sudo systemctl start mysql

# Importar base de datos
mysql -u root -p < database/medilink_db_full.sql
```

---

### 3️⃣ Configurar Backend PHP

#### Windows:
1. Copia la carpeta del backend a la carpeta de XAMPP:
   ```cmd
   xcopy /E /I backend C:\xampp\htdocs\hospital_api
   ```

#### Linux:
```bash
sudo cp -r backend /opt/lampp/htdocs/hospital_api
sudo chmod -R 755 /opt/lampp/htdocs/hospital_api
```

**Verificar que funciona:**
- Abre: http://localhost/hospital_api/sedes.php
- Deberías ver un JSON con las sedes

---

### 4️⃣ Configurar Backend Python (Estadísticas)

#### Windows:
```cmd
cd hospital_stats_api

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor (en nueva ventana de CMD)
python main.py
```

#### Linux:
```bash
cd hospital_stats_api

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor en segundo plano
nohup python main.py > server.log 2>&1 &
```

**Verificar que funciona:**
- Abre: http://localhost:8000/docs
- Deberías ver la documentación de FastAPI

---

### 5️⃣ Configurar Frontend (React)

#### Windows y Linux:
```bash
# Desde la raíz del proyecto
npm install

# Iniciar en modo desarrollo
npm run dev
```

**Acceder a la aplicación:**
- Frontend: http://localhost:5174
- Backend PHP: http://localhost/hospital_api/
- Backend Python: http://localhost:8000

---

## 🔑 Credenciales de Prueba

### Administrador:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Médico de Prueba:
- **Identificación**: `DOC001`
- **Contraseña**: `medico123`

### Paciente de Prueba:
- **Tipo documento**: `CC`
- **Identificación**: `1234567890`
- **Contraseña**: `paciente123`

---

## 🎯 Orden de Inicio de Servicios

1. **MySQL** (XAMPP o servicio)
2. **Apache** (XAMPP - para PHP)
3. **Python API** (puerto 8000)
4. **React** (puerto 5174)

---

## 🛠️ Comandos Útiles

### Detener Servicios

#### Windows:
- XAMPP: Usa el panel de control
- Python: `Ctrl + C` en la terminal
- React: `Ctrl + C` en la terminal

#### Linux:
```bash
# Detener XAMPP
sudo /opt/lampp/lampp stop

# Detener Python API
pkill -f "uvicorn main:app"

# Detener React
Ctrl + C en la terminal
```

### Ver Logs

#### Windows:
```cmd
# Python API
type hospital_stats_api\server.log

# React
Ver en la consola donde ejecutaste npm run dev
```

#### Linux:
```bash
# Python API
tail -f hospital_stats_api/server.log

# MySQL
sudo tail -f /opt/lampp/logs/mysql_error.log

# Apache
sudo tail -f /opt/lampp/logs/error_log
```

## 📖 Uso

### Para Pacientes

1. Entra a la página principal y selecciona "Pacientes"
2. Regístrate con tus datos personales o inicia sesión si ya tienes cuenta
3. Agenda una cita médica seleccionando médico, fecha y horario disponible
4. Accede a "Citas programadas" para ver tu historial médico completo
5. Descarga tus historias clínicas en formato PDF

### Para Médicos

1. Accede al "Portal Médicos" desde la página principal
2. Regístrate con tu información profesional o inicia sesión
3. Ve tu dashboard con las citas programadas por tus pacientes
4. Atiende consultas y documenta historias clínicas completas
5. Genera reportes y seguimiento de pacientes

## 🔧 Componentes Principales

### Componentes de Autenticación
- **AuthContext**: Manejo del estado de autenticación
- **ProtectedRoute**: Protección de rutas según roles

### Componentes Médicos
- **CupsSelector**: Selector de códigos CUPS para procedimientos
- **MedicationTable**: Tabla interactiva para manejo de medicamentos
- **IncapacidadManager**: Gestión de incapacidades médicas

### Componentes de Interface
- **Calendar**: Calendario interactivo para citas
- **TimeSlots**: Gestión de horarios disponibles
- **AppointmentsList**: Lista de citas programadas

### Servicios

- **cupsService**: Gestión de códigos CUPS
- **pdfServiceWorking**: Generación optimizada de reportes PDF

## 🧩 Tecnologías Utilizadas

- **Frontend:** React 19.2.0 + Vite 7.1.7
- **Estilado:** Bootstrap 5.3.8 + React Bootstrap 2.10.10 + Tailwind CSS 4.1.14
- **Navegación:** React Router DOM 7.9.4
- **Formularios:** React Hook Form 7.65.0 + Yup 1.7.1
- **PDF:** jsPDF 3.0.3 + jsPDF AutoTable 5.0.2
- **Iconos:** Font Awesome 7.1.0
- **HTTP:** Axios 1.12.2
- **Fechas:** date-fns 4.1.0
- **Linting:** ESLint 9.36.0 + Standard 17.1.2

## 📜 Scripts Disponibles

```bash
npm run dev      # Modo desarrollo
npm run build    # Construcción para producción
npm run preview  # Vista previa de la construcción
npm run lint     # Análisis de código con ESLint
```

## 👨‍💻 Autores

**Jeisson Londoño**  
[GitHub](https://github.com/elnurri)

**Jessica Gutierrez**  
[GitHub](https://github.com/jessig24)

**Jhoy Cardona**  
[GitHub](https://github.com/JhoyCardona)

## 📄 Licencia

Este proyecto está desarrollado con fines académicos como proyecto integrador.

## 🛠️ Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 💡 Futuras Mejoras

- 📧 Sistema de notificaciones por email
- 📊 Dashboard con estadísticas y reportes avanzados
- 🔄 Integración con sistemas de salud externos
- 📱 Aplicación móvil nativa
- 🗄️ Migración a base de datos PostgreSQL/MongoDB
- 🌐 Implementación de API REST con Node.js/Express
- 🔐 Autenticación OAuth2 y JWT
- 📋 Sistema de recordatorios automáticos
- 🏥 Integración con equipos médicos IoT

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:

- **GitHub Issues**: [Reportar problemas](https://github.com/JhoyCardona/PaginaWebHospital/issues)
- **Repositorio**: [PaginaWebHospital](https://github.com/JhoyCardona/PaginaWebHospital)

## 📱 Acceso Rápido

**URL de desarrollo:** `http://localhost:5173`

### Usuarios de Prueba

- **Paciente:** Regístrate desde la página principal
- **Médico:** Accede al Portal Médicos y regístrate con tus datos profesionales

---

⭐ **¡No olvides darle una estrella al proyecto si te resultó útil!** ⭐