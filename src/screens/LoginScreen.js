import { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Toast from 'react-native-toast-message';


export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { email, password });

      console.log("REPONSE API LOGIN :", res.data);

      login(res.data.token, res.data.user);

          
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue sur Horizon Moto !'
      });

    
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Adresse mail ou mot de passe incorect',
      });
    }
  };


  return (
    <View style={styles.container}>

      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require("../../assets/logo.png")}
            style={styles.stretch}
          ></Image>
        </View>

        <View style={styles.choice}>
          <Text style={styles.title}>Se Connecter </Text> 
        </View>

        <View style={styles.form}>
          
          <Text style={styles.titre}>Adresse mail :</Text>
          <TextInput
            placeholder="ex: horizonmoto@contact.fr"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.titre}>Mot de passe : </Text>
          <TextInput
            placeholder="ex : horizon1250"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>



      <View style={styles.butlink}>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        <Text onPress={() => navigation.navigate("Register")} style={styles.link}>
          Pas de compte ? Inscription
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  titre: { fontSize: 20, color: "white"},
  container: { flex: 1, justifyContent: "space-around", padding: 20, backgroundColor: "black", gap: "20" },
  choice: {flexDirection: "row", gap: "10", alignItems: "center", justifyContent:"center", fontSize: "10"},
  header: { justifyContent: "center", alignItems: "center", width: "100%", height:"10%"},
  title: { fontSize: 24, marginBottom: 20, color:"white" },
  content:{ justifyContent:"start", alignItems:"center", gap:"20", width:"100%" },
  form:{ justifyContent:"center", width:"90%" ,gap:"10"},
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: "white" },
  link: { marginTop: 20, color: "blue", textAlign: "center" },
  stretch: { width: 200, height: 50, resizeMode: 'contain',},
  butlink: { justifyContent:"center", alignItems:"center"},
  button: { backgroundColor: 'red', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', width: "80%" },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', },
});