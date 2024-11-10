import React from "react";
import { createRoot } from "react-dom/client";
import TOPSISCalculator from "./components/TopsisCalculator";
import { Analytics } from "@vercel/analytics/react"
import "./styles/style.css";

const root = createRoot(document.getElementById('root'));
root.render(<TOPSISCalculator />);
<Analytics/>