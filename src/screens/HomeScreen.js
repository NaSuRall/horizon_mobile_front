import { View, Text, StyleSheet, Button, Image } from "react-native";
import { useContext } from "react";            
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);
  const { user, userToken } = useContext(AuthContext);

  return (
    <View style={ styles.container}>

     <View style={styles.header}>
      
        <Image 
          source={require("../../assets/logo.png")}
          style={styles.logo}
        ></Image>

        <View style={styles.points}>
            <Text style={styles.textPoint}>{user.point} - POINTS</Text>
        </View>
     </View>

      <View style={styles.sectionScanheader}>
        <Image
          source={require("../../assets/horizonmoto.jpg")}
          style={styles.stretch}
        ></Image>
        <Text onPress={() => navigation.navigate("Home")} style={styles.link}>
          Afficer le QR code
        </Text>
      </View>

      <View style={styles.logout}>
        <Button title="Se déconnecter" onPress={logout} />
      </View>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 50, width:"auto", height:"100%", backgroundColor:"black", overflow:"scroll"},
  logo:{width:"50%", height:50},
  stretch: { width:"100%", height:"100%", borderRadius:10},
  header: { width: "100%", height:"10%", flexDirection:"row"},
  textPoint:{color:"white"},
  points:{ padding:"10", backgroundColor:"red", width:"45%", borderRadius:10, height:"70%", justifyContent: 'center', alignItems:"center"},
  sectionScanheader:{ display:"flex", alignItems:"center", justifyContent:"space-between", height:"150", backgroundColor:"white", marginLeft:"20", marginRight:"20", borderRadius:10},
  link:{ padding:10, backgroundColor:"red", width:"50%", color:"black", borderRadius:10, textAlign:"center", position:"absolute", bottom:5},
  logout:{ display:"flex", position:"absolute", bottom:"50"}
});