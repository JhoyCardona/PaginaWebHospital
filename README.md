# MediLink — PaginaWebHospital

Documento actualizado y reducido para describir y ejecutar lo que realmente hay en este repositorio.

Resumen rápido
- Frontend: Aplicación React + Vite ubicada en el directorio `src/` y `public/`.
- API de estadísticas: código Python en `hospital_stats_api/` (FastAPI / scripts de análisis).

Nota importante: Este repositorio contiene el frontend y una API de estadísticas en Python. No incluye un backend completo en PHP/Node que gestione usuarios/citas en producción; si tienes otro backend local o base de datos, configúralo por separado.

## Estructura principal

Repositorios y carpetas más relevantes:

- `src/` — Código del frontend React (componentes, páginas, estilos).
- `public/` — Recursos estáticos (index.html, imágenes).
- `hospital_stats_api/` — API y scripts Python para generación de estadísticas y visualizaciones.
- `package.json`, `vite.config.js` — Configuración y scripts del frontend.

Para más detalles sobre el API de estadísticas revisa `hospital_stats_api/README.md`.

## Requisitos (mínimos)

- Node.js 16+ (recomendado 18+)
- npm o yarn
- Python 3.8+
- Git

En Windows se recomienda usar PowerShell; en Linux/macOS una terminal bash.

## Ejecutar el proyecto (desarrollo)

1) Frontend (React + Vite)

PowerShell:

```powershell
cd c:\Users\USUARIO\OneDrive\Desktop\MediLink\PaginaWebHospital
npm install
npm run dev
```

Bash (Linux/macOS):

```bash
cd /ruta/al/proyecto/PaginaWebHospital
npm install
npm run dev
```

Vite mostrará la URL local (por defecto suele ser `http://localhost:5173`) — usa la que indique la consola.

2) API de estadísticas (Python)

PowerShell (Windows):

```powershell
cd c:\Users\USUARIO\OneDrive\Desktop\MediLink\PaginaWebHospital\hospital_stats_api
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Inicia la API (si el proyecto usa uvicorn o ejecuta main.py directamente)
python main.py
```

Bash (Linux/macOS):

```bash
cd /ruta/al/proyecto/PaginaWebHospital/hospital_stats_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Después de arrancar la API, normalmente estará disponible en `http://localhost:8000` (o según la configuración en `main.py`). Si el proyecto usa FastAPI + Uvicorn, revisa `/hospital_stats_api/main.py` o `README.md` interno para el comando exacto.

## Notas sobre base de datos y backend

Este repo no incluye ni obliga a una base de datos específica para el frontend. Si estás usando un backend externo (por ejemplo un servicio PHP o Node que expone las rutas de usuarios/citas), asegúrate de configurarlo y actualizar las URLs en `src/services/api.js`.

Si tienes SQL o scripts de datos en otra carpeta, colócalos y documenta su importación (por ejemplo con phpMyAdmin o mysql CLI).

## Scripts útiles (npm)

- `npm run dev` — Inicia Vite en modo desarrollo.
- `npm run build` — Genera la versión de producción.
- `npm run preview` — Vista previa de la build de producción.
- `npm run lint` — Ejecuta ESLint (si está configurado).

Consulta `package.json` para el detalle exacto de scripts.

## Contribución

1. Fork del repositorio.
2. Crea una rama: `git checkout -b feature/mi-cambio`.
3. Haz commits claros: `git commit -m "feat: descripción breve"`.
4. Push y Pull Request.

Si vas a añadir un backend o migrar la DB, agrega un archivo `hospital_api/README.md` o `docs/` con instrucciones claras.

## Autor y contacto

- Jhoy Cardona — https://github.com/JhoyCardona
- Jessica Gutierrez — https://github.com/jessig24
- Jeisson Londoño — https://github.com/elnurri

Para problemas o dudas abre un Issue en GitHub: https://github.com/JhoyCardona/PaginaWebHospital/issues

## Licencia

Proyecto con fines académicos. Añade una licencia si quieres permitir contribuciones externas (por ejemplo MIT).

---

Si quieres que deje el README también en inglés, o que incorpore los comandos exactos para ejecutar `hospital_stats_api` con `uvicorn`, dímelo y lo actualizo. 