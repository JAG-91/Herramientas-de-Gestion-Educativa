/**
 * ==========================================
 * SISTEMA UNIFICADO DE GESTIÓN DE ASISTENCIA
 * app.js
 * 
 * Este archivo JavaScript contiene toda la lógica para:
 * - Gestión de contextos (cursos/materias)
 * - Registro diario de asistencia
 * - Planilla de porcentajes de inasistencia
 * - Gestión de alumnos (agregar, editar, eliminar)
 * - Cálculo automático de porcentajes
 * - Manejo de múltiples listas
 * - Estadísticas del curso
 * - Búsqueda y ordenamiento
 * - Sistema de deshacer acciones
 * - Selección múltiple
 * - Impresión con datos institucionales
 * - Persistencia en localStorage
 * ==========================================
 */

// ==========================================
// VARIABLES GLOBALES
// ==========================================

// Modo actual: 'registro' o 'planilla'
let modoActual = 'planilla';

// Contexto actualmente seleccionado
let contextoActual = null;

// Todos los contextos guardados
let contextos = {};

// Array principal que almacena los datos de los alumnos
let alumnos = [];

// Índice del alumno que se está editando actualmente
let indiceEdicion = null;

// Columna por la cual se ordenó la tabla la última vez
let columnaOrden = null;

// Dirección del ordenamiento (true = ascendente, false = descendente)
let ascendente = true;

// Set que contiene los índices de los alumnos seleccionados
let seleccionados = new Set();

// Estado anterior para funcionalidad de deshacer
let estadoAnterior = null;

// Logo institucional para impresión
let logoBase64 = null;

// ==========================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ==========================================

// Elementos de contexto
const selectorContexto = document.getElementById('selectorContexto');
const btnCargarContexto = document.getElementById('btnCargarContexto');
const btnNuevoContexto = document.getElementById('btnNuevoContexto');
const modalContexto = document.getElementById('modalContexto');
const tituloModalContexto = document.getElementById('tituloModalContexto');
const contextoNombreInput = document.getElementById('contextoNombre');
const contextoFechaInput = document.getElementById('contextoFecha');
const contextoTotalClasesInput = document.getElementById('contextoTotalClases');
const guardarContextoBtn = document.getElementById('guardarContexto');
const cancelarContextoBtn = document.getElementById('cancelarContexto');
const campoTotalClases = document.getElementById('campoTotalClases');

// Secciones
const seccionContexto = document.getElementById('seccionContexto');
const seccionClases = document.getElementById('seccionClases');
const seccionEstadisticas = document.getElementById('seccionEstadisticas');
const seccionBuscador = document.getElementById('seccionBuscador');
const seccionFormulario = document.getElementById('seccionFormulario');
const seccionTabla = document.getElementById('seccionTabla');
const seccionRegistroDiario = document.getElementById('seccionRegistroDiario');

// Inputs principales
const totalClasesInput = document.getElementById('totalClases');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const inasistenciasInput = document.getElementById('inasistencias');
const btnAgregar = document.getElementById('btnAgregar');

// Elementos de la tabla
const cuerpoTabla = document.getElementById('cuerpoTabla');
const buscador = document.getElementById('buscarAlumno');

// Elementos de registro diario
const fechaRegistroInput = document.getElementById('fechaRegistro');
const cuerpoRegistro = document.getElementById('cuerpoRegistro');
const btnGuardarRegistro = document.getElementById('btnGuardarRegistro');
const btnImprimirRegistro = document.getElementById('btnImprimirRegistro');

// Notificación toast
const toast = document.getElementById('toast');

// Elementos de estadísticas
const cantidadAlumnosEl = document.getElementById('cantidadAlumnos');
const promedioCursoEl = document.getElementById('promedioCurso');
const mayorPorcentajeEl = document.getElementById('mayorPorcentaje');
const menorPorcentajeEl = document.getElementById('menorPorcentaje');
const ultimaModificacionEl = document.getElementById('ultimaModificacion');

// Elementos para selección múltiple
const seleccionarTodoCheckbox = document.getElementById('seleccionarTodo');
const btnEliminarSeleccionados = document.getElementById('btnEliminarSeleccionados');
const btnDeshacer = document.getElementById('btnDeshacer');

// Elementos del modal de edición
const modalEditar = document.getElementById('modalEditar');
const editarNombreInput = document.getElementById('editarNombre');
const editarApellidoInput = document.getElementById('editarApellido');
const editarInasistenciasInput = document.getElementById('editarInasistencias');
const guardarEdicionBtn = document.getElementById('guardarEdicion');
const cancelarEdicionBtn = document.getElementById('cancelarEdicion');

// Elementos del modal de impresión
const modalImprimir = document.getElementById('modalImprimir');
const institucionInput = document.getElementById('institucion');
const logoInstitucionInput = document.getElementById('logoInstitucion');
const cursoImprimirInput = document.getElementById('cursoImprimir');
const divisionImprimirInput = document.getElementById('divisionImprimir');
const cicloImprimirInput = document.getElementById('cicloImprimir');
const periodoImprimirInput = document.getElementById('periodoImprimir');
const docenteImprimirInput = document.getElementById('docenteImprimir');
const fechaImpresionInput = document.getElementById('fechaImpresion');
const observacionesImprimirInput = document.getElementById('observacionesImprimir');
const confirmarImprimirBtn = document.getElementById('confirmarImprimir');
const cancelarImprimirBtn = document.getElementById('cancelarImprimir');

// Encabezados
const tituloPrincipal = document.getElementById('tituloPrincipal');
const subtituloPrincipal = document.getElementById('subtituloPrincipal');

// ==========================================
// INICIALIZACIÓN
// ==========================================

/**
 * Inicializa la aplicación al cargar la página
 * Detecta el modo desde la URL y configura la interfaz
 */
function inicializar() {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    modoActual = params.get('modo') || 'planilla';
    
    // Configurar según el modo
    if (modoActual === 'registro') {
        configurarModoRegistro();
    } else {
        configurarModoPlanilla();
    }
    
    // Cargar contextos guardados
    cargarContextos();
    
    // Establecer fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaRegistroInput) fechaRegistroInput.value = hoy;
    if (fechaImpresionInput) fechaImpresionInput.value = hoy;
    if (contextoFechaInput) contextoFechaInput.value = hoy;
    
    // Configurar evento para input de total de clases
    if (totalClasesInput) {
        totalClasesInput.addEventListener('change', () => {
            guardarDatos();
            actualizarEstadisticas();
            renderizarTabla();
        });
    }
    
    mostrarToast('Aplicación cargada correctamente');
}

/**
 * Configura la interfaz para modo registro diario
 */
function configurarModoRegistro() {
    tituloPrincipal.textContent = '📅 Registro Diario de Asistencia';
    subtituloPrincipal.textContent = 'Toma de asistencia por fecha';
    
    seccionClases.classList.add('oculto');
    seccionEstadisticas.classList.add('oculto');
    seccionBuscador.classList.add('oculto');
    seccionFormulario.classList.add('oculto');
    seccionTabla.classList.add('oculto');
    seccionRegistroDiario.classList.remove('oculto');
    
    // Ocultar campo de inasistencias en formulario
    const campoInasistencias = document.getElementById('campoInasistencias');
    if (campoInasistencias) campoInasistencias.classList.add('oculto');
}

/**
 * Configura la interfaz para modo planilla de inasistencias
 */
function configurarModoPlanilla() {
    tituloPrincipal.textContent = '📊 Planilla de Inasistencias';
    subtituloPrincipal.textContent = 'Cálculo de porcentajes de asistencia';
    
    seccionRegistroDiario.classList.add('oculto');
}

// ==========================================
// GESTIÓN DE CONTEXTOS
// ==========================================

/**
 * Carga todos los contextos guardados desde localStorage
 */
function cargarContextos() {
    const guardado = localStorage.getItem('asistencia_contextos');
    if (guardado) {
        contextos = JSON.parse(guardado);
    }
    actualizarSelectorContexto();
}

/**
 * Guarda todos los contextos en localStorage
 */
function guardarContextos() {
    localStorage.setItem('asistencia_contextos', JSON.stringify(contextos));
}

/**
 * Actualiza el selector desplegable de contextos
 */
function actualizarSelectorContexto() {
    selectorContexto.innerHTML = '<option value="">-- Seleccionar --</option>';
    
    Object.keys(contextos).forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        selectorContexto.appendChild(option);
    });
}

/**
 * Muestra el modal para crear nuevo contexto
 */
function mostrarModalNuevoContexto() {
    tituloModalContexto.textContent = 'Crear nuevo contexto';
    contextoNombreInput.value = '';
    contextoFechaInput.value = new Date().toISOString().split('T')[0];
    contextoTotalClasesInput.value = '';
    
    // Mostrar/ocultar campo de total de clases según el modo
    if (modoActual === 'registro') {
        campoTotalClases.classList.add('oculto');
    } else {
        campoTotalClases.classList.remove('oculto');
    }
    
    modalContexto.classList.remove('oculto');
    contextoNombreInput.focus();
}

/**
 * Guarda un nuevo contexto o actualiza uno existente
 */
function guardarContexto() {
    const nombre = contextoNombreInput.value.trim();
    const fecha = contextoFechaInput.value;
    const totalClases = parseInt(contextoTotalClasesInput.value) || 82;
    
    if (!nombre) {
        mostrarToast('❌ Ingresa un nombre para el contexto');
        return;
    }
    
    // Crear nuevo contexto
    contextos[nombre] = {
        nombre: nombre,
        fecha: fecha,
        totalClases: totalClases,
        alumnos: [],
        registros: {}, // Para modo registro: { "2024-01-15": [{id, estado}, ...] }
        ultimaModificacion: new Date().toISOString()
    };
    
    guardarContextos();
    actualizarSelectorContexto();
    
    // Seleccionar el nuevo contexto
    selectorContexto.value = nombre;
    
    modalContexto.classList.add('oculto');
    mostrarToast(`✅ Contexto "${nombre}" creado correctamente`);
}

/**
 * Carga los datos de un contexto seleccionado
 */
function cargarContextoSeleccionado() {
    const nombre = selectorContexto.value;
    
    if (!nombre || !contextos[nombre]) {
        mostrarToast('❌ Selecciona un contexto válido');
        return;
    }
    
    contextoActual = contextos[nombre];
    alumnos = contextoActual.alumnos || [];
    
    // Actualizar UI según el modo
    if (modoActual === 'planilla') {
        totalClasesInput.value = contextoActual.totalClases || 82;
        seccionClases.classList.remove('oculto');
        seccionEstadisticas.classList.remove('oculto');
        seccionBuscador.classList.remove('oculto');
        seccionFormulario.classList.remove('oculto');
        seccionTabla.classList.remove('oculto');
        
        actualizarEstadisticas();
        renderizarTabla();
    } else {
        seccionRegistroDiario.classList.remove('oculto');
        renderizarRegistro();
    }
    
    subtituloPrincipal.textContent = `Contexto: ${nombre}`;
    mostrarToast(`✅ Datos de "${nombre}" cargados`);
}

// ==========================================
// GESTIÓN DE ALUMNOS (MODO PLANILLA)
// ==========================================

/**
 * Agrega un nuevo alumno a la lista
 */
function agregarAlumno() {
    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const inasistencias = parseInt(inasistenciasInput.value) || 0;
    
    if (!nombre && !apellido) {
        mostrarToast('❌ Ingresa al menos nombre o apellido');
        return;
    }
    
    // Guardar estado anterior para deshacer
    guardarEstadoAnterior();
    
    alumnos.push({
        id: Date.now(),
        nombre: nombre,
        apellido: apellido,
        inasistencias: inasistencias
    });
    
    // Limpiar formulario
    nombreInput.value = '';
    apellidoInput.value = '';
    inasistenciasInput.value = '';
    
    guardarDatos();
    actualizarEstadisticas();
    renderizarTabla();
    
    mostrarToast('✅ Alumno agregado correctamente');
}

/**
 * Elimina un alumno por su índice
 */
function eliminarAlumno(indice) {
    guardarEstadoAnterior();
    alumnos.splice(indice, 1);
    guardarDatos();
    actualizarEstadisticas();
    renderizarTabla();
    mostrarToast('✅ Alumno eliminado');
}

/**
 * Edita un alumno existente
 */
function editarAlumno(indice) {
    const alumno = alumnos[indice];
    indiceEdicion = indice;
    
    editarNombreInput.value = alumno.nombre;
    editarApellidoInput.value = alumno.apellido;
    editarInasistenciasInput.value = alumno.inasistencias;
    
    modalEditar.classList.remove('oculto');
    editarNombreInput.focus();
}

/**
 * Guarda los cambios de edición de un alumno
 */
function guardarEdicion() {
    if (indiceEdicion === null) return;
    
    guardarEstadoAnterior();
    
    alumnos[indiceEdicion].nombre = editarNombreInput.value.trim();
    alumnos[indiceEdicion].apellido = editarApellidoInput.value.trim();
    alumnos[indiceEdicion].inasistencias = parseInt(editarInasistenciasInput.value) || 0;
    
    guardarDatos();
    actualizarEstadisticas();
    renderizarTabla();
    
    modalEditar.classList.add('oculto');
    indiceEdicion = null;
    mostrarToast('✅ Alumno actualizado');
}

/**
 * Calcula el porcentaje de inasistencia de un alumno
 */
function calcularPorcentaje(inasistencias) {
    const total = parseInt(totalClasesInput.value) || 82;
    if (total === 0) return 0;
    return Math.round((inasistencias / total) * 100);
}

/**
 * Obtiene la clase CSS para el porcentaje según su valor
 */
function obtenerClasePorcentaje(porcentaje) {
    if (porcentaje >= 30) return 'porcentaje-bajo';
    if (porcentaje >= 15) return 'porcentaje-medio';
    return 'porcentaje-alto';
}

// ==========================================
// ESTADÍSTICAS Y RENDERIZADO
// ==========================================

/**
 * Actualiza las estadísticas del curso
 */
function actualizarEstadisticas() {
    const total = parseInt(totalClasesInput.value) || 82;
    
    // Cantidad de alumnos
    cantidadAlumnosEl.textContent = alumnos.length;
    
    if (alumnos.length === 0) {
        promedioCursoEl.textContent = '0%';
        mayorPorcentajeEl.textContent = '—';
        menorPorcentajeEl.textContent = '—';
        return;
    }
    
    // Calcular promedios y extremos
    let sumaPorcentajes = 0;
    let maxPorcentaje = -1;
    let minPorcentaje = 101;
    let alumnoMayor = null;
    let alumnoMenor = null;
    
    alumnos.forEach(alumno => {
        const porcentaje = calcularPorcentaje(alumno.inasistencias);
        sumaPorcentajes += porcentaje;
        
        if (porcentaje > maxPorcentaje) {
            maxPorcentaje = porcentaje;
            alumnoMayor = alumno;
        }
        if (porcentaje < minPorcentaje) {
            minPorcentaje = porcentaje;
            alumnoMenor = alumno;
        }
    });
    
    const promedio = Math.round(sumaPorcentajes / alumnos.length);
    
    promedioCursoEl.textContent = `${promedio}%`;
    mayorPorcentajeEl.textContent = alumnoMayor ? `${maxPorcentaje}% (${alumnoMayor.apellido})` : '—';
    menorPorcentajeEl.textContent = alumnoMenor ? `${minPorcentaje}% (${alumnoMenor.apellido})` : '—';
    
    // Última modificación
    ultimaModificacionEl.textContent = new Date().toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

/**
 * Renderiza la tabla de alumnos
 */
function renderizarTabla(filtrados = null) {
    cuerpoTabla.innerHTML = '';
    
    const datos = filtrados || alumnos;
    
    if (datos.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;">No hay alumnos registrados</td></tr>';
        return;
    }
    
    datos.forEach((alumno, indice) => {
        const porcentaje = calcularPorcentaje(alumno.inasistencias);
        const clasePorcentaje = obtenerClasePorcentaje(porcentaje);
        const fila = document.createElement('tr');
        
        if (seleccionados.has(indice)) {
            fila.classList.add('seleccionada');
        }
        
        fila.innerHTML = `
            <td class="colCheck">
                <input type="checkbox" data-indice="${indice}" ${seleccionados.has(indice) ? 'checked' : ''}>
            </td>
            <td>${indice + 1}</td>
            <td>${alumno.nombre}</td>
            <td>${alumno.apellido}</td>
            <td>${alumno.inasistencias}</td>
            <td class="${clasePorcentaje}">${porcentaje}%</td>
            <td>
                <button class="btnEditar" onclick="editarAlumno(${indice})">Editar</button>
                <button class="btnEliminar" onclick="eliminarAlumno(${indice})">Eliminar</button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    // Configurar eventos de checkbox
    configurarCheckboxes();
}

/**
 * Configura los eventos de los checkboxes de selección
 */
function configurarCheckboxes() {
    const checkboxes = cuerpoTabla.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const indice = parseInt(e.target.dataset.indice);
            
            if (e.target.checked) {
                seleccionados.add(indice);
            } else {
                seleccionados.delete(indice);
            }
            
            actualizarBotonesSeleccion();
        });
    });
}

/**
 * Actualiza el estado de los botones de selección múltiple
 */
function actualizarBotonesSeleccion() {
    btnEliminarSeleccionados.disabled = seleccionados.size === 0;
    seleccionarTodoCheckbox.checked = seleccionados.size === alumnos.length && alumnos.length > 0;
}

// ==========================================
// BÚSQUEDA Y ORDENAMIENTO
// ==========================================

/**
 * Filtra los alumnos según el término de búsqueda
 */
function buscarAlumno() {
    const termino = buscador.value.toLowerCase().trim();
    
    if (!termino) {
        renderizarTabla();
        return;
    }
    
    const filtrados = alumnos.filter(alumno => 
        alumno.nombre.toLowerCase().includes(termino) ||
        alumno.apellido.toLowerCase().includes(termino)
    );
    
    renderizarTabla(filtrados);
}

/**
 * Ordena la tabla por una columna específica
 */
function ordenarTabla(columna) {
    if (columnaOrden === columna) {
        ascendente = !ascendente;
    } else {
        columnaOrden = columna;
        ascendente = true;
    }
    
    alumnos.sort((a, b) => {
        let valorA, valorB;
        
        switch (columna) {
            case 'nombre':
                valorA = a.nombre.toLowerCase();
                valorB = b.nombre.toLowerCase();
                break;
            case 'apellido':
                valorA = a.apellido.toLowerCase();
                valorB = b.apellido.toLowerCase();
                break;
            case 'inasistencias':
                valorA = a.inasistencias;
                valorB = b.inasistencias;
                break;
            case 'porcentaje':
                valorA = calcularPorcentaje(a.inasistencias);
                valorB = calcularPorcentaje(b.inasistencias);
                break;
            default:
                return 0;
        }
        
        if (valorA < valorB) return ascendente ? -1 : 1;
        if (valorA > valorB) return ascendente ? 1 : -1;
        return 0;
    });
    
    renderizarTabla();
    actualizarEstadisticas();
}

// ==========================================
// SELECCIÓN MÚLTIPLE
// ==========================================

/**
 * Selecciona o deselecciona todos los alumnos
 */
function seleccionarTodos() {
    if (seleccionarTodoCheckbox.checked) {
        alumnos.forEach((_, indice) => seleccionados.add(indice));
    } else {
        seleccionados.clear();
    }
    
    renderizarTabla();
    actualizarBotonesSeleccion();
}

/**
 * Elimina todos los alumnos seleccionados
 */
function eliminarSeleccionados() {
    if (seleccionados.size === 0) return;
    
    if (!confirm(`¿Eliminar ${seleccionados.size} alumno(s) seleccionado(s)?`)) {
        return;
    }
    
    guardarEstadoAnterior();
    
    // Convertir a array y ordenar descendente para eliminar desde el final
    const indices = Array.from(seleccionados).sort((a, b) => b - a);
    
    indices.forEach(indice => {
        alumnos.splice(indice, 1);
    });
    
    seleccionados.clear();
    guardarDatos();
    actualizarEstadisticas();
    renderizarTabla();
    
    mostrarToast(`✅ ${indices.length} alumno(s) eliminado(s)`);
}

// ==========================================
// SISTEMA DESHACER
// ==========================================

/**
 * Guarda el estado actual para poder deshacer
 */
function guardarEstadoAnterior() {
    estadoAnterior = JSON.parse(JSON.stringify(alumnos));
    btnDeshacer.disabled = false;
}

/**
 * Deshace la última acción
 */
function deshacer() {
    if (!estadoAnterior) return;
    
    alumnos = JSON.parse(JSON.stringify(estadoAnterior));
    estadoAnterior = null;
    
    guardarDatos();
    actualizarEstadisticas();
    renderizarTabla();
    
    btnDeshacer.disabled = true;
    mostrarToast('✅ Acción deshecha');
}

// ==========================================
// REGISTRO DIARIO
// ==========================================

/**
 * Renderiza la tabla de registro diario
 */
function renderizarRegistro() {
    cuerpoRegistro.innerHTML = '';
    
    if (alumnos.length === 0) {
        cuerpoRegistro.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;">No hay alumnos en este contexto</td></tr>';
        return;
    }
    
    const fecha = fechaRegistroInput.value;
    const registros = contextoActual?.registros?.[fecha] || [];
    
    // Crear mapa de registros existentes
    const registrosMap = {};
    registros.forEach(reg => {
        registrosMap[reg.id] = reg.estado;
    });
    
    alumnos.forEach((alumno, indice) => {
        const estado = registrosMap[alumno.id] || 'presente';
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td>${alumno.nombre}</td>
            <td>${alumno.apellido}</td>
            <td>
                <div class="estado-asistencia">
                    <button class="estado-btn presente ${estado === 'presente' ? 'activo' : ''}" 
                            onclick="cambiarEstado(${indice}, 'presente')">Presente</button>
                    <button class="estado-btn ausente ${estado === 'ausente' ? 'activo' : ''}" 
                            onclick="cambiarEstado(${indice}, 'ausente')">Ausente</button>
                    <button class="estado-btn tarde ${estado === 'tarde' ? 'activo' : ''}" 
                            onclick="cambiarEstado(${indice}, 'tarde')">Tarde</button>
                    <button class="estado-btn justificado ${estado === 'justificado' ? 'activo' : ''}" 
                            onclick="cambiarEstado(${indice}, 'justificado')">Justificado</button>
                </div>
            </td>
        `;
        
        cuerpoRegistro.appendChild(fila);
    });
}

/**
 * Cambia el estado de asistencia de un alumno
 */
function cambiarEstado(indice, estado) {
    const fecha = fechaRegistroInput.value;
    
    if (!contextoActual.registros) {
        contextoActual.registros = {};
    }
    
    if (!contextoActual.registros[fecha]) {
        contextoActual.registros[fecha] = [];
    }
    
    const alumno = alumnos[indice];
    const registroExistente = contextoActual.registros[fecha].find(r => r.id === alumno.id);
    
    if (registroExistente) {
        registroExistente.estado = estado;
    } else {
        contextoActual.registros[fecha].push({
            id: alumno.id,
            estado: estado
        });
    }
    
    guardarContextos();
    renderizarRegistro();
}

/**
 * Guarda el registro de asistencia del día
 */
function guardarRegistro() {
    const fecha = fechaRegistroInput.value;
    
    if (!fecha) {
        mostrarToast('❌ Selecciona una fecha');
        return;
    }
    
    guardarContextos();
    mostrarToast(`✅ Registro del ${fecha} guardado correctamente`);
}

// ==========================================
// PERSISTENCIA DE DATOS
// ==========================================

/**
 * Guarda los datos actuales en localStorage
 */
function guardarDatos() {
    if (!contextoActual) return;
    
    contextoActual.alumnos = alumnos;
    contextoActual.totalClases = parseInt(totalClasesInput.value) || 82;
    contextoActual.ultimaModificacion = new Date().toISOString();
    
    contextos[contextoActual.nombre] = contextoActual;
    guardarContextos();
}

// ==========================================
// IMPRESIÓN
// ==========================================

/**
 * Muestra el modal de impresión institucional
 */
function mostrarModalImprimir() {
    modalImprimir.classList.remove('oculto');
    institucionInput.focus();
}

/**
 * Prepara e imprime la planilla con datos institucionales
 */
function imprimirPlanilla() {
    const institucion = institucionInput.value || 'Institución Educativa';
    const curso = cursoImprimirInput.value || '';
    const division = divisionImprimirInput.value || '';
    const ciclo = cicloImprimirInput.value || '';
    const periodo = periodoImprimirInput.value || '';
    const docente = docenteImprimirInput.value || '';
    const fecha = fechaImpresionInput.value || '';
    const observaciones = observacionesImprimirInput.value || '';
    
    // Generar HTML para impresión
    const htmlImpresion = `
        <div class="impresion-encabezado">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : ''}
            <div class="datos">
                <h2>${institucion}</h2>
                <p><strong>Curso:</strong> ${curso} ${division ? `- ${division}` : ''}</p>
                <p><strong>Ciclo lectivo:</strong> ${ciclo}</p>
                <p><strong>Período:</strong> ${periodo}</p>
                <p><strong>Docente:</strong> ${docente}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                ${observaciones ? `<p><strong>Observaciones:</strong> ${observaciones}</p>` : ''}
            </div>
        </div>
        ${document.querySelector('.tablaCard').outerHTML}
        <footer class="print-footer">
            <p>Documento generado automáticamente - ${new Date().toLocaleDateString('es-AR')}</p>
        </footer>
    `;
    
    const contenedor = document.getElementById('impresionContenedor');
    contenedor.innerHTML = htmlImpresion;
    contenedor.classList.remove('oculto');
    
    window.print();
    
    setTimeout(() => {
        contenedor.classList.add('oculto');
        contenedor.innerHTML = '';
    }, 1000);
    
    modalImprimir.classList.add('oculto');
}

/**
 * Procesa la carga del logo institucional
 */
function procesarLogo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        logoBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Muestra una notificación toast
 */
function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('mostrar');
    
    setTimeout(() => {
        toast.classList.remove('mostrar');
    }, 3000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', inicializar);

// Botones de contexto
btnNuevoContexto.addEventListener('click', mostrarModalNuevoContexto);
btnCargarContexto.addEventListener('click', cargarContextoSeleccionado);
guardarContextoBtn.addEventListener('click', guardarContexto);
cancelarContextoBtn.addEventListener('click', () => modalContexto.classList.add('oculto'));

// Formulario de alumnos
btnAgregar.addEventListener('click', agregarAlumno);

// Buscador
buscador.addEventListener('input', buscarAlumno);

// Ordenamiento de columnas
document.querySelectorAll('.ordenable').forEach(th => {
    th.addEventListener('click', () => {
        ordenarTabla(th.dataset.columna);
    });
});

// Selección múltiple
seleccionarTodoCheckbox.addEventListener('change', seleccionarTodos);
btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);
btnDeshacer.addEventListener('click', deshacer);

// Modal de edición
guardarEdicionBtn.addEventListener('click', guardarEdicion);
cancelarEdicionBtn.addEventListener('click', () => modalEditar.classList.add('oculto'));

// Impresión
document.getElementById('btnImprimir')?.addEventListener('click', mostrarModalImprimir);
confirmarImprimirBtn.addEventListener('click', imprimirPlanilla);
cancelarImprimirBtn.addEventListener('click', () => modalImprimir.classList.add('oculto'));
logoInstitucionInput.addEventListener('change', procesarLogo);

// Registro diario
fechaRegistroInput.addEventListener('change', renderizarRegistro);
btnGuardarRegistro.addEventListener('click', guardarRegistro);
btnImprimirRegistro.addEventListener('click', () => window.print());

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modalContexto) modalContexto.classList.add('oculto');
    if (e.target === modalEditar) modalEditar.classList.add('oculto');
    if (e.target === modalImprimir) modalImprimir.classList.add('oculto');
});

// Tecla Escape para cerrar modales
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modalContexto.classList.add('oculto');
        modalEditar.classList.add('oculto');
        modalImprimir.classList.add('oculto');
    }
});
