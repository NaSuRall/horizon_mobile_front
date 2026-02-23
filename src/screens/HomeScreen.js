import { View, Text, StyleSheet, Button, Image } from "react-native";
import { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { Motorbike } from "lucide-react-native";
import Navbar from "../components/Navbar";


export default function HomeScreen() {
  const { logout, user } = useContext(AuthContext);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Image 
          source={require("../../assets/logo.png")}
          style={styles.logo}
        />

        <View style={styles.points}>
          <Text style={styles.textPoint}>{user.point}</Text>
          <Motorbike color="white" />
        </View>
      </View>

      { /*<Text style={styles.texte}>Bienvenue sur HorizonMobile</Text> */}

      <View style={styles.sectionScanheader}>
        <Image
          source={require("../../assets/horizonmoto.jpg")}
          style={styles.stretch}
        />

        <Text 
          onPress={() => navigation.navigate("QrCode")}
          style={styles.link}
        >
          Afficher le QR code
        </Text>
      </View>

      <View style={styles.logout}>
        <Button title="Se déconnecter" onPress={logout} />
      </View>

      <Navbar />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingTop: 50, 
    paddingLeft: 10, 
    paddingRight: 10, 
    height: "100%", 
    backgroundColor: "black"
  },

  logo: { width: "50%", height: 40 },

  stretch: { width: "100%", height: "100%", borderRadius: 10 },

  texte: { color: "white", fontSize: 20, marginVertical: 20,  },

  header: { width: "100%", height: "10%", flexDirection: "row" },

  textPoint: { color: "white", fontSize: 20 },

  points: { 
    gap: 10, 
    padding: 10, 
    backgroundColor: "#FF383C", 
    width: "45%", 
    borderRadius: 10, 
    height: "70%", 
    justifyContent: "center", 
    alignItems: "center", 
    flexDirection: "row" 
  },

  sectionScanheader: { 
    alignItems: "center", 
    justifyContent: "space-between", 
    height: 150, 
    backgroundColor: "white", 
    marginLeft: 20, 
    marginRight: 20, 
    borderRadius: 10 
  },

  link: { 
    padding: 10, 
    backgroundColor: "red", 
    width: "50%", 
    color: "black", 
    borderRadius: 10, 
    textAlign: "center", 
    position: "absolute", 
    bottom: 5 
  },

  logout: { 
    position: "absolute", 
    bottom: 50, 
    width: "100%" 
  }
});