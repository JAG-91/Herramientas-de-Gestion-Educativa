/**
 * ==========================================
 * PLANILLA DE PORCENTAJE DE ASISTENCIAS
 * planilla-asistencia.js
 * 
 * Este archivo JavaScript contiene toda la lógica para:
 * - Gestión de alumnos (agregar, editar, eliminar)
 * - Cálculo de porcentajes de inasistencia
 * - Manejo de múltiples planillas
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

// Array principal que almacena los datos de los alumnos
let alumnos = [];

// Índice del alumno que se está editando actualmente
let indiceEdicion = null;

// Columna por la cual se ordenó la tabla la última vez
let columnaOrden = null;

// Dirección del ordenamiento (true = ascendente, false = descendente)
let ascendente = true;

// Objeto que contiene todas las planillas (nombre -> datos)
let planillas = {};

// Nombre de la planilla actualmente seleccionada
let planillaActual = "Principal";

// Set que contiene los índices de los alumnos seleccionados
let seleccionados = new Set();

// Estado anterior para funcionalidad de deshacer
let estadoAnterior = null;

// ==========================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ==========================================

// Inputs principales
const totalClasesInput = document.getElementById("totalClases");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const inasistenciasInput = document.getElementById("inasistencias");
const btnAgregar = document.getElementById("btnAgregar");

// Elementos de la tabla
const cuerpoTabla = document.getElementById("cuerpoTabla");
const buscador = document.getElementById("buscarAlumno");

// Notificación toast
const toast = document.getElementById("toast");

// Gestión de planillas
const selectorPlanilla = document.getElementById("selectorPlanilla");
const nombrePlanillaInput = document.getElementById("nombrePlanilla");

// Elementos de estadísticas
const cantidadAlumnosEl = document.getElementById("cantidadAlumnos");
const promedioCursoEl = document.getElementById("promedioCurso");
const mayorPorcentajeEl = document.getElementById("mayorPorcentaje");
const menorPorcentajeEl = document.getElementById("menorPorcentaje");
const ultimaModificacionEl = document.getElementById("ultimaModificacion");

// Elementos para selección múltiple
const seleccionarTodoCheckbox = document.getElementById("seleccionarTodo");
const btnEliminarSeleccionados = document.getElementById("btnEliminarSeleccionados");
const btnDeshacer = document.getElementById("btnDeshacer");

// Elementos del modal de edición
const modalEditar = document.getElementById("modalEditar");
const editarNombreInput = document.getElementById("editarNombre");
const editarApellidoInput = document.getElementById("editarApellido");
const editarInasistenciasInput = document.getElementById("editarInasistencias");
const guardarEdicionBtn = document.getElementById("guardarEdicion");
const cancelarEdicionBtn = document.getElementById("cancelarEdicion");

// Elementos del modal de impresión
const modalImprimir = document.getElementById("modalImprimir");
const institucionInput = document.getElementById("institucion");
const logoInstitucionInput = document.getElementById("logoInstitucion");
const cursoImprimirInput = document.getElementById("cursoImprimir");
const divisionImprimirInput = document.getElementById("divisionImprimir");
const cicloImprimirInput = document.getElementById("cicloImprimir");
const periodoImprimirInput = document.getElementById("periodoImprimir");
const docenteImprimirInput = document.getElementById("docenteImprimir");
const fechaImpresionInput = document.getElementById("fechaImpresion");
const observacionesImprimirInput = document.getElementById("observacionesImprimir");
const confirmarImprimirBtn = document.getElementById("confirmarImprimir");
const cancelarImprimirBtn = document.getElementById("cancelarImprimir");

// ==========================================
// INICIALIZACIÓN
// ==========================================

/**
 * Se ejecuta cuando el DOM está completamente cargado.
 * Carga los datos guardados y renderiza la tabla inicial.
 */
document.addEventListener("DOMContentLoaded", iniciar);

function iniciar() {
    cargarDatos();
    renderizarTabla();
    actualizarEstadisticas();
}

// ==========================================
// EVENT LISTENERS PRINCIPALES
// ==========================================

// Botón para agregar nuevo alumno
btnAgregar.addEventListener("click", agregarAlumno);

// Botón para crear nueva planilla
document.getElementById("btnNuevaPlanilla").addEventListener("click", crearPlanilla);

// Botón para eliminar planilla completa
document.getElementById("btnEliminarPlanilla").addEventListener("click", eliminarPlanillaCompleta);

// Botón para abrir modal de impresión
document.getElementById("btnImprimir").addEventListener("click", abrirModalImprimir);

// Cambio de planilla en el selector
selectorPlanilla.addEventListener("change", cambiarPlanilla);

// Checkbox "Seleccionar todos"
seleccionarTodoCheckbox.addEventListener("change", toggleSeleccionarTodos);

// Eliminar alumnos seleccionados
btnEliminarSeleccionados.addEventListener("click", eliminarSeleccionados);

// Botón deshacer
btnDeshacer.addEventListener("click", deshacer);

// Input de total de clases - recalcula porcentajes
totalClasesInput.addEventListener("input", () => {
    guardarDatos();
    renderizarTabla();
    actualizarEstadisticas();
});

// Buscador de alumnos
buscador.addEventListener("input", filtrarTabla);

// Ordenamiento por columnas
document.querySelectorAll(".ordenable").forEach(th => {
    th.addEventListener("click", () => {
        ordenar(th.dataset.columna);
    });
});

// ==========================================
// EVENTOS DEL MODAL DE EDICIÓN
// ==========================================

// Cancelar edición
cancelarEdicionBtn.addEventListener("click", () => {
    modalEditar.classList.add("oculto");
});

// Guardar edición
guardarEdicionBtn.addEventListener("click", () => {
    const clases = Number(totalClasesInput.value);
    const inasistencias = Number(editarInasistenciasInput.value);

    // Validaciones
    if (isNaN(inasistencias)) {
        mostrarToast("Ingrese las inasistencias.");
        return;
    }

    if (inasistencias < 0) {
        mostrarToast("Las inasistencias no pueden ser negativas.");
        return;
    }

    if (inasistencias > clases) {
        mostrarToast("Las inasistencias superan las clases.");
        return;
    }

    // Guardar estado anterior para poder deshacer
    guardarEstadoAnterior();

    // Actualizar datos del alumno
    alumnos[indiceEdicion] = {
        nombre: editarNombreInput.value.trim(),
        apellido: editarApellidoInput.value.trim(),
        inasistencias: inasistencias
    };

    guardarDatos();
    renderizarTabla();
    actualizarEstadisticas();
    modalEditar.classList.add("oculto");
    mostrarToast("Alumno actualizado.");
});

// Cerrar modal al hacer clic fuera
window.addEventListener("click", (e) => {
    if (e.target === modalEditar) {
        modalEditar.classList.add("oculto");
    }
});

// ==========================================
// EVENTOS DEL MODAL DE IMPRESIÓN
// ==========================================

// Cargar logo como DataURL
logoInstitucionInput.addEventListener('change', e => manejarLogoCarga(e.target.files && e.target.files[0]));

// Confirmar impresión
confirmarImprimirBtn.addEventListener('click', prepararImpresion);

// Cancelar impresión
cancelarImprimirBtn.addEventListener('click', cancelarImpresion);

// Persistir datos institucionales cuando cambian
institucionInput.addEventListener('input', guardarDatosInstitucionales);
cursoImprimirInput.addEventListener('input', guardarDatosInstitucionales);
divisionImprimirInput.addEventListener('input', guardarDatosInstitucionales);
cicloImprimirInput.addEventListener('input', guardarDatosInstitucionales);
periodoImprimirInput.addEventListener('input', guardarDatosInstitucionales);
docenteImprimirInput.addEventListener('input', guardarDatosInstitucionales);
observacionesImprimirInput.addEventListener('input', guardarDatosInstitucionales);

// ==========================================
// FUNCIONES PRINCIPALES - GESTIÓN DE ALUMNOS
// ==========================================

/**
 * Agrega un nuevo alumno a la lista.
 * Valida que los datos sean correctos antes de agregar.
 */
function agregarAlumno() {
    const clases = Number(totalClasesInput.value);

    // Validar que se haya ingresado el total de clases
    if (clases <= 0 || isNaN(clases)) {
        mostrarToast("Ingrese la cantidad total de clases efectivas.");
        return;
    }

    const inasistencias = Number(inasistenciasInput.value);

    // Validar que se hayan ingresado las inasistencias
    if (isNaN(inasistencias)) {
        mostrarToast("Ingrese las inasistencias.");
        return;
    }

    // Validar que las inasistencias no sean negativas
    if (inasistencias < 0) {
        mostrarToast("Las inasistencias no pueden ser negativas.");
        return;
    }

    // Validar que las inasistencias no superen el total de clases
    if (inasistencias > clases) {
        mostrarToast("Las inasistencias superan las clases.");
        return;
    }

    // Guardar estado anterior para poder deshacer
    guardarEstadoAnterior();

    // Agregar alumno al array
    alumnos.push({
        nombre: nombreInput.value.trim(),
        apellido: apellidoInput.value.trim(),
        inasistencias: inasistencias
    });

    // Limpiar formulario
    limpiarFormulario();

    // Guardar y actualizar UI
    guardarDatos();
    renderizarTabla();
    actualizarEstadisticas();

    mostrarToast("Alumno agregado.");
}

/**
 * Limpia los campos del formulario de agregar alumno.
 */
function limpiarFormulario() {
    nombreInput.value = "";
    apellidoInput.value = "";
    inasistenciasInput.value = "";
    nombreInput.focus();
}

// ==========================================
// CÁLCULO DE PORCENTAJES
// ==========================================

/**
 * Calcula el porcentaje de inasistencia basado en el total de clases.
 * @param {number} inasistencias - Cantidad de inasistencias del alumno
 * @returns {number} Porcentaje de inasistencia (0-100)
 */
function calcularPorcentaje(inasistencias) {
    const clases = Number(totalClasesInput.value);
    if (clases <= 0) return 0;
    return (inasistencias / clases) * 100;
}

/**
 * Determina la clase CSS según el porcentaje de inasistencia.
 * - Verde: hasta 10%
 * - Amarillo: hasta 25%
 * - Rojo: más de 25%
 * @param {number} valor - Porcentaje de inasistencia
 * @returns {string} Clase CSS correspondiente
 */
function clasePorcentaje(valor) {
    if (valor <= 10) return "porcentaje-alto";
    if (valor <= 25) return "porcentaje-medio";
    return "porcentaje-bajo";
}

// ==========================================
// RENDERIZADO DE TABLA
// ==========================================

/**
 * Renderiza la tabla de alumnos en el DOM.
 * @param {Array} lista - Lista de alumnos a mostrar (por defecto, todos)
 */
function renderizarTabla(lista = alumnos) {
    cuerpoTabla.innerHTML = "";

    lista.forEach((alumno, indice) => {
        // Encontrar el índice real en el array original (para selección)
        const indiceAlumno = alumnos.indexOf(alumno);

        // Calcular porcentaje de inasistencia
        const porcentaje = calcularPorcentaje(alumno.inasistencias);

        // Crear fila de tabla
        const fila = document.createElement("tr");

        // Marcar como seleccionada si corresponde
        const esSeleccionado = seleccionados.has(indiceAlumno);
        if (esSeleccionado) fila.classList.add("seleccionada");

        // Construir HTML de la fila
        fila.innerHTML = `
            <td class="colCheck">
                <input type="checkbox" class="chkAlumno" data-indice="${indiceAlumno}" ${esSeleccionado ? "checked" : ""}>
            </td>
            <td>${indice + 1}</td>
            <td>${alumno.nombre}</td>
            <td>${alumno.apellido}</td>
            <td>${alumno.inasistencias}</td>
            <td class="${clasePorcentaje(porcentaje)}">${Math.round(porcentaje)}%</td>
            <td>
                <button class="btnEditar" onclick="abrirEdicion(${indiceAlumno})">✏️</button>
                <button class="btnEliminar" onclick="eliminarAlumnoConConfirmacion(${indiceAlumno})">🗑️</button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);
    });

    // Agregar listeners a los checkboxes generados
    document.querySelectorAll(".chkAlumno").forEach(chk => {
        chk.addEventListener("change", (e) => {
            const indice = parseInt(e.target.dataset.indice);
            if (e.target.checked) {
                seleccionados.add(indice);
            } else {
                seleccionados.delete(indice);
            }
            actualizarEstadoBotones();
            renderizarTabla(lista);
        });
    });

    actualizarEstadoBotones();
}

// ==========================================
// ESTADÍSTICAS
// ==========================================

/**
 * Actualiza las estadísticas mostradas en la interfaz.
 * Incluye: cantidad de alumnos, promedio, mayor/menor porcentaje, última modificación.
 */
function actualizarEstadisticas() {
    cantidadAlumnosEl.textContent = alumnos.length;

    if (alumnos.length === 0) {
        promedioCursoEl.textContent = "0%";
        mayorPorcentajeEl.textContent = "—";
        menorPorcentajeEl.textContent = "—";
        ultimaModificacionEl.textContent = "—";
        return;
    }

    let suma = 0;
    let mayor = -1;
    let menor = 101;

    alumnos.forEach(a => {
        const p = calcularPorcentaje(a.inasistencias);
        suma += p;
        if (p > mayor) mayor = p;
        if (p < menor) menor = p;
    });

    promedioCursoEl.textContent = Math.round(suma / alumnos.length) + "%";
    mayorPorcentajeEl.textContent = Math.round(mayor) + "%";
    menorPorcentajeEl.textContent = Math.round(menor) + "%";
    ultimaModificacionEl.textContent = obtenerFechaModificacion();
}

/**
 * Obtiene la fecha de última modificación formateada.
 * @returns {string} Fecha y hora formateadas
 */
function obtenerFechaModificacion() {
    if (!planillas[planillaActual]) return "—";
    const fecha = planillas[planillaActual].ultimaModificacion;
    if (!fecha) return "—";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-ES") + " " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// ==========================================
// PERSISTENCIA EN LOCALSTORAGE
// ==========================================

/**
 * Guarda los datos actuales en localStorage.
 * Almacena todas las planillas y la planilla actual.
 */
function guardarDatos() {
    planillas[planillaActual] = {
        alumnos: alumnos,
        clases: totalClasesInput.value,
        ultimaModificacion: new Date().toISOString()
    };
    localStorage.setItem("planillas", JSON.stringify(planillas));
    actualizarEstadisticas();
}

/**
 * Guarda el estado actual para permitir deshacer acciones.
 */
function guardarEstadoAnterior() {
    estadoAnterior = {
        alumnos: JSON.parse(JSON.stringify(alumnos)),
        totalClases: totalClasesInput.value
    };
    btnDeshacer.disabled = false;
}

/**
 * Carga los datos desde localStorage.
 * Maneja migración desde versiones antiguas.
 */
function cargarDatos() {
    const datosGuardados = localStorage.getItem("planillas");

    if (datosGuardados) {
        try {
            planillas = JSON.parse(datosGuardados);
            planillaActual = localStorage.getItem("planillaActual") || Object.keys(planillas)[0];

            // Si la planilla actual no existe, usar la primera disponible
            if (!planillas[planillaActual]) {
                planillaActual = Object.keys(planillas)[0] || "Principal";
                if (!planillas[planillaActual]) {
                    planillas[planillaActual] = { alumnos: [], clases: "" };
                }
            }

            cargarPlanillaActual();
        } catch (e) {
            console.error("Error al cargar datos", e);
            planillas = { "Principal": { alumnos: [], clases: "" } };
            planillaActual = "Principal";
        }
    } else {
        // Migración desde versión antigua (sin soporte de múltiples planillas)
        const datos = localStorage.getItem("alumnos");
        const clases = localStorage.getItem("clases");
        alumnos = datos ? JSON.parse(datos).map(normalizarAlumno) : [];
        totalClasesInput.value = clases || "";

        planillas[planillaActual] = {
            alumnos: alumnos,
            clases: totalClasesInput.value,
            ultimaModificacion: new Date().toISOString()
        };
        guardarDatos();
    }

    actualizarSelectorPlanillas();
    cargarDatosInstitucionales();
}

/**
 * Normaliza los datos de un alumno para asegurar consistencia.
 * @param {Object} alumno - Datos del alumno
 * @returns {Object} Alumno normalizado
 */
function normalizarAlumno(alumno) {
    return {
        nombre: alumno.nombre || "",
        apellido: alumno.apellido || "",
        inasistencias: Number(alumno.inasistencias ?? alumno.asistencias ?? 0)
    };
}

/**
 * Carga los datos de la planilla actualmente seleccionada.
 */
function cargarPlanillaActual() {
    const planilla = planillas[planillaActual] || { alumnos: [], clases: "" };
    alumnos = (planilla.alumnos || []).map(normalizarAlumno);
    totalClasesInput.value = planilla.clases || "";
    buscador.value = "";
}

/**
 * Actualiza el selector desplegable de planillas.
 */
function actualizarSelectorPlanillas() {
    selectorPlanilla.innerHTML = "";
    Object.keys(planillas).forEach(nombre => {
        const opcion = document.createElement("option");
        opcion.value = nombre;
        opcion.textContent = nombre;
        opcion.selected = nombre === planillaActual;
        selectorPlanilla.appendChild(opcion);
    });
}

/**
 * Cambia a una planilla diferente.
 */
function cambiarPlanilla() {
    guardarDatos();
    planillaActual = selectorPlanilla.value;
    localStorage.setItem("planillaActual", planillaActual);
    seleccionados.clear();
    cargarPlanillaActual();
    buscador.value = "";
    renderizarTabla();
    actualizarEstadisticas();
}

/**
 * Crea una nueva planilla vacía.
 */
function crearPlanilla() {
    const nombre = nombrePlanillaInput.value.trim();

    if (!nombre) {
        mostrarToast("Ingrese un nombre para la planilla.");
        return;
    }

    if (planillas[nombre]) {
        mostrarToast("Ya existe una planilla con ese nombre.");
        return;
    }

    guardarDatos();
    planillaActual = nombre;
    planillas[planillaActual] = { alumnos: [], clases: "", ultimaModificacion: new Date().toISOString() };
    localStorage.setItem("planillaActual", planillaActual);
    guardarDatos();

    nombrePlanillaInput.value = "";
    seleccionados.clear();
    cargarPlanillaActual();
    actualizarSelectorPlanillas();
    renderizarTabla();
    actualizarEstadisticas();

    mostrarToast("Planilla creada.");
}

/**
 * Elimina la planilla actualmente seleccionada.
 */
function eliminarPlanillaCompleta() {
    const nombrePlanilla = planillaActual;

    // No permitir eliminar la única planilla
    if (Object.keys(planillas).length === 1) {
        mostrarToast("No se puede eliminar la única planilla. Cree una nueva primero.");
        return;
    }

    if (!confirm(`¿Está seguro de que desea eliminar la planilla "${nombrePlanilla}"?\n\nEsta acción es irreversible.`)) {
        return;
    }

    delete planillas[nombrePlanilla];
    localStorage.setItem("planillas", JSON.stringify(planillas));

    planillaActual = Object.keys(planillas)[0];
    localStorage.setItem("planillaActual", planillaActual);

    seleccionados.clear();
    cargarPlanillaActual();
    actualizarSelectorPlanillas();
    renderizarTabla();
    actualizarEstadisticas();

    mostrarToast(`Planilla "${nombrePlanilla}" eliminada.`);
}

// ==========================================
// EDICIÓN Y ELIMINACIÓN DE ALUMNOS
// ==========================================

/**
 * Abre el modal de edición con los datos de un alumno.
 * @param {number} indice - Índice del alumno en el array
 */
function abrirEdicion(indice) {
    indiceEdicion = indice;
    const alumno = alumnos[indice];
    editarNombreInput.value = alumno.nombre;
    editarApellidoInput.value = alumno.apellido;
    editarInasistenciasInput.value = alumno.inasistencias;
    modalEditar.classList.remove("oculto");
}

/**
 * Elimina un alumno después de confirmar.
 * @param {number} indice - Índice del alumno a eliminar
 */
function eliminarAlumnoConConfirmacion(indice) {
    if (!confirm("¿Está seguro de que desea eliminar este alumno?")) {
        return;
    }

    guardarEstadoAnterior();
    alumnos.splice(indice, 1);
    seleccionados.delete(indice);
    guardarDatos();
    renderizarTabla();
    actualizarEstadisticas();
    mostrarToast("Alumno eliminado.");
}

/**
 * Elimina todos los alumnos seleccionados.
 */
function eliminarSeleccionados() {
    if (seleccionados.size === 0) {
        mostrarToast("No hay alumnos seleccionados.");
        return;
    }

    if (!confirm(`¿Está seguro de que desea eliminar ${seleccionados.size} alumno(s)?`)) {
        return;
    }

    guardarEstadoAnterior();

    // Eliminar en orden inverso para no afectar los índices
    const indices = Array.from(seleccionados).sort((a, b) => b - a);
    indices.forEach(i => alumnos.splice(i, 1));

    seleccionados.clear();
    guardarDatos();
    renderizarTabla();
    actualizarEstadisticas();

    mostrarToast(`${indices.length} alumno(s) eliminado(s).`);
}

// ==========================================
// BÚSQUEDA Y ORDENAMIENTO
// ==========================================

/**
 * Filtra la tabla según el texto ingresado en el buscador.
 */
function filtrarTabla() {
    const texto = buscador.value.toLowerCase().trim();

    const filtrados = alumnos.filter(a => {
        return (
            a.nombre.toLowerCase().includes(texto) ||
            a.apellido.toLowerCase().includes(texto)
        );
    });

    renderizarTabla(filtrados);
}

/**
 * Ordena la tabla por la columna especificada.
 * @param {string} columna - Nombre de la columna por la cual ordenar
 */
function ordenar(columna) {
    // Invertir dirección si ya estaba ordenado por esta columna
    if (columnaOrden === columna) {
        ascendente = !ascendente;
    } else {
        columnaOrden = columna;
        ascendente = true;
    }

    // Función de comparación según la columna
    alumnos.sort((a, b) => {
        let A, B;

        switch (columna) {
            case "nombre":
                A = a.nombre.toLowerCase();
                B = b.nombre.toLowerCase();
                break;
            case "apellido":
                A = a.apellido.toLowerCase();
                B = b.apellido.toLowerCase();
                break;
            case "inasistencias":
                A = a.inasistencias;
                B = b.inasistencias;
                break;
            case "porcentaje":
                A = calcularPorcentaje(a.inasistencias);
                B = calcularPorcentaje(b.inasistencias);
                break;
        }

        if (A < B) return ascendente ? -1 : 1;
        if (A > B) return ascendente ? 1 : -1;
        return 0;
    });

    guardarDatos();
    renderizarTabla();
}

// ==========================================
// SISTEMA DESHACER
// ==========================================

/**
 * Deshace la última acción realizada.
 * Restaura el estado anterior de alumnos y total de clases.
 */
function deshacer() {
    if (!estadoAnterior) {
        mostrarToast("No hay acción para deshacer.");
        return;
    }

    alumnos = JSON.parse(JSON.stringify(estadoAnterior.alumnos));
    totalClasesInput.value = estadoAnterior.totalClases;
    estadoAnterior = null;
    seleccionados.clear();

    guardarDatos();
    renderizarTabla();
    actualizarEstadisticas();

    mostrarToast("Acción deshecha.");
}

// ==========================================
// SELECCIÓN MÚLTIPLE
// ==========================================

/**
 * Activa o desactiva la selección de todos los alumnos.
 */
function toggleSeleccionarTodos() {
    if (seleccionarTodoCheckbox.checked) {
        alumnos.forEach((_, indice) => seleccionados.add(indice));
    } else {
        seleccionados.clear();
    }
    renderizarTabla();
    actualizarEstadoBotones();
}

/**
 * Actualiza el estado de los botones según la selección.
 */
function actualizarEstadoBotones() {
    const haySeleccionados = seleccionados.size > 0;
    btnEliminarSeleccionados.disabled = !haySeleccionados;
    seleccionarTodoCheckbox.checked = seleccionados.size === alumnos.length && alumnos.length > 0;
}

// ==========================================
// DATOS INSTITUCIONALES E IMPRESIÓN
// ==========================================

/**
 * Guarda los datos institucionales en localStorage.
 */
function guardarDatosInstitucionales() {
    const datos = {
        institucion: institucionInput.value.trim(),
        logo: logoInstitucionInput._dataUrl || null,
        curso: cursoImprimirInput.value.trim(),
        division: divisionImprimirInput.value.trim(),
        ciclo: cicloImprimirInput.value.trim(),
        periodo: periodoImprimirInput.value.trim(),
        docente: docenteImprimirInput.value.trim(),
        observaciones: observacionesImprimirInput.value.trim()
    };
    localStorage.setItem('datosInstitucionales', JSON.stringify(datos));
}

/**
 * Carga los datos institucionales desde localStorage.
 */
function cargarDatosInstitucionales() {
    const raw = localStorage.getItem('datosInstitucionales');
    if (!raw) return;

    try {
        const datos = JSON.parse(raw);
        institucionInput.value = datos.institucion || '';
        cursoImprimirInput.value = datos.curso || '';
        divisionImprimirInput.value = datos.division || '';
        cicloImprimirInput.value = datos.ciclo || '';
        periodoImprimirInput.value = datos.periodo || '';
        docenteImprimirInput.value = datos.docente || '';
        observacionesImprimirInput.value = datos.observaciones || '';

        if (datos.logo) {
            logoInstitucionInput._dataUrl = datos.logo;
        }
    } catch (e) {
        console.error('Error cargando datos institucionales', e);
    }
}

/**
 * Maneja la carga del logo institucional como DataURL.
 * @param {File} file - Archivo de imagen seleccionado
 */
function manejarLogoCarga(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        logoInstitucionInput._dataUrl = e.target.result;
        guardarDatosInstitucionales();
    };
    reader.readAsDataURL(file);
}

/**
 * Abre el modal de impresión y carga datos institucionales.
 */
function abrirModalImprimir() {
    cargarDatosInstitucionales();
    // Establecer fecha actual por defecto si está vacía
    if (!fechaImpresionInput.value) {
        const hoy = new Date();
        fechaImpresionInput.value = hoy.toISOString().slice(0, 10);
    }
    modalImprimir.classList.remove('oculto');
}

/**
 * Cierra el modal de impresión.
 */
function cancelarImpresion() {
    modalImprimir.classList.add('oculto');
}

/**
 * Prepara y ejecuta la impresión de la planilla.
 * Genera un encabezado institucional y lanza el diálogo de impresión.
 */
function prepararImpresion() {
    // Guardar datos institucionales
    guardarDatosInstitucionales();

    // Crear contenedor de impresión
    let cont = document.getElementById('impresionContenido');
    if (cont) cont.remove();
    cont = document.createElement('div');
    cont.id = 'impresionContenido';
    cont.className = 'impresion-contenedor';

    const datos = JSON.parse(localStorage.getItem('datosInstitucionales') || '{}');

    // Crear encabezado
    const header = document.createElement('div');
    header.className = 'impresion-encabezado';

    // Agregar logo si existe
    if (datos.logo) {
        const img = document.createElement('img');
        img.src = datos.logo;
        img.alt = 'Logo';
        header.appendChild(img);
    }

    // Agregar información institucional
    const txt = document.createElement('div');
    txt.className = 'datos';
    const h1 = document.createElement('h2');
    h1.textContent = datos.institucion || '';
    h1.style.margin = '0';
    const info = document.createElement('div');
    info.innerHTML = `
        <strong>Curso:</strong> ${datos.curso || ''} &nbsp;
        <strong>División:</strong> ${datos.division || ''} &nbsp;
        <strong>Ciclo:</strong> ${datos.ciclo || ''} &nbsp;
        <strong>Período:</strong> ${datos.periodo || ''} &nbsp;
        <strong>Docente:</strong> ${datos.docente || ''} &nbsp;
        <strong>Fecha impresión:</strong> ${fechaImpresionInput.value || ''}
    `;
    txt.appendChild(h1);
    txt.appendChild(info);
    header.appendChild(txt);

    cont.appendChild(header);

    // Agregar resumen
    const resumen = document.createElement('div');
    resumen.style.margin = '8px 0 12px 0';
    resumen.innerHTML = `<strong>Clases efectivas:</strong> ${totalClasesInput.value || '-'} &nbsp; <strong>Alumnos:</strong> ${alumnos.length}`;
    cont.appendChild(resumen);

    // Agregar observaciones si existen
    if (datos.observaciones) {
        const obs = document.createElement('div');
        obs.style.marginTop = '12px';
        obs.innerHTML = `<strong>Observaciones:</strong> ${datos.observaciones}`;
        cont.appendChild(obs);
    }

    // Agregar pie para firma
    const footer = document.createElement('footer');
    footer.className = 'print-footer';
    footer.innerHTML = `<div style="margin-top:28px;">______________________________<br>Firma del docente</div>`;
    cont.appendChild(footer);

    document.body.appendChild(cont);

    // Cerrar modal y ejecutar impresión
    modalImprimir.classList.add('oculto');
    setTimeout(() => {
        window.print();
        // Limpiar contenedor después de imprimir
        setTimeout(() => {
            const c = document.getElementById('impresionContenido');
            if (c) c.remove();
        }, 1000);
    }, 200);
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Muestra una notificación toast temporal.
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add("mostrar");
    clearTimeout(mostrarToast.temporizador);
    mostrarToast.temporizador = setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 2500);
}
