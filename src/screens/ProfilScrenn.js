import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, Mail, Lock, Star } from "lucide-react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { useTheme, isLightColor } from "../context/ThemeContext";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const theme   = useTheme();
  const isLight = isLightColor(theme.primary);

  const [email, setEmail]       = useState(user.email);
  const [password, setPassword] = useState("");

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  const styles = makeStyles(theme, isLight);

  if (!fontsLoaded) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
  }

  const handleSave = () => {
    Toast.show({
      type: "info",
      text1: "Bientôt disponible",
      text2: "La modification du profil arrive prochainement",
    });
  };

  return (
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSpan}>Programme fidélité</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Avatar + nom */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>Niveau {user.rank ?? "Silver"}</Text>
            </View>
          </View>

          {/* Infos */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <User size={16} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Prénom</Text>
                <Text style={styles.infoValue}>{user.first_name}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <User size={16} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom</Text>
                <Text style={styles.infoValue}>{user.last_name}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Star size={16} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Points cumulés</Text>
                <Text style={styles.infoValueAccent}>{user.point} pts</Text>
              </View>
            </View>
          </View>

          {/* Modifier email */}
          <Text style={styles.sectionTitle}>Modifier mes informations</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Mail size={16} color="#888888" />
              <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Adresse email"
                  placeholderTextColor="#555"
                  keyboardType="email-address"
                  autoCapitalize="none"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Lock size={16} color="#888888" />
              <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor="#555"
              />
            </View>
          </View>

          {/* Bouton sauvegarder */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Enregistrer les modifications</Text>
          </TouchableOpacity>

          {/* Bouton déconnexion */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <LogOut color={theme.primary} size={18} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
  );
}

function makeStyles(theme, isLight) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1, backgroundColor: "#111111",
      justifyContent: "center", alignItems: "center",
    },
    container: {
      flex: 1, backgroundColor: "#111111", paddingTop: 50,
    },

    /* Header */
    header: {
      paddingHorizontal: 16, marginBottom: 8, alignItems: "flex-end",
    },
    headerSpan: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13 },

    scrollContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 16 },

    /* Avatar */
    avatarBlock: { alignItems: "center", gap: 10, marginTop: 8, marginBottom: 8 },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: theme.secondary,
      borderWidth: 2, borderColor: theme.primary,
      justifyContent: "center", alignItems: "center",
    },
    avatarText: {
      color: theme.primary,
      fontSize: 28, fontFamily: "LexendDeca_700Bold",
    },
    userName: {
      color: "white", fontSize: 22, fontFamily: "LexendDeca_700Bold",
    },
    rankBadge: {
      borderWidth: 1, borderColor: theme.primary,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4,
    },
    rankBadgeText: {
      color: theme.primary, fontSize: 13, fontFamily: "LexendDeca_400Regular",
    },

    /* Card */
    card: {
      backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
      borderRadius: 16, padding: 16, gap: 12,
    },
    divider: { height: 0.5, backgroundColor: "#2A2A2A" },

    /* Info rows */
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoContent: { flex: 1 },
    infoLabel: { color: "#888888", fontSize: 12, fontFamily: "LexendDeca_400Regular" },
    infoValue: { color: "white", fontSize: 15, fontFamily: "LexendDeca_700Bold" },
    infoValueAccent: {
      color: theme.primary, // ✅ thème
      fontSize: 15, fontFamily: "LexendDeca_700Bold",
    },

    /* Section title */
    sectionTitle: {
      color: "#888888", fontSize: 12,
      fontFamily: "LexendDeca_400Regular", letterSpacing: 1,
    },

    /* Input */
    inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    input: {
      flex: 1, color: "white",
      fontFamily: "LexendDeca_400Regular", fontSize: 15,
    },

    /* Save button */
    saveButton: {
      backgroundColor: theme.primary, // ✅ thème
      borderRadius: 14, paddingVertical: 16,
      alignItems: "center",
    },
    saveText: {
      color: isLight ? "#111111" : "white", // ✅ adaptatif
      fontSize: 16, fontFamily: "LexendDeca_700Bold",
    },

    /* Logout */
    logoutButton: {
      flexDirection: "row", justifyContent: "center",
      alignItems: "center", gap: 10,
      backgroundColor: "#1A1A1A",
      borderWidth: 1, borderColor: "#2A2A2A",
      borderRadius: 14, paddingVertical: 16,
    },
    logoutText: {
      color: theme.primary, // ✅ thème
      fontSize: 16, fontFamily: "LexendDeca_700Bold",
    },
  });
}