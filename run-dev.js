// Este script ejecuta tanto el servidor como el cliente en paralelo
const concurrently = require('concurrently');

// Ejecutar el servidor y el cliente en paralelo
concurrently([
  { 
    command: 'tsx server/index.ts',
    name: 'SERVER', 
    prefixColor: 'blue'
  },
  { 
    command: 'cd client && vite',
    name: 'CLIENT', 
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  restartDelay: 1000
});