import { View, Text, StyleSheet } from "react-native";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text>Bienvenue sur Horizon moto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,               // ← OBLIGATOIRE pour un écran
    justifyContent: "center",
    alignItems: "center",
  },
});
