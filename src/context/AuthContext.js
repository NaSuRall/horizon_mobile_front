import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger token + user au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");

        if (token) setUserToken(token);
        if (userData) setUser(JSON.parse(userData));
      } catch (e) {
        console.log("Erreur chargement AuthContext :", e);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // Connexion
  const login = async (token, userData) => {
    setUserToken(token);
    setUser(userData);

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  // Déconnexion
  const logout = async () => {
    setUserToken(null);
    setUser(null);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  // AuthContext.js — ajoute cette fonction
  const updatePoints = async (newPoints, newRank) => {
    const updatedUser = { ...user, point: newPoints, ...(newRank ? { rank: newRank } : {}) };
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  };


  const fetchWithAuth = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`,
        ...options.headers,
      },
    });

    // Token expiré ou invalide → déconnexion automatique
    if (response.status === 401) {
      await logout(); // vide AsyncStorage + remet userToken à null
      // La navigation vers Login se fait automatiquement
      // via ton NavigationContainer qui surveille userToken
      return null;
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        login,
        logout,
        loading,
        updatePoints,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}