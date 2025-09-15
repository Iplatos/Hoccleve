import React, {createContext, useContext, useEffect, useState} from "react";
import {FlatList, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useAppSelector} from "../redux/hooks.ts";
import axiosInstance from "../services/axios/instans.ts";

interface AuthProps {
    loading?: boolean;
    authState?: { token: string | null; authenticated: boolean | null, userId: number | null };
    onRegister?: (email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

export const TOKEN_KEY = 'my-jwt';
export const REFRESH_TOKEN_KEY = 'my-refresh-jwt';
export const API_URL = 'selected-platform';
export const API_URL_NAME = 'api-url-name';
export const USER_ID = 'user-id';

interface Platform {
    url: string;
    data: {
        token: string;
        refresh_token: string;
        user: { id: number };
    };
    urlName: string
}

const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({children}: any) => {

    const platforms = useAppSelector((state) => state.settings.platforms);
    console.log(platforms)
    const [authState, setAuthState] = useState<{
        token: string | null,
        userId: number | null,
        authenticated: boolean | null
    }>({
        token: null,
        userId: null,
        authenticated: false
    });
    const [loading, setLoading] = useState(false);
    const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([]);
    const [showPlatformSelection, setShowPlatformSelection] = useState(false);

    useEffect(() => {
        const loadTokenAndPlatform = async () => {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const platform = await AsyncStorage.getItem(API_URL);
            const userIdStr = await AsyncStorage.getItem(USER_ID);

            if (token && platform) {
                const cleanedToken = token.replace(/^"(.*)"$/, '$1'); // Удаление кавычек

                axios.defaults.baseURL = platform;
                axiosInstance.defaults.baseURL = platform;
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${cleanedToken}`;

                const userId = userIdStr ? parseInt(userIdStr, 10) : null;

                setAuthState({
                    token: cleanedToken,
                    authenticated: true,
                    userId: userId
                });
            } else {
                console.log('Токен или платформа не найдены');
            }
        };
        loadTokenAndPlatform();
    }, []);

    const attemptLogin = async (email: string, password: string, url: string, urlName: string) => {
        try {
            const result = await axios.post(`${url}v1/auth/login/?expand=roles`, {email, password},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': urlName, // ← добавили заголовок Origin
                    },
                });

            if (result.data.token) {
                return {success: true, data: result.data, url, urlName};
            }
        } catch (error: unknown) {
            let errorMessage = "Unknown error occurred";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = error.response.data?.error?.[0]?.password || errorMessage;
                    // console.log(`Login attempt failed for ${url}`, errorMessage);
                } else if (error.request) {
                    errorMessage = "No response received from server";
                    //  console.log(`Login attempt failed for ${url}`, error.request);
                } else {
                    errorMessage = error.message;
                    // console.log(`Login attempt failed for ${url}`, error.message);
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
                //console.log(`Login attempt failed for ${url}`, error.message);
            } else {
                // console.log(`Login attempt failed for ${url}`, error);
            }

            return {success: false, data: null, url, error: errorMessage};
        }

        return {success: false, data: null, url, error: "Unknown error occurred"};
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        const loginResults = await Promise.all(platforms.map(url => attemptLogin(email, password, url.path, url.name)));
        const successfulLogins = loginResults.filter(result => result.success);

         console.log('successfulLogins', successfulLogins)
        //
        // const urlName = platforms.find(el => el.path === successfulLogins[0].url);
        // console.log('urlName', urlName)
        // console.log('platforms', platforms)

        if (successfulLogins.length === 0) {
            setLoading(false);
            const firstError = loginResults.find(result => result.error)?.error || 'Unknown error';
            return {error: true, msg: firstError};
        } else if (successfulLogins.length === 1) {
            const {token, refresh_token, user} = successfulLogins[0].data;
            const url = successfulLogins[0].url;
            const urlName = successfulLogins[0].urlName;
            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(API_URL, url);
            await AsyncStorage.setItem(API_URL_NAME, urlName);
            await AsyncStorage.setItem(USER_ID, user.id.toString());
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(refresh_token));
            axiosInstance.defaults.baseURL = url;
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.replace(/^"(.*)"$/, '$1')}`

            setAuthState({
                token: token,
                authenticated: true,
                userId: user.id
            });

            setLoading(false);
            return successfulLogins[0];
        } else {
            setAvailablePlatforms(successfulLogins);
            setShowPlatformSelection(true);
            setLoading(false);
        }
    };

    const handlePlatformSelection = async (selectedPlatform) => {
        const {token, refresh_token, user, } = selectedPlatform.data;
        const urlName = selectedPlatform.urlName
        console.log(token, refresh_token, user,  )
        const url = selectedPlatform.url;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(API_URL, url);
        await AsyncStorage.setItem(API_URL_NAME, urlName);
        await AsyncStorage.setItem(USER_ID, user.id.toString());
        if (refresh_token) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(refresh_token));
        }
        axiosInstance.defaults.baseURL = url;
        axios.defaults.baseURL = url;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setAuthState({
            token: token,
            authenticated: true,
            userId: user.id
        });
        setShowPlatformSelection(false);
    };

    const logout = async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(API_URL);
        await AsyncStorage.removeItem(API_URL_NAME);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        setAuthState({
            token: null,
            authenticated: false,
            userId: null
        });
    };

    const value = {
        onLogin: login,
        onLogout: logout,
        authState,
        loading
    };

    const getPlatformName = (url: string) => {
        const platform = platforms.find((platform) => platform.path === url);
        return platform ? platform.name : url; // Возвращаем название или URL, если платформа не найдена
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {showPlatformSelection && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showPlatformSelection}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Выберите платформу</Text>
                            <FlatList
                                data={availablePlatforms}

                                keyExtractor={(item) => item.url + item.urlName}
                                renderItem={({item}) => {
                                   return (
                                        <TouchableOpacity
                                            style={styles.platformItem}
                                            onPress={() => handlePlatformSelection(item)}>
                                            <Text style={styles.itemText}>
                                                Url: {getPlatformName(item.url)}
                                            </Text>
                                            <Text style={styles.itemText}>
                                                База данных: {getPlatformName(item.urlName)}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </AuthContext.Provider>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10
    },
    platformItem: {

        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    itemText: {
        fontSize: 16,
    }
});
