import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Calendar, Plus, FileText, Users, QrCode } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

        {/* Left icons */}
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Home color="white" size={26} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
          <Calendar color="white" size={26} />
        </TouchableOpacity>

        {/* Center big button */}
        <TouchableOpacity 
          style={styles.centerButton}
          onPress={() => navigation.navigate("QrCode")}
        >
          <QrCode color="white" size={32} />
        </TouchableOpacity>

        {/* Right icons */}
        <TouchableOpacity onPress={() => navigation.navigate("Gain")}>
          <FileText color="white" size={26} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Profil")}>
          <Users color="white" size={26} />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },

  container: {
    width: "100%",
    height: 70,
    backgroundColor: "#FF383C", // 🔥 couleur comme ton image
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  centerButton: {
    width: 70,
    height: 70,
    backgroundColor: "black",
    borderColor:"white",
    borderWidth:2,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -35, 
    elevation: 10,
  },
});