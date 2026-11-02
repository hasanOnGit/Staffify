import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

// Configure Native Status Bar if running on Android/iOS
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#0052CC' }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
