/**
 * app.js - Lógica principal para la gestión de contextos
 */

// Clave para localStorage
const STORAGE_KEY = 'asistencia_contextos';

// Estado actual
let contextoActual = null;

// ========================================
// FUNCIONES DE ALMACENAMIENTO
// ========================================

/**
 * Obtener todos los contextos guardados
 */
function obtenerContextos() {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
}

/**
 * Guardar un contexto
 */
function guardarContexto(contexto) {
    const contextos = obtenerContextos();
    
    // Verificar si ya existe (por nombre de institución + materia + ciclo)
    const index = contextos.findIndex(c => 
        c.institucion === contexto.institucion && 
        c.materia === contexto.materia &&
        c.cicloLectivo === contexto.cicloLectivo &&
        c.curso === contexto.curso &&
        c.division === contexto.division
    );
    
    if (index !== -1) {
        // Actualizar existente, manteniendo registros y observaciones
        contexto.registrosAsistencia = contextos[index].registrosAsistencia || [];
        contexto.observaciones = contextos[index].observaciones || '';
        contextos[index] = contexto;
    } else {
        // Agregar nuevo
        contextos.push(contexto);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contextos));
}

/**
 * Eliminar un contexto por índice
 */
function eliminarContexto(index) {
    const contextos = obtenerContextos();
    contextos.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contextos));
}

/**
 * Obtener un contexto por índice
 */
function obtenerContextoPorIndex(index) {
    const contextos = obtenerContextos();
    return contextos[index] || null;
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Parsear la lista de alumnos desde el textarea
 * Formato esperado: "Número, Nombre, Apellido" por línea
 */
function parsearListaAlumnos(texto) {
    const lineas = texto.trim().split('\n');
    const alumnos = [];
    
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;
        
        const partes = linea.split(',').map(p => p.trim());
        if (partes.length >= 3) {
            alumnos.push({
                numero: parseInt(partes[0]) || (i + 1),
                nombre: partes[1],
                apellido: partes[2]
            });
        } else if (partes.length === 2) {
            // Si solo hay nombre y apellido, generar número automáticamente
            alumnos.push({
                numero: i + 1,
                nombre: partes[0],
                apellido: partes[1]
            });
        }
    }
    
    return alumnos;
}

/**
 * Formatear fecha actual
 */
function obtenerFechaActual() {
    const fecha = new Date();
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

/**
 * Obtener timestamp formateado
 */
function obtenerTimestamp() {
    const fecha = new Date();
    return fecha.toLocaleString('es-ES');
}

// ========================================
// INICIALIZACIÓN DEL SELECTOR DE CONTEXTOS
// ========================================

/**
 * Cargar el selector de contextos en la página principal
 */
function cargarSelectorContextos() {
    const selector = document.getElementById('selector-contextos');
    if (!selector) return;
    
    const contextos = obtenerContextos();
    
    // Limpiar opciones (mantener la primera)
    selector.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    contextos.forEach((contexto, index) => {
        const opcion = document.createElement('option');
        opcion.value = index;
        const cursoInfo = contexto.curso && contexto.division 
            ? `${contexto.curso}° "${contexto.division}"` 
            : '';
        opcion.textContent = `${contexto.institucion} - ${cursoInfo} - ${contexto.materia} (${contexto.cicloLectivo})`;
        selector.appendChild(opcion);
    });
}

/**
 * Mostrar información del contexto seleccionado
 */
function mostrarInfoContexto(contexto) {
    const infoBox = document.getElementById('info-contexto');
    if (!infoBox) return;
    
    if (contexto) {
        document.getElementById('info-institucion').textContent = contexto.institucion;
        document.getElementById('info-curso').textContent = contexto.curso || '';
        document.getElementById('info-division').textContent = contexto.division || '';
        document.getElementById('info-materia').textContent = contexto.materia;
        document.getElementById('info-docente').textContent = contexto.docente;
        document.getElementById('info-ciclo').textContent = contexto.cicloLectivo;
        document.getElementById('info-alumnos').textContent = contexto.alumnos ? contexto.alumnos.length : 0;
        infoBox.style.display = 'block';
    } else {
        infoBox.style.display = 'none';
    }
}

// ========================================
// EVENT LISTENERS - PÁGINA PRINCIPAL
// ========================================

function inicializarPaginaPrincipal() {
    // Botón Registro Diario
    const btnRegistro = document.getElementById('btn-registro-diario');
    if (btnRegistro) {
        btnRegistro.addEventListener('click', () => {
            if (!contextoActual) {
                alert('Primero debe seleccionar o crear un contexto.');
                document.getElementById('formulario-contexto').scrollIntoView({ behavior: 'smooth' });
                return;
            }
            window.location.href = 'asistencias.html';
        });
    }
    
    // Botón Planilla Inasistencias
    const btnPlanilla = document.getElementById('btn-planilla-inasistencias');
    if (btnPlanilla) {
        btnPlanilla.addEventListener('click', () => {
            if (!contextoActual) {
                alert('Primero debe seleccionar o crear un contexto.');
                document.getElementById('formulario-contexto').scrollIntoView({ behavior: 'smooth' });
                return;
            }
            window.location.href = 'planilla.html';
        });
    }
    
    // Selector de contextos
    const selector = document.getElementById('selector-contextos');
    if (selector) {
        selector.addEventListener('change', (e) => {
            const index = e.target.value;
            if (index !== '') {
                contextoActual = obtenerContextoPorIndex(parseInt(index));
                mostrarInfoContexto(contextoActual);
            } else {
                contextoActual = null;
                mostrarInfoContexto(null);
            }
        });
    }
    
    // Botón Cargar Contexto
    const btnCargar = document.getElementById('btn-cargar-contexto');
    if (btnCargar) {
        btnCargar.addEventListener('click', () => {
            const index = document.getElementById('selector-contextos').value;
            if (index === '') {
                alert('Seleccione un contexto de la lista.');
                return;
            }
            contextoActual = obtenerContextoPorIndex(parseInt(index));
            mostrarInfoContexto(contextoActual);
            
            // Precargar datos en el formulario
            precargarFormulario(contextoActual);
        });
    }
    
    // Botón Eliminar Contexto
    const btnEliminar = document.getElementById('btn-eliminar-contexto');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
            const index = document.getElementById('selector-contextos').value;
            if (index === '') {
                alert('Seleccione un contexto de la lista para eliminar.');
                return;
            }
            
            const contexto = obtenerContextoPorIndex(parseInt(index));
            const confirmacion = confirm(
                `¿Está seguro que desea eliminar el contexto:\n\n` +
                `${contexto.institucion} - ${contexto.curso}° "${contexto.division}"\n` +
                `${contexto.materia} - Ciclo: ${contexto.cicloLectivo}\n\n` +
                `Esta acción no se puede deshacer.`
            );
            
            if (confirmacion) {
                eliminarContexto(parseInt(index));
                cargarSelectorContextos();
                contextoActual = null;
                mostrarInfoContexto(null);
                document.getElementById('selector-contextos').value = '';
                alert('Contexto eliminado correctamente.');
            }
        });
    }
    
    // Formulario de creación/edición de contexto
    const formContexto = document.getElementById('form-contexto');
    if (formContexto) {
        formContexto.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const contexto = {
                institucion: document.getElementById('institucion').value.trim(),
                logoUrl: document.getElementById('logo-url').value.trim(),
                director: document.getElementById('director').value.trim(),
                cicloLectivo: document.getElementById('ciclo-lectivo').value.trim(),
                curso: document.getElementById('curso').value.trim(),
                division: document.getElementById('division').value.trim(),
                materia: document.getElementById('materia').value.trim(),
                docente: document.getElementById('docente').value.trim(),
                alumnos: parsearListaAlumnos(document.getElementById('lista-alumnos').value),
                registrosAsistencia: [] // Array para guardar registros históricos
            };
            
            // Validaciones
            if (!contexto.curso || !contexto.division) {
                alert('Debe ingresar curso y división.');
                return;
            }
            
            if (contexto.alumnos.length === 0) {
                alert('Debe ingresar al menos un alumno.');
                return;
            }
            
            guardarContexto(contexto);
            cargarSelectorContextos();
            
            // Establecer como contexto actual
            const contextos = obtenerContextos();
            contextoActual = contextos[contextos.length - 1];
            
            alert('Contexto guardado correctamente.\n\nNota: El "Total de Clases" se solicitará al ingresar a la Planilla de Inasistencias.');
            formContexto.reset();
            mostrarInfoContexto(contextoActual);
        });
    }
}

/**
 * Precargar datos en el formulario para edición
 */
function precargarFormulario(contexto) {
    const form = document.getElementById('form-contexto');
    if (!form) return;
    
    document.getElementById('institucion').value = contexto.institucion;
    document.getElementById('logo-url').value = contexto.logoUrl || '';
    document.getElementById('director').value = contexto.director;
    document.getElementById('ciclo-lectivo').value = contexto.cicloLectivo;
    document.getElementById('curso').value = contexto.curso || '';
    document.getElementById('division').value = contexto.division || '';
    document.getElementById('materia').value = contexto.materia;
    document.getElementById('docente').value = contexto.docente;
    
    // Reconstruir lista de alumnos
    const listaAlumnos = contexto.alumnos
        .map(a => `${a.numero}, ${a.nombre}, ${a.apellido}`)
        .join('\n');
    document.getElementById('lista-alumnos').value = listaAlumnos;
}

// ========================================
// MODAL DE OBSERVACIONES
// ========================================

let callbackImpresion = null;

/**
 * Mostrar modal de observaciones
 */
function mostrarModalObservaciones(callback) {
    callbackImpresion = callback;
    const modal = document.getElementById('modal-observaciones');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('texto-observaciones').value = '';
        document.getElementById('texto-observaciones').focus();
    }
}

/**
 * Ocultar modal de observaciones
 */
function ocultarModalObservaciones() {
    const modal = document.getElementById('modal-observaciones');
    if (modal) {
        modal.style.display = 'none';
    }
    callbackImpresion = null;
}

/**
 * Inicializar listeners del modal
 */
function inicializarModalObservaciones() {
    const btnCancelar = document.getElementById('btn-cancelar-observaciones');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarModalObservaciones);
    }
    
    const btnImprimir = document.getElementById('btn-imprimir-con-observaciones');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            if (callbackImpresion) {
                const observaciones = document.getElementById('texto-observaciones').value;
                callbackImpresion(observaciones);
            }
            ocultarModalObservaciones();
        });
    }
    
    // Cerrar modal al hacer click fuera
    const modal = document.getElementById('modal-observaciones');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                ocultarModalObservaciones();
            }
        });
    }
}

// ========================================
// INICIALIZACIÓN GENERAL
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Página principal
    if (document.getElementById('menu-principal')) {
        cargarSelectorContextos();
        inicializarPaginaPrincipal();
    }
    
    // Modal de observaciones (en todas las páginas)
    inicializarModalObservaciones();
});

// Exportar funciones para usar en otras páginas
window.AppUtils = {
    obtenerContextos,
    obtenerContextoPorIndex,
    guardarContexto,
    eliminarContexto,
    parsearListaAlumnos,
    obtenerFechaActual,
    obtenerTimestamp,
    mostrarModalObservaciones,
    get contextoActual() { return contextoActual; },
    set contextoActual(value) { contextoActual = value; }
};
