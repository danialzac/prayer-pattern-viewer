//! React is the UI library, and ReactDOM attaches our app to the real browser page.
//! React ni library UI, dan ReactDOM sambungkan app kita ke page browser sebenar.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

//! This finds the <div id="root"> in index.html and renders the whole React app inside it.
//! Ni cari <div id="root"> dalam index.html dan render seluruh app React dalam tu.
ReactDOM.createRoot(document.getElementById("root")).render(
  //? StrictMode helps catch common mistakes during development.
  //? StrictMode tolong tangkap silap biasa masa development.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
