"use client";

// Material UI theme matching the Assignment 3 Figma prototype (OC Transpo red, Inter).
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: "#d30f1d", dark: "#9e051f", contrastText: "#ffffff" },
    error: { main: "#d32f2f" },
    text: { primary: "#39383f", secondary: "#666666" },
    background: { default: "#f5f6f7" },
  },
  typography: {
    fontFamily: "var(--font-inter), 'Helvetica Neue', Arial, sans-serif",
    button: { fontWeight: 500, letterSpacing: "0.46px" },
  },
  shape: { borderRadius: 4 },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
