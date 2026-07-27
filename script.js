/**
 * SCRIPT PRINCIPAL - HOME
 * Gestión de la página principal y modal de contextos
 */

// ========================================
// VARIABLES GLOBALES
// ========================================
let contextoEditandoId = null;

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
    } else {
        contextoEditandoId = null;
        tituloForm.textContent = 'Crear Nuevo Contexto';
        document.getElementById('form-contexto').reset();
        document.getElementById('contexto-id-editar').value = '';
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

    if (contextoEditandoId) {
        editarContexto(contextoEditandoId, datos);
    } else {
        crearContexto(datos);
    }

    ocultarFormularioContexto();
    renderizarListaContextos();
    actualizarUIContextoActivo();
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

// Exportar funciones globales
window.actualizarUIContextoActivo = actualizarUIContextoActivo;
window.usarContexto = usarContexto;
window.editarContextoDesdeLista = editarContextoDesdeLista;
window.eliminarContextoDesdeLista = eliminarContextoDesdeLista;
