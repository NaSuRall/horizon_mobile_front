import { createContext, useContext } from "react";
import { AuthContext } from "./AuthContext";

const RANK_THEMES = {
    Bronze:   { primary: "#CD7F32", secondary: "#2A1A0A", label: "Bronze"   },
    Silver:   { primary: "#E3000F", secondary: "#2A1010", label: "Silver"   },
    Gold:     { primary: "#FFD700", secondary: "#2A2200", label: "Gold"     },
    Platinum: { primary: "#00FFD4", secondary: "#002A25", label: "Platine"  },
    Diamond:  { primary: "#A78BFA", secondary: "#1A0A2A", label: "Diamond"  },
};

const DEFAULT_THEME = RANK_THEMES.Silver;

export const ThemeContext = createContext(DEFAULT_THEME);

export function ThemeProvider({ children }) {
    const { user } = useContext(AuthContext);

    const rank  = user?.rank ?? "Silver";
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