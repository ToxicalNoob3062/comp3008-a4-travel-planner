"use client";

// Material UI theme matching the Assignment 3 Figma prototype (OC Transpo red, Inter).
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { MotionConfig } from "motion/react";

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
  components: {
    // Even out the lines in every alert box so a single word is never left alone on the last line.
    MuiAlert: { styleOverrides: { message: { textWrap: "balance" } } },
    // A small press-down on every button, so a click is felt as well as seen.
    MuiButton: {
      styleOverrides: {
        root: {
          transition:
            "background-color 250ms, box-shadow 250ms, border-color 250ms, color 250ms, transform 110ms cubic-bezier(0.22, 1, 0.36, 1)",
          "&:active": { transform: "scale(0.95)" },
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": people who ask their system for less motion get fades only, with no sliding or bouncing.
    <MotionConfig reducedMotion="user">
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </MotionConfig>
  );
}
