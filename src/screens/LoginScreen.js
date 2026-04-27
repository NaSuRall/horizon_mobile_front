import { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Toast from 'react-native-toast-message';
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { Mail, Lock } from "lucide-react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

const PRIMARY      = "#E3000F";
const GOOGLE_WEB_CLIENT_ID     = "589886121106-gq7ir45hi1gcmjl6lgk5ce8e6u5sc5t0.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "589886121106-6ndeismkr8c1t3jgjheuns71i0nfpnop.apps.googleusercontent.com";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const theme     = useTheme();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  const redirectUri = Platform.OS === "android"
    ? `com.googleusercontent.apps.589886121106-6ndeismkr8c1t3jgjheuns71i0nfpnop:/oauth2redirect`
    : makeRedirectUri({ scheme: "com.horizonmoto.app", path: "oauth2redirect/google" });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") handleGoogleResponse(response.authentication);
  }, [response]);

  const handleGoogleResponse = async (authentication) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: authentication.accessToken }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        Toast.show({ type: "success", text1: "Connexion réussie", text2: `Bienvenue ${data.user.first_name} !` });
      } else {
        Toast.show({ type: "error", text1: "Erreur Google", text2: data.error ?? "Une erreur est survenue" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      login(res.data.token, res.data.user);
      Toast.show({ type: 'success', text1: 'Connexion réussie', text2: 'Bienvenue sur Horizon Moto !' });
    } catch {
      Toast.show({ type: 'error', text1: 'Adresse mail ou mot de passe incorrect' });
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(theme);

  return (
    <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo */}
        <View style={styles.logoBlock}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleMain}>Se connecter</Text>
          <Text style={styles.titleSub}>Accédez à votre programme fidélité</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={theme.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Adresse email"
              placeholderTextColor={theme.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={theme.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={theme.placeholder}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.buttonText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, (!request || loading) && { opacity: 0.6 }]}
            onPress={() => promptAsync()}
            disabled={!request || loading}
          >
            <AntDesign name="google" size={20} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>
              Pas encore de compte ?{" "}
              <Text style={styles.linkAccent}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    keyboardView: { flex: 1, backgroundColor: theme.bg },
    scrollContent: {
      flexGrow: 1, justifyContent: "center",
      paddingHorizontal: 24, paddingVertical: 60, gap: 36,
    },

    logoBlock: { alignItems: "center" },
    logo: { width: 200, height: 55, resizeMode: "contain" },

    titleBlock: { gap: 8 },
    titleMain: { color: theme.text, fontSize: 30, fontFamily: "LexendDeca_700Bold" },
    titleSub:  { color: theme.textMuted, fontSize: 14, fontFamily: "LexendDeca_400Regular" },

    form: { gap: 14 },
    inputWrapper: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border,
      borderRadius: 14, paddingHorizontal: 14, height: 54, gap: 10,
    },
    input: { flex: 1, color: theme.text, fontFamily: "LexendDeca_400Regular", fontSize: 15 },

    footer: { gap: 14, alignItems: "center" },
    button: {
      backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 16,
      alignItems: "center", width: "100%",
    },
    buttonText: { color: "white", fontSize: 16, fontFamily: "LexendDeca_700Bold" },

    separator: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
    separatorLine: { flex: 1, height: 1, backgroundColor: theme.border },
    separatorText: { color: theme.placeholder, fontFamily: "LexendDeca_400Regular", fontSize: 13 },

    googleBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border,
      borderRadius: 14, paddingVertical: 14, width: "100%", gap: 10,
    },
    googleBtnText: { color: theme.text, fontSize: 15, fontFamily: "LexendDeca_700Bold" },

    link: { color: theme.textMuted, fontSize: 14, fontFamily: "LexendDeca_400Regular", textAlign: "center" },
    linkAccent: { color: PRIMARY, fontFamily: "LexendDeca_700Bold" },
  });
}
