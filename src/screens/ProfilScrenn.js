import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from "react-native";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { LogOut } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Ici tu pourras sauvegarder le thème dans ton contexte ou AsyncStorage
  };

  const handleSave = () => {
    // Appel API pour modifier email / mot de passe
    console.log("Nouveau mail :", email);
    console.log("Nouveau mot de passe :", password);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "black" : "white" }]}>
    <Navbar />
      <Text style={[styles.title, { color: isDark ? "white" : "black" }]}>
        Profil utilisateur
      </Text>

      {/* Informations utilisateur */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: isDark ? "white" : "black" }]}>Nom</Text>
        <Text style={[styles.value, { color: isDark ? "red" : "black" }]}>{user.first_name}</Text>

        <Text style={[styles.label, { color: isDark ? "white" : "black" }]}>Prénom</Text>
        <Text style={[styles.value, { color: isDark ? "red" : "black" }]}>{user.last_name}</Text>

        <Text style={[styles.label, { color: isDark ? "white" : "black" }]}>Points</Text>
        <Text style={[styles.value, { color: isDark ? "red" : "black" }]}>{user.point}</Text>
      </View>

      {/* Modification email */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: isDark ? "white" : "black" }]}>Modifier l'email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? "#222" : "#eee", color: isDark ? "red" : "black" }]}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Modification mot de passe */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: isDark ? "white" : "black" }]}>Nouveau mot de passe</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? "#222" : "#eee", color: isDark ? "white" : "black" }]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Thème */}
      <View style={styles.themeRow}>
        <Text style={[styles.label, { color: isDark ? "white" : "black" }]}>Thème sombre</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      {/* Bouton sauvegarder */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Enregistrer</Text>
      </TouchableOpacity>

      {/* Bouton déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter </Text>
      </TouchableOpacity>

    {/* <LogOut color={"red"} size={20} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop:50
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  section: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
  },

  value: {
    fontSize: 18,
    marginBottom: 10,
  },

  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },

  saveButton: {
    backgroundColor: "#FF383C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  logoutButton: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:"10",
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
  },

  logoutText: {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    textAlign:"center",
    color: "white",
    fontSize: 18,
  },
});