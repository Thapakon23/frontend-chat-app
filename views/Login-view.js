import React from 'react';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import {
    View,
    KeyboardAvoidingView,
    TextInput,
    StyleSheet,
    Text,
    Platform,
    TouchableWithoutFeedback,
    Button,
    Keyboard, TouchableOpacity, Alert
} from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react/cjs/react.development';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginView() {
    const navigation = useNavigation()
    const [user, setUser] = useState({})
    const API_SERVER = Constants.expoConfig.extra.REACT_APP_SERVER;

    useEffect(() => {
        const verifyToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                navigation.navigate('Home');
            } else {
                navigation.navigate('Login');
            }
        };
        verifyToken();
    }, []);

    const handleInputChange = (name, value) => {
        setUser({ ...user, [name]: value });
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${API_SERVER}/signin`, user);

            if (response?.status === 200) {
                const token = response?.data.token;
                await AsyncStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                Alert.alert('Success', 'Logged in successfully.');
                navigation.navigate('Home');
            }
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Invalid username/password');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Text style={styles.header}>Chat with Me</Text>
                    <View style={styles.inputView}>
                        <TextInput
                            name="username"
                            style={styles.inputText}
                            placeholder="Username"
                            placeholderTextColor="#003f5c"
                            onChangeText={(value) => handleInputChange("username", value)}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            secureTextEntry
                            name="password"
                            style={styles.inputText}
                            placeholder="Password"
                            placeholderTextColor="#003f5c"
                            onChangeText={(value) => handleInputChange("password", value)}
                        />
                    </View>
                    <TouchableOpacity style={styles.loginBtn} onPress={() => handleSubmit()}>
                        <Text style={styles.loginText}>LOGIN</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontWeight: 'bold',
        fontSize: 45,
        color: '#fb5b5a',
        marginBottom: 40,
    },
    inputView: {
        width: '80%',
        backgroundColor: '#465881',
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        padding: 20,
    },
    inputText: {
        height: 50,
        color: 'white',
    },
    loginBtn: {
        width: '80%',
        backgroundColor: '#fb5b5a',
        borderRadius: 25,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 10,
    },
    loginText: {
        color: 'white',
    },
    inner: {
        padding: 24,
        flex: 1,
        width: '100%', alignItems: 'center', justifyContent: 'center'
    },
    header: {
        fontSize: 36,
        marginBottom: 48,
    },
    textInput: {
        height: 40,
        borderColor: '#000000',
        borderBottomWidth: 1,
        marginBottom: 36,
    },
    btnContainer: {
        backgroundColor: 'white',
        marginTop: 12,
    },
});
