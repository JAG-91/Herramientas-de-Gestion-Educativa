// PLANILLA DE PORCENTAJES - planilla.js
// Sistema unificado basado en Contextos Compartidos

let contextoActual = null, alumnosActuales = [];

document.addEventListener('DOMContentLoaded', function() {
    const anioEl = document.getElementById('anio-actual');
    if (anioEl) anioEl.textContent = new Date().getFullYear();
    
    cargarContextosEnSelector();
    configurarEventos();
    configurarModalContextos();
    configurarModalAlumno();
    
    const contextoActivoId = localStorage.getItem('asistencia_contexto_activo');
    if (contextoActivoId) {
        document.getElementById('selector-contexto-planilla').value = contextoActivoId;
        manejarCambioContexto(contextoActivoId);
    }
});

function cargarContextosEnSelector() {
    const selector = document.getElementById('selector-contexto-planilla');
    if (!selector) return;
    
    const contextos = window.SistemaContextos.listarContextos();
    selector.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    Object.values(contextos).forEach(ctx => {
        const opt = document.createElement('option');
        opt.value = ctx.id;
        opt.textContent = ctx.nombre;
        selector.appendChild(opt);
    });
    
    selector.addEventListener('change', function() {
        manejarCambioContexto(this.value);
    });
}

function manejarCambioContexto(contextoId) {
    if (!contextoId) {
        ocultarSeccionTabla();
        contextoActual = null;
        alumnosActuales = [];
        return;
    }
    
    const contextos = window.SistemaContextos.listarContextos();
    contextoActual = contextos[contextoId];
    
    if (contextoActual) {
        alumnosActuales = contextoActual.alumnos || [];
        
        const inputClases = document.getElementById('clases-efectivas');
        if (inputClases) {
            inputClases.value = contextoActual.clasesEfectivas || '';
        }
        
        mostrarSeccionTabla();
        cargarAlumnosEnTabla();
        actualizarEstadisticas();
    }
}

function configurarEventos() {
    const btnGuardar = document.getElementById('btn-guardar-planilla');
    const btnImprimir = document.getElementById('btn-imprimir-planilla');
    const inputClases = document.getElementById('clases-efectivas');
    
    if (btnGuardar) btnGuardar.addEventListener('click', guardarCambios);
    if (btnImprimir) btnImprimir.addEventListener('click', prepararImpresion);
    if (inputClases) {
        inputClases.addEventListener('change', function() {
            if (contextoActual) {
                window.SistemaContextos.actualizarClasesEfectivas(contextoActual.id, parseInt(this.value) || 0);
                cargarAlumnosEnTabla();
                actualizarEstadisticas();
            }
        });
    }
    
    configurarModalImpresion();
}

function cargarAlumnosEnTabla() {
    const tbody = document.getElementById('tabla-planilla-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const clasesEfectivas = contextoActual ? contextoActual.clasesEfectivas : 0;
    
    const alumnosOrdenados = [...alumnosActuales].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    alumnosOrdenados.forEach((alumno, indice) => {
        const tr = document.createElement('tr');
        tr.dataset.alumnoId = alumno.id;
        
        const porcentaje = calcularPorcentajeAlumno(alumno, clasesEfectivas);
        
        let html = '<td>' + (indice + 1) + '</td>';
        html += '<td>' + escapeHtml(alumno.apellido) + '</td>';
        html += '<td>' + escapeHtml(alumno.nombre) + '</td>';
        html += '<td><input type="number" class="input-inasistencias" data-alumno-id="' + alumno.id + '" value="' + (alumno.inasistencias || 0) + '" min="0" max="365" style="width: 70px;"></td>';
        html += '<td class="celda-porcentaje">' + porcentaje + '%</td>';
        html += '<td class="acciones-alumno">';
        html += '<button class="btn btn-small btn-secondary btn-subir-alumno" data-alumno-id="' + alumno.id + '" title="Subir">⬆</button>';
        html += '<button class="btn btn-small btn-secondary btn-bajar-alumno" data-alumno-id="' + alumno.id + '" title="Bajar">⬇</button>';
        html += '<button class="btn btn-small btn-danger btn-eliminar-alumno" data-alumno-id="' + alumno.id + '" title="Eliminar">🗑</button>';
        html += '</td>';
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
    
    tbody.querySelectorAll('.input-inasistencias').forEach(input => {
        input.addEventListener('change', function() {
            const alumnoId = this.dataset.alumnoId;
            const valor = parseInt(this.value) || 0;
            actualizarInasistenciasEnTabla(alumnoId, valor);
        });
    });
    
    tbody.querySelectorAll('.btn-subir-alumno').forEach(btn => {
        btn.addEventListener('click', function() {
            if (contextoActual) {
                moverAlumnoArriba(contextoActual.id, this.dataset.alumnoId);
                cargarAlumnosEnTabla();
                actualizarEstadisticas();
            }
        });
    });
    
    tbody.querySelectorAll('.btn-bajar-alumno').forEach(btn => {
        btn.addEventListener('click', function() {
            if (contextoActual) {
                moverAlumnoAbajo(contextoActual.id, this.dataset.alumnoId);
                cargarAlumnosEnTabla();
                actualizarEstadisticas();
            }
        });
    });
    
    tbody.querySelectorAll('.btn-eliminar-alumno').forEach(btn => {
        btn.addEventListener('click', function() {
            if (contextoActual && confirm('¿Eliminar este alumno?')) {
                window.SistemaContextos.eliminarAlumnoDeContexto(contextoActual.id, this.dataset.alumnoId);
                const ctx = window.SistemaContextos.obtenerContexto(contextoActual.id);
                alumnosActuales = ctx ? ctx.alumnos : [];
                cargarAlumnosEnTabla();
                actualizarEstadisticas();
            }
        });
    });
}

function actualizarInasistenciasEnTabla(alumnoId, valor) {
    if (!contextoActual) return;
    
    window.SistemaContextos.actualizarInasistencias(contextoActual.id, alumnoId, valor);
    
    const tr = document.querySelector('tr[data-alumno-id="' + alumnoId + '"]');
    if (tr) {
        const porcentaje = calcularPorcentajeAlumno(
            { inasistencias: valor },
            contextoActual.clasesEfectivas
        );
        const celdaPorcentaje = tr.querySelector('.celda-porcentaje');
        if (celdaPorcentaje) {
            celdaPorcentaje.textContent = porcentaje + '%';
        }
    }
    
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    if (!contextoActual) return;
    
    const totalAlumnos = alumnosActuales.length;
    const clasesEfectivas = contextoActual.clasesEfectivas || 0;
    
    let totalInasistencias = 0;
    let mayorPorcentaje = 0;
    let menorPorcentaje = 100;
    
    alumnosActuales.forEach(alumno => {
        totalInasistencias += (alumno.inasistencias || 0);
        const porcentaje = calcularPorcentajeAlumno(alumno, clasesEfectivas);
        if (porcentaje > mayorPorcentaje) mayorPorcentaje = porcentaje;
        if (porcentaje < menorPorcentaje) menorPorcentaje = porcentaje;
    });
    
    const promedioInasistencias = totalAlumnos > 0 ? Math.round(totalInasistencias / totalAlumnos * 10) / 10 : 0;
    if (totalAlumnos === 0) menorPorcentaje = 0;
    
    document.getElementById('stat-total-alumnos').textContent = totalAlumnos;
    document.getElementById('stat-promedio-inasistencias').textContent = promedioInasistencias;
    document.getElementById('stat-mayor-porcentaje').textContent = mayorPorcentaje + '%';
    document.getElementById('stat-menor-porcentaje').textContent = menorPorcentaje + '%';
}

function guardarCambios() {
    if (!contextoActual) {
        mostrarToast('Seleccione un contexto', 'error');
        return;
    }
    mostrarToast('Cambios guardados', 'success');
}

function prepararImpresion() {
    if (!contextoActual || alumnosActuales.length === 0) {
        mostrarToast('Seleccione un contexto con alumnos', 'error');
        return;
    }
    
    const modal = document.getElementById('modal-imprimir');
    if (!modal) return;
    
    cargarContextosEnSelectorImpresion();
    aplicarContextoAUIImpresion(contextoActual.id);
    
    modal.style.display = 'flex';
}

function cargarContextosEnSelectorImpresion() {
    const selector = document.getElementById('selector-contexto-imprimir-planilla');
    if (!selector) return;
    
    const contextos = window.SistemaContextos.listarContextos();
    selector.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    Object.values(contextos).forEach(ctx => {
        const opt = document.createElement('option');
        opt.value = ctx.id;
        opt.textContent = ctx.nombre;
        selector.appendChild(opt);
    });
    
    selector.addEventListener('change', function() {
        if (this.value) {
            aplicarContextoAUIImpresion(this.value);
        }
    });
}

function aplicarContextoAUIImpresion(contextoId) {
    const contextos = window.SistemaContextos.listarContextos();
    const contexto = contextos[contextoId];
    
    if (!contexto) return;
    
    const campos = {
        'institucionInputPlanilla': contexto.institucion,
        'cursoImprimirPlanilla': contexto.curso,
        'divisionImprimirPlanilla': contexto.division,
        'cicloImprimirPlanilla': contexto.ciclo,
        'docenteImprimirPlanilla': contexto.docente,
        'observacionesImprimirPlanilla': contexto.observaciones
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) el.value = valor || '';
    });
}

function configurarModalImpresion() {
    const btnCerrar = document.getElementById('btn-cerrar-modal-imprimir');
    const btnConfirmar = document.getElementById('btn-confirmar-imprimir-planilla');
    const modal = document.getElementById('modal-imprimir');
    
    if (btnCerrar) btnCerrar.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    if (btnConfirmar) btnConfirmar.addEventListener('click', imprimirPlanilla);
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function imprimirPlanilla() {
    const prev = document.getElementById('impresionContenidoPlanilla');
    if (prev) prev.remove();
    
    const inst = document.getElementById('institucionInputPlanilla').value;
    const cur = document.getElementById('cursoImprimirPlanilla').value;
    const div = document.getElementById('divisionImprimirPlanilla').value;
    const ciclo = document.getElementById('cicloImprimirPlanilla').value;
    const doce = document.getElementById('docenteImprimirPlanilla').value;
    const obs = document.getElementById('observacionesImprimirPlanilla').value;
    
    const contenedor = document.createElement('div');
    contenedor.id = 'impresionContenidoPlanilla';
    contenedor.className = 'impresion-contenedor';
    
    const clasesEfectivas = contextoActual ? contextoActual.clasesEfectivas : 0;
    
    let html = '<div class="impresion-encabezado">';
    html += inst ? '<h1>' + escapeHtml(inst) + '</h1>' : '';
    html += '<div class="impresion-info">';
    html += cur ? '<p><strong>Curso:</strong> ' + escapeHtml(cur) + (div ? ' - ' + escapeHtml(div) : '') + '</p>' : '';
    html += ciclo ? '<p><strong>Ciclo:</strong> ' + escapeHtml(ciclo) + '</p>' : '';
    html += doce ? '<p><strong>Docente:</strong> ' + escapeHtml(doce) + '</p>' : '';
    html += '</div></div>';
    
    html += '<h2>Planilla de Porcentaje de Inasistencias</h2>';
    html += '<p class="impresion-fecha"><strong>Clases Efectivas:</strong> ' + clasesEfectivas + ' | <strong>Total Alumnos:</strong> ' + alumnosActuales.length + '</p>';
    
    html += '<table class="print-table"><thead><tr><th>#</th><th>Apellido</th><th>Nombre</th><th>Inasistencias</th><th>%</th></tr></thead><tbody>';
    
    const alumnosOrdenados = [...alumnosActuales].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    alumnosOrdenados.forEach((alumno, i) => {
        const porcentaje = calcularPorcentajeAlumno(alumno, clasesEfectivas);
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + escapeHtml(alumno.apellido) + '</td>';
        html += '<td>' + escapeHtml(alumno.nombre) + '</td>';
        html += '<td>' + (alumno.inasistencias || 0) + '</td>';
        html += '<td>' + porcentaje + '%</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    if (obs) {
        html += '<div class="print-observaciones"><h3>Observaciones</h3><p>' + escapeHtml(obs) + '</p></div>';
    }
    
    html += '<div class="print-footer"><p>_____________________________</p><p>Firma del Docente</p></div>';
    
    contenedor.innerHTML = html;
    document.body.appendChild(contenedor);
    
    window.print();
    
    setTimeout(() => {
        contenedor.remove();
    }, 1000);
}

function configurarModalContextos() {
    const btnGestionar = document.getElementById('btn-gestionar-contextos-planilla');
    const btnCerrar = document.getElementById('btn-cerrar-modal-contextos');
    const btnCrear = document.getElementById('btn-crear-contexto');
    const btnCancelar = document.getElementById('btn-cancelar-form-contexto');
    const form = document.getElementById('form-contexto');
    const modal = document.getElementById('modal-contextos');
    const btnAgregarAlumno = document.getElementById('btn-agregar-alumno');
    
    if (btnGestionar) btnGestionar.addEventListener('click', abrirModalContextos);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalContextos);
    if (btnCrear) btnCrear.addEventListener('click', () => mostrarFormularioContexto(null));
    if (btnCancelar) btnCancelar.addEventListener('click', ocultarFormularioContexto);
    if (form) form.addEventListener('submit', manejarSubmitContexto);
    if (btnAgregarAlumno) btnAgregarAlumno.addEventListener('click', () => mostrarModalAlumno(null));
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) cerrarModalContextos();
        });
    }
}

let contextoEditandoId = null;
let alumnosTemporales = [];

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
    if (modal) modal.style.display = 'none';
}

function mostrarFormularioContexto(contextoParaEditar) {
    const contenedorForm = document.getElementById('formulario-contexto-container');
    const listaContainer = document.querySelector('.contextos-lista-container');
    const tituloForm = document.getElementById('form-titulo-contexto');
    
    if (!contenedorForm) return;
    
    contenedorForm.style.display = 'block';
    if (listaContainer) listaContainer.style.display = 'none';
    
    if (contextoParaEditar) {
        contextoEditandoId = contextoParaEditar.id;
        alumnosTemporales = JSON.parse(JSON.stringify(contextoParaEditar.alumnos || []));
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
        document.getElementById('contexto-clases-efectivas').value = contextoParaEditar.clasesEfectivas || '';
        document.getElementById('contexto-observaciones').value = contextoParaEditar.observaciones || '';
        
        renderizarListaAlumnosTemporales();
    } else {
        contextoEditandoId = null;
        alumnosTemporales = [];
        tituloForm.textContent = 'Crear Nuevo Contexto';
        document.getElementById('form-contexto').reset();
        document.getElementById('contexto-id-editar').value = '';
        document.getElementById('lista-alumnos-contexto').innerHTML = '';
    }
}

function ocultarFormularioContexto() {
    const contenedorForm = document.getElementById('formulario-contexto-container');
    const listaContainer = document.querySelector('.contextos-lista-container');
    
    if (contenedorForm) contenedorForm.style.display = 'none';
    if (listaContainer) listaContainer.style.display = 'block';
    
    contextoEditandoId = null;
    alumnosTemporales = [];
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
        clasesEfectivas: parseInt(document.getElementById('contexto-clases-efectivas').value) || 0,
        observaciones: document.getElementById('contexto-observaciones').value,
        alumnos: alumnosTemporales
    };
    
    if (contextoEditandoId) {
        window.SistemaContextos.editarContexto(contextoEditandoId, datos);
    } else {
        window.SistemaContextos.crearContexto(datos);
    }
    
    ocultarFormularioContexto();
    renderizarListaContextos();
    cargarContextosEnSelector();
}

function renderizarListaContextos() {
    const container = document.getElementById('lista-contextos');
    if (!container) return;
    
    const contextos = window.SistemaContextos.listarContextos();
    const activoId = localStorage.getItem('asistencia_contexto_activo');
    
    if (Object.keys(contextos).length === 0) {
        container.innerHTML = '<p class="no-contextos">No hay contextos guardados.</p>';
        return;
    }
    
    let html = '';
    Object.values(contextos).forEach(ctx => {
        const esActivo = ctx.id === activoId;
        const cantAlumnos = (ctx.alumnos || []).length;
        
        html += '<div class="contexto-item ' + (esActivo ? 'activo' : '') + '" data-id="' + ctx.id + '">';
        html += '<div class="contexto-info">';
        html += '<div class="contexto-nombre">' + escapeHtml(ctx.nombre) + '</div>';
        html += '<div class="contexto-detalle">' + escapeHtml(ctx.institucion) + ' - ' + escapeHtml(ctx.curso) + (ctx.division ? '/' + ctx.division : '') + ' (' + cantAlumnos + ' alumnos)</div>';
        html += '</div>';
        html += '<div class="contexto-acciones">';
        html += !esActivo ? '<button class="btn btn-small btn-usar" onclick="usarContexto(\'' + ctx.id + '\')">Usar</button>' : '<span class="badge-activo">Activo</span>';
        html += '<button class="btn btn-small btn-secondary" onclick="editarContextoDesdeLista(\'' + ctx.id + '\')">Editar</button>';
        html += '<button class="btn btn-small btn-danger" onclick="eliminarContextoDesdeLista(\'' + ctx.id + '\')">Eliminar</button>';
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

function usarContexto(id) {
    window.SistemaContextos.seleccionarContexto(id);
    cerrarModalContextos();
    if (contextoActual) {
        manejarCambioContexto(id);
    }
}

function editarContextoDesdeLista(id) {
    const contextos = window.SistemaContextos.listarContextos();
    const contexto = contextos[id];
    if (contexto) {
        mostrarFormularioContexto(contexto);
    }
}

function eliminarContextoDesdeLista(id) {
    if (window.SistemaContextos.eliminarContexto(id)) {
        renderizarListaContextos();
        cargarContextosEnSelector();
    }
}

function renderizarListaAlumnosTemporales() {
    const container = document.getElementById('lista-alumnos-contexto');
    if (!container) return;
    
    if (alumnosTemporales.length === 0) {
        container.innerHTML = '<p class="no-alumnos">No hay alumnos agregados.</p>';
        return;
    }
    
    const alumnosOrdenados = [...alumnosTemporales].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    let html = '<div class="tabla-alumnos-temporal">';
    alumnosOrdenados.forEach((alumno, indice) => {
        html += '<div class="alumno-row" data-id="' + alumno.id + '">';
        html += '<span class="alumno-orden">' + (indice + 1) + '</span>';
        html += '<span class="alumno-nombre">' + escapeHtml(alumno.apellido) + ', ' + escapeHtml(alumno.nombre) + '</span>';
        html += '<div class="alumno-acciones">';
        html += '<button type="button" class="btn btn-small btn-subir" onclick="moverAlumnoTempArriba(\'' + alumno.id + '\')" title="Subir">⬆</button>';
        html += '<button type="button" class="btn btn-small btn-bajar" onclick="moverAlumnoTempAbajo(\'' + alumno.id + '\')" title="Bajar">⬇</button>';
        html += '<button type="button" class="btn btn-small btn-secondary" onclick="editarAlumnoTemp(\'' + alumno.id + '\')" title="Editar">✏</button>';
        html += '<button type="button" class="btn btn-small btn-danger" onclick="eliminarAlumnoTemp(\'' + alumno.id + '\')" title="Eliminar">🗑</button>';
        html += '</div></div>';
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function moverAlumnoTempArriba(alumnoId) {
    const indice = alumnosTemporales.findIndex(a => a.id === alumnoId);
    if (indice <= 0) return;
    
    const temp = alumnosTemporales[indice];
    alumnosTemporales.splice(indice, 1);
    alumnosTemporales.splice(indice - 1, 0, temp);
    
    renderizarListaAlumnosTemporales();
}

function moverAlumnoTempAbajo(alumnoId) {
    const indice = alumnosTemporales.findIndex(a => a.id === alumnoId);
    if (indice < 0 || indice >= alumnosTemporales.length - 1) return;
    
    const temp = alumnosTemporales[indice];
    alumnosTemporales.splice(indice, 1);
    alumnosTemporales.splice(indice + 1, 0, temp);
    
    renderizarListaAlumnosTemporales();
}

function editarAlumnoTemp(alumnoId) {
    const alumno = alumnosTemporales.find(a => a.id === alumnoId);
    if (alumno) {
        mostrarModalAlumno(alumno);
    }
}

function eliminarAlumnoTemp(alumnoId) {
    if (!confirm('¿Eliminar este alumno?')) return;
    
    alumnosTemporales = alumnosTemporales.filter(a => a.id !== alumnoId);
    renderizarListaAlumnosTemporales();
}

let alumnoEditandoId = null;

function configurarModalAlumno() {
    const btnCerrar = document.getElementById('btn-cerrar-modal-alumno');
    const btnCancelar = document.getElementById('btn-cancelar-alumno');
    const form = document.getElementById('form-alumno');
    const modal = document.getElementById('modal-alumno');
    
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalAlumno);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModalAlumno);
    if (form) form.addEventListener('submit', manejarSubmitAlumno);
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) cerrarModalAlumno();
        });
    }
}

function mostrarModalAlumno(alumnoParaEditar) {
    const modal = document.getElementById('modal-alumno');
    const titulo = document.getElementById('titulo-modal-alumno');
    
    if (!modal) return;
    
    if (alumnoParaEditar) {
        alumnoEditandoId = alumnoParaEditar.id;
        titulo.textContent = 'Editar Alumno';
        document.getElementById('alumno-id-editar').value = alumnoParaEditar.id;
        document.getElementById('alumno-nombre').value = alumnoParaEditar.nombre;
        document.getElementById('alumno-apellido').value = alumnoParaEditar.apellido;
    } else {
        alumnoEditandoId = null;
        titulo.textContent = 'Agregar Alumno';
        document.getElementById('form-alumno').reset();
        document.getElementById('alumno-id-editar').value = '';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalAlumno() {
    const modal = document.getElementById('modal-alumno');
    if (modal) modal.style.display = 'none';
}

function manejarSubmitAlumno(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('alumno-nombre').value.trim();
    const apellido = document.getElementById('alumno-apellido').value.trim();
    
    if (alumnoEditandoId) {
        const alumno = alumnosTemporales.find(a => a.id === alumnoEditandoId);
        if (alumno) {
            alumno.nombre = nombre;
            alumno.apellido = apellido;
        }
    } else {
        const id = 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const maxOrden = alumnosTemporales.reduce((max, a) => Math.max(max, a.orden || 0), 0);
        
        alumnosTemporales.push({
            id: id,
            orden: maxOrden + 1,
            nombre: nombre,
            apellido: apellido,
            inasistencias: 0
        });
    }
    
    cerrarModalAlumno();
    renderizarListaAlumnosTemporales();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarToast(mensaje, tipo) {
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(mensaje, tipo);
    } else {
        alert(mensaje);
    }
}

function mostrarSeccionTabla() {
    document.getElementById('seccion-tabla-planilla').style.display = 'block';
    document.getElementById('seccion-estadisticas-planilla').style.display = 'block';
}

function ocultarSeccionTabla() {
    document.getElementById('seccion-tabla-planilla').style.display = 'none';
    document.getElementById('seccion-estadisticas-planilla').style.display = 'none';
}
