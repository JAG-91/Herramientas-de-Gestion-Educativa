/**
 * planilla-asistencia.js - Lógica para la Planilla de Inasistencias
 */

/**
 * Inicializar la página de planilla
 */
function inicializarPlanilla() {
    // Botón volver
    const btnVolver = document.getElementById('btn-volver');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Cargar datos del contexto
    cargarDatosContexto();
    
    // Inicializar tabla de inasistencias
    inicializarTablaInasistencias();
    
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
    document.getElementById('planilla-materia').textContent = contexto.materia;
    document.getElementById('planilla-docente').textContent = contexto.docente;
    document.getElementById('planilla-total-clases').textContent = contexto.totalClases;
    
    // Datos para impresión
    document.getElementById('print-institucion').textContent = contexto.institucion;
    document.getElementById('print-director').textContent = contexto.director;
    document.getElementById('print-ciclo').textContent = contexto.cicloLectivo;
    
    document.getElementById('print-institucion-full').textContent = contexto.institucion;
    document.getElementById('print-director-full').textContent = contexto.director;
    document.getElementById('print-ciclo-full').textContent = contexto.cicloLectivo;
    document.getElementById('print-materia').textContent = contexto.materia;
    document.getElementById('print-docente').textContent = contexto.docente;
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
 * Calcular inasistencias por alumno basado en los registros guardados
 */
function calcularInasistencias(contexto) {
    const totalClases = contexto.totalClases;
    const inasistenciasPorAlumno = {};
    
    // Inicializar contador para cada alumno
    contexto.alumnos.forEach(alumno => {
        inasistenciasPorAlumno[alumno.numero] = 0;
    });
    
    // Si hay registros de asistencia, contar ausencias
    if (contexto.registrosAsistencia && contexto.registrosAsistencia.length > 0) {
        contexto.registrosAsistencia.forEach(registro => {
            registro.asistencia.forEach(item => {
                if (!item.presente) {
                    inasistenciasPorAlumno[item.alumno.numero]++;
                }
            });
        });
    }
    
    // Calcular porcentajes
    const resultados = contexto.alumnos.map(alumno => {
        const inasistencias = inasistenciasPorAlumno[alumno.numero] || 0;
        const porcentaje = totalClases > 0 ? (inasistencias / totalClases) * 100 : 0;
        
        return {
            alumno: alumno,
            inasistencias: inasistencias,
            porcentaje: porcentaje.toFixed(2)
        };
    });
    
    // Ordenar por cantidad de inasistencias (mayor a menor)
    resultados.sort((a, b) => b.inasistencias - a.inasistencias);
    
    return resultados;
}

/**
 * Inicializar la tabla de inasistencias
 */
function inicializarTablaInasistencias() {
    const contexto = window.AppUtils?.contextoActual;
    if (!contexto || !contexto.alumnos) return;
    
    const tbody = document.getElementById('tabla-inasistencias-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const resultados = calcularInasistencias(contexto);
    
    resultados.forEach(resultado => {
        const fila = document.createElement('tr');
        
        // Determinar clase según porcentaje
        let clasePorcentaje = '';
        if (resultado.porcentaje >= 25) {
            clasePorcentaje = 'estado-ausente'; // Rojo para alto porcentaje
        } else if (resultado.porcentaje >= 15) {
            clasePorcentaje = 'warning'; // Amarillo/naranja para medio
        }
        
        fila.innerHTML = `
            <td data-label="N°">${resultado.alumno.numero}</td>
            <td data-label="Apellido">${resultado.alumno.apellido}</td>
            <td data-label="Nombre">${resultado.alumno.nombre}</td>
            <td data-label="Inasistencias">${resultado.inasistencias}</td>
            <td data-label="%"><span class="${clasePorcentaje}">${resultado.porcentaje}%</span></td>
        `;
        
        tbody.appendChild(fila);
    });
}

/**
 * Preparar impresión de la planilla
 */
function prepararImpresion(observaciones) {
    const contexto = window.AppUtils?.contextoActual;
    if (!contexto) return;
    
    const printTbody = document.getElementById('print-tabla-body');
    if (!printTbody) return;
    
    printTbody.innerHTML = '';
    
    const resultados = calcularInasistencias(contexto);
    
    resultados.forEach(resultado => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${resultado.alumno.numero}</td>
            <td>${resultado.alumno.apellido}</td>
            <td>${resultado.alumno.nombre}</td>
            <td>${resultado.inasistencias}</td>
            <td>${resultado.porcentaje}%</td>
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
    // Imprimir
    const btnImprimir = document.getElementById('btn-imprimir-planilla');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            AppUtils.mostrarModalObservaciones(prepararImpresion);
        });
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', inicializarPlanilla);
