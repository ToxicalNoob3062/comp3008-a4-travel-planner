"use client";

// Material UI theme matching the Assignment 3 Figma prototype (OC Transpo red, Inter).
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { MotionConfig } from "motion/react";
import PopupTransition from "@/components/motion/PopupTransition";
import { PRESS_SCALE } from "@/components/motion/tokens";

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
    // Rounder corners on every alert box (the same 10px as the choice cards and the suggested-fix card).
    // The icon sits in the vertical middle of the box, however many lines of text there are.
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, alignItems: "center" },
        icon: { paddingTop: 0, paddingBottom: 0 },
        message: { textWrap: "balance" },
      },
    },
    // Every dialog opens with the shared popup animation.
    MuiDialog: { defaultProps: { slots: { transition: PopupTransition } } },
    // A small press-down on every button, so a click is felt as well as seen.
    MuiButton: {
      styleOverrides: {
        root: {
          transition:
            "background-color 250ms, box-shadow 250ms, border-color 250ms, color 250ms, transform 110ms cubic-bezier(0.22, 1, 0.36, 1)",
          "&:active": { transform: `scale(${PRESS_SCALE})` },
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
