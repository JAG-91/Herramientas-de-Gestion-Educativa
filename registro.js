// REGISTRO DIARIO DE ASISTENCIA - registro.js
// Sistema unificado basado en Contextos Compartidos

const STORAGE_KEY_REGISTROS = 'registrosDiarios';
const ESTADOS = { PRESENTE: 'presente', AUSENTE: 'ausente', TARDE: 'tarde', JUSTIFICADO: 'justificado' };
const ESTADO_CONFIG = {
    [ESTADOS.PRESENTE]: { label: 'Presente', emoji: '✅' },
    [ESTADOS.AUSENTE]: { label: 'Ausente', emoji: '❌' },
    [ESTADOS.TARDE]: { label: 'Tarde', emoji: '⏰' },
    [ESTADOS.JUSTIFICADO]: { label: 'Justificado', emoji: '📄' }
};

let contextoActual = null, fechaActual = null, alumnosActuales = [];

document.addEventListener('DOMContentLoaded', function() {
    const anioEl = document.getElementById('anio-actual');
    if (anioEl) anioEl.textContent = new Date().getFullYear();
    
    const fechaInput = document.getElementById('fecha-registro');
    if (fechaInput) {
        fechaInput.value = obtenerFechaHoy();
        fechaActual = obtenerFechaHoy();
    }
    
    cargarContextosEnSelector();
    configurarEventos();
    configurarModalContextosRegistro();
    
    // Cargar contexto activo si existe
    const contextoActivoId = localStorage.getItem('asistencia_contexto_activo');
    if (contextoActivoId) {
        document.getElementById('selector-contexto-registro').value = contextoActivoId;
        manejarCambioContexto(contextoActivoId);
    }
});

function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function guardarRegistros(registros) {
    localStorage.setItem(STORAGE_KEY_REGISTROS, JSON.stringify(registros));
}

function obtenerRegistros() {
    const datos = localStorage.getItem(STORAGE_KEY_REGISTROS);
    return datos ? JSON.parse(datos) : {};
}

// ========================================
// GESTIÓN DE CONTEXTOS
// ========================================

function cargarContextosEnSelector() {
    const selector = document.getElementById('selector-contexto-registro');
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
    
    if (Object.keys(contextos).length === 0) {
        mostrarToast('No hay contextos creados. Cree uno desde "Gestionar Contextos".', 'warning');
    }
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
    
    if (contextoActual && contextoActual.alumnos) {
        alumnosActuales = contextoActual.alumnos;
        mostrarSeccionTabla();
        cargarAlumnosEnTabla();
        actualizarEstadisticas();
    }
}

function configurarEventos() {
    const fecha = document.getElementById('fecha-registro');
    const btnGuardar = document.getElementById('btn-guardar-registro');
    const btnImprimir = document.getElementById('btn-imprimir-registro');
    
    if (fecha) fecha.addEventListener('change', manejarCambioFecha);
    if (btnGuardar) btnGuardar.addEventListener('click', guardarRegistro);
    if (btnImprimir) btnImprimir.addEventListener('click', prepararImpresion);
    
    configurarModalImpresion();
}

function manejarCambioFecha(e) {
    fechaActual = e.target.value;
    if (contextoActual && alumnosActuales.length > 0) {
        cargarEstadosGuardados();
        actualizarEstadisticas();
    }
}

function cargarAlumnosEnTabla() {
    const tbody = document.getElementById('tabla-asistencia-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Ordenar alumnos por su número de orden
    const alumnosOrdenados = [...alumnosActuales].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    alumnosOrdenados.forEach((alumno, indice) => {
        const tr = document.createElement('tr');
        tr.dataset.alumnoId = alumno.id;
        tr.dataset.indice = indice;
        
        const estado = obtenerEstadoAlumno(alumno.id);
        
        let h = '<td>' + (indice + 1) + '</td>';
        h += '<td>' + escapeHtml(alumno.apellido) + '</td>';
        h += '<td>' + escapeHtml(alumno.nombre) + '</td>';
        h += '<td><div class="estado-botones">';
        h += '<button class="estado-btn ' + (estado === ESTADOS.PRESENTE ? 'activo' : '') + '" data-estado="' + ESTADOS.PRESENTE + '" data-alumno-id="' + alumno.id + '">✅ P</button>';
        h += '<button class="estado-btn ' + (estado === ESTADOS.AUSENTE ? 'activo' : '') + '" data-estado="' + ESTADOS.AUSENTE + '" data-alumno-id="' + alumno.id + '">❌ A</button>';
        h += '<button class="estado-btn ' + (estado === ESTADOS.TARDE ? 'activo' : '') + '" data-estado="' + ESTADOS.TARDE + '" data-alumno-id="' + alumno.id + '">⏰ T</button>';
        h += '<button class="estado-btn ' + (estado === ESTADOS.JUSTIFICADO ? 'activo' : '') + '" data-estado="' + ESTADOS.JUSTIFICADO + '" data-alumno-id="' + alumno.id + '">📄 J</button></div></td>';
        
        tr.innerHTML = h;
        tbody.appendChild(tr);
    });
    
    tbody.querySelectorAll('.estado-btn').forEach(b => {
        b.addEventListener('click', manejarClickEstado);
    });
}

function manejarClickEstado(e) {
    const btn = e.target;
    const alumnoId = btn.dataset.alumnoId;
    const nuevoEstado = btn.dataset.estado;
    
    if (!contextoActual || !fechaActual) return;
    
    const registros = obtenerRegistros();
    
    if (!registros[contextoActual.id]) {
        registros[contextoActual.id] = {};
    }
    
    if (!registros[contextoActual.id][fechaActual]) {
        registros[contextoActual.id][fechaActual] = {};
    }
    
    registros[contextoActual.id][fechaActual][alumnoId] = nuevoEstado;
    guardarRegistros(registros);
    
    actualizarBotonesEstado(alumnoId, nuevoEstado);
    actualizarEstadisticas();
    
    mostrarToast('Estado: ' + ESTADO_CONFIG[nuevoEstado].label, 'success');
}

function actualizarBotonesEstado(alumnoId, estadoActual) {
    const fila = document.querySelector('tr[data-alumno-id="' + alumnoId + '"]');
    if (!fila) return;
    
    fila.querySelectorAll('.estado-btn').forEach(btn => {
        btn.classList.toggle('activo', btn.dataset.estado === estadoActual);
    });
}

function obtenerEstadoAlumno(alumnoId) {
    if (!contextoActual || !fechaActual) return ESTADOS.PRESENTE;
    
    const registros = obtenerRegistros();
    
    if (!registros[contextoActual.id]) return ESTADOS.PRESENTE;
    if (!registros[contextoActual.id][fechaActual]) return ESTADOS.PRESENTE;
    
    return registros[contextoActual.id][fechaActual][alumnoId] || ESTADOS.PRESENTE;
}

function cargarEstadosGuardados() {
    if (!contextoActual || !fechaActual) return;
    
    alumnosActuales.forEach(alumno => {
        actualizarBotonesEstado(alumno.id, obtenerEstadoAlumno(alumno.id));
    });
}

function actualizarEstadisticas() {
    if (!contextoActual || !fechaActual) return;
    
    const registros = obtenerRegistros();
    const registroDia = registros[contextoActual.id]?.[fechaActual] || {};
    
    let p = 0, a = 0, t = 0, j = 0;
    
    Object.values(registroDia).forEach(estado => {
        if (estado === ESTADOS.PRESENTE) p++;
        else if (estado === ESTADOS.AUSENTE) a++;
        else if (estado === ESTADOS.TARDE) t++;
        else if (estado === ESTADOS.JUSTIFICADO) j++;
    });
    
    const statPresentes = document.getElementById('stat-presentes');
    const statAusentes = document.getElementById('stat-ausentes');
    const statTardes = document.getElementById('stat-tardes');
    const statJustificados = document.getElementById('stat-justificados');
    
    if (statPresentes) statPresentes.textContent = p;
    if (statAusentes) statAusentes.textContent = a;
    if (statTardes) statTardes.textContent = t;
    if (statJustificados) statJustificados.textContent = j;
}

function guardarRegistro() {
    if (!contextoActual) {
        mostrarToast('Seleccione un contexto', 'error');
        return;
    }
    if (!fechaActual) {
        mostrarToast('Seleccione una fecha', 'error');
        return;
    }
    mostrarToast('Registro guardado exitosamente', 'success');
}

function prepararImpresion() {
    if (!contextoActual || !fechaActual) {
        mostrarToast('Seleccione contexto y fecha', 'error');
        return;
    }
    
    const modal = document.getElementById('modal-imprimir');
    if (!modal) return;
    
    // Cargar datos del contexto en el modal
    const institucionInput = document.getElementById('institucionInput');
    const cursoImprimir = document.getElementById('cursoImprimir');
    const divisionImprimir = document.getElementById('divisionImprimir');
    const cicloImprimir = document.getElementById('cicloImprimir');
    const docenteImprimir = document.getElementById('docenteImprimir');
    const observacionesImprimir = document.getElementById('observacionesImprimir');
    const logoImprimir = document.getElementById('logoImprimir');
    
    if (institucionInput) institucionInput.value = contextoActual.institucion || '';
    if (cursoImprimir) cursoImprimir.value = contextoActual.curso || '';
    if (divisionImprimir) divisionImprimir.value = contextoActual.division || '';
    if (cicloImprimir) cicloImprimir.value = contextoActual.ciclo || '';
    if (docenteImprimir) docenteImprimir.value = contextoActual.docente || '';
    if (observacionesImprimir) observacionesImprimir.value = contextoActual.observaciones || '';
    if (logoImprimir && contextoActual.logo) {
        logoImprimir.src = contextoActual.logo;
        logoImprimir.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

function configurarModalImpresion() {
    const btnCerrar = document.getElementById('btn-cerrar-modal-imprimir');
    const btnImprimir = document.getElementById('btn-confirmar-imprimir');
    const modal = document.getElementById('modal-imprimir');
    
    if (btnCerrar) btnCerrar.addEventListener('click', () => { modal.style.display = 'none'; });
    if (btnImprimir) btnImprimir.addEventListener('click', imprimirRegistro);
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

function imprimirRegistro() {
    const contenidoExistente = document.getElementById('impresionContenidoDiario');
    if (contenidoExistente) contenidoExistente.remove();
    
    const inst = document.getElementById('institucionInput').value;
    const cur = document.getElementById('cursoImprimir').value;
    const di = document.getElementById('divisionImprimir').value;
    const ci = document.getElementById('cicloImprimir').value;
    const doce = document.getElementById('docenteImprimir').value;
    const ob = document.getElementById('observacionesImprimir').value;
    
    const contenedor = document.createElement('div');
    contenedor.id = 'impresionContenidoDiario';
    contenedor.className = 'impresion-contenedor';
    
    const registros = obtenerRegistros();
    const registroDia = registros[contextoActual?.id]?.[fechaActual] || {};
    
    let html = '<div class="impresion-encabezado">';
    if (inst) html += '<h1>' + escapeHtml(inst) + '</h1>';
    html += '<div class="impresion-info">';
    if (cur) html += '<p><strong>Curso:</strong> ' + escapeHtml(cur) + (di ? ' - ' + escapeHtml(di) : '') + '</p>';
    if (ci) html += '<p><strong>Ciclo:</strong> ' + escapeHtml(ci) + '</p>';
    if (doce) html += '<p><strong>Docente:</strong> ' + escapeHtml(doce) + '</p>';
    html += '</div></div>';
    
    html += '<h2>Registro Diario de Asistencia</h2>';
    html += '<p class="impresion-fecha"><strong>Fecha:</strong> ' + formatearFecha(fechaActual) + '</p>';
    
    html += '<table class="print-table"><thead><tr><th>#</th><th>Apellido</th><th>Nombre</th><th>Estado</th></tr></thead><tbody>';
    
    // Ordenar alumnos por orden
    const alumnosOrdenados = [...alumnosActuales].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    alumnosOrdenados.forEach((alumno, indice) => {
        const estado = registroDia[alumno.id] || ESTADOS.PRESENTE;
        html += '<tr>';
        html += '<td>' + (indice + 1) + '</td>';
        html += '<td>' + escapeHtml(alumno.apellido) + '</td>';
        html += '<td>' + escapeHtml(alumno.nombre) + '</td>';
        html += '<td>' + ESTADO_CONFIG[estado].emoji + ' ' + ESTADO_CONFIG[estado].label + '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    if (ob) html += '<div class="print-observaciones"><h3>Observaciones</h3><p>' + escapeHtml(ob) + '</p></div>';
    
    html += '<div class="print-footer"><p>_____________________________</p><p>Firma del Docente</p></div>';
    
    contenedor.innerHTML = html;
    document.body.appendChild(contenedor);
    window.print();
    setTimeout(() => contenedor.remove(), 1000);
}

function formatearFecha(f) {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function mostrarSeccionTabla() {
    const seccion = document.getElementById('seccion-tabla');
    const estadisticas = document.getElementById('seccion-estadisticas');
    if (seccion) seccion.style.display = 'block';
    if (estadisticas) estadisticas.style.display = 'block';
}

function ocultarSeccionTabla() {
    const seccion = document.getElementById('seccion-tabla');
    const estadisticas = document.getElementById('seccion-estadisticas');
    if (seccion) seccion.style.display = 'none';
    if (estadisticas) estadisticas.style.display = 'none';
}

let contextoEditandoId=null;
function configurarModalContextosRegistro(){
    const bg=document.getElementById('btn-gestionar-contextos-registro'),bz=document.getElementById('btn-cerrar-modal-contextos'),bc=document.getElementById('btn-crear-contexto'),bn=document.getElementById('btn-cancelar-form-contexto'),fm=document.getElementById('form-contexto'),md=document.getElementById('modal-contextos');
    if(bg)bg.addEventListener('click',abrirModalContextos);if(bz)bz.addEventListener('click',cerrarModalContextos);
    if(bc)bc.addEventListener('click',mostrarFormularioContexto);if(bn)bn.addEventListener('click',ocultarFormularioContexto);
    if(fm)fm.addEventListener('submit',manejarSubmitContexto);if(md)md.addEventListener('click',e=>{if(e.target===md)cerrarModalContextos();});
}
function abrirModalContextos(){const m=document.getElementById('modal-contextos');if(m){m.style.display='flex';renderizarListaContextos();ocultarFormularioContexto();}}
function cerrarModalContextos(){const m=document.getElementById('modal-contextos');if(m)m.style.display='none';}
function mostrarFormularioContexto(ctx){
    const c=document.getElementById('formulario-contexto-container'),l=document.querySelector('.contextos-lista-container'),t=document.getElementById('form-titulo-contexto');if(!c)return;
    c.style.display='block';if(l)l.style.display='none';
    if(ctx){contextoEditandoId=ctx.id;t.textContent='Editar Contexto';
        document.getElementById('contexto-id-editar').value=ctx.id;document.getElementById('contexto-nombre').value=ctx.nombre;
        document.getElementById('contexto-institucion').value=ctx.institucion;document.getElementById('contexto-logo-url').value=ctx.logo||'';
        document.getElementById('contexto-curso').value=ctx.curso;document.getElementById('contexto-division').value=ctx.division||'';
        document.getElementById('contexto-ciclo').value=ctx.ciclo||'';document.getElementById('contexto-periodo').value=ctx.periodo||'';
        document.getElementById('contexto-docente').value=ctx.docente;document.getElementById('contexto-observaciones').value=ctx.observaciones||'';
    }else{contextoEditandoId=null;t.textContent='Crear Nuevo Contexto';document.getElementById('form-contexto').reset();document.getElementById('contexto-id-editar').value='';}
}
function ocultarFormularioContexto(){const c=document.getElementById('formulario-contexto-container'),l=document.querySelector('.contextos-lista-container');if(c)c.style.display='none';if(l)l.style.display='block';contextoEditandoId=null;}
function manejarSubmitContexto(e){e.preventDefault();const d={nombre:document.getElementById('contexto-nombre').value,institucion:document.getElementById('contexto-institucion').value,logo:document.getElementById('contexto-logo-url').value,curso:document.getElementById('contexto-curso').value,division:document.getElementById('contexto-division').value,ciclo:document.getElementById('contexto-ciclo').value,periodo:document.getElementById('contexto-periodo').value,docente:document.getElementById('contexto-docente').value,observaciones:document.getElementById('contexto-observaciones').value};if(contextoEditandoId)editarContexto(contextoEditandoId,d);else crearContexto(d);ocultarFormularioContexto();renderizarListaContextos();}
function renderizarListaContextos(){const c=document.getElementById('lista-contextos');if(!c)return;const ctxs=listarContextos(),aid=localStorage.getItem('asistencia_contexto_activo');if(Object.keys(ctxs).length===0){c.innerHTML='<p class="no-contextos">No hay contextos.</p>';return;}let h='';Object.values(ctxs).forEach(x=>{const ea=x.id===aid;h+='<div class="contexto-item '+(ea?'activo':'')+'" data-id="'+x.id+'"><div class="contexto-info"><div class="contexto-nombre">'+escapeHtml(x.nombre)+'</div><div class="contexto-detalle">'+escapeHtml(x.institucion)+' - '+escapeHtml(x.curso)+(x.division?'/'+x.division:'')+'</div></div><div class="contexto-acciones">'+(ea?'<span class="badge-activo">Activo</span>':'<button class="btn btn-small btn-usar" onclick="usarContexto(\''+x.id+'\')">Usar</button>');h+='<button class="btn btn-small btn-secondary" onclick="editarContextoDesdeLista(\''+x.id+'\')">Editar</button><button class="btn btn-small btn-danger" onclick="eliminarContextoDesdeLista(\''+x.id+'\')">Eliminar</button></div></div>';});c.innerHTML=h;}
function usarContexto(id){seleccionarContexto(id);cerrarModalContextos();}
function editarContextoDesdeLista(id){const x=listarContextos()[id];if(x)mostrarFormularioContexto(x);}
function eliminarContextoDesdeLista(id){if(eliminarContexto(id))renderizarListaContextos();}

// Funciones auxiliares para el modal de contextos (usando SistemaContextos)
function mostrarToast(mensaje, tipo = 'info') {
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(mensaje, tipo);
    } else {
        alert(mensaje);
    }
}

function listarContextos() {
    return window.SistemaContextos ? window.SistemaContextos.listarContextos() : {};
}

function crearContexto(datos) {
    if (window.SistemaContextos) {
        return window.SistemaContextos.crearContexto(datos);
    }
    return null;
}

function editarContexto(id, datos) {
    if (window.SistemaContextos) {
        return window.SistemaContextos.editarContexto(id, datos);
    }
    return null;
}

function eliminarContexto(id) {
    if (window.SistemaContextos) {
        return window.SistemaContextos.eliminarContexto(id);
    }
    return false;
}

function seleccionarContexto(id) {
    if (window.SistemaContextos) {
        window.SistemaContextos.seleccionarContexto(id);
        // Recargar la lista y actualizar la UI
        renderizarListaContextos();
        // Si estamos en registro, cargar el contexto
        manejarCambioContexto(id);
    }
}
