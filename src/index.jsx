import React from "react";
import { createRoot } from "react-dom/client";
import TOPSISCalculator from "./components/TopsisCalculator";
import "./styles/style.css";

const root = createRoot(document.getElementById('root'));
root.render(<TOPSISCalculator />);