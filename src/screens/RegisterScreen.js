import { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from "react-native";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = async () => {
    try {
      const res = await api.post("/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
      });

      console.log("REPONSE API REGISTER :", res.data);

      // Sinon tu peux rediriger vers Login :
      navigation.navigate("Login");

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.stretch}
          />
        </View>

        <View style={styles.choice}>
          <Text style={styles.title}>Créer un compte</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.titre}>Prénom :</Text>
          <TextInput
            placeholder="ex: Jean"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.titre}>Nom :</Text>
          <TextInput
            placeholder="ex: Dupont"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.titre}>Adresse mail :</Text>
          <TextInput
            placeholder="ex: jean@email.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.titre}>Téléphone :</Text>
          <TextInput
            placeholder="ex: 0612345678"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.titre}>Mot de passe :</Text>
          <TextInput
            placeholder="Minimum 6 caractères"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>

      <View style={styles.butlink}>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>

        <Text
          onPress={() => navigation.navigate("Login")}
          style={styles.link}
        >
          Déjà un compte ? Se connecter
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 20, color: "white" },
  container: {
    flex: 1,
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "black",
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "10%",
  },
  title: { fontSize: 24, marginBottom: 20, color: "white" },
  content: {
    alignItems: "center",
    width: "100%",
  },
  form: {
    width: "90%",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  link: {
    marginTop: 20,
    color: "blue",
    textAlign: "center",
  },
  stretch: {
    width: 200,
    height: 50,
    resizeMode: "contain",
  },
  butlink: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
