# 🏥 Sistema Médico Integrado - Hospital Digital

## 📖 Descripción
Este proyecto es una aplicación web desarrollada en React que digitaliza la gestión médica hospitalaria. Permite el registro completo de pacientes y médicos, facilitando la solicitud y gestión de citas médicas, creación de historias clínicas digitales y descarga de reportes médicos en formato PDF. La plataforma conecta de manera bidireccional a pacientes y profesionales de la salud en un entorno digital seguro y eficiente.

## ⚙️ Características Principales
- **👥 Gestión dual de usuarios**: Registro y autenticación separada para pacientes y médicos
- **📅 Sistema de citas inteligente**: Agendamiento automático con médicos registrados
- **📋 Historia clínica digital**: Documentación médica completa y profesional
- **📄 Generación de PDF**: Reportes médicos descargables con información detallada
- **🔐 Autenticación segura**: Acceso protegido con rutas privadas
- **🎨 Interfaz profesional**: Diseño médico con experiencia optimizada
- **📱 Diseño responsivo**: Accesible desde cualquier dispositivo
- **💾 Almacenamiento local**: Gestión de datos con localStorage para persistencia
- **🩺 Gestión de CUPS**: Sistema integrado de códigos únicos de procedimientos en salud
- **💊 Manejo de medicamentos**: Tabla interactiva para prescripciones médicas
- **🚫 Control de incapacidades**: Gestión especializada de licencias médicas

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

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm (incluido con Node.js)
- Git

### Pasos de instalación

1. **Clona este repositorio:**

   ```bash
   git clone https://github.com/JhoyCardona/PaginaWebHospital.git
   ```

2. **Entra al directorio del proyecto:**

   ```bash
   cd PaginaWebHospital/my-react-app-citas
   ```

3. **Instala las dependencias:**

   ```bash
   npm install
   ```

4. **Ejecuta el proyecto en modo desarrollo:**

   ```bash
   npm run dev
   ```

5. **Accede a la aplicación:**

   Abre tu navegador en `http://localhost:5173`

### Inicialización de Datos

El sistema comienza sin datos por defecto. Para usar la aplicación:

1. Los **pacientes** pueden registrarse desde el formulario de login principal
2. Los **médicos** pueden registrarse desde el portal médico
3. Las **historias clínicas** se crean durante las consultas médicas

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