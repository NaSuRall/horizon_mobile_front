import { createContext, useContext } from "react";
import { AuthContext } from "./AuthContext";

const RANK_THEMES = {
    Bronze:   { primary: "#CD7F32", secondary: "#2A1A0A" },
    Silver:   { primary: "#C0C0C0", secondary: "#1E1E1E" }, // ✅ argent véritable
    Gold:     { primary: "#CFB53B", secondary: "#2A2100" }, // ✅ or ancien, riche et profond
    Platinum: { primary: "#00FFD4", secondary: "#002A25" },
    Diamond:  { primary: "#A78BFA", secondary: "#1A0A2A" },
};
// Calcule si une couleur hex est claire ou foncée
export function isLightColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Formule de luminosité perçue
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
}

const DEFAULT_THEME = RANK_THEMES.Silver;

export const ThemeContext = createContext(DEFAULT_THEME);

export function ThemeProvider({ children }) {
    const { user } = useContext(AuthContext);

    // ✅ Sécurisé : si user est null ou rank inconnu, on prend Silver par défaut
    const rank  = user?.rank ?? "Gold";
    const theme = RANK_THEMES[rank] ?? DEFAULT_THEME;

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}