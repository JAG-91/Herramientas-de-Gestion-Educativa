# Herramientas de Gestión Educativa

Un conjunto de herramientas web ligeras, offline-first y basadas en localStorage para la administración escolar. Desarrollado con HTML5, CSS3 y JavaScript Vanilla (ES6+).

## 📋 Descripción

Este repositorio contiene un hub central de herramientas educativas que incluye:

1. **Planilla de Porcentajes** - Calcula y gestiona el porcentaje de inasistencias por curso (enlace externo)
2. **Registro Diario de Asistencia** - Toma de asistencia diaria con estados: Presente, Ausente, Tarde, Justificado
3. **Sistema de Contextos Compartidos** - Gestión centralizada de datos institucionales reutilizables entre herramientas

## 🚀 Características Principales

- ✅ **Offline-first**: Funciona completamente sin conexión a internet
- ✅ **localStorage**: Todos los datos se almacenan localmente en el navegador
- ✅ **Sin dependencias**: No requiere frameworks ni librerías externas
- ✅ **Responsive**: Diseño mobile-first adaptable a todos los dispositivos
- ✅ **Impresión optimizada**: Formularios de impresión con formato profesional
- ✅ **Contextos compartidos**: Los datos institucionales se comparten entre herramientas

## 📁 Estructura del Repositorio

```
Planilla-de-asistencia/
├── index.html                  # Home con acceso a las herramientas
├── registro-asistencia.html    # Registro diario de asistencia
├── styles.css                  # Hoja de estilos unificada
├── script.js                   # Lógica del Home y gestión de contextos
├── registro.js                 # Lógica del registro diario
├── contextos.js                # Sistema de contextos compartidos
└── README.md                   # Este archivo
```

## 🛠️ Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- No requiere servidor ni instalación

### Pasos

1. **Clonar o descargar el repositorio**
   ```bash
   git clone https://github.com/jag-91/Planilla-de-asistencia.git
   cd Planilla-de-asistencia
   ```

2. **Abrir en el navegador**
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local si lo prefieres:
     ```bash
     # Con Python
     python -m http.server 8000
     
     # Con Node.js
     npx serve
     ```

3. **Acceder a las herramientas**
   - Desde el Home (`index.html`), haz clic en la herramienta deseada

## 📖 Instrucciones de Uso

### Home (index.html)

La página principal muestra:
- Accesos directos a ambas herramientas
- Información del contexto activo actual
- Botón para gestionar contextos

### Registro Diario de Asistencia

1. **Seleccionar planilla**: Elige una planilla existente del selector
2. **Seleccionar fecha**: Usa el input de fecha (por defecto hoy)
3. **Marcar asistencia**: Para cada alumno, selecciona el estado:
   - ✅ P (Presente)
   - ❌ A (Ausente)
   - ⏰ T (Tarde)
   - 📄 J (Justificado)
4. **Guardar**: Los cambios se guardan automáticamente al cambiar estados
5. **Imprimir**: Genera un reporte imprimible con los datos institucionales

### Sistema de Contextos

Los contextos permiten guardar datos institucionales reutilizables:

#### Crear un contexto
1. Haz clic en "📁 Gestionar Contextos"
2. Selecciona "+ Crear Nuevo Contexto"
3. Completa los datos:
   - Nombre del contexto
   - Institución
   - Curso y División
   - Ciclo Lectivo
   - Docente
   - Observaciones (opcional)
4. Guarda el contexto

#### Usar un contexto
1. En la lista de contextos, haz clic en "Usar"
2. El contexto se aplicará automáticamente a las impresiones

#### Editar/Eliminar contextos
- Usa los botones correspondientes en cada contexto de la lista
- No se puede eliminar el último contexto ni el contexto activo directamente

## 💾 Estructura de Datos en localStorage

### Contextos
```javascript
// Clave: 'asistencia_contextos'
{
  "contextoId_1": {
    id: "contextoId_1",
    nombre: "5to A - Matemática 2026",
    institucion: "Escuela N°123",
    logo: "",
    curso: "5to",
    division: "A",
    ciclo: "2026",
    periodo: "1er Cuatrimestre",
    docente: "Prof. Gómez",
    observaciones: "",
    fechaCreacion: "2026-07-28T...",
    fechaModificacion: "2026-07-28T..."
  }
}

// Clave: 'asistencia_contexto_activo' → ID del contexto seleccionado
```

### Registros Diarios
```javascript
// Clave: 'registrosDiarios'
{
  "NombrePlanilla": {
    "YYYY-MM-DD": {
      indiceAlumno: "estado"
    }
  }
}
```

### Planillas
```javascript
// Clave: 'asistencia_planillas'
{
  "NombrePlanilla": {
    nombre: "NombrePlanilla",
    alumnos: [
      { apellido: "Pérez", nombre: "Juan" },
      { apellido: "González", nombre: "María" }
    ]
  }
}
```

## 🔄 Migración de Datos Antiguos

Si existían datos en la clave `datosInstitucionales`, el sistema los migrará automáticamente a un contexto llamado "Contexto por defecto" la primera vez que se ejecute.

## 🎨 Personalización

El diseño utiliza variables CSS en `:root` para fácil personalización:

```css
:root {
  --color-primario: #667eea;
  --color-primario-hover: #5a67d8;
  --verde: #28a745;
  --rojo: #dc3545;
  --amarillo: #ffc107;
  --gris: #6c757d;
  --radio: 10px;
  --sombra: 0 2px 10px rgba(0,0,0,0.1);
}
```

## 📱 Responsive Design

- **Mobile (≤600px)**: Grid de 1 columna, tabla scrolleable, botones táctiles (min-height: 44px)
- **Desktop (>600px)**: Grid de 2 columnas, tabla completa

## 🔒 Privacidad y Seguridad

- Todos los datos se almacenan LOCALMENTE en el navegador
- No se envía información a servidores externos
- Los datos persisten mientras no se limpie el localStorage del navegador

## 🧑‍💻 Desarrollo

### Tecnologías utilizadas
- HTML5 semántico
- CSS3 con Custom Properties (variables)
- JavaScript ES6+ (sin frameworks)
- localStorage API

### Buenas prácticas implementadas
- Mobile-first
- Offline-first
- Accesibilidad básica
- Prevención de XSS (escapeHtml)
- Código modular y comentado

## 📄 Licencia

Desarrollado por Julián Alejandro Gomez (JAG-91)

## 🔗 Enlaces Relacionados

- [Planilla de Porcentajes](https://jag-91.github.io/Planilla-de-Porcentaje-de-Asistencias/)

## 🐛 Soporte

Para reportar errores o sugerencias, por favor crea un issue en el repositorio.
