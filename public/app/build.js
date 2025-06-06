// Este archivo servirá como punto de entrada para JSX/TypeScript
// que será preprocesado con esbuild para navegadores modernos

import * as esbuild from 'https://cdn.jsdelivr.net/npm/esbuild-wasm@latest/lib/browser.min.js';

const setup = async () => {
  // Inicializar esbuild (la API de WASM) en el navegador
  await esbuild.initialize({
    wasmURL: 'https://cdn.jsdelivr.net/npm/esbuild-wasm@latest/esbuild.wasm',
  });

  // Simple loader para archivos JSX/TSX en el navegador
  const app = document.querySelector('#app');
  
  app.innerHTML = '<div>Cargando la aplicación...</div>';

  try {
    // Transformar JSX a JS
    const result = await esbuild.transform(
      document.querySelector('#source').textContent,
      {
        loader: 'jsx',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        format: 'esm',
        target: 'es2020',
      }
    );

    // Crear un módulo a partir del código transformado
    const blob = new Blob([result.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    // Cargar el módulo
    import(url).then(module => {
      app.innerHTML = '';
      const App = module.default;
      ReactDOM.render(React.createElement(App), app);
    });

  } catch (err) {
    app.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    console.error(err);
  }
};

setup();