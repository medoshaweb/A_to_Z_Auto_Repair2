import React from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <Header />
      <main className="main-content">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;

