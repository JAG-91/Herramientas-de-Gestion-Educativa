// ==========================================
// REGISTRO DE ASISTENCIA DIARIA
// registro.js
// ==========================================

// ---------- Constantes de estados ----------
const ESTADOS_ASISTENCIA = {
    PRESENTE: 'presente',
    AUSENTE: 'ausente',
    TARDE: 'tarde',
    JUSTIFICADO: 'justificado'
};

const ESTADOS_INFO = {
    [ESTADOS_ASISTENCIA.PRESENTE]: { label: '✅ Presente', clase: 'estado-presente' },
    [ESTADOS_ASISTENCIA.AUSENTE]: { label: '❌ Ausente', clase: 'estado-ausente' },
    [ESTADOS_ASISTENCIA.TARDE]: { label: '⏰ Tarde', clase: 'estado-tarde' },
    [ESTADOS_ASISTENCIA.JUSTIFICADO]: { label: '📄 Justificado', clase: 'estado-justificado' }
};

// ---------- Variables ----------
let planillas = {};
let planillaActual = null;
let alumnos = [];
let registrosAsistencia = {};

// ---------- Elementos del DOM ----------
const selectorPlanilla = document.getElementById('selectorPlanillaAsistencia');
const fechaRegistro = document.getElementById('fechaRegistro');
const cuerpoTabla = document.getElementById('cuerpoTablaAsistencia');
const infoCurso = document.getElementById('infoCurso');
const infoDivision = document.getElementById('infoDivision');
const infoTotalAlumnos = document.getElementById('infoTotalAlumnos');
const toast = document.getElementById('toast');

// Modal de impresión (usando IDs estándar)
const modalImprimir = document.getElementById('modalImprimir');
const printInstitucion = document.getElementById('printInstitucion');
const printLogo = document.getElementById('printLogo');
const printCurso = document.getElementById('printCurso');
const printDivision = document.getElementById('printDivision');
const printCiclo = document.getElementById('printCiclo');
const printPeriodo = document.getElementById('printPeriodo');
const printDocente = document.getElementById('printDocente');
const printFecha = document.getElementById('printFecha');
const printObservaciones = document.getElementById('printObservaciones');
const btnConfirmarImpresion = document.getElementById('btnConfirmarImpresion');
const btnCancelarImpresion = document.getElementById('btnCancelarImpresion');

// Botones
const btnGuardarRegistro = document.getElementById('btnGuardarRegistro');
const btnImprimirRegistro = document.getElementById('btnImprimirRegistro');
const btnMarcarTodosPresentes = document.getElementById('btnMarcarTodosPresentes');

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
    // Establecer fecha por defecto (hoy)
    const hoy = new Date();
    fechaRegistro.value = hoy.toISOString().slice(0, 10);
    
    // Cargar datos desde localStorage
    cargarDatos();
    
    // Cargar registros de asistencia existentes
    cargarRegistrosAsistencia();
    
    // Actualizar selector de planillas
    actualizarSelectorPlanillas();
    
    // Si hay planillas, cargar la primera
    if (Object.keys(planillas).length > 0) {
        const primeraPlanilla = Object.keys(planillas)[0];
        selectorPlanilla.value = primeraPlanilla;
        cargarAlumnosDePlanilla(primeraPlanilla);
    } else {
        mostrarToast('No hay planillas creadas. Cree una planilla primero.');
    }
}

// ---------- Funciones de LocalStorage ----------

function cargarDatos() {
    const datosGuardados = localStorage.getItem('planillas');
    if (datosGuardados) {
        try {
            planillas = JSON.parse(datosGuardados);
        } catch (e) {
            console.error('Error al cargar planillas', e);
            planillas = {};
        }
    }
}

function cargarRegistrosAsistencia() {
    const registrosGuardados = localStorage.getItem('registrosAsistencia');
    if (registrosGuardados) {
        try {
            registrosAsistencia = JSON.parse(registrosGuardados);
        } catch (e) {
            console.error('Error al cargar registros de asistencia', e);
            registrosAsistencia = {};
        }
    }
}

function guardarRegistrosAsistencia() {
    localStorage.setItem('registrosAsistencia', JSON.stringify(registrosAsistencia));
}

// ---------- Selector de Planillas ----------

function actualizarSelectorPlanillas() {
    selectorPlanilla.innerHTML = '';
    
    const nombresPlanillas = Object.keys(planillas);
    
    if (nombresPlanillas.length === 0) {
        const opcion = document.createElement('option');
        opcion.value = '';
        opcion.textContent = 'No hay planillas disponibles';
        selectorPlanilla.appendChild(opcion);
        return;
    }
    
    nombresPlanillas.forEach(nombre => {
        const opcion = document.createElement('option');
        opcion.value = nombre;
        opcion.textContent = nombre;
        selectorPlanilla.appendChild(opcion);
    });
}

// ---------- Cargar Alumnos ----------

function cargarAlumnosDePlanilla(nombrePlanilla) {
    planillaActual = nombrePlanilla;
    
    if (!planillas[nombrePlanilla]) {
        alumnos = [];
        renderizarTabla();
        actualizarInfoDia();
        return;
    }
    
    alumnos = planillas[nombrePlanilla].alumnos || [];
    
    // Cargar datos institucionales para mostrar curso y división
    cargarDatosInstitucionales();
    
    // Renderizar tabla con los estados guardados o por defecto
    renderizarTabla();
    actualizarInfoDia();
}

function cargarDatosInstitucionales() {
    const raw = localStorage.getItem('datosInstitucionales');
    if (raw) {
        try {
            const datos = JSON.parse(raw);
            infoCurso.textContent = datos.curso || '—';
            infoDivision.textContent = datos.division || '—';
        } catch (e) {
            console.error('Error al cargar datos institucionales', e);
        }
    }
}

function actualizarInfoDia() {
    infoTotalAlumnos.textContent = alumnos.length;
}

// ---------- Renderizar Tabla ----------

function renderizarTabla() {
    cuerpoTabla.innerHTML = '';
    
    if (alumnos.length === 0) {
        const filaVacia = document.createElement('tr');
        filaVacia.innerHTML = '<td colspan="4" style="text-align:center; padding: 30px;">No hay alumnos en esta planilla</td>';
        cuerpoTabla.appendChild(filaVacia);
        return;
    }
    
    const fecha = fechaRegistro.value;
    const registrosDelDia = obtenerRegistrosDelDia(fecha);
    
    alumnos.forEach((alumno, indice) => {
        const estadoGuardado = registrosDelDia[indice] || ESTADOS_ASISTENCIA.PRESENTE;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td>${alumno.apellido || '—'}</td>
            <td>${alumno.nombre || '—'}</td>
            <td>
                <div class="selector-estados">
                    ${renderizarBotonesEstado(indice, estadoGuardado)}
                </div>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    // Agregar listeners a los botones de estado
    document.querySelectorAll('.btn-estado').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const indice = parseInt(e.target.dataset.indice);
            const estado = e.target.dataset.estado;
            seleccionarEstado(indice, estado);
        });
    });
}

function renderizarBotonesEstado(indice, estadoActual) {
    return Object.entries(ESTADOS_INFO).map(([estado, info]) => {
        const activo = estado === estadoActual ? 'activo' : '';
        return `<button 
            class="btn-estado ${info.clase} ${activo}" 
            data-indice="${indice}" 
            data-estado="${estado}"
            title="${info.label}">
            ${info.label.split(' ')[0]}
        </button>`;
    }).join('');
}

function obtenerRegistrosDelDia(fecha) {
    if (!registrosAsistencia[planillaActual]) {
        return {};
    }
    return registrosAsistencia[planillaActual][fecha] || {};
}

// ---------- Selección de Estado ----------

function seleccionarEstado(indice, estado) {
    // Actualizar visualmente los botones
    document.querySelectorAll(`.btn-estado[data-indice="${indice}"]`).forEach(btn => {
        btn.classList.remove('activo');
        if (btn.dataset.estado === estado) {
            btn.classList.add('activo');
        }
    });
    
    // Guardar temporalmente en memoria (se persiste al guardar)
    if (!registrosAsistencia[planillaActual]) {
        registrosAsistencia[planillaActual] = {};
    }
    
    const fecha = fechaRegistro.value;
    if (!registrosAsistencia[planillaActual][fecha]) {
        registrosAsistencia[planillaActual][fecha] = {};
    }
    
    registrosAsistencia[planillaActual][fecha][indice] = estado;
}

// ---------- Acciones Principales ----------

function guardarRegistro() {
    if (alumnos.length === 0) {
        mostrarToast('No hay alumnos para registrar asistencia.');
        return;
    }
    
    const fecha = fechaRegistro.value;
    const registrosDelDia = obtenerRegistrosDelDia(fecha);
    
    // Contar estados
    const conteo = {
        [ESTADOS_ASISTENCIA.PRESENTE]: 0,
        [ESTADOS_ASISTENCIA.AUSENTE]: 0,
        [ESTADOS_ASISTENCIA.TARDE]: 0,
        [ESTADOS_ASISTENCIA.JUSTIFICADO]: 0
    };
    
    Object.values(registrosDelDia).forEach(estado => {
        conteo[estado] = (conteo[estado] || 0) + 1;
    });
    
    // Asegurar que todos los alumnos tengan un estado registrado
    alumnos.forEach((_, indice) => {
        if (!registrosDelDia[indice]) {
            registrosDelDia[indice] = ESTADOS_ASISTENCIA.PRESENTE;
        }
    });
    
    // Guardar en localStorage
    if (!registrosAsistencia[planillaActual]) {
        registrosAsistencia[planillaActual] = {};
    }
    registrosAsistencia[planillaActual][fecha] = registrosDelDia;
    guardarRegistrosAsistencia();
    
    mostrarToast(`Registro guardado para el ${formatearFecha(fecha)}. Presentes: ${conteo[ESTADOS_ASISTENCIA.PRESENTE]}, Ausentes: ${conteo[ESTADOS_ASISTENCIA.AUSENTE]}, Tarde: ${conteo[ESTADOS_ASISTENCIA.TARDE]}, Justificados: ${conteo[ESTADOS_ASISTENCIA.JUSTIFICADO]}`);
}

function marcarTodosPresentes() {
    if (alumnos.length === 0) {
        mostrarToast('No hay alumnos para marcar.');
        return;
    }
    
    alumnos.forEach((_, indice) => {
        seleccionarEstado(indice, ESTADOS_ASISTENCIA.PRESENTE);
    });
    
    renderizarTabla();
    mostrarToast('Todos los alumnos marcados como Presentes.');
}

// ---------- Impresión ----------

function abrirModalImprimir() {
    cargarDatosInstitucionalesEnModal();
    // Establecer fecha por defecto (hoy) si está vacía
    if (!printFecha.value) {
        const hoy = new Date();
        printFecha.value = hoy.toISOString().slice(0, 10);
    }
    modalImprimir.classList.remove('oculto');
}

function cancelarImpresion() {
    modalImprimir.classList.add('oculto');
}

function guardarDatosInstitucionalesRegistro() {
    const datos = {
        institucion: printInstitucion.value.trim(),
        logo: printLogo._dataUrl || null,
        curso: printCurso.value.trim(),
        division: printDivision.value.trim(),
        ciclo: printCiclo.value.trim(),
        periodo: printPeriodo.value.trim(),
        docente: printDocente.value.trim(),
        fecha: printFecha.value,
        observaciones: printObservaciones.value.trim()
    };
    localStorage.setItem('datosInstitucionales', JSON.stringify(datos));
}

function cargarDatosInstitucionalesEnModal() {
    const raw = localStorage.getItem('datosInstitucionales');
    if (!raw) return;
    try {
        const datos = JSON.parse(raw);
        printInstitucion.value = datos.institucion || '';
        printCurso.value = datos.curso || '';
        printDivision.value = datos.division || '';
        printCiclo.value = datos.ciclo || '';
        printPeriodo.value = datos.periodo || '';
        printDocente.value = datos.docente || '';
        printFecha.value = datos.fecha || '';
        printObservaciones.value = datos.observaciones || '';
        if (datos.logo) {
            printLogo._dataUrl = datos.logo;
        }
    } catch (e) {
        console.error('Error cargando datos institucionales', e);
    }
}

function manejarLogoCarga(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        input._dataUrl = e.target.result;
    };
    reader.readAsDataURL(file);
}

function imprimirRegistro() {
    if (alumnos.length === 0) {
        mostrarToast('No hay alumnos para imprimir.');
        return;
    }
    
    // Abrir modal para permitir modificar datos institucionales
    abrirModalImprimir();
}

function prepararImpresionRegistro() {
    // Guardar datos institucionales
    guardarDatosInstitucionalesRegistro();

    // Cerrar modal
    modalImprimir.classList.add('oculto');

    // Eliminar contenedores previos de impresión (tanto del registro como de planilla)
    const contenedoresPrevios = document.querySelectorAll('#impresionRegistroContenido, #impresionContenido, #impresionContenidoDiario');
    contenedoresPrevios.forEach(el => el.remove());

    let cont = document.createElement('div');
    cont.id = 'impresionRegistroContenido';
    cont.className = 'impresion-registro-contenedor';

    // Obtener datos institucionales guardados
    const datosInst = JSON.parse(localStorage.getItem('datosInstitucionales') || '{}');

    const fecha = fechaRegistro.value;
    const registrosDelDia = obtenerRegistrosDelDia(fecha);

    // Encabezado con todos los datos institucionales
    const header = document.createElement('div');
    header.className = 'impresion-encabezado';

    if (datosInst.logo) {
        const img = document.createElement('img');
        img.src = datosInst.logo;
        img.alt = 'Logo Institucional';
        img.className = 'print-logo';
        header.appendChild(img);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'datos';
    infoDiv.innerHTML = `
        <h2 style="margin:0 0 8px 0;">${datosInst.institucion || 'Institución'}</h2>
        <p style="margin:4px 0;"><strong>Docente:</strong> ${datosInst.docente || '—'}</p>
        <p style="margin:4px 0;"><strong>Curso:</strong> ${datosInst.curso || '—'} &nbsp;|&nbsp; <strong>División:</strong> ${datosInst.division || '—'}</p>
        <p style="margin:4px 0;"><strong>Ciclo:</strong> ${datosInst.ciclo || '—'} &nbsp;|&nbsp; <strong>Período:</strong> ${datosInst.periodo || '—'}</p>
        <p style="margin:4px 0;"><strong>Fecha de Registro:</strong> ${formatearFecha(fecha)}</p>
    `;
    header.appendChild(infoDiv);
    cont.appendChild(header);

    // Título
    const titulo = document.createElement('h3');
    titulo.className = 'titulo-registro-print';
    titulo.textContent = `Registro Diario de Asistencia - ${formatearFecha(fecha)}`;
    cont.appendChild(titulo);

    // Tabla de asistencia para impresión (SOLO columnas: #, Apellido, Nombre, Estado)
    const tabla = document.createElement('table');
    tabla.className = 'tabla-registro-print';

    tabla.innerHTML = `
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 35%;">Apellido</th>
                <th style="width: 35%;">Nombre</th>
                <th style="width: 25%;">Estado</th>
            </tr>
        </thead>
        <tbody>
            ${alumnos.map((alumno, indice) => {
                const estado = registrosDelDia[indice] || ESTADOS_ASISTENCIA.PRESENTE;
                const estadoLabel = ESTADOS_INFO[estado].label.split(' ')[1]; // Solo el texto sin emoji
                return `
                    <tr>
                        <td>${indice + 1}</td>
                        <td>${alumno.apellido || ''}</td>
                        <td>${alumno.nombre || ''}</td>
                        <td>${estadoLabel}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;

    cont.appendChild(tabla);

    // Observaciones (si existen)
    if (datosInst.observaciones) {
        const obs = document.createElement('div');
        obs.className = 'observaciones-print';
        obs.innerHTML = `<strong>Observaciones:</strong> ${datosInst.observaciones}`;
        cont.appendChild(obs);
    }

    // Footer SOLO con firma del docente (NO incluir directivo)
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = `
        <div class="firma-box">
            <p>_____________________________</p>
            <p>Firma del Docente</p>
        </div>
    `;
    cont.appendChild(footer);

    document.body.appendChild(cont);

    // Trigger print
    setTimeout(() => {
        window.print();
        // Cleanup after print
        setTimeout(() => {
            const c = document.getElementById('impresionRegistroContenido');
            if (c && c.parentNode) {
                c.parentNode.removeChild(c);
            }
        }, 1000);
    }, 200);
}

// ---------- Utilidades ----------

function formatearFecha(fechaISO) {
    if (!fechaISO) return '—';
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('mostrar');
    
    clearTimeout(mostrarToast.temporizador);
    
    mostrarToast.temporizador = setTimeout(() => {
        toast.classList.remove('mostrar');
    }, 3000);
}

// ---------- Event Listeners ----------

selectorPlanilla.addEventListener('change', (e) => {
    if (e.target.value) {
        cargarAlumnosDePlanilla(e.target.value);
    }
});

fechaRegistro.addEventListener('change', () => {
    renderizarTabla();
});

btnGuardarRegistro.addEventListener('click', guardarRegistro);
btnImprimirRegistro.addEventListener('click', imprimirRegistro);
btnMarcarTodosPresentes.addEventListener('click', marcarTodosPresentes);

// Event listeners para el modal de impresión
btnConfirmarImpresion.addEventListener('click', prepararImpresionRegistro);
btnCancelarImpresion.addEventListener('click', cancelarImpresion);
printLogo.addEventListener('change', () => manejarLogoCarga(printLogo));

// Cerrar modal al hacer clic fuera del contenido
modalImprimir?.addEventListener('click', (e) => {
    if (e.target === modalImprimir) {
        cancelarImpresion();
    }
});

