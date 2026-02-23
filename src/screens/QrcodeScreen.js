import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import QRCode from 'react-native-qrcode-svg';
import { Motorbike } from "lucide-react-native";
import Navbar from "../components/Navbar";
import { View, Text, StyleSheet, Button, Image } from "react-native";


export default function QrcodeScreen(){
     const { user } = useContext(AuthContext);

     const data = {
        user_id: user.id,
        point: user.point,
    }

    const qrContent = JSON.stringify(data);

    return (
        <View style={styles.container}>
        <Navbar />
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

            <View style={styles.qrcode}>
                <View style={styles.qrcodebg}>
                    <QRCode
                    
                        value={qrContent}
                        size={220}
                        color="black"
                        backgroundColor="white"
                    />  

                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerHeader}>
                    <Text style={styles.footerTitre}>Vos informations : </Text>
                </View>

                <Text>Prénom : {user.first_name} </Text>
                <Text>Nom :{user.last_name}</Text>
                <Text>Email : {user.email}</Text>
                <Text>Téléphone : {user.phone}</Text>
                <Text>Points : {user.point}</Text>
            </View>

        </View>
    )


}

const styles = StyleSheet.create({
    container:{flex:1, backgroundColor:"black", padding:20, paddingTop:50,},
    qrcode:{display:"flex", alignItems: "center", justifyContent:"center", width:"100%", padding:30},
    qrcodebg:{padding:20, backgroundColor:"white", borderRadius:10},
    header: { width: "100%", height: "10%", flexDirection: "row" },

    logo: { width: "50%", height: 40 },
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

    footer:{ backgroundColor:"white", height:"40%", width:"100%", borderRadius:10, padding:"10"},

    footerHeader:{ height:40, borderBlockColor:"black", borderBottomWidth:2 , marginBottom:10},
    footerTitre:{ fontSize:20},
    
})