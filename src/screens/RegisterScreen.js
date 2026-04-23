import { useState, useContext, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Toast from 'react-native-toast-message';
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { Mail, Lock, User, Phone, AtSign, ChevronRight, ChevronLeft } from "lucide-react-native";
import { AntDesign } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

const PRIMARY = "#E3000F";
const GOOGLE_WEB_CLIENT_ID     = "589886121106-gq7ir45hi1gcmjl6lgk5ce8e6u5sc5t0.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "589886121106-6ndeismkr8c1t3jgjheuns71i0nfpnop.apps.googleusercontent.com";

const STEPS = [
  { id: 1, title: "Votre email",     subtitle: "On commence par votre adresse mail" },
  { id: 2, title: "Mot de passe",    subtitle: "Choisissez un mot de passe sécurisé" },
  { id: 3, title: "Votre identité",  subtitle: "Comment devons-nous vous appeler ?" },
  { id: 4, title: "Votre pseudo",    subtitle: "Choisissez un nom d'affichage unique" },
  { id: 5, title: "Votre téléphone", subtitle: "Pour vous contacter si besoin" },
];

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleResponse(response.authentication);
    }
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
        Toast.show({ type: "success", text1: "Compte créé avec Google !", text2: `Bienvenue ${data.user.first_name} !` });
      } else {
        Toast.show({ type: "error", text1: "Erreur Google", text2: data.error ?? "Une erreur est survenue" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Erreur réseau" });
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({
    email:      "",
    password:   "",
    confirm:    "",
    first_name: "",
    last_name:  "",
    pseudo:     "",
    phone:      "",
  });

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  if (!fontsLoaded) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
    );
  }

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    switch (step) {
      case 1:
        if (!form.email.includes("@")) {
          Toast.show({ type: "error", text1: "Email invalide" });
          return false;
        }
        return true;
      case 2:
        if (form.password.length < 6) {
          Toast.show({ type: "error", text1: "Mot de passe trop court", text2: "Minimum 6 caractères" });
          return false;
        }
        if (form.password !== form.confirm) {
          Toast.show({ type: "error", text1: "Les mots de passe ne correspondent pas" });
          return false;
        }
        return true;
      case 3:
        if (!form.first_name.trim() || !form.last_name.trim()) {
          Toast.show({ type: "error", text1: "Prénom et nom requis" });
          return false;
        }
        return true;
      case 4:
        if (!form.pseudo.trim()) {
          Toast.show({ type: "error", text1: "Pseudo requis" });
          return false;
        }
        return true;
      case 5:
        if (form.phone.length < 10) {
          Toast.show({ type: "error", text1: "Numéro de téléphone invalide" });
          return false;
        }
        return true;
    }
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < STEPS.length) setStep(s => s + 1);
    else handleSubmit();
  };

  // ✅ Une seule requête à la fin
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/register", {
        email:      form.email,
        password:   form.password,
        first_name: form.first_name,
        last_name:  form.last_name,
        pseudo:     form.pseudo,
        phone:      form.phone,
      });

      Toast.show({
        type: "success",
        text1: "Inscription réussie !",
        text2: `Bienvenue ${form.first_name} !`
      });

      navigation.navigate("Login");

    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'inscription",
        text2: err?.response?.data?.message ?? "Veuillez réessayer"
      });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = step === STEPS.length;

  return (
      <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior="padding"
      >
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

          {/* Progress bar */}
          <View style={styles.progressBlock}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / STEPS.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Étape {step} sur {STEPS.length}</Text>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>{STEPS[step - 1].title}</Text>
            <Text style={styles.titleSub}>{STEPS[step - 1].subtitle}</Text>
          </View>

          {/* Champs par étape */}
          <View style={styles.form}>

            {step === 1 && (
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#888888" />
                  <TextInput
                      style={styles.input}
                      placeholder="Adresse email"
                      placeholderTextColor="#555"
                      value={form.email}
                      onChangeText={v => update("email", v)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoFocus
                  />
                </View>
            )}

            {step === 2 && (
                <>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#888888" />
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor="#555"
                        secureTextEntry
                        value={form.password}
                        onChangeText={v => update("password", v)}
                        autoFocus
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#888888" />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmer le mot de passe"
                        placeholderTextColor="#555"
                        secureTextEntry
                        value={form.confirm}
                        onChangeText={v => update("confirm", v)}
                    />
                  </View>
                </>
            )}

            {step === 3 && (
                <>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#888888" />
                    <TextInput
                        style={styles.input}
                        placeholder="Prénom"
                        placeholderTextColor="#555"
                        value={form.first_name}
                        onChangeText={v => update("first_name", v)}
                        autoCapitalize="words"
                        autoFocus
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#888888" />
                    <TextInput
                        style={styles.input}
                        placeholder="Nom de famille"
                        placeholderTextColor="#555"
                        value={form.last_name}
                        onChangeText={v => update("last_name", v)}
                        autoCapitalize="words"
                    />
                  </View>
                </>
            )}

            {step === 4 && (
                <View style={styles.inputWrapper}>
                  <AtSign size={18} color="#888888" />
                  <TextInput
                      style={styles.input}
                      placeholder="Pseudo (ex: HorizonMoto)"
                      placeholderTextColor="#555"
                      value={form.pseudo}
                      onChangeText={v => update("pseudo", v)}
                      autoCapitalize="none"
                      autoFocus
                  />
                </View>
            )}

            {step === 5 && (
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#888888" />
                  <TextInput
                      style={styles.input}
                      placeholder="0612345678"
                      placeholderTextColor="#555"
                      value={form.phone}
                      onChangeText={v => update("phone", v)}
                      keyboardType="phone-pad"
                      autoFocus
                  />
                </View>
            )}

          </View>

          {/* Boutons */}
          <View style={styles.footer}>
            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleNext}
                disabled={loading}
            >
              {loading ? (
                  <ActivityIndicator color="white" />
              ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>
                      {isLastStep ? "Créer mon compte" : "Continuer"}
                    </Text>
                    {!isLastStep && <ChevronRight color="white" size={20} />}
                  </View>
              )}
            </TouchableOpacity>

            {step > 1 && (
                <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
                  <ChevronLeft color="#888888" size={16} />
                  <Text style={styles.backText}>Étape précédente</Text>
                </TouchableOpacity>
            )}

            {step === 1 && (
                <>
                  {/* Séparateur */}
                  <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>ou</Text>
                    <View style={styles.separatorLine} />
                  </View>

                  {/* Google */}
                  <TouchableOpacity
                      style={[styles.googleBtn, (!request || loading) && { opacity: 0.6 }]}
                      onPress={() => promptAsync()}
                      disabled={!request || loading}
                  >
                    <AntDesign name="google" size={20} color="#EA4335" />
                    <Text style={styles.googleBtnText}>S'inscrire avec Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.link}>
                      Déjà un compte ?{" "}
                      <Text style={styles.linkAccent}>Se connecter</Text>
                    </Text>
                  </TouchableOpacity>
                </>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: "#111111",
    justifyContent: "center", alignItems: "center",
  },
  keyboardView: {
    flex: 1, backgroundColor: "#111111",
  },
  scrollContent: {
    flexGrow: 1, justifyContent: "center",
    paddingHorizontal: 24, paddingVertical: 60, gap: 32,
  },

  logoBlock: { alignItems: "center" },
  logo: { width: 200, height: 55, resizeMode: "contain" },

  progressBlock: { gap: 8 },
  progressBar: {
    height: 4, backgroundColor: "#2A2A2A",
    borderRadius: 10, overflow: "hidden",
  },
  progressFill: {
    height: "100%", backgroundColor: PRIMARY, borderRadius: 10,
  },
  progressText: {
    color: "#888888", fontSize: 12,
    fontFamily: "LexendDeca_400Regular", textAlign: "right",
  },

  titleBlock: { gap: 6 },
  titleMain: { color: "white", fontSize: 28, fontFamily: "LexendDeca_700Bold" },
  titleSub:  { color: "#888888", fontSize: 14, fontFamily: "LexendDeca_400Regular" },

  form: { gap: 14 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 14, paddingHorizontal: 14, height: 54, gap: 10,
  },
  input: {
    flex: 1, color: "white",
    fontFamily: "LexendDeca_400Regular", fontSize: 15,
  },

  footer: { gap: 16, alignItems: "center" },
  button: {
    backgroundColor: PRIMARY, borderRadius: 14,
    paddingVertical: 16, width: "100%", alignItems: "center",
  },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  buttonText:  { color: "white", fontSize: 16, fontFamily: "LexendDeca_700Bold" },

  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: "#888888", fontSize: 14, fontFamily: "LexendDeca_400Regular" },

  link: { color: "#888888", fontSize: 14, fontFamily: "LexendDeca_400Regular", textAlign: "center" },
  linkAccent: { color: PRIMARY, fontFamily: "LexendDeca_700Bold" },

  separator: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#2A2A2A" },
  separatorText: { color: "#555", fontFamily: "LexendDeca_400Regular", fontSize: 13 },

  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 14, paddingVertical: 14, width: "100%", gap: 10,
  },
  googleBtnText: { color: "white", fontSize: 15, fontFamily: "LexendDeca_700Bold" },
});