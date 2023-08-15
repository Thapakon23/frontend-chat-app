import React, { useRef, useState, useEffect } from "react";
import {
    Text, TextInput, TouchableOpacity,
    View, StyleSheet, ScrollView,
    SafeAreaView, KeyboardAvoidingView, Platform,
    StatusBar, TouchableWithoutFeedback, Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from 'expo-constants';
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

export default function ChatView() {
    const route = useRoute()
    const { id } = route.params; // user_id that you talk with
    const navigation = useNavigation()
    const [user, setUser] = useState({})
    const chatContainerRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userInfo, setUserInfo] = useState()
    const API_SERVER = Constants.expoConfig.extra.REACT_APP_SERVER;

    useEffect(() => {
        const verifyToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login');
            }
        };
        verifyToken();
    }, []);

    // me
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get(`${API_SERVER}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response) {
                    setUser(response?.data[0]);
                }
            } catch (error) {
                console.error(error);
            }
        }
        getUserInfo()
    }, [])

    useEffect(() => {
        const getUserById = async () => {
            try {
                const response = await axios.get(`${API_SERVER}/getuserbyid?user_id=${id}`);
                if (response) {
                    setUserInfo(response?.data[0]);
                }
            } catch (error) {
                console.error(error);
            }
        }
        getUserById()
    }, [])

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${API_SERVER}/getMessageIsent?receiver_id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response) {
                setMessages(response?.data.sort((a, b) => a.send_time.localeCompare(b.send_time)));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [id]);

    const getMaxMessageId = async () => {
        try {
            const response = await axios.get(`${API_SERVER}/getMaxMessageId`);
            if (response) {
                const maxId = response?.data[0].maxId;

                if (maxId) {
                    const currentId = parseInt(maxId.slice(1));
                    const nextId = currentId + 1;
                    return `M${nextId.toString().padStart(4, '0')}`;
                } else {
                    return 'M0001';
                }
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const handleSendMessage = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const generatedID = await getMaxMessageId()
            const response = await axios.post(`${API_SERVER}/sendmessage`, {
                message_id: generatedID,
                message_text: newMessage,
                receiver_id: id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response?.status === 200) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollToEnd({ animated: false });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatMessageTime = (time) => {
        const messageTime = new Date(time);
        const now = new Date();

        const timeDiffInMinutes = Math.floor((now - messageTime) / (1000 * 60)); // Calculate time difference in minutes

        if (timeDiffInMinutes < 1) {
            return 'Just now'; // Message sent just now
        } else if (timeDiffInMinutes >= 1 && timeDiffInMinutes <= 5) {
            return `${timeDiffInMinutes} minutes ago`; // Message sent 2-5 minutes ago
        } else if (messageTime.toDateString() === now.toDateString()) {
            return `${messageTime.getHours()}:${messageTime.getMinutes().toString().padStart(2, '0')}`; // Today's message
        } else {
            // Message from earlier days
            return `${messageTime.toLocaleDateString()}, ${messageTime.getHours()}:${messageTime.getMinutes().toString().padStart(2, '0')}`;
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={25} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{userInfo?.username}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.profileButton}>
                    <Ionicons name="person-circle-outline" size={25} color="black" />
                </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    ref={chatContainerRef}
                    style={styles.chatContainer}
                    onContentSizeChange={() => scrollToBottom()}
                >
                    <View style={{ padding: 10 }}>
                        {messages
                            .filter(person => person.sender_id === id || person.sender_id === user?.user_id)
                            .sort((a, b) => a.send_time.localeCompare(b.send_time))
                            .map((message, index) => (
                                <View
                                    style={{
                                        maxWidth: '60%',
                                        alignSelf: message.sender_id === user?.user_id ? 'flex-end' : 'flex-start',
                                        backgroundColor: message.sender_id === user?.user_id ? '#E4E6EB' : '#007AFF',
                                        padding: 10, marginTop: 10, borderRadius: 10
                                    }}
                                    key={index}
                                >
                                    {/* <Text style={{ color: message.sender_id === user?.user_id ? '#000000' : '#FFFFFF' }}>
                                        {message?.sender}
                                    </Text> */}
                                    <Text style={{ color: message.sender_id === user?.user_id ? '#000000' : '#FFFFFF', fontSize: 16 }}>
                                        {message?.message_text}
                                    </Text>
                                    <Text style={{ color: message.sender_id === user?.user_id ? '#000000' : '#FFFFFF', marginTop: 10, fontSize: 12 }}>
                                        {formatMessageTime(message?.send_time)}
                                    </Text>
                                </View>
                            ))}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>

            <View style={styles.messageInputContainer}>
                <TextInput
                    value={newMessage}
                    onChangeText={(value) => setNewMessage(value)}
                    placeholder="Type your message..."
                    style={styles.messageInput}
                />

                {newMessage === '' || newMessage === undefined ? (
                    <View style={styles.sendButton2}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage()}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                )}

            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: StatusBar.currentHeight,
        justifyContent: 'space-between',
    },
    header: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
    },
    messageInput: {
        flex: 1,
        marginRight: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    sendButton2: {
        backgroundColor: '#C5C5C5',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    sendButtonText: {
        color: '#FFF',
    },
    backButton: {
        position: 'absolute',
        left: 20
    },
    profileButton: {
        position: 'absolute',
        right: 20
    }
});