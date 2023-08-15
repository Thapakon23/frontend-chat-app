import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Alert, Button, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react/cjs/react.development";
import Constants from 'expo-constants';
import axios from "axios";

export default function HomeView() {
    const navigation = useNavigation()
    const [friends, setFriends] = useState([])
    const API_SERVER = Constants.expoConfig.extra.REACT_APP_SERVER;

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            Alert.alert('Success', 'Signed out')
            navigation.navigate('Login');
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const getAllFriends = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get(`${API_SERVER}/getallfriends`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (Array.isArray(response.data)) {
                    setFriends(response.data);
                } else {
                    console.log("Response data is not an array:", response.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        getAllFriends();
    }, []);


    return (
        <SafeAreaView>
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                <Text style={{ fontSize: 20 }}>เพื่อนของคุณ</Text>
            </View>

            <View>
                {friends?.map((friend, index) => (
                    <View key={index} style={{ flexDirection: "row", justifyContent: 'space-around', alignItems: 'center', marginTop: 10 }}>
                        <Text>{friend?.friend_username}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Chat', { id: friend.user_id })}>
                            <Text>แชท</Text>
                        </TouchableOpacity>
                    </View>

                ))}
            </View>

            <View style={{ marginTop: 10 }}>
                <Button title="Log out" onPress={() => handleLogout()} />
            </View>
        </SafeAreaView>
    )
}
