import { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Toast from 'react-native-toast-message';
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { Mail, Lock } from "lucide-react-native";

const PRIMARY = "#E3000F";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  if (!fontsLoaded) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
    );
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      login(res.data.token, res.data.user);
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue sur Horizon Moto !'
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Adresse mail ou mot de passe incorrect',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>Se connecter</Text>
            <Text style={styles.titleSub}>Accédez à votre programme fidélité</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#888888" />
              <TextInput
                  style={styles.input}
                  placeholder="Adresse email"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={18} color="#888888" />
              <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#555"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Footer */}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: "#111111",
    justifyContent: "center", alignItems: "center",
  },

  // ✅ KeyboardAvoidingView prend tout l'écran
  keyboardView: {
    flex: 1,
    backgroundColor: "#111111",
  },

  // ✅ ScrollView centre le contenu verticalement sans space-between
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
    gap: 36,
  },

  /* Logo */
  logoBlock: { alignItems: "center" },
  logo: { width: 200, height: 55, resizeMode: "contain" },

  /* Title */
  titleBlock: { gap: 8 },
  titleMain: {
    color: "white", fontSize: 30,
    fontFamily: "LexendDeca_700Bold",
  },
  titleSub: {
    color: "#888888", fontSize: 14,
    fontFamily: "LexendDeca_400Regular",
  },

  /* Form */
  form: { gap: 14 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1, borderColor: "#2A2A2A",
    borderRadius: 14, paddingHorizontal: 14, height: 54,
    gap: 10,
  },
  input: {
    flex: 1, color: "white",
    fontFamily: "LexendDeca_400Regular",
    fontSize: 15,
  },

  /* Footer */
  footer: { gap: 16, alignItems: "center" },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 14, paddingVertical: 16,
    alignItems: "center", width: "100%",
  },
  buttonText: {
    color: "white", fontSize: 16,
    fontFamily: "LexendDeca_700Bold",
  },
  link: {
    color: "#888888", fontSize: 14,
    fontFamily: "LexendDeca_400Regular",
    textAlign: "center",
  },
  linkAccent: {
    color: PRIMARY,
    fontFamily: "LexendDeca_700Bold",
  },
});