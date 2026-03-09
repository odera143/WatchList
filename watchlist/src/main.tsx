import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.tsx';
import { Container } from 'react-bootstrap';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Container fluid data-bs-theme='dark'>
      <App />
    </Container>
  </StrictMode>
);
