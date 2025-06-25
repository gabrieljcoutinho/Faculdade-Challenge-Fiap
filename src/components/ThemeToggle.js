import React, { useEffect, useState } from 'react';
import '../CSS/mudarTema.css'; // importe o css do tema

const ThemeToggle = () => {
  // Pega o tema salvo no localStorage ou usa claro por padrão
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light-theme';
  });

  useEffect(() => {
    // Aplica a classe no body
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);

    // Salva no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));
  };

  return (
    <button onClick={toggleTheme} style={{padding: '8px 12px', cursor: 'pointer'}}>
      {theme === 'light-theme' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
};

export default ThemeToggle;
