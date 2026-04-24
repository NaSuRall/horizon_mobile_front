import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";

// ─── Couleurs d'accent selon le rang ────────────────────────────────────────
const RANK_THEMES = {
    Bronze:  { primary: "#CD7F32", secondary: "#2A1A0A" },
    Silver:  { primary: "#C0C0C0", secondary: "#1E1E1E" },
    Gold:    { primary: "#CFB53B", secondary: "#2A2100" },
    Platine: { primary: "#00FFD4", secondary: "#002A25" },
    Diamond: { primary: "#A78BFA", secondary: "#1A0A2A" },
};

// ─── Palettes dark / light ───────────────────────────────────────────────────
const DARK = {
    isDark:      true,
    bg:          "#111111",
    card:        "#1A1A1A",
    cardAlt:     "#222222",
    border:      "#2A2A2A",
    text:        "#FFFFFF",
    textMuted:   "#888888",
    textFaint:   "#444444",
    placeholder: "#555555",
    calCard:     "#F5F5F5",
    inputBg:     "#1A1A1A",
    switchTrack: "#3A3A3A",
};

const LIGHT = {
    isDark:      false,
    bg:          "#F2F2F7",
    card:        "#FFFFFF",
    cardAlt:     "#F8F8FA",
    border:      "#E5E5EA",
    text:        "#111111",
    textMuted:   "#6E6E73",
    textFaint:   "#C7C7CC",
    placeholder: "#AEAEB2",
    calCard:     "#FFFFFF",
    inputBg:     "#FFFFFF",
    switchTrack: "#E5E5EA",
};

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem("colorMode").then(val => {
            if (val !== null) setIsDark(val === "dark");
        });
    }, []);

    const toggleMode = async () => {
        const next = !isDark;
        setIsDark(next);
        await AsyncStorage.setItem("colorMode", next ? "dark" : "light");
    };

    const rank   = user?.rank ?? "Bronze";
    const accent = RANK_THEMES[rank] ?? RANK_THEMES.Bronze;
    const mode   = isDark ? DARK : LIGHT;

    return (
        <ThemeContext.Provider value={{ ...accent, ...mode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export function isLightColor(hex) {
    if (!hex || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}
