import React, {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext.tsx";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {AppNavigator} from "./AppNavigator.tsx";
import {Tabs} from "./Tabs.tsx";
import {Menu} from "../components/Menu/Menu.tsx";
import {LoginScreen} from "../screens/auth/LoginScreen.tsx";
import {Header} from "./Header.tsx";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchPlatforms} from "../redux/slises/settingSlice.ts";
import {useRoute} from "@react-navigation/native";
import {navigationRef} from "../settings/navigationRef.ts";
import {ROUTES} from "../constants/Routes.ts";

export const MainComponent: React.FC = () => {
    const dispatch = useAppDispatch()
    const {authState} = useAuth();
    console.log('MainComponent', authState);


    const [currentScreen, setCurrentScreen] = useState('main');
    const [menuOpen, setMenuOpen] = useState(false);
    const [routeName, setRouteName] = useState<string | undefined>(undefined);

    useEffect(() => {
        dispatch(fetchPlatforms());
    }, []);

    // Слушаем изменения маршрута
    useEffect(() => {
        const unsubscribe = navigationRef.addListener('state', () => {
            const currentRoute = navigationRef.getCurrentRoute();
            setRouteName(currentRoute?.name);
        });

        return unsubscribe;
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleMenuItemPress = (screen: string) => {
        setCurrentScreen(screen);
        setMenuOpen(false);
    };

    const isChatScreen =
        // routeName === ROUTES.CHAT ||
        routeName === ROUTES.CHAT_DETAIL;


    return (
        <View style={styles.fullscreen}>

            {authState?.authenticated ? (
                <>
                    {/*<KeyboardAvoidingView*/}
                    {/*    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}*/}
                    {/*    style={{flex: 1}}>*/}
                    {/*<TouchableWithoutFeedback onPress={Keyboard.dismiss}>*/}
                    {/*    <>*/}
                    {!isChatScreen && (
                        <Header title={currentScreen} onMenuPress={toggleMenu}/>
                    )}
                    <AppNavigator/>

                    <Menu currentScreen={currentScreen} onMenuItemPress={handleMenuItemPress}
                          menuOpen={menuOpen}/>
                    {/*</>*/}

                    {/*</TouchableWithoutFeedback>*/}
                    {/*</KeyboardAvoidingView>*/}
                    {!isChatScreen && (
                        <Tabs currentScreen={currentScreen} setScreen={setCurrentScreen}/>
                    )}
                </>
            ) : (
                <LoginScreen/> // Показываем экран входа если пользователь не аутентифицирован
            )}

        </View>

    );
};

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
