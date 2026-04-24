import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Switch,
} from "react-native";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, Mail, Lock, Star, KeyRound, Sun, Moon } from "lucide-react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { useTheme, isLightColor } from "../context/ThemeContext";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, logout, fetchWithAuth } = useContext(AuthContext);
  const theme   = useTheme();
  const isLight = isLightColor(theme.primary);

  const [email,           setEmail]           = useState(user.email);
  const [password,        setPassword]        = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSaving,        setIsSaving]        = useState(false);

  const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

  const styles = makeStyles(theme, isLight);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const handleSave = async () => {
    const body = {};

    if (email !== user.email) body.email = email;

    if (password.trim().length > 0) {
      if (currentPassword.trim().length === 0) {
        Toast.show({ type: "error", text1: "Champ requis", text2: "Saisissez votre mot de passe actuel" });
        return;
      }
      body.password         = password;
      body.current_password = currentPassword;
    }

    if (Object.keys(body).length === 0) {
      Toast.show({ type: "info", text1: "Aucune modification", text2: "Aucun champ n'a été modifié" });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.EXPO_PUBLIC_API_URL}/user/${user.id}`,
        { method: "PUT", body: JSON.stringify(body) }
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        Toast.show({ type: "error", text1: "Erreur", text2: data.error ?? "Une erreur est survenue" });
        return;
      }

      Toast.show({ type: "success", text1: "Profil mis à jour", text2: "Vos informations ont été enregistrées" });
      setPassword("");
      setCurrentPassword("");
    } catch (_) {
      Toast.show({ type: "error", text1: "Erreur réseau", text2: "Impossible de contacter le serveur" });
    } finally {
      setIsSaving(false);
    }
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

        {/* Apparence */}
        <Text style={styles.sectionTitle}>Apparence</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            {theme.isDark
              ? <Moon size={16} color={theme.textMuted} />
              : <Sun size={16} color={theme.textMuted} />
            }
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thème</Text>
              <Text style={styles.infoValue}>{theme.isDark ? "Mode sombre" : "Mode clair"}</Text>
            </View>
            <Switch
              value={!theme.isDark}
              onValueChange={theme.toggleMode}
              trackColor={{ false: theme.switchTrack, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Modifier email / mot de passe */}
        <Text style={styles.sectionTitle}>Modifier mes informations</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Mail size={16} color={theme.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Adresse email"
              placeholderTextColor={theme.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <Lock size={16} color={theme.textMuted} />
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Nouveau mot de passe"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          {password.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                <KeyRound size={16} color={theme.textMuted} />
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Mot de passe actuel"
                  placeholderTextColor={theme.placeholder}
                />
              </View>
            </>
          )}
        </View>

        {/* Sauvegarder */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? <ActivityIndicator size="small" color={isLight ? "#111111" : "white"} />
            : <Text style={styles.saveText}>Enregistrer les modifications</Text>
          }
        </TouchableOpacity>

        {/* Déconnexion */}
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
      flex: 1, backgroundColor: theme.bg,
      justifyContent: "center", alignItems: "center",
    },
    container: { flex: 1, backgroundColor: theme.bg, paddingTop: 50 },

    header: { paddingHorizontal: 16, marginBottom: 8, alignItems: "flex-end" },
    headerSpan: { color: theme.textMuted, fontFamily: "LexendDeca_400Regular", fontSize: 13 },

    scrollContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 16 },

    avatarBlock: { alignItems: "center", gap: 10, marginTop: 8, marginBottom: 8 },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: theme.secondary,
      borderWidth: 2, borderColor: theme.primary,
      justifyContent: "center", alignItems: "center",
    },
    avatarText: { color: theme.primary, fontSize: 28, fontFamily: "LexendDeca_700Bold" },
    userName:   { color: theme.text, fontSize: 22, fontFamily: "LexendDeca_700Bold" },
    rankBadge: {
      borderWidth: 1, borderColor: theme.primary,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4,
    },
    rankBadgeText: { color: theme.primary, fontSize: 13, fontFamily: "LexendDeca_400Regular" },

    card: {
      backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
      borderRadius: 16, padding: 16, gap: 12,
    },
    divider: { height: 0.5, backgroundColor: theme.border },

    infoRow:    { flexDirection: "row", alignItems: "center", gap: 12 },
    infoContent: { flex: 1 },
    infoLabel:   { color: theme.textMuted, fontSize: 12, fontFamily: "LexendDeca_400Regular" },
    infoValue:   { color: theme.text, fontSize: 15, fontFamily: "LexendDeca_700Bold" },
    infoValueAccent: { color: theme.primary, fontSize: 15, fontFamily: "LexendDeca_700Bold" },

    sectionTitle: {
      color: theme.textMuted, fontSize: 12,
      fontFamily: "LexendDeca_400Regular", letterSpacing: 1,
    },

    inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    input: {
      flex: 1, color: theme.text,
      fontFamily: "LexendDeca_400Regular", fontSize: 15,
    },

    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 14, paddingVertical: 16, alignItems: "center",
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveText: {
      color: isLight ? "#111111" : "white",
      fontSize: 16, fontFamily: "LexendDeca_700Bold",
    },

    logoutButton: {
      flexDirection: "row", justifyContent: "center",
      alignItems: "center", gap: 10,
      backgroundColor: theme.card,
      borderWidth: 1, borderColor: theme.border,
      borderRadius: 14, paddingVertical: 16,
    },
    logoutText: { color: theme.primary, fontSize: 16, fontFamily: "LexendDeca_700Bold" },
  });
}
