import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// #region agent log
fetch('http://127.0.0.1:7893/ingest/2ab3fe32-aef3-4b4a-9b84-d597bfde7be3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6611e7'},body:JSON.stringify({sessionId:'6611e7',runId:'initial',hypothesisId:'H6_H7',location:'src/main.tsx:6',message:'frontend bootstrap loaded',data:{userAgent:navigator.userAgent},timestamp:Date.now()})}).catch(()=>{});
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
