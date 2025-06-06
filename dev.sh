#!/bin/bash

# Establecer permisos de ejecución
chmod +x dev.sh

# Mensaje de inicio
echo "Iniciando servicios de desarrollo para MediConnect..."
echo "================================================================="
echo "INFORMACIÓN DE ARQUITECTURA:"
echo "Este proyecto utiliza una arquitectura integrada donde:"
echo "- Server/index.ts inicia un servidor Express (backend)"
echo "- Server/vite.ts configura Vite para servir el frontend en desarrollo"
echo "- Ambos comparten el mismo puerto (5000) gracias a la configuración"
echo "================================================================="
echo ""
echo "Iniciando servidor integrado (backend + frontend)..."
echo ""

# En Replit, normalmente ejecutaríamos:
npm run dev

# Pero alternativamente, si quisieras usar concurrently para ejecutar 
# procesos independientes, podrías usar:
# node run-dev.js