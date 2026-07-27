/**
 * asistencias.js - Lógica para el Registro Diario de Asistencia
 */

// Estado local de asistencia del día
let asistenciaDelDia = [];

/**
 * Inicializar la página de registro
 */
function inicializarRegistro() {
    // Botón volver
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Cargar datos del contexto
    cargarDatosContexto();
    
    // Inicializar tabla de asistencia
    inicializarTablaAsistencia();
    
    // Event listeners de botones
    inicializarBotones();
}

/**
 * Cargar datos del contexto en la página
 */
function cargarDatosContexto() {
    const contexto = window.AppUtils?.contextoActual;
    
    if (!contexto) {
        alert('No hay un contexto seleccionado. Redirigiendo al inicio...');
        window.location.href = 'index.html';
        return;
    }
    
    // Datos visibles
    document.getElementById('registro-curso').textContent = contexto.curso || '';
    document.getElementById('registro-division').textContent = contexto.division || '';
    document.getElementById('registro-materia').textContent = contexto.materia;
    document.getElementById('registro-docente').textContent = contexto.docente;
    document.getElementById('registro-fecha').textContent = AppUtils.obtenerFechaActual();
    
    // Datos para impresión
    document.getElementById('print-institucion').textContent = contexto.institucion;
    document.getElementById('print-director').textContent = contexto.director;
    document.getElementById('print-ciclo').textContent = contexto.cicloLectivo;
    
    document.getElementById('print-institucion-full').textContent = contexto.institucion;
    document.getElementById('print-director-full').textContent = contexto.director;
    document.getElementById('print-ciclo-full').textContent = contexto.cicloLectivo;
    document.getElementById('print-curso').textContent = contexto.curso || '';
    document.getElementById('print-division').textContent = contexto.division || '';
    document.getElementById('print-materia').textContent = contexto.materia;
    document.getElementById('print-docente').textContent = contexto.docente;
    document.getElementById('print-fecha').textContent = AppUtils.obtenerFechaActual();
    document.getElementById('print-total-clases').textContent = contexto.totalClases;
    document.getElementById('print-generado').textContent = AppUtils.obtenerTimestamp();
    
    // Logo si existe
    if (contexto.logoUrl) {
        document.getElementById('print-logo').src = contexto.logoUrl;
        document.getElementById('print-logo').style.display = 'block';
        document.getElementById('print-logo-full').src = contexto.logoUrl;
    }
}

/**
 * Inicializar la tabla de asistencia con los alumnos del contexto
 */
function inicializarTablaAsistencia() {
    const contexto = window.AppUtils?.contextoActual;
    if (!contexto || !contexto.alumnos) return;
    
    const tbody = document.getElementById('tabla-asistencia-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    asistenciaDelDia = [];
    
    contexto.alumnos.forEach((alumno, index) => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td data-label="N°">${alumno.numero}</td>
            <td data-label="Apellido">${alumno.apellido}</td>
            <td data-label="Nombre">${alumno.nombre}</td>
            <td data-label="Estado">
                <label class="estado-toggle">
                    <input type="checkbox" 
                           id="asistencia-${index}" 
                           checked 
                           onchange="actualizarEstado(${index}, this.checked)">
                    <span class="estado-texto" id="estado-texto-${index}">Presente</span>
                </label>
            </td>
        `;
        
        tbody.appendChild(fila);
        
        // Guardar estado inicial
        asistenciaDelDia.push({
            alumno: alumno,
            presente: true
        });
    });
}

/**
 * Actualizar el estado de un alumno
 */
function actualizarEstado(index, esPresente) {
    asistenciaDelDia[index].presente = esPresente;
    
    const textoEstado = document.getElementById(`estado-texto-${index}`);
    if (textoEstado) {
        textoEstado.textContent = esPresente ? 'Presente' : 'Ausente';
        textoEstado.className = 'estado-texto ' + (esPresente ? 'estado-presente' : 'estado-ausente');
    }
}

/**
 * Marcar todos como presentes
 */
function marcarTodosPresentes() {
    const checkboxes = document.querySelectorAll('#tabla-asistencia-body input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = true;
        actualizarEstado(index, true);
    });
}

/**
 * Guardar la asistencia del día
 */
function guardarAsistencia() {
    const contexto = window.AppUtils?.contextoActual;
    if (!contexto) return;
    
    // Obtener todos los contextos
    const contextos = AppUtils.obtenerContextos();
    
    // Encontrar el índice del contexto actual
    const index = contextos.findIndex(c => 
        c.institucion === contexto.institucion && 
        c.materia === contexto.materia &&
        c.cicloLectivo === contexto.cicloLectivo &&
        c.curso === contexto.curso &&
        c.division === contexto.division
    );
    
    if (index === -1) return;
    
    // Crear registro del día
    const registro = {
        fecha: new Date().toISOString(),
        fechaFormateada: AppUtils.obtenerFechaActual(),
        asistencia: [...asistenciaDelDia]
    };
    
    // Agregar a los registros del contexto
    if (!contextos[index].registrosAsistencia) {
        contextos[index].registrosAsistencia = [];
    }
    contextos[index].registrosAsistencia.push(registro);
    
    // Guardar en localStorage
    localStorage.setItem('asistencia_contextos', JSON.stringify(contextos));
    
    // Actualizar contexto actual
    window.AppUtils.contextoActual = contextos[index];
    
    alert('Asistencia guardada correctamente.\n\n' +
          `Presentes: ${asistenciaDelDia.filter(a => a.presente).length}\n` +
          `Ausentes: ${asistenciaDelDia.filter(a => !a.presente).length}`);
}

/**
 * Preparar impresión del registro
 */
function prepararImpresion(observaciones) {
    const printTbody = document.getElementById('print-tabla-body');
    if (!printTbody) return;
    
    printTbody.innerHTML = '';
    
    asistenciaDelDia.forEach(registro => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.alumno.numero}</td>
            <td>${registro.alumno.apellido}</td>
            <td>${registro.alumno.nombre}</td>
            <td>${registro.presente ? 'Presente' : 'Ausente'}</td>
        `;
        printTbody.appendChild(fila);
    });
    
    // Observaciones
    const obsDiv = document.getElementById('print-observaciones');
    const obsTexto = document.getElementById('print-texto-observaciones');
    
    if (observaciones && observaciones.trim()) {
        obsTexto.textContent = observaciones;
        obsDiv.style.display = 'block';
    } else {
        obsDiv.style.display = 'none';
    }
    
    // Imprimir
    setTimeout(() => {
        window.print();
    }, 500);
}

/**
 * Inicializar botones de acción
 */
function inicializarBotones() {
    // Marcar todos presentes
    const btnTodosPresentes = document.getElementById('btn-marcar-todos-presentes');
    if (btnTodosPresentes) {
        btnTodosPresentes.addEventListener('click', marcarTodosPresentes);
    }
    
    // Guardar asistencia
    const btnGuardar = document.getElementById('btn-guardar-asistencia');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarAsistencia);
    }
    
    // Imprimir
    const btnImprimir = document.getElementById('btn-imprimir-registro');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            AppUtils.mostrarModalObservaciones(prepararImpresion);
        });
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', inicializarRegistro);
