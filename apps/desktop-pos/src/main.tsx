import React from "react";
import { createRoot } from "react-dom/client";
import { PosApp } from "./pos-app";
import "./style.css";

createRoot(document.getElementById("root")!).render(<React.StrictMode><PosApp /></React.StrictMode>);
