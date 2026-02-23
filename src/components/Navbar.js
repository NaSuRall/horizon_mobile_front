import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Home, QrCode, User } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Home color="white" size={28} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("QrCode")}>
        <QrCode color="white" size={28} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <User color="white" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,              
    left: 0,
    right: 0,
    height: 100,
    paddingTop:"15",
    backgroundColor: "black", 
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "red",
    zIndex: 999,  
  },
});