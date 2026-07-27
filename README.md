# 🎓 Herramientas de Gestión Educativa

Suite de aplicaciones web desarrolladas en **HTML5, CSS3 y JavaScript puro** para la administración escolar. Todas las herramientas funcionan 100% offline utilizando LocalStorage.

---

## 📋 Herramientas Disponibles

### 1. Planilla de Porcentaje de Asistencias
Aplicación externa para registrar inasistencias de alumnos y calcular automáticamente su porcentaje de asistencia.

🔗 [Abrir herramienta](https://jag-91.github.io/Planilla-de-Porcentaje-de-Asistencias/)

**Características:**
- Registro de clases efectivas
- Alta, edición y eliminación de alumnos
- Cálculo automático del porcentaje de inasistencia
- Búsqueda instantánea y ordenamiento por columnas
- Gestión de múltiples planillas
- Estadísticas automáticas del curso
- Impresión institucional personalizada

---

### 2. Registro Diario de Asistencia
Herramienta interna para tomar asistencia diaria con múltiples estados por alumno.

🔗 [Abrir herramienta](registro-asistencia.html)

**Características:**
- Cuatro estados de asistencia: Presente ✅, Ausente ❌, Tarde ⏰, Justificado 📄
- Selector de planilla y fecha
- Persistencia automática en localStorage
- Impresión de registros diarios con espacio para firmas
- Interfaz responsive para móviles y tablets

---

## 💾 Almacenamiento

Todas las herramientas utilizan exclusivamente **LocalStorage**:

- No requiere base de datos
- No requiere servidor
- No requiere internet
- Los datos permanecen en el navegador del usuario

---

## 🚀 Cómo usar

1. Abrir `index.html` en cualquier navegador moderno
2. Seleccionar la herramienta deseada
3. Comenzar a gestionar tus planillas escolares

---

## 🛠️ Tecnologías utilizadas

- HTML5 semántico
- CSS3 con variables custom
- JavaScript ES6+ (Vanilla)
- LocalStorage API
- Google Fonts (Inter)

**Sin frameworks ni dependencias externas.**

---

## 📱 Compatibilidad

Compatible con todos los navegadores modernos:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

Funciona en Windows, Linux, macOS, Android e iOS.

---

## 🔒 Privacidad

Toda la información se almacena únicamente en el navegador del usuario:

- No envía datos a servidores
- No recopila información personal
- No utiliza cookies
- No requiere cuentas de usuario

---

## 📁 Estructura del proyecto

```
Planilla-de-asistencia/
│
├── index.html                    # Home / Landing Page
├── registro-asistencia.html      # Registro Diario de Asistencia
├── styles.css                    # Hoja de estilos unificada
├── script.js                     # Lógica del Home (mínima)
├── registro.js                   # Lógica del Registro Diario
└── README.md                     # Documentación
```

---

## 💡 Ventajas

- Completamente offline
- Sin instalación requerida
- Guarda automáticamente
- Interfaz intuitiva y moderna
- Diseño responsive
- Rápido y ligero

---

## Licencia

Proyecto de uso libre para fines educativos. Puede modificarse y adaptarse según las necesidades de cada institución.

---

## Autor

**Julián Alejandro Gomez** (GitHub: JAG-91)

---

**Versión:** 4.0 - Refactorizado con arquitectura modular
