import React, { useState } from 'react';
import { create } from 'zustand';

// Crear una store con Zustand
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Componente de contador usando Zustand
const Counter = () => {
  const { count, increment, decrement, reset } = useStore();
  
  return (
    <div className="counter">
      <h2>Contador con Zustand: {count}</h2>
      <div className="buttons">
        <button onClick={increment}>Incrementar</button>
        <button onClick={decrement}>Decrementar</button>
        <button onClick={reset}>Resetear</button>
      </div>
    </div>
  );
};

// Componente de formulario usando useState local
const Form = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
    setSubmitted(true);
  };

  return (
    <div className="form-container">
      <h2>Formulario con React State</h2>
      {submitted ? (
        <div className="success-message">
          <h3>¡Gracias por enviarnos tus datos!</h3>
          <p>Nombre: {formData.name}</p>
          <p>Email: {formData.email}</p>
          <button onClick={() => setSubmitted(false)}>Enviar otro</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Enviar</button>
        </form>
      )}
    </div>
  );
};

// Componente principal App
const App = () => {
  return (
    <div className="app">
      <header>
        <h1>Ejemplo de React con Zustand y State Management</h1>
      </header>
      <main>
        <Counter />
        <hr />
        <Form />
      </main>
      <footer>
        <p>MediConnect - Ejemplos de Gestión de Estado - 2025</p>
      </footer>
    </div>
  );
};

export default App;