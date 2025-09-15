import {RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useAuth} from "../context/AuthContext.tsx";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchSeminarianFullDataThunk, fetchStudentFullDataThunk, fetchUser} from "../redux/slises/userSlice.ts";

import {Banner} from "../components/Baner/Baner.tsx";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {UserLevel} from "../components/UserLevel/UserLevel.tsx";
import {FreeLearning} from "../components/FreeLearning/FreeLearning.tsx";
import {ReportsComponent} from "../components/ReportsComponent/ReportsComponent.tsx";
import {Courses} from "../components/Courses/Courses.tsx";
import {News} from "../components/News/News.tsx";
import {Colors} from "../constants/Colors.ts";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import LottieView from "lottie-react-native";
import {configureReanimatedLogger, ReanimatedLogLevel,} from 'react-native-reanimated';
import {usePushNotifications} from "../settings/usePushNotifications.ts";
import {hasRole} from "../settings/helpers.tsx";
import {CoursesBySeminarian} from "../components/CoursesBySeminarian/CoursesBySeminarian.tsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ClassReports} from "../components/ClassReports/ClassReports.tsx";
import {registerPushToken} from "../redux/slises/settingSlice.ts";
import {useNavigation} from "@react-navigation/native";


// This is the default configuration
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Reanimated runs in strict mode by default
});


const Home = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const {expoPushToken, notification} = usePushNotifications();

    const {authState, onLogout} = useAuth()
    console.log(expoPushToken)


    useEffect(() => {
        if (expoPushToken) {
            dispatch(registerPushToken({push_token: expoPushToken}))
        }
    }, [expoPushToken]);

    const  user = useAppSelector(state => state.user.user);
    const {isLoadingUser, isLoadingStudent, isLoadingSeminarian} = useAppSelector(state => state.user);
    const settings = useAppSelector((state) => state.settings.data);

    const isSeminarian = user ? hasRole(user, 'seminarian') : false;
    const currentRole = isSeminarian ? 'seminarian' : 'children';
    const isStudent = !isSeminarian;

    useEffect(() => {
        const saveRole = async () => {
            try {
                const storedRole = await AsyncStorage.getItem('USER_ROLE');

                if (!storedRole || storedRole !== currentRole) {
                    await AsyncStorage.setItem('USER_ROLE', currentRole);
                    console.log(`Роль обновлена: ${currentRole}`);
                } else {
                    console.log(`Роль из стораджа совпадает: ${storedRole}`);
                }
            } catch (error) {
                console.error('Ошибка при работе с AsyncStorage:', error);
            }
        };

        if (user) {
            saveRole();
        }
    }, [user]);

    const animation = useRef<LottieView>(null);
    // const isHideScheduleStudent = settings?.find(el => el.key === 'isHideScheduleStudent')?.value === '0'


    useEffect(() => {
        if (authState?.userId != null) {
            dispatch(fetchUser(authState.userId)); // Загрузка данных пользователя
        }
    }, [authState?.userId]);

    useEffect(() => {
        if (!isLoadingUser && user) {
            const isSeminarian = hasRole(user, "seminarian");
            const isStudent = !isSeminarian;

            if (isSeminarian && authState?.userId != null) {
                dispatch(fetchSeminarianFullDataThunk(authState.userId));
            } else if (isStudent) {
                dispatch(fetchStudentFullDataThunk(authState?.userId!));
            }
        }
    }, [isLoadingUser, user]);

    const onRefreshHandler = () => {
        if (isSeminarian && authState?.userId != null) {
            dispatch(fetchSeminarianFullDataThunk(authState.userId));
            return
        } else if (authState?.userId != null) {
            dispatch(fetchUser(authState.userId));
            dispatch(fetchStudentFullDataThunk(authState.userId));
        }
    }

    if (isLoadingUser || isLoadingStudent || isLoadingSeminarian) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <LottieView
                    autoPlay
                    ref={animation}
                    speed={0.5}
                    style={{
                        width: 200,
                        height: 200,
                        //  backgroundColor: '#eee',
                    }}
                    source={require('../../app/assets/loader.json')}
                />
            </View>
        )
    }

    return (
        <>
            <SafeAreaView style={{flex: 1}}>
                {/*<View style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>*/}
                {/*    <Text>Token: {expoPushToken?.data ?? ""}</Text>*/}
                {/*    <View style={{alignItems: 'center', justifyContent: 'center'}}>*/}
                {/*        <Text>Title: {notification && notification.request.content.title} </Text>*/}
                {/*        <Text>Body: {notification && notification.request.content.body}</Text>*/}
                {/*        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>*/}
                {/*    </View>*/}

                {/*</View>*/}
                <StatusBar backgroundColor={Colors.white} barStyle="dark-content"/>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: Colors.white,
                    }}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={false}
                                onRefresh={onRefreshHandler}/>
                        }>

                        {isStudent && (
                            <>
                                <Banner/>
                                {/*<FormulaConstructor/>*/}

                                <View style={
                                    [{flexDirection: 'row', gap: 10, marginBottom: 20},
                                        GlobalStyle.wrapperGL]
                                }>
                                    <UserLevel/>
                                    <FreeLearning/>
                                </View>
                                <ReportsComponent/>
                                <Courses/>
                                <News/>
                            </>
                        )}

                        {isSeminarian && (
                            <>
                                <Banner/>

                                <CoursesBySeminarian/>
                                <News/>
                                <ClassReports/>
                            </>
                        )}


                    </ScrollView>
                    <Toast config={toastConfig}/>
                </View>

            </SafeAreaView>

        </>
    );
};

export default Home;

const styles = StyleSheet.create({
    userImg: {
        width: 110,
        height: 110,
        borderRadius: 110 / 2,
        borderWidth: 4,
        borderColor: Colors.white,
    },
    drawerListWrapper: {
        marginTop: 25,
    },
});

