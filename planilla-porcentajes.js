/**
 * PLANILLA DE PORCENTAJES DE INASISTENCIA
 * Gestión de inasistencias y cálculo de porcentajes por alumno
 */

// ========================================
// VARIABLES GLOBALES
// ========================================
let alumnos = [];
let clasesTotales = 0;
let porcentajeMaximo = 25;
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

    // Configurar eventos
    configurarEventos();

    // Cargar datos guardados si existen
    cargarPlanillaGuardada();
});

// ========================================
// CONFIGURACIÓN DE EVENTOS
// ========================================
function configurarEventos() {
    // Botón inicializar planilla
    const btnInicializar = document.getElementById('btn-inicializar-planilla');
    if (btnInicializar) {
        btnInicializar.addEventListener('click', inicializarPlanilla);
    }

    // Botón agregar alumno
    const btnAgregar = document.getElementById('btn-agregar-alumno');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', agregarAlumno);
    }

    // Botón guardar planilla
    const btnGuardar = document.getElementById('btn-guardar-planilla');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarPlanilla);
    }

    // Botón imprimir planilla
    const btnImprimir = document.getElementById('btn-imprimir-planilla');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', abrirModalImpresion);
    }

    // Botón limpiar planilla
    const btnLimpiar = document.getElementById('btn-limpiar-planilla');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarPlanilla);
    }

    // Eventos del modal de impresión
    configurarModalImpresion();

    // Eventos del modal de contextos
    configurarEventosModalContextos();
}

// ========================================
// INICIALIZAR PLANILLA
// ========================================
function inicializarPlanilla() {
    const inputClases = document.getElementById('clases-totales');
    const inputPorcentajeMax = document.getElementById('porcentaje-maximo');

    const clases = parseInt(inputClases.value);
    const porcentajeMax = parseInt(inputPorcentajeMax.value) || 25;

    if (!clases || clases < 1) {
        alert('❌ Por favor ingrese un total de clases válido (mayor a 0)');
        return;
    }

    clasesTotales = clases;
    porcentajeMaximo = porcentajeMax;

    // Mostrar sección de alumnos
    document.getElementById('seccion-alumnos').style.display = 'block';
    document.getElementById('seccion-resumen').style.display = 'block';

    // Renderizar tabla
    renderizarTabla();
    actualizarResumen();

    mostrarToast('Planilla inicializada correctamente', 'success');
}

// ========================================
// GESTIÓN DE ALUMNOS
// ========================================
function agregarAlumno() {
    const apellidoInput = document.getElementById('nuevo-apellido');
    const nombreInput = document.getElementById('nuevo-nombre');

    const apellido = apellidoInput.value.trim();
    const nombre = nombreInput.value.trim();

    if (!apellido || !nombre) {
        alert('❌ Por favor complete apellido y nombre del alumno');
        return;
    }

    // Crear nuevo alumno
    const nuevoAlumno = {
        id: 'alumno_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        apellido: apellido,
        nombre: nombre,
        inasistencias: 0
    };

    alumnos.push(nuevoAlumno);

    // Limpiar inputs
    apellidoInput.value = '';
    nombreInput.value = '';
    apellidoInput.focus();

    // Renderizar tabla y actualizar resumen
    renderizarTabla();
    actualizarResumen();
}

function eliminarAlumno(id) {
    if (!confirm('¿Está seguro de eliminar este alumno?')) {
        return;
    }

    alumnos = alumnos.filter(a => a.id !== id);
    renderizarTabla();
    actualizarResumen();
}

function actualizarInasistencias(id, valor) {
    const alumno = alumnos.find(a => a.id === id);
    if (alumno) {
        const inasistencias = parseInt(valor) || 0;
        alumno.inasistencias = Math.max(0, Math.min(inasistencias, clasesTotales));
        renderizarTabla();
        actualizarResumen();
    }
}

// ========================================
// RENDERIZADO DE TABLA
// ========================================
function renderizarTabla() {
    const tbody = document.getElementById('tabla-alumnos-body');
    if (!tbody) return;

    if (alumnos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No hay alumnos registrados. Agregue el primero arriba.</td></tr>';
        return;
    }

    let html = '';
    alumnos.forEach((alumno, index) => {
        const porcentaje = calcularPorcentaje(alumno.inasistencias);
        const clasePorcentaje = obtenerClasePorcentaje(porcentaje);

        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(alumno.apellido)}</td>
                <td>${escapeHtml(alumno.nombre)}</td>
                <td>
                    <input type="number" 
                           min="0" 
                           max="${clasesTotales}" 
                           value="${alumno.inasistencias}" 
                           onchange="actualizarInasistencias('${alumno.id}', this.value)"
                           style="width: 80px; padding: 8px; border: 2px solid #ddd; border-radius: 6px;">
                </td>
                <td>
                    <div class="porcentaje-display ${clasePorcentaje}">
                        ${porcentaje.toFixed(2)}%
                    </div>
                </td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarAlumno('${alumno.id}')">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function calcularPorcentaje(inasistencias) {
    if (clasesTotales === 0) return 0;
    return (inasistencias / clasesTotales) * 100;
}

function obtenerClasePorcentaje(porcentaje) {
    if (porcentaje <= 15) return 'porcentaje-bajo';
    if (porcentaje <= 25) return 'porcentaje-medio';
    return 'porcentaje-alto';
}

// ========================================
// RESUMEN ESTADÍSTICO
// ========================================
function actualizarResumen() {
    const totalAlumnos = alumnos.length;
    const totalInasistencias = alumnos.reduce((sum, a) => sum + a.inasistencias, 0);
    const promedioInasistencias = totalAlumnos > 0 ? (totalInasistencias / totalAlumnos).toFixed(1) : 0;
    const alumnosRiesgo = alumnos.filter(a => calcularPorcentaje(a.inasistencias) > 25).length;
    const maximoInasistencias = Math.max(...alumnos.map(a => a.inasistencias), 0);

    document.getElementById('stat-total-alumnos').textContent = totalAlumnos;
    document.getElementById('stat-promedio-inasistencias').textContent = promedioInasistencias;
    document.getElementById('stat-alumnos-riesgo').textContent = alumnosRiesgo;
    document.getElementById('stat-maximo-inasistencias').textContent = maximoInasistencias;
}

// ========================================
// GUARDAR Y CARGAR PLANILLA
// ========================================
function guardarPlanilla() {
    if (clasesTotales === 0) {
        alert('❌ Primero debe inicializar la planilla con el total de clases');
        return;
    }

    const datos = {
        clasesTotales: clasesTotales,
        porcentajeMaximo: porcentajeMaximo,
        alumnos: alumnos,
        fechaGuardado: new Date().toISOString()
    };

    localStorage.setItem('planilla_porcentajes', JSON.stringify(datos));
    mostrarToast('Planilla guardada exitosamente', 'success');
}

function cargarPlanillaGuardada() {
    const datosGuardados = localStorage.getItem('planilla_porcentajes');
    
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            clasesTotales = datos.clasesTotales || 0;
            porcentajeMaximo = datos.porcentajeMaximo || 25;
            alumnos = datos.alumnos || [];

            // Actualizar inputs
            document.getElementById('clases-totales').value = clasesTotales;
            document.getElementById('porcentaje-maximo').value = porcentajeMaximo;

            // Mostrar secciones si hay datos
            if (alumnos.length > 0 || clasesTotales > 0) {
                document.getElementById('seccion-alumnos').style.display = 'block';
                document.getElementById('seccion-resumen').style.display = 'block';
                renderizarTabla();
                actualizarResumen();
            }
        } catch (error) {
            console.error('Error al cargar planilla guardada:', error);
        }
    }
}

function limpiarPlanilla() {
    if (!confirm('⚠️ ¿Está seguro de limpiar toda la planilla? Esta acción no se puede deshacer.')) {
        return;
    }

    alumnos = [];
    clasesTotales = 0;
    porcentajeMaximo = 25;

    document.getElementById('clases-totales').value = '';
    document.getElementById('porcentaje-maximo').value = '25';
    document.getElementById('seccion-alumnos').style.display = 'none';
    document.getElementById('seccion-resumen').style.display = 'none';

    localStorage.removeItem('planilla_porcentajes');
    mostrarToast('Planilla limpiada correctamente', 'info');
}

// ========================================
// MODAL DE IMPRESIÓN
// ========================================
function abrirModalImpresion() {
    if (alumnos.length === 0) {
        alert('❌ No hay alumnos para imprimir');
        return;
    }

    const modal = document.getElementById('modal-imprimir');
    if (modal) {
        modal.style.display = 'flex';
        cargarSelectorContextos();
    }
}

function cerrarModalImpresion() {
    const modal = document.getElementById('modal-imprimir');
    if (modal) {
        modal.style.display = 'none';
    }
}

function cargarSelectorContextos() {
    const selector = document.getElementById('selector-contexto-imprimir');
    if (!selector) return;

    const contextos = listarContextos();
    let html = '<option value="">-- Seleccionar --</option>';
    
    Object.values(contextos).forEach(contexto => {
        html += `<option value="${contexto.id}">${escapeHtml(contexto.nombre)}</option>`;
    });

    selector.innerHTML = html;

    // Evento cambio de contexto
    selector.addEventListener('change', function() {
        aplicarContextoAUI(this.value);
    });
}

function confirmarImpresion() {
    // Preparar datos para impresión
    const datosImpresion = {
        institucion: document.getElementById('institucionInput').value,
        curso: document.getElementById('cursoImprimir').value,
        division: document.getElementById('divisionImprimir').value,
        ciclo: document.getElementById('cicloImprimir').value,
        docente: document.getElementById('docenteImprimir').value,
        observaciones: document.getElementById('observacionesImprimir').value,
        clasesTotales: clasesTotales,
        alumnos: alumnos
    };

    // Guardar en localStorage para la ventana de impresión
    localStorage.setItem('datos_impresion_porcentajes', JSON.stringify(datosImpresion));

    // Abrir ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(generarHTMLImpresion(datosImpresion));
    ventanaImpresion.document.close();
    ventanaImpresion.print();

    cerrarModalImpresion();
}

function generarHTMLImpresion(datos) {
    const fechaActual = new Date().toLocaleDateString('es-AR');
    
    let filasAlumnos = '';
    datos.alumnos.forEach((alumno, index) => {
        const porcentaje = calcularPorcentaje(alumno.inasistencias);
        filasAlumnos += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(alumno.apellido)}</td>
                <td>${escapeHtml(alumno.nombre)}</td>
                <td style="text-align: center;">${alumno.inasistencias}</td>
                <td style="text-align: center;">${porcentaje.toFixed(2)}%</td>
            </tr>
        `;
    });

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Planilla de Porcentajes - Impresión</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                .header-info { text-align: right; }
                .info-curso { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                .observaciones { margin-top: 20px; padding: 15px; border: 1px solid #333; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>Planilla de Porcentajes de Inasistencia</h1>
                </div>
                <div class="header-info">
                    <p><strong>Institución:</strong> ${escapeHtml(datos.institucion)}</p>
                    <p><strong>Curso:</strong> ${escapeHtml(datos.curso)}${datos.division ? '/' + datos.division : ''}</p>
                    <p><strong>Ciclo:</strong> ${escapeHtml(datos.ciclo)}</p>
                    <p><strong>Docente:</strong> ${escapeHtml(datos.docente)}</p>
                </div>
            </div>

            <div class="info-curso">
                <p><strong>Total de Clases:</strong> ${datos.clasesTotales}</p>
                <p><strong>Fecha de Impresión:</strong> ${fechaActual}</p>
                <p><strong>Total de Alumnos:</strong> ${datos.alumnos.length}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Apellido</th>
                        <th>Nombre</th>
                        <th>Inasistencias</th>
                        <th>Porcentaje</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasAlumnos}
                </tbody>
            </table>

            ${datos.observaciones ? `
            <div class="observaciones">
                <h3>Observaciones:</h3>
                <p>${escapeHtml(datos.observaciones)}</p>
            </div>
            ` : ''}

            <div class="footer">
                <p>Desarrollado por Julián Alejandro Gomez (JAG-91) &copy; ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `;
}

function configurarModalImpresion() {
    const btnCerrar = document.getElementById('btn-cerrar-modal-imprimir');
    const btnConfirmar = document.getElementById('btn-confirmar-imprimir');
    const btnGuardarComoContexto = document.getElementById('btn-guardar-como-contexto');
    const modal = document.getElementById('modal-imprimir');

    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModalImpresion);
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmarImpresion);
    }

    if (btnGuardarComoContexto) {
        btnGuardarComoContexto.addEventListener('click', guardarComoContexto);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalImpresion();
            }
        });
    }
}

function guardarComoContexto() {
    const nombreContexto = prompt('Ingrese un nombre para el contexto:');
    if (!nombreContexto) return;

    const datos = {
        nombre: nombreContexto,
        institucion: document.getElementById('institucionInput').value,
        curso: document.getElementById('cursoImprimir').value,
        division: document.getElementById('divisionImprimir').value,
        ciclo: document.getElementById('cicloImprimir').value,
        docente: document.getElementById('docenteImprimir').value,
        observaciones: document.getElementById('observacionesImprimir').value
    };

    crearContexto(datos);
    cerrarModalImpresion();
}

// ========================================
// MODAL DE CONTEXTOS
// ========================================
function configurarEventosModalContextos() {
    const btnGestionar = document.getElementById('btn-gestionar-contextos-porcentajes');
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

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalContextos();
            }
        });
    }
}

function abrirModalContextos() {
    const modal = document.getElementById('modal-contextos');
    if (modal) {
        modal.style.display = 'flex';
        renderizarListaContextos();
        ocultarFormularioContexto();
    }
}

function cerrarModalContextos() {
    const modal = document.getElementById('modal-contextos');
    if (modal) {
        modal.style.display = 'none';
    }
}

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

function ocultarFormularioContexto() {
    const contenedorForm = document.getElementById('formulario-contexto-container');
    const listaContainer = document.querySelector('.contextos-lista-container');
    
    if (contenedorForm) contenedorForm.style.display = 'none';
    if (listaContainer) listaContainer.style.display = 'block';
    
    contextoEditandoId = null;
}

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
}

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

function usarContexto(id) {
    seleccionarContexto(id);
    cerrarModalContextos();
}

function editarContextoDesdeLista(id) {
    const contextos = listarContextos();
    const contexto = contextos[id];
    if (contexto) {
        mostrarFormularioContexto(contexto);
    }
}

function eliminarContextoDesdeLista(id) {
    const eliminado = eliminarContexto(id);
    if (eliminado) {
        renderizarListaContextos();
    }
}

// ========================================
// UTILIDADES
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarToast(mensaje, tipo = 'info') {
    const toastExistente = document.querySelector('.toast-contexto');
    if (toastExistente) {
        toastExistente.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-contexto toast-${tipo}`;
    toast.textContent = mensaje;
    
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

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Exportar funciones globales
window.actualizarInasistencias = actualizarInasistencias;
window.eliminarAlumno = eliminarAlumno;
window.usarContexto = usarContexto;
window.editarContextoDesdeLista = editarContextoDesdeLista;
window.eliminarContextoDesdeLista = eliminarContextoDesdeLista;
