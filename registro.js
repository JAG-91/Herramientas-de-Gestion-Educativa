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

// Modal de impresión
const modalImprimirRegistro = document.getElementById('modalImprimirRegistro');
const institucionRegistro = document.getElementById('institucionRegistro');
const logoRegistro = document.getElementById('logoRegistro');
const cursoRegistro = document.getElementById('cursoRegistro');
const divisionRegistro = document.getElementById('divisionRegistro');
const docenteRegistro = document.getElementById('docenteRegistro');
const fechaImpresionRegistro = document.getElementById('fechaImpresionRegistro');
const observacionesRegistro = document.getElementById('observacionesRegistro');
const btnConfirmarImprimirRegistro = document.getElementById('confirmarImprimirRegistro');
const btnCancelarImprimirRegistro = document.getElementById('cancelarImprimirRegistro');

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
    if (!fechaImpresionRegistro.value) {
        const hoy = new Date();
        fechaImpresionRegistro.value = hoy.toISOString().slice(0, 10);
    }
    modalImprimirRegistro.classList.remove('oculto');
}

function cancelarImpresion() {
    modalImprimirRegistro.classList.add('oculto');
}

function guardarDatosInstitucionalesRegistro() {
    const datos = {
        institucion: institucionRegistro.value.trim(),
        logo: logoRegistro._dataUrl || null,
        curso: cursoRegistro.value.trim(),
        division: divisionRegistro.value.trim(),
        docente: docenteRegistro.value.trim(),
        observaciones: observacionesRegistro.value.trim()
    };
    localStorage.setItem('datosInstitucionales', JSON.stringify(datos));
}

function cargarDatosInstitucionalesEnModal() {
    const raw = localStorage.getItem('datosInstitucionales');
    if (!raw) return;
    try {
        const datos = JSON.parse(raw);
        institucionRegistro.value = datos.institucion || '';
        cursoRegistro.value = datos.curso || '';
        divisionRegistro.value = datos.division || '';
        docenteRegistro.value = datos.docente || '';
        observacionesRegistro.value = datos.observaciones || '';
        if (datos.logo) {
            logoRegistro._dataUrl = datos.logo;
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
    modalImprimirRegistro.classList.add('oculto');
    
    // Eliminar contenedores previos
    let cont = document.getElementById('impresionRegistroContenido');
    if (cont) cont.remove();
    
    cont = document.createElement('div');
    cont.id = 'impresionRegistroContenido';
    cont.className = 'impresion-registro-contenedor';
    
    // Obtener datos institucionales guardados
    const datosInst = JSON.parse(localStorage.getItem('datosInstitucionales') || '{}');
    
    const fecha = fechaRegistro.value;
    const registrosDelDia = obtenerRegistrosDelDia(fecha);
    
    // Encabezado
    const header = document.createElement('div');
    header.className = 'impresion-registro-header';
    
    if (datosInst.logo) {
        const img = document.createElement('img');
        img.src = datosInst.logo;
        img.alt = 'Logo';
        header.appendChild(img);
    }
    
    const txt = document.createElement('div');
    txt.className = 'impresion-registro-datos';
    const h1 = document.createElement('h2');
    h1.textContent = datosInst.institucion || 'Registro de Asistencia';
    h1.style.margin = '0';
    
    const info = document.createElement('div');
    info.innerHTML = `
        <strong>Curso:</strong> ${datosInst.curso || '—'} &nbsp;
        <strong>División:</strong> ${datosInst.division || '—'} &nbsp;
        <strong>Fecha:</strong> ${formatearFecha(fecha)} &nbsp;
        <strong>Docente:</strong> ${datosInst.docente || '—'}
    `;
    
    txt.appendChild(h1);
    txt.appendChild(info);
    header.appendChild(txt);
    cont.appendChild(header);
    
    // Título
    const titulo = document.createElement('h3');
    titulo.className = 'titulo-registro-print';
    titulo.textContent = 'Registro Diario de Asistencia';
    titulo.style.textAlign = 'center';
    titulo.style.margin = '15px 0';
    cont.appendChild(titulo);
    
    // Tabla de asistencia para impresión
    const tablaContainer = document.createElement('div');
    tablaContainer.className = 'impresion-registro-tabla-container';
    
    const tabla = document.createElement('table');
    tabla.className = 'tabla-registro-print';
    
    tabla.innerHTML = `
        <thead>
            <tr>
                <th style="width: 50px;">#</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th style="width: 120px;">Estado</th>
            </tr>
        </thead>
        <tbody>
            ${alumnos.map((alumno, indice) => {
                const estado = registrosDelDia[indice] || ESTADOS_ASISTENCIA.PRESENTE;
                const estadoInfo = ESTADOS_INFO[estado];
                return `
                    <tr>
                        <td>${indice + 1}</td>
                        <td>${alumno.apellido || ''}</td>
                        <td>${alumno.nombre || ''}</td>
                        <td class="${estadoInfo.clase}">${estadoInfo.label}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    
    tablaContainer.appendChild(tabla);
    cont.appendChild(tablaContainer);
    
    // Observaciones
    if (datosInst.observaciones) {
        const obs = document.createElement('div');
        obs.className = 'observaciones-print';
        obs.innerHTML = `<strong>Observaciones:</strong> ${datosInst.observaciones}`;
        obs.style.marginTop = '15px';
        cont.appendChild(obs);
    }
    
    // Footer con firmas
    const footer = document.createElement('footer');
    footer.className = 'print-footer-registro';
    footer.innerHTML = `
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 45%;">
                ______________________________<br>
                Firma del docente
            </div>
            <div style="text-align: center; width: 45%;">
                ______________________________<br>
                Firma del directivo
            </div>
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
            if (c) c.remove();
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
btnConfirmarImprimirRegistro.addEventListener('click', prepararImpresionRegistro);
btnCancelarImprimirRegistro.addEventListener('click', cancelarImpresion);
logoRegistro.addEventListener('change', () => manejarLogoCarga(logoRegistro));

// Cerrar modal al hacer clic fuera del contenido
modalImprimirRegistro?.addEventListener('click', (e) => {
    if (e.target === modalImprimirRegistro) {
        cancelarImpresion();
    }
});

