# Configuración de AWS Amplify (Guía rápida - Windows PowerShell)

Esta guía te lleva paso a paso para inicializar AWS Amplify para el frontend de la plataforma y explica opciones para desplegar el backend (Flask).

Requisitos previos
- Tener cuenta AWS con permisos para Amplify, IAM y RDS/Elastic Beanstalk si vas a desplegar backend.
- AWS CLI v2 configurado (~ `aws configure`).
- Node.js 18+ y npm o pnpm.
- Amplify CLI instalado globalmente:
  ```powershell
  npm install -g @aws-amplify/cli
  ```
- Git instalado.

Resumen de la estrategia recomendada
- Frontend (React + Vite): desplegar por AWS Amplify Hosting (CI/CD desde GitHub).
- Backend (Flask): dos opciones recomendadas:
  1) Elastic Beanstalk o EC2 (fácil para Flask tradicional).  
  2) Lambda + API Gateway empaquetando la app como contenedor (más complejo).  
- Base de datos: RDS (Postgres/MySQL) - mantener las credenciales fuera del repo y usarlas como variables de entorno en el servicio elegido.

Pasos para inicializar Amplify y publicar frontend (PowerShell)
1. Abrir PowerShell y navegar al directorio del frontend:
```powershell
cd .\frontend\frontend-app
```

2. (Opcional) Si aún no has iniciado el repo Git o quieres una rama para Amplify:
```powershell
git checkout -b amplify-setup
```

3. Configurar Amplify para tu usuario (sólo la primera vez):
```powershell
amplify configure
```
Este comando abre el navegador para permitir la creación de un usuario IAM. Sigue las instrucciones y toma nota del perfil AWS que crees.

4. Inicializar Amplify en el proyecto frontend:
```powershell
amplify init
```
Responde las preguntas. Ejemplo de respuestas sugeridas:
- Enter a name for the project: e-learning-platform
- Enter a name for the environment: dev
- Choose your default editor: Visual Studio Code
- Choose the type of app that you're building: javascript
- What javascript framework are you using: react
- Source Directory Path: dist  # (o build) si usas Vite usa `dist` o `build` según tu config
- Distribution Directory Path: dist
- Build Command: pnpm run build  # o npm run build
- Start Command: pnpm run dev
- Do you want to use an AWS profile: Yes
- Please choose the profile: <tu-perfil>

5. Añadir hosting y publicar (Amplify Console):
```powershell
amplify add hosting
# Elegir: Continuous deployment (Git-based deployments)
# Seleccionar proveedor GitHub/Bitbucket/GitLab y autorizar

# Finalmente:
amplify publish
```
El primer `publish` generará la build y conectará el repositorio a la consola Amplify si seleccionaste CI/CD.

Configurar variables de entorno en Amplify Console
- En la Amplify Console ve a tu App > App settings > Environment variables.
- Añade variables como `VITE_API_URL` (para frontend) y cualquier otra que tu build necesite.

Ejemplo mínimo para frontend `.env` (local):
VITE_API_URL=https://tu-api.example.com

Opciones para desplegar el backend (Flask)
Opción A - Elastic Beanstalk (recomendado para Flask tradicional):
- Empaqueta tu app (requirements.txt, wsgi.py) y sigue:
```powershell
# Instalar EB CLI
pip install awsebcli --upgrade
# Inicializar
eb init -p python-3.11 <nombre-app>
# Crear entorno
eb create elearning-prod
# Desplegar
eb deploy
```
- Configura las variables de entorno en el entorno de Elastic Beanstalk (Configuration > Software > Environment properties).

Opción B - Lambda + API Gateway (serverless):
- Requiere empaquetar la app con Zappa / Serverless / contenedor. Es viable pero requiere adaptación del `main.py` y manejo de conexiones a RDS.

Notas de seguridad
- Nunca subas credenciales ni `.env` con secrets al repo.
- Usa Amplify Console environment variables, Parameter Store o Secrets Manager para secretos en producción.

Siguientes pasos sugeridos (elige una):
- ¿Quieres que te genere un archivo `amplify.yml` de build y un ejemplo de variables de entorno para Amplify Console? (Puedo crearlos aquí en el repo).
- ¿Prefieres que te guíe para desplegar el backend en Elastic Beanstalk con scripts y archivos `wsgi.py` y `Procfile`?

