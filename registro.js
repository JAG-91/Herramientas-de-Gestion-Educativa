// REGISTRO DIARIO DE ASISTENCIA - registro.js
const STORAGE_KEY_PLANILLAS='asistencia_planillas',STORAGE_KEY_REGISTROS='registrosDiarios';
const ESTADOS={PRESENTE:'presente',AUSENTE:'ausente',TARDE:'tarde',JUSTIFICADO:'justificado'};
const ESTADO_CONFIG={[ESTADOS.PRESENTE]:{label:'Presente',emoji:'✅'},[ESTADOS.AUSENTE]:{label:'Ausente',emoji:'❌'},[ESTADOS.TARDE]:{label:'Tarde',emoji:'⏰'},[ESTADOS.JUSTIFICADO]:{label:'Justificado',emoji:'📄'}};
let planillaActual=null,fechaActual=null,alumnosActuales=[];

document.addEventListener('DOMContentLoaded',function(){
    const anioEl=document.getElementById('anio-actual');if(anioEl)anioEl.textContent=new Date().getFullYear();
    const fechaInput=document.getElementById('fecha-registro');if(fechaInput){fechaInput.value=obtenerFechaHoy();fechaActual=obtenerFechaHoy();}
    cargarPlanillasEnSelector();configurarEventos();configurarModalContextosRegistro();
});

function obtenerFechaHoy(){return new Date().toISOString().split('T')[0];}
function obtenerPlanillas(){const d=localStorage.getItem(STORAGE_KEY_PLANILLAS);return d?JSON.parse(d):{};}
function guardarRegistros(r){localStorage.setItem(STORAGE_KEY_REGISTROS,JSON.stringify(r));}
function obtenerRegistros(){const d=localStorage.getItem(STORAGE_KEY_REGISTROS);return d?JSON.parse(d):{};}

function configurarEventos(){
    const sel=document.getElementById('selector-planillas'),fecha=document.getElementById('fecha-registro');
    const btnGuardar=document.getElementById('btn-guardar-registro'),btnImprimir=document.getElementById('btn-imprimir-registro');
    if(sel)sel.addEventListener('change',manejarCambioPlanilla);
    if(fecha)fecha.addEventListener('change',manejarCambioFecha);
    if(btnGuardar)btnGuardar.addEventListener('click',guardarRegistro);
    if(btnImprimir)btnImprimir.addEventListener('click',prepararImpresion);
    configurarModalImpresion();
}

function cargarPlanillasEnSelector(){
    const selector=document.getElementById('selector-planillas');if(!selector)return;
    const planillas=obtenerPlanillas();selector.innerHTML='<option value="">-- Seleccionar --</option>';
    Object.keys(planillas).forEach(nombre=>{const opt=document.createElement('option');opt.value=nombre;opt.textContent=nombre;selector.appendChild(opt);});
    if(Object.keys(planillas).length===0)mostrarToast('No hay planillas creadas.','warning');
}

function manejarCambioPlanilla(e){
    const nombre=e.target.value;if(!nombre){ocultarSeccionTabla();planillaActual=null;return;}
    const planillas=obtenerPlanillas();planillaActual=planillas[nombre];
    if(planillaActual&&planillaActual.alumnos){alumnosActuales=planillaActual.alumnos;mostrarSeccionTabla();cargarAlumnosEnTabla();actualizarEstadisticas();}
}

function manejarCambioFecha(e){fechaActual=e.target.value;if(planillaActual&&alumnosActuales.length>0){cargarEstadosGuardados();actualizarEstadisticas();}}

function cargarAlumnosEnTabla(){
    const tbody=document.getElementById('tabla-asistencia-body');if(!tbody)return;tbody.innerHTML='';
    alumnosActuales.forEach((alumno,indice)=>{
        const tr=document.createElement('tr');tr.dataset.indice=indice;const estado=obtenerEstadoAlumno(indice);
        let h='<td>'+(indice+1)+'</td><td>'+escapeHtml(alumno.apellido)+'</td><td>'+escapeHtml(alumno.nombre)+'</td><td><div class="estado-botones">';
        h+='<button class="estado-btn '+(estado===ESTADOS.PRESENTE?'activo':'')+'" data-estado="'+ESTADOS.PRESENTE+'" data-indice="'+indice+'">✅ P</button>';
        h+='<button class="estado-btn '+(estado===ESTADOS.AUSENTE?'activo':'')+'" data-estado="'+ESTADOS.AUSENTE+'" data-indice="'+indice+'">❌ A</button>';
        h+='<button class="estado-btn '+(estado===ESTADOS.TARDE?'activo':'')+'" data-estado="'+ESTADOS.TARDE+'" data-indice="'+indice+'">⏰ T</button>';
        h+='<button class="estado-btn '+(estado===ESTADOS.JUSTIFICADO?'activo':'')+'" data-estado="'+ESTADOS.JUSTIFICADO+'" data-indice="'+indice+'">📄 J</button></div></td>';
        tr.innerHTML=h;tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.estado-btn').forEach(b=>b.addEventListener('click',manejarClickEstado));
}

function manejarClickEstado(e){
    const b=e.target,i=parseInt(b.dataset.indice),ne=b.dataset.estado;
    if(!planillaActual||!fechaActual)return;
    const r=obtenerRegistros();if(!r[planillaActual.nombre])r[planillaActual.nombre]={};
    if(!r[planillaActual.nombre][fechaActual])r[planillaActual.nombre][fechaActual]={};
    r[planillaActual.nombre][fechaActual][i]=ne;guardarRegistros(r);actualizarBotonesEstado(i,ne);actualizarEstadisticas();
    mostrarToast('Estado: '+ESTADO_CONFIG[ne].label,'success');
}

function actualizarBotonesEstado(i,ea){
    const f=document.querySelector('tr[data-indice="'+i+'"]');if(!f)return;
    f.querySelectorAll('.estado-btn').forEach(b=>b.classList.toggle('activo',b.dataset.estado===ea));
}

function obtenerEstadoAlumno(i){
    if(!planillaActual||!fechaActual)return ESTADOS.PRESENTE;
    const r=obtenerRegistros();if(!r[planillaActual.nombre])return ESTADOS.PRESENTE;
    if(!r[planillaActual.nombre][fechaActual])return ESTADOS.PRESENTE;
    return r[planillaActual.nombre][fechaActual][i]||ESTADOS.PRESENTE;
}

function cargarEstadosGuardados(){if(!planillaActual||!fechaActual)return;alumnosActuales.forEach((_,i)=>actualizarBotonesEstado(i,obtenerEstadoAlumno(i)));}

function actualizarEstadisticas(){
    if(!planillaActual||!fechaActual)return;
    const r=obtenerRegistros(),rd=r[planillaActual.nombre]?.[fechaActual]||{};
    let p=0,a=0,t=0,j=0;Object.values(rd).forEach(e=>{if(e===ESTADOS.PRESENTE)p++;else if(e===ESTADOS.AUSENTE)a++;else if(e===ESTADOS.TARDE)t++;else if(e===ESTADOS.JUSTIFICADO)j++;});
    document.getElementById('stat-presentes').textContent=p;document.getElementById('stat-ausentes').textContent=a;
    document.getElementById('stat-tardes').textContent=t;document.getElementById('stat-justificados').textContent=j;
}

function guardarRegistro(){if(!planillaActual){mostrarToast('Seleccione una planilla','error');return;}if(!fechaActual){mostrarToast('Seleccione una fecha','error');return;}mostrarToast('Registro guardado','success');}

function prepararImpresion(){
    if(!planillaActual||!fechaActual){mostrarToast('Seleccione planilla y fecha','error');return;}
    const m=document.getElementById('modal-imprimir');if(!m)return;cargarContextosEnSelector();
    const ci=localStorage.getItem('asistencia_contexto_activo');if(ci){aplicarContextoAUI(ci);document.getElementById('selector-contexto-imprimir').value=ci;}
    m.style.display='flex';
}

function cargarContextosEnSelector(){
    const s=document.getElementById('selector-contexto-imprimir');if(!s)return;
    const c=listarContextos();s.innerHTML='<option value="">-- Seleccionar --</option>';
    Object.values(c).forEach(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.nombre;s.appendChild(o);});
    s.addEventListener('change',function(){if(this.value)aplicarContextoAUI(this.value);});
}

function configurarModalImpresion(){
    const bc=document.getElementById('btn-cerrar-modal-imprimir'),bi=document.getElementById('btn-confirmar-imprimir'),bg=document.getElementById('btn-guardar-como-contexto'),m=document.getElementById('modal-imprimir');
    if(bc)bc.addEventListener('click',()=>m.style.display='none');
    if(bi)bi.addEventListener('click',imprimirRegistro);
    if(bg)bg.addEventListener('click',guardarComoContextoActual);
    if(m)m.addEventListener('click',e=>{if(e.target===m)m.style.display='none';});
}

function imprimirRegistro(){
    const pv=document.getElementById('impresionContenidoDiario');if(pv)pv.remove();
    const inst=document.getElementById('institucionInput').value,cur=document.getElementById('cursoImprimir').value,di=document.getElementById('divisionImprimir').value;
    const ci=document.getElementById('cicloImprimir').value,doce=document.getElementById('docenteImprimir').value,ob=document.getElementById('observacionesImprimir').value;
    const ct=document.createElement('div');ct.id='impresionContenidoDiario';ct.className='impresion-contenedor';
    const rg=obtenerRegistros(),rd=rg[planillaActual?.nombre]?.[fechaActual]||{};
    let h='<div class="impresion-encabezado">'+(inst?'<h1>'+escapeHtml(inst)+'</h1>':'')+'<div class="impresion-info">';
    h+=(cur?'<p><strong>Curso:</strong> '+escapeHtml(cur)+(di?' - '+escapeHtml(di):'')+'</p>':'')+(ci?'<p><strong>Ciclo:</strong> '+escapeHtml(ci)+'</p>':'')+(doce?'<p><strong>Docente:</strong> '+escapeHtml(doce)+'</p>':'')+'</div></div>';
    h+='<h2>Registro Diario de Asistencia</h2><p class="impresion-fecha"><strong>Fecha:</strong> '+formatearFecha(fechaActual)+'</p>';
    h+='<table class="print-table"><thead><tr><th>#</th><th>Apellido</th><th>Nombre</th><th>Estado</th></tr></thead><tbody>';
    alumnosActuales.forEach((x,i)=>{const es=rd[i]||ESTADOS.PRESENTE;h+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(x.apellido)+'</td><td>'+escapeHtml(x.nombre)+'</td><td>'+ESTADO_CONFIG[es].emoji+' '+ESTADO_CONFIG[es].label+'</td></tr>';});
    h+='</tbody></table>'+(ob?'<div class="print-observaciones"><h3>Observaciones</h3><p>'+escapeHtml(ob)+'</p></div>':'')+'<div class="print-footer"><p>_____________________________</p><p>Firma del Docente</p></div>';
    ct.innerHTML=h;document.body.appendChild(ct);window.print();setTimeout(()=>ct.remove(),1000);
}

function guardarComoContextoActual(){
    const d={nombre:prompt('Nombre:','Contexto '+new Date().toLocaleDateString()),institucion:document.getElementById('institucionInput').value,logo:'',curso:document.getElementById('cursoImprimir').value,division:document.getElementById('divisionImprimir').value,ciclo:document.getElementById('cicloImprimir').value,periodo:'',docente:document.getElementById('docenteImprimir').value,observaciones:document.getElementById('observacionesImprimir').value};
    if(d.nombre){crearContexto(d);document.getElementById('modal-imprimir').style.display='none';}
}

function formatearFecha(f){return new Date(f+'T00:00:00').toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});}
function escapeHtml(t){if(!t)return'';const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
function mostrarToast(m,tp){if(typeof window.mostrarToast==='function')window.mostrarToast(m,tp);else alert(m);}
function mostrarSeccionTabla(){document.getElementById('seccion-tabla').style.display='block';document.getElementById('seccion-estadisticas').style.display='block';}
function ocultarSeccionTabla(){document.getElementById('seccion-tabla').style.display='none';document.getElementById('seccion-estadisticas').style.display='none';}

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
