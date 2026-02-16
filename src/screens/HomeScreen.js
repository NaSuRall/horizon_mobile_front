import { View, Text, StyleSheet, Button } from "react-native";
import { useContext } from "react";            
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);
  const { user, userToken } = useContext(AuthContext);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bonjour {user?.first_name} {user?.last_name}</Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
});