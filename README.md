# Herramientas de Gestión Educativa

Sistema unificado de gestión educativa para instituciones escolares. Incluye **Planilla de Porcentaje de Inasistencias** y **Registro Diario de Asistencia**, ambas herramientas compartiendo un sistema centralizado de **Contextos** que garantiza consistencia total de datos.

## Características Principales

### 📊 Planilla de Porcentajes
- Calcula automáticamente el porcentaje de inasistencias por alumno
- Gestiona clases efectivas y estadísticas del curso
- Permite reordenar alumnos manualmente
- Genera reportes imprimibles con datos institucionales

### 📋 Registro Diario de Asistencia  
- Toma de asistencia diaria con estados: Presente, Ausente, Tarde, Justificado
- Historial de registros por fecha
- Reportes diarios imprimibles

### 🗂️ Sistema de Contextos Compartidos
Ambas herramientas utilizan los mismos contextos que incluyen:
- **Datos institucionales**: institución, logo, curso, división, ciclo, período, docente
- **Lista de alumnos**: orden numérico intercambiable, nombres, apellidos
- **Planilla asociada**: clases efectivas, inasistencias por alumno

## Estructura del Proyecto

```
Planilla-de-asistencia/
├── index.html                  ← Home (hub de herramientas)
├── planilla-porcentajes.html   ← Planilla de Porcentajes
├── registro-asistencia.html    ← Registro Diario de Asistencia
├── styles.css                  ← Hoja de estilos unificada
├── script.js                   ← Lógica del Home
├── planilla.js                 ← Lógica de Planilla de Porcentajes
├── registro.js                 ← Lógica del Registro Diario
├── contextos.js                ← Sistema de contextos compartidos
└── README.md                   ← Esta documentación
```

## Instalación y Uso

### 1. Abrir la aplicación
Simplemente abre `index.html` en tu navegador web moderno (Chrome, Firefox, Edge).

### 2. Crear tu primer contexto
1. Ve a **Planilla de Porcentajes** o **Registro Diario**
2. Haz clic en **"📁 Contextos"**
3. Completa los datos institucionales y agrega alumnos
4. Guarda el contexto

### 3. Usar contextos en ambas herramientas
Los contextos creados están disponibles en ambas herramientas automáticamente, garantizando que:
- La lista de alumnos es la misma
- Los datos institucionales son consistentes
- Las inasistencias se comparten entre herramientas

## Almacenamiento de Datos

Todos los datos se guardan localmente en tu navegador usando `localStorage`:

| Clave | Descripción |
|-------|-------------|
| `asistencia_contextos` | Todos los contextos creados |
| `asistencia_contexto_activo` | ID del contexto seleccionado actualmente |
| `registrosDiarios` | Registros de asistencia diaria por fecha |

**Importante**: Los datos NO se sincronizan entre dispositivos. Para usar en otro dispositivo/navegador, deberás crear los contextos nuevamente.

## Migración de Datos Antiguos

Si ya tenías datos en versiones anteriores del sistema, estos se migrarán automáticamente a un contexto llamado "Contexto por defecto" la primera vez que abras la aplicación.

## Impresión de Reportes

Ambas herramientas generan reportes imprimibles que incluyen:
- Encabezado institucional con logo (si está configurado)
- Datos del curso, ciclo y docente
- Tabla completa de alumnos con sus datos
- Pie de página con firma del docente

Los reportes están optimizados para impresión en papel A4 y no incluyen elementos de la interfaz (botones, menús, etc.).

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos con variables CSS para coherencia visual
- **JavaScript Vanilla (ES6+)** - Sin frameworks ni librerías externas
- **localStorage** - Persistencia de datos offline

## Compatibilidad

- ✅ Chrome/Chromium (recomendado)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Internet Explorer no es compatible

## Desarrollo

Este proyecto fue desarrollado por **Julián Alejandro Gomez (JAG-91)**.

### Licencia

Consultar el archivo `LICENSE` para más información.

---

**Nota**: Esta aplicación funciona completamente offline una vez cargada. No requiere conexión a internet ni envía datos a servidores externos.
