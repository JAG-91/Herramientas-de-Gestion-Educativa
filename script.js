// script.js - Lógica mínima para el Home
// Actualizar año automáticamente en el footer
document.addEventListener('DOMContentLoaded', function() {
    const anioElement = document.getElementById('anioActual');
    if (anioElement) {
        anioElement.textContent = new Date().getFullYear();
    }
});
