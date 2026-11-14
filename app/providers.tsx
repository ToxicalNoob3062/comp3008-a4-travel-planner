"use client";

// Material UI theme matching the Assignment 3 Figma prototype (OC Transpo red, Inter).
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MotionProvider from "@/components/motion/MotionProvider";
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
    // A box with a heading: the icon lines up with the heading line, however much text follows.
    // A box without a heading: the icon sits in the vertical middle of the box.
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          alignItems: "center",
          "&:has(.MuiAlertTitle-root)": { alignItems: "flex-start" },
          // 7px puts the 22px icon on the centre of the 24px heading line.
          "&:has(.MuiAlertTitle-root) .MuiAlert-icon": { paddingTop: 7 },
        },
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
    <MotionProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </MotionProvider>
  );
}
