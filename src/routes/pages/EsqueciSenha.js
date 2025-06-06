// EsqueciSenha.jsx
import React, { useState } from 'react';
import '../../CSS/EsqueciSenha/style.css'; // Don't forget to create this CSS file!

const EsqueciSenha = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // In a real application, you'd send a request to your backend here.
    // For this example, we'll just simulate a success or failure.
    console.log(`Sending password reset request for: ${email}`);

    // Simulate API call
    setTimeout(() => {
      if (email === 'test@example.com') { // Simulate a known email for success
        setMessage('If an account with that email exists, we\'ve sent you a password reset link!');
        setEmail('');
      } else {
        // Even if the email doesn't exist, it's good practice not to reveal that
        // for security reasons. So, we give a generic success message.
        setMessage('Sua senha foi enviada para esse email');
        setEmail('');
      }
    }, 1500);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email address below and we'll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="SeuEmail@gmail.com"
              required
            />
          </div>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="reset-button">Recuperar Senha</button>
        </form>
        <div className="back-to-login">
          <a href="/login">Voltar para Login</a> {/* Adjust this path as needed */}
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;