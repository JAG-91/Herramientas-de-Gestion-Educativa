/**
 * SCRIPT PRINCIPAL - HOME
 * Gestión de la página principal y modal de contextos
 */

// ========================================
// VARIABLES GLOBALES
// ========================================
let contextoEditandoId = null;
let alumnoEditandoId = null;
let contextoAlumnoActualId = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año en footer
    const anioElement = document.getElementById('anio-actual');
    if (anioElement) {
        anioElement.textContent = new Date().getFullYear();
    }

    // Inicializar UI de contexto activo
    actualizarUIContextoActivo();

    // Configurar eventos del modal de contextos
    configurarEventosModalContextos();
    
    // Configurar eventos del modal de alumnos
    configurarEventosModalAlumno();
});

// ========================================
// ACTUALIZACIÓN DE UI
// ========================================

/**
 * Actualiza la UI mostrando el contexto activo
 */
function actualizarUIContextoActivo() {
    const contexto = obtenerContextoActivo();
    const infoBox = document.getElementById('info-contexto-activo');
    const noContextosMsg = document.getElementById('no-contextos-msg');

    if (!infoBox || !noContextosMsg) return;

    if (contexto) {
        infoBox.style.display = 'block';
        noContextosMsg.style.display = 'none';

        document.getElementById('info-nombre-contexto').textContent = contexto.nombre;
        document.getElementById('info-institucion').textContent = contexto.institucion;
        document.getElementById('info-curso').textContent = contexto.curso;
        document.getElementById('info-division').textContent = contexto.division || '-';
        document.getElementById('info-ciclo').textContent = contexto.ciclo || '-';
        document.getElementById('info-docente').textContent = contexto.docente;
    } else {
        infoBox.style.display = 'none';
        noContextosMsg.style.display = 'block';
    }
}

// ========================================
// MODAL DE CONTEXTOS
// ========================================

/**
 * Configura los eventos del modal de gestión de contextos
 */
function configurarEventosModalContextos() {
    const btnGestionar = document.getElementById('btn-gestionar-contextos');
    const btnCerrar = document.getElementById('btn-cerrar-modal-contextos');
    const btnCrear = document.getElementById('btn-crear-contexto');
    const btnCancelarForm = document.getElementById('btn-cancelar-form-contexto');
    const formContexto = document.getElementById('form-contexto');
    const modal = document.getElementById('modal-contextos');

    if (btnGestionar) {
        btnGestionar.addEventListener('click', abrirModalContextos);
    }

    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModalContextos);
    }

    if (btnCrear) {
        btnCrear.addEventListener('click', mostrarFormularioContexto);
    }

    if (btnCancelarForm) {
        btnCancelarForm.addEventListener('click', ocultarFormularioContexto);
    }

    if (formContexto) {
        formContexto.addEventListener('submit', manejarSubmitContexto);
    }

    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalContextos();
            }
        });
    }
}

/**
 * Abre el modal de gestión de contextos
 */
function abrirModalContextos() {
    const modal = document.getElementById('modal-contextos');
    if (modal) {
        modal.style.display = 'flex';
        renderizarListaContextos();
        ocultarFormularioContexto();
    }
}

/**
 * Cierra el modal de gestión de contextos
 */
function cerrarModalContextos() {
    const modal = document.getElementById('modal-contextos');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Muestra el formulario de creación/edición de contexto
 */
function mostrarFormularioContexto(contextoParaEditar = null) {
    const contenedorForm = document.getElementById('formulario-contexto-container');
    const listaContainer = document.querySelector('.contextos-lista-container');
    const tituloForm = document.getElementById('form-titulo-contexto');

    if (!contenedorForm) return;

    contenedorForm.style.display = 'block';
    if (listaContainer) listaContainer.style.display = 'none';

    if (contextoParaEditar) {
        contextoEditandoId = contextoParaEditar.id;
        contextoAlumnoActualId = contextoParaEditar.id;
        tituloForm.textContent = 'Editar Contexto';
        
        // Rellenar formulario con datos del contexto
        document.getElementById('contexto-id-editar').value = contextoParaEditar.id;
        document.getElementById('contexto-nombre').value = contextoParaEditar.nombre;
        document.getElementById('contexto-institucion').value = contextoParaEditar.institucion;
        document.getElementById('contexto-logo-url').value = contextoParaEditar.logo || '';
        document.getElementById('contexto-curso').value = contextoParaEditar.curso;
        document.getElementById('contexto-division').value = contextoParaEditar.division || '';
        document.getElementById('contexto-ciclo').value = contextoParaEditar.ciclo || '';
        document.getElementById('contexto-periodo').value = contextoParaEditar.periodo || '';
        document.getElementById('contexto-docente').value = contextoParaEditar.docente;
        document.getElementById('contexto-observaciones').value = contextoParaEditar.observaciones || '';
        
        // Renderizar lista de alumnos
        renderizarListaAlumnosContexto(contextoParaEditar.id);
    } else {
        contextoEditandoId = null;
        contextoAlumnoActualId = null;
        tituloForm.textContent = 'Crear Nuevo Contexto';
        document.getElementById('form-contexto').reset();
        document.getElementById('contexto-id-editar').value = '';
        document.getElementById('lista-alumnos-contexto').innerHTML = '<p class="info-help">Los alumnos se agregarán después de crear el contexto.</p>';
    }
}

/**
 * Oculta el formulario y muestra la lista de contextos
 */
function ocultarFormularioContexto() {
    const contenedorForm = document.getElementById('formulario-contexto-container');
    const listaContainer = document.querySelector('.contextos-lista-container');
    
    if (contenedorForm) contenedorForm.style.display = 'none';
    if (listaContainer) listaContainer.style.display = 'block';
    
    contextoEditandoId = null;
    contextoAlumnoActualId = null;
}

/**
 * Maneja el submit del formulario de contexto
 */
function manejarSubmitContexto(e) {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('contexto-nombre').value,
        institucion: document.getElementById('contexto-institucion').value,
        logo: document.getElementById('contexto-logo-url').value,
        curso: document.getElementById('contexto-curso').value,
        division: document.getElementById('contexto-division').value,
        ciclo: document.getElementById('contexto-ciclo').value,
        periodo: document.getElementById('contexto-periodo').value,
        docente: document.getElementById('contexto-docente').value,
        observaciones: document.getElementById('contexto-observaciones').value
    };

    let resultado;
    if (contextoEditandoId) {
        // Al editar, preservamos los alumnos existentes
        const contextos = listarContextos();
        const contextoExistente = contextos[contextoEditandoId];
        if (contextoExistente) {
            datos.alumnos = contextoExistente.alumnos;
        }
        resultado = editarContexto(contextoEditandoId, datos);
    } else {
        resultado = crearContexto(datos);
        // Si se creó exitosamente, establecer como contexto actual para alumnos
        if (resultado) {
            contextoAlumnoActualId = resultado.id;
            document.getElementById('contexto-id-editar').value = resultado.id;
            document.getElementById('lista-alumnos-contexto').innerHTML = '<p class="info-help">Agrega alumnos al contexto.</p>';
            return; // No ocultar el formulario, permitir agregar alumnos
        }
    }

    if (resultado) {
        ocultarFormularioContexto();
        renderizarListaContextos();
        actualizarUIContextoActivo();
    }
}

/**
 * Renderiza la lista de contextos en el modal
 */
function renderizarListaContextos() {
    const listaContainer = document.getElementById('lista-contextos');
    if (!listaContainer) return;

    const contextos = listarContextos();
    const contextoActivoId = localStorage.getItem('asistencia_contexto_activo');

    if (Object.keys(contextos).length === 0) {
        listaContainer.innerHTML = '<p class="no-contextos">No hay contextos guardados.</p>';
        return;
    }

    let html = '';
    Object.values(contextos).forEach(contexto => {
        const esActivo = contexto.id === contextoActivoId;
        html += `
            <div class="contexto-item ${esActivo ? 'activo' : ''}" data-id="${contexto.id}">
                <div class="contexto-info">
                    <div class="contexto-nombre">${escapeHtml(contexto.nombre)}</div>
                    <div class="contexto-detalle">${escapeHtml(contexto.institucion)} - ${escapeHtml(contexto.curso)}${contexto.division ? '/' + contexto.division : ''}</div>
                </div>
                <div class="contexto-acciones">
                    ${!esActivo ? `<button class="btn btn-small btn-usar" onclick="usarContexto('${contexto.id}')">Usar</button>` : '<span class="badge-activo">Activo</span>'}
                    <button class="btn btn-small btn-secondary" onclick="editarContextoDesdeLista('${contexto.id}')">Editar</button>
                    <button class="btn btn-small btn-danger" onclick="eliminarContextoDesdeLista('${contexto.id}')">Eliminar</button>
                </div>
            </div>
        `;
    });

    listaContainer.innerHTML = html;
}

/**
 * Usa un contexto desde la lista
 */
function usarContexto(id) {
    seleccionarContexto(id);
    cerrarModalContextos();
    actualizarUIContextoActivo();
}

/**
 * Edita un contexto desde la lista
 */
function editarContextoDesdeLista(id) {
    const contextos = listarContextos();
    const contexto = contextos[id];
    if (contexto) {
        mostrarFormularioContexto(contexto);
    }
}

/**
 * Elimina un contexto desde la lista
 */
function eliminarContextoDesdeLista(id) {
    const eliminado = eliminarContexto(id);
    if (eliminado) {
        renderizarListaContextos();
        actualizarUIContextoActivo();
    }
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// GESTIÓN DE ALUMNOS EN EL CONTEXTO
// ========================================

/**
 * Renderiza la lista de alumnos en el formulario de contexto
 */
function renderizarListaAlumnosContexto(contextoId) {
    const container = document.getElementById('lista-alumnos-contexto');
    if (!container) return;
    
    const contextos = listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto || !contexto.alumnos || contexto.alumnos.length === 0) {
        container.innerHTML = '<p class="info-help">No hay alumnos en este contexto.</p>';
        return;
    }
    
    // Ordenar alumnos por número de orden
    const alumnosOrdenados = [...contexto.alumnos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '<div class="tabla-alumnos-contexto">';
    html += '<div class="alumno-header"><span>N°</span><span>Apellido</span><span>Nombre</span><span>Acciones</span></div>';
    
    alumnosOrdenados.forEach(alumno => {
        html += `
            <div class="alumno-row" data-id="${alumno.id}">
                <span class="alumno-orden">${alumno.orden}</span>
                <span class="alumno-apellido">${escapeHtml(alumno.apellido)}</span>
                <span class="alumno-nombre">${escapeHtml(alumno.nombre)}</span>
                <div class="alumno-acciones">
                    <button type="button" class="btn-icon btn-subir" onclick="moverAlumnoArribaUI('${contextoId}', '${alumno.id}')" title="Subir">⬆️</button>
                    <button type="button" class="btn-icon btn-bajar" onclick="moverAlumnoAbajoUI('${contextoId}', '${alumno.id}')" title="Bajar">⬇️</button>
                    <button type="button" class="btn-icon btn-editar-alumno" onclick="editarAlumnoUI('${alumno.id}')" title="Editar">✏️</button>
                    <button type="button" class="btn-icon btn-eliminar-alumno" onclick="eliminarAlumnoUI('${contextoId}', '${alumno.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Mueve un alumno hacia arriba en la UI
 */
function moverAlumnoArribaUI(contextoId, alumnoId) {
    SistemaContextos.moverAlumnoArriba(contextoId, alumnoId);
    renderizarListaAlumnosContexto(contextoId);
}

/**
 * Mueve un alumno hacia abajo en la UI
 */
function moverAlumnoAbajoUI(contextoId, alumnoId) {
    SistemaContextos.moverAlumnoAbajo(contextoId, alumnoId);
    renderizarListaAlumnosContexto(contextoId);
}

/**
 * Edita un alumno en la UI
 */
function editarAlumnoUI(alumnoId) {
    const contextos = listarContextos();
    const contexto = contextos[contextoAlumnoActualId];
    
    if (!contexto) return;
    
    const alumno = contexto.alumnos.find(a => a.id === alumnoId);
    if (!alumno) return;
    
    mostrarModalAlumno(alumno);
}

/**
 * Elimina un alumno en la UI
 */
function eliminarAlumnoUI(contextoId, alumnoId) {
    if (confirm('¿Está seguro de eliminar este alumno?')) {
        SistemaContextos.eliminarAlumnoDeContexto(contextoId, alumnoId);
        renderizarListaAlumnosContexto(contextoId);
    }
}

// ========================================
// MODAL DE ALUMNOS
// ========================================

/**
 * Configura los eventos del modal de alumnos
 */
function configurarEventosModalAlumno() {
    const btnAgregarAlumno = document.getElementById('btn-agregar-alumno');
    const btnCerrarModalAlumno = document.getElementById('btn-cerrar-modal-alumno');
    const btnCancelarAlumno = document.getElementById('btn-cancelar-alumno');
    const formAlumno = document.getElementById('form-alumno');
    const modalAlumno = document.getElementById('modal-alumno');
    
    if (btnAgregarAlumno) {
        btnAgregarAlumno.addEventListener('click', function() {
            mostrarModalAlumno(null);
        });
    }
    
    if (btnCerrarModalAlumno) {
        btnCerrarModalAlumno.addEventListener('click', cerrarModalAlumno);
    }
    
    if (btnCancelarAlumno) {
        btnCancelarAlumno.addEventListener('click', cerrarModalAlumno);
    }
    
    if (formAlumno) {
        formAlumno.addEventListener('submit', manejarSubmitAlumno);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalAlumno) {
        modalAlumno.addEventListener('click', function(e) {
            if (e.target === modalAlumno) {
                cerrarModalAlumno();
            }
        });
    }
}

/**
 * Muestra el modal de alumno para agregar o editar
 */
function mostrarModalAlumno(alumnoParaEditar = null) {
    const modal = document.getElementById('modal-alumno');
    const tituloModal = document.getElementById('titulo-modal-alumno');
    
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    if (alumnoParaEditar) {
        alumnoEditandoId = alumnoParaEditar.id;
        tituloModal.textContent = 'Editar Alumno';
        
        document.getElementById('alumno-id-editar').value = alumnoParaEditar.id;
        document.getElementById('alumno-orden').value = alumnoParaEditar.orden || '';
        document.getElementById('alumno-nombre').value = alumnoParaEditar.nombre;
        document.getElementById('alumno-apellido').value = alumnoParaEditar.apellido;
    } else {
        alumnoEditandoId = null;
        tituloModal.textContent = 'Agregar Alumno';
        
        document.getElementById('form-alumno').reset();
        document.getElementById('alumno-id-editar').value = '';
        
        // Auto-completar orden
        const contextos = listarContextos();
        const contexto = contextos[contextoAlumnoActualId];
        if (contexto && contexto.alumnos && contexto.alumnos.length > 0) {
            const maxOrden = Math.max(...contexto.alumnos.map(a => a.orden || 0));
            document.getElementById('alumno-orden').value = maxOrden + 1;
        } else {
            document.getElementById('alumno-orden').value = 1;
        }
    }
}

/**
 * Cierra el modal de alumno
 */
function cerrarModalAlumno() {
    const modal = document.getElementById('modal-alumno');
    if (modal) {
        modal.style.display = 'none';
    }
    alumnoEditandoId = null;
}

/**
 * Maneja el submit del formulario de alumno
 */
function manejarSubmitAlumno(e) {
    e.preventDefault();
    
    if (!contextoAlumnoActualId) {
        mostrarToast('Error: No hay un contexto seleccionado para agregar alumnos', 'error');
        return;
    }
    
    const orden = parseInt(document.getElementById('alumno-orden').value) || 0;
    const nombre = document.getElementById('alumno-nombre').value.trim();
    const apellido = document.getElementById('alumno-apellido').value.trim();
    
    if (alumnoEditandoId) {
        // Editar alumno existente
        SistemaContextos.editarAlumnoEnContexto(contextoAlumnoActualId, alumnoEditandoId, { nombre, apellido, orden });
    } else {
        // Agregar nuevo alumno
        SistemaContextos.agregarAlumnoAContexto(contextoAlumnoActualId, nombre, apellido);
    }
    
    cerrarModalAlumno();
    renderizarListaAlumnosContexto(contextoAlumnoActualId);
}

// Exportar funciones globales
window.actualizarUIContextoActivo = actualizarUIContextoActivo;
window.usarContexto = usarContexto;
window.editarContextoDesdeLista = editarContextoDesdeLista;
window.eliminarContextoDesdeLista = eliminarContextoDesdeLista;
window.renderizarListaAlumnosContexto = renderizarListaAlumnosContexto;
window.moverAlumnoArribaUI = moverAlumnoArribaUI;
window.moverAlumnoAbajoUI = moverAlumnoAbajoUI;
window.editarAlumnoUI = editarAlumnoUI;
window.eliminarAlumnoUI = eliminarAlumnoUI;
