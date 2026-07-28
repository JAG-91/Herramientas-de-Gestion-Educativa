/**
 * SISTEMA CENTRALIZADO DE CONTEXTOS
 * Gestión de datos institucionales compartidos entre herramientas
 * Almacenamiento: localStorage
 */

// ========================================
// CONSTANTES Y CONFIGURACIÓN
// ========================================
const STORAGE_KEY_CONTEXTOS = 'asistencia_contextos';
const STORAGE_KEY_CONTEXTO_ACTIVO = 'asistencia_contexto_activo';
const STORAGE_KEY_DATOS_ANTIGUOS = 'datosInstitucionales';
const STORAGE_KEY_PLANILLAS = 'asistencia_planillas';

// ========================================
// FUNCIONES PRINCIPALES DE GESTIÓN
// ========================================

/**
 * Obtiene todos los contextos guardados
 * @returns {Object} Objeto con todos los contextos
 */
function listarContextos() {
    const data = localStorage.getItem(STORAGE_KEY_CONTEXTOS);
    return data ? JSON.parse(data) : {};
}

/**
 * Guarda el objeto de contextos en localStorage
 * @param {Object} contextos - Objeto con todos los contextos
 */
function guardarContextos(contextos) {
    localStorage.setItem(STORAGE_KEY_CONTEXTOS, JSON.stringify(contextos));
}

/**
 * Crea un nuevo contexto
 * @param {Object} datos - Datos del contexto
 * @returns {Object|null} El contexto creado o null si hay error
 */
function crearContexto(datos) {
    // Validaciones
    if (!datos.institucion || !datos.curso || !datos.docente) {
        mostrarToast('Error: Institución, Curso y Docente son obligatorios', 'error');
        return null;
    }

    if (!datos.nombre || datos.nombre.trim() === '') {
        mostrarToast('Error: El nombre del contexto es obligatorio', 'error');
        return null;
    }

    const contextos = listarContextos();
    
    // Verificar nombre duplicado
    const nombreDuplicado = Object.values(contextos).some(
        c => c.nombre.toLowerCase() === datos.nombre.toLowerCase().trim()
    );
    
    if (nombreDuplicado) {
        mostrarToast('Error: Ya existe un contexto con ese nombre', 'error');
        return null;
    }

    // Generar ID único
    const id = 'ctx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const ahora = new Date().toISOString();

    const nuevoContexto = {
        id: id,
        nombre: datos.nombre.trim(),
        institucion: datos.institucion.trim(),
        logo: datos.logo || '',
        curso: datos.curso.trim(),
        division: datos.division ? datos.division.trim() : '',
        ciclo: datos.ciclo ? datos.ciclo.trim() : '',
        periodo: datos.periodo ? datos.periodo.trim() : '',
        docente: datos.docente.trim(),
        observaciones: datos.observaciones ? datos.observaciones.trim() : '',
        alumnos: datos.alumnos || [],
        clasesEfectivas: datos.clasesEfectivas || 0,
        fechaCreacion: ahora,
        fechaModificacion: ahora
    };

    contextos[id] = nuevoContexto;
    guardarContextos(contextos);

    // Establecer como activo si es el primero
    if (Object.keys(contextos).length === 1) {
        seleccionarContexto(id);
    }

    mostrarToast('Contexto creado exitosamente', 'success');
    return nuevoContexto;
}

/**
 * Edita un contexto existente
 * @param {string} id - ID del contexto a editar
 * @param {Object} datos - Nuevos datos del contexto
 * @returns {Object|null} El contexto actualizado o null si hay error
 */
function editarContexto(id, datos) {
    const contextos = listarContextos();
    
    if (!contextos[id]) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return null;
    }

    // Validaciones
    if (!datos.institucion || !datos.curso || !datos.docente) {
        mostrarToast('Error: Institución, Curso y Docente son obligatorios', 'error');
        return null;
    }

    if (!datos.nombre || datos.nombre.trim() === '') {
        mostrarToast('Error: El nombre del contexto es obligatorio', 'error');
        return null;
    }

    // Verificar nombre duplicado (excluyendo el contexto actual)
    const nombreDuplicado = Object.values(contextos).some(
        c => c.id !== id && c.nombre.toLowerCase() === datos.nombre.toLowerCase().trim()
    );
    
    if (nombreDuplicado) {
        mostrarToast('Error: Ya existe otro contexto con ese nombre', 'error');
        return null;
    }

    const contextoActual = contextos[id];
    contextos[id] = {
        ...contextoActual,
        nombre: datos.nombre.trim(),
        institucion: datos.institucion.trim(),
        logo: datos.logo || '',
        curso: datos.curso.trim(),
        division: datos.division ? datos.division.trim() : '',
        ciclo: datos.ciclo ? datos.ciclo.trim() : '',
        periodo: datos.periodo ? datos.periodo.trim() : '',
        docente: datos.docente.trim(),
        observaciones: datos.observaciones ? datos.observaciones.trim() : '',
        alumnos: datos.alumnos || contextoActual.alumnos,
        clasesEfectivas: datos.clasesEfectivas !== undefined ? datos.clasesEfectivas : contextoActual.clasesEfectivas,
        fechaModificacion: new Date().toISOString()
    };

    guardarContextos(contextos);
    mostrarToast('Contexto actualizado exitosamente', 'success');
    return contextos[id];
}

/**
 * Elimina un contexto
 * @param {string} id - ID del contexto a eliminar
 * @returns {boolean} True si se eliminó, false si hubo error
 */
function eliminarContexto(id) {
    const contextos = listarContextos();
    
    if (!contextos[id]) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return false;
    }

    // No permitir eliminar si es el único
    if (Object.keys(contextos).length === 1) {
        mostrarToast('No se puede eliminar el último contexto', 'warning');
        return false;
    }

    // Confirmación
    if (!confirm('¿Está seguro de eliminar este contexto? Esta acción no se puede deshacer.')) {
        return false;
    }

    delete contextos[id];
    guardarContextos(contextos);

    // Si era el activo, seleccionar el primero disponible
    const contextoActivoId = localStorage.getItem(STORAGE_KEY_CONTEXTO_ACTIVO);
    if (contextoActivoId === id) {
        const primerosIds = Object.keys(contextos);
        if (primerosIds.length > 0) {
            seleccionarContexto(primerosIds[0]);
        } else {
            localStorage.removeItem(STORAGE_KEY_CONTEXTO_ACTIVO);
        }
    }

    mostrarToast('Contexto eliminado exitosamente', 'success');
    return true;
}

/**
 * Selecciona un contexto como activo
 * @param {string} id - ID del contexto a seleccionar
 */
function seleccionarContexto(id) {
    const contextos = listarContextos();
    
    if (!contextos[id]) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return;
    }

    localStorage.setItem(STORAGE_KEY_CONTEXTO_ACTIVO, id);
    mostrarToast('Contexto seleccionado: ' + contextos[id].nombre, 'success');
    
    // Actualizar UI si existe la función
    if (typeof actualizarUIContextoActivo === 'function') {
        actualizarUIContextoActivo();
    }
}

/**
 * Obtiene el contexto actualmente activo
 * @returns {Object|null} El contexto activo o null
 */
function obtenerContextoActivo() {
    const id = localStorage.getItem(STORAGE_KEY_CONTEXTO_ACTIVO);
    if (!id) return null;
    
    const contextos = listarContextos();
    return contextos[id] || null;
}

/**
 * Aplica los datos de un contexto a los inputs del modal de impresión
 * @param {string} id - ID del contexto a aplicar
 */
function aplicarContextoAUI(id) {
    const contextos = listarContextos();
    const contexto = contextos[id];
    
    if (!contexto) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return;
    }

    // Rellenar inputs del modal de impresión (si existen)
    const mapeoCampos = {
        'institucionInput': contexto.institucion,
        'cursoImprimir': contexto.curso,
        'divisionImprimir': contexto.division,
        'cicloImprimir': contexto.ciclo,
        'periodoImprimir': contexto.periodo,
        'docenteImprimir': contexto.docente,
        'observacionesImprimir': contexto.observaciones
    };

    Object.entries(mapeoCampos).forEach(([idCampo, valor]) => {
        const elemento = document.getElementById(idCampo);
        if (elemento && valor) {
            elemento.value = valor;
        }
    });

    // Manejar logo si existe
    if (contexto.logo) {
        const logoImg = document.getElementById('logoImprimir');
        if (logoImg) {
            logoImg.src = contexto.logo;
            logoImg.style.display = 'block';
        }
    }
}

// ========================================
// GESTIÓN DE ALUMNOS DENTRO DEL CONTEXTO
// ========================================

/**
 * Agrega un alumno a un contexto
 * @param {string} contextoId - ID del contexto
 * @param {string} nombre - Nombre del alumno
 * @param {string} apellido - Apellido del alumno
 * @returns {Object|null} El alumno creado o null
 */
function agregarAlumnoAContexto(contextoId, nombre, apellido) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return null;
    }
    
    const id = 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const maxOrden = contexto.alumnos.reduce((max, a) => Math.max(max, a.orden || 0), 0);
    
    const nuevoAlumno = {
        id: id,
        orden: maxOrden + 1,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        inasistencias: 0
    };
    
    contexto.alumnos.push(nuevoAlumno);
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
    
    mostrarToast('Alumno agregado exitosamente', 'success');
    return nuevoAlumno;
}

/**
 * Edita un alumno en un contexto
 * @param {string} contextoId - ID del contexto
 * @param {string} alumnoId - ID del alumno
 * @param {Object} nuevosDatos - Nuevos datos del alumno
 * @returns {boolean} True si se actualizó
 */
function editarAlumnoEnContexto(contextoId, alumnoId, nuevosDatos) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return false;
    }
    
    const alumno = contexto.alumnos.find(a => a.id === alumnoId);
    if (!alumno) {
        mostrarToast('Error: Alumno no encontrado', 'error');
        return false;
    }
    
    if (nuevosDatos.nombre) alumno.nombre = nuevosDatos.nombre.trim();
    if (nuevosDatos.apellido) alumno.apellido = nuevosDatos.apellido.trim();
    if (nuevosDatos.orden !== undefined) alumno.orden = parseInt(nuevosDatos.orden) || alumno.orden;
    
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
    
    mostrarToast('Alumno actualizado', 'success');
    return true;
}

/**
 * Elimina un alumno de un contexto
 * @param {string} contextoId - ID del contexto
 * @param {string} alumnoId - ID del alumno
 * @returns {boolean} True si se eliminó
 */
function eliminarAlumnoDeContexto(contextoId, alumnoId) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) {
        mostrarToast('Error: Contexto no encontrado', 'error');
        return false;
    }
    
    const indice = contexto.alumnos.findIndex(a => a.id === alumnoId);
    if (indice === -1) {
        mostrarToast('Error: Alumno no encontrado', 'error');
        return false;
    }
    
    contexto.alumnos.splice(indice, 1);
    
    // Reordenar los restantes
    contexto.alumnos.forEach((alumno, i) => {
        alumno.orden = i + 1;
    });
    
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
    
    mostrarToast('Alumno eliminado', 'success');
    return true;
}

/**
 * Intercambia el orden de dos alumnos
 * @param {string} contextoId - ID del contexto
 * @param {string} alumnoId1 - ID del primer alumno
 * @param {string} alumnoId2 - ID del segundo alumno
 */
function intercambiarOrdenAlumnos(contextoId, alumnoId1, alumnoId2) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) return;
    
    const alumno1 = contexto.alumnos.find(a => a.id === alumnoId1);
    const alumno2 = contexto.alumnos.find(a => a.id === alumnoId2);
    
    if (!alumno1 || !alumno2) return;
    
    const ordenTemp = alumno1.orden;
    alumno1.orden = alumno2.orden;
    alumno2.orden = ordenTemp;
    
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
}

/**
 * Mueve un alumno una posición hacia arriba
 * @param {string} contextoId - ID del contexto
 * @param {string} alumnoId - ID del alumno
 */
function moverAlumnoArriba(contextoId, alumnoId) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) return;
    
    const indice = contexto.alumnos.findIndex(a => a.id === alumnoId);
    if (indice <= 0) return; // Ya está arriba
    
    const alumnoActual = contexto.alumnos[indice];
    const alumnoAnterior = contexto.alumnos[indice - 1];
    
    const ordenTemp = alumnoActual.orden;
    alumnoActual.orden = alumnoAnterior.orden;
    alumnoAnterior.orden = ordenTemp;
    
    // Reordenar array
    contexto.alumnos.splice(indice, 1);
    contexto.alumnos.splice(indice - 1, 0, alumnoActual);
    
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
}

/**
 * Mueve un alumno una posición hacia abajo
 * @param {string} contextoId - ID del contexto
 * @param {string} alumnoId - ID del alumno
 */
function moverAlumnoAbajo(contextoId, alumnoId) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) return;
    
    const indice = contexto.alumnos.findIndex(a => a.id === alumnoId);
    if (indice < 0 || indice >= contexto.alumnos.length - 1) return; // Ya está abajo
    
    const alumnoActual = contexto.alumnos[indice];
    const alumnoSiguiente = contexto.alumnos[indice + 1];
    
    const ordenTemp = alumnoActual.orden;
    alumnoActual.orden = alumnoSiguiente.orden;
    alumnoSiguiente.orden = ordenTemp;
    
    // Reordenar array
    contexto.alumnos.splice(indice, 1);
    contexto.alumnos.splice(indice + 1, 0, alumnoActual);
    
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
}

/**
 * Actualiza las clases efectivas de un contexto
 * @param {string} contextoId - ID del contexto
 * @param {number} clases - Número de clases efectivas
 */
function actualizarClasesEfectivas(contextoId, clases) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) return;
    
    contexto.clasesEfectivas = parseInt(clases) || 0;
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
}

/**
 * Actualiza las inasistencias de un alumno
 * @param {string} contextoId - ID del contexto
 * @param {string} alumnoId - ID del alumno
 * @param {number} inasistencias - Número de inasistencias
 */
function actualizarInasistencias(contextoId, alumnoId, inasistencias) {
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) return;
    
    const alumno = contexto.alumnos.find(a => a.id === alumnoId);
    if (!alumno) return;
    
    alumno.inasistencias = parseInt(inasistencias) || 0;
    contexto.fechaModificacion = new Date().toISOString();
    contextos[contextoId] = contexto;
    guardarContextos(contextos);
}

/**
 * Calcula el porcentaje de inasistencias de un alumno
 * @param {Object} alumno - Objeto alumno
 * @param {number} clasesEfectivas - Total de clases efectivas
 * @returns {number} Porcentaje de inasistencias
 */
function calcularPorcentajeAlumno(alumno, clasesEfectivas) {
    if (!clasesEfectivas || clasesEfectivas <= 0) return 0;
    return Math.round((alumno.inasistencias / clasesEfectivas) * 100);
}

// ========================================
// MIGRACIÓN DE DATOS ANTIGUOS
// ========================================

/**
 * Migra datos antiguos de datosInstitucionales a un contexto
 */
function migrarDatosAntiguos() {
    const datosAntiguos = localStorage.getItem(STORAGE_KEY_DATOS_ANTIGUOS);
    
    if (!datosAntiguos) {
        return false; // No hay datos para migrar
    }

    try {
        const datos = JSON.parse(datosAntiguos);
        const contextos = listarContextos();

        // Crear contexto por defecto
        const nuevoContexto = {
            id: 'contexto_default_' + Date.now(),
            nombre: 'Contexto por defecto',
            institucion: datos.institucion || '',
            logo: datos.logo || '',
            curso: datos.curso || '',
            division: datos.division || '',
            ciclo: datos.ciclo || '',
            periodo: datos.periodo || '',
            docente: datos.docente || '',
            observaciones: datos.observaciones || '',
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString()
        };

        contextos[nuevoContexto.id] = nuevoContexto;
        guardarContextos(contextos);
        
        // Establecer como activo
        seleccionarContexto(nuevoContexto.id);

        // Eliminar clave antigua
        localStorage.removeItem(STORAGE_KEY_DATOS_ANTIGUOS);

        console.log('Migración completada: datos antiguos convertidos a contexto');
        return true;
    } catch (error) {
        console.error('Error en migración:', error);
        return false;
    }
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Muestra un toast de notificación
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de toast (success, error, warning, info)
 */
function mostrarToast(mensaje, tipo = 'info') {
    // Eliminar toasts existentes
    const toastExistente = document.querySelector('.toast-contexto');
    if (toastExistente) {
        toastExistente.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-contexto toast-${tipo}`;
    toast.textContent = mensaje;
    
    // Estilos inline para el toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.3s ease',
        backgroundColor: tipo === 'success' ? '#28a745' : 
                        tipo === 'error' ? '#dc3545' : 
                        tipo === 'warning' ? '#ffc107' : '#667eea'
    });

    document.body.appendChild(toast);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Agregar animaciones CSS para toast
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Ejecutar migración al cargar
document.addEventListener('DOMContentLoaded', function() {
    migrarDatosAntiguos();
});

// Exportar funciones para uso global
window.SistemaContextos = {
    listarContextos,
    crearContexto,
    editarContexto,
    eliminarContexto,
    seleccionarContexto,
    obtenerContextoActivo,
    aplicarContextoAUI,
    migrarDatosAntiguos,
    agregarAlumnoAContexto,
    editarAlumnoEnContexto,
    eliminarAlumnoDeContexto,
    intercambiarOrdenAlumnos,
    moverAlumnoArriba,
    moverAlumnoAbajo,
    actualizarClasesEfectivas,
    actualizarInasistencias,
    calcularPorcentajeAlumno
};
