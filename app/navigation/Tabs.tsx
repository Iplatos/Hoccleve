import React from "react";
import {useNavigation} from "@react-navigation/native";
import {useAppSelector} from "../redux/hooks.ts";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {TabIconWrapper} from "../screens/TabNavigator/components/TabIconWrapper.tsx";
import {Colors} from "../constants/Colors.ts";
import GroupsIcon from "../assets/icons/Grops-icon.tsx";
import HomeTabIcon from "../assets/img/HomeTabIcon.tsx";
import SmileIcon from "../assets/icons/Smile-icon.tsx";
import {ROUTES} from "../constants/Routes.ts";
import DocumentMinusIcon from "../assets/icons/Document-minus-icon.tsx";
import PlayVideoIcon from "../assets/icons/Play-video-icon.tsx";
import CreditCardIcon from "../assets/icons/Credit-card-icon.tsx";
import CalendarIcon from "../assets/icons/Calendar-icon.tsx";
import ChatIcon from "../assets/icons/Chat-icon.tsx";
import PenIcon from "../assets/icons/Pen-icon.tsx";

const getTabIconComponent = (icon: string) => {
    switch (icon) {
        case 'grops':
            return GroupsIcon;
        case 'user':
            return HomeTabIcon;
        case 'smile':
            return SmileIcon;
        case 'document_minus':
            return DocumentMinusIcon;
        case 'play_video_rectangle':
            return PlayVideoIcon;
        case 'credit_card_2':
            return CreditCardIcon;
        case 'calendar':
            return CalendarIcon;
        case 'chatIcon':
            return ChatIcon;
        case 'pen':
            return PenIcon;
        // Добавите другие иконки здесь
        default:
            return HomeTabIcon;
    }
};

export const Tabs: React.FC<{ currentScreen: string; setScreen: (screenName: string) => void }> = (
    {
        currentScreen,
        setScreen
    }) => {
    const navigation = useNavigation();
    const mobileMenu = useAppSelector(state => state.menu.mobileItems);
    const {bottom} = useSafeAreaInsets();

    const {notifications} = useAppSelector(state => state.chatActiveUsers);
    const noReadMessagesLength = notifications && notifications.length;

    const ROUTE_VALUES = Object.values(ROUTES);

    const safeNavigate = (routeName: string) => {
        if (ROUTE_VALUES.includes(routeName)) {
            // @ts-ignore
            navigation.navigate(routeName);
            setScreen(routeName);
        } else {
            // @ts-ignore
            navigation.navigate(ROUTES.NOT_FOUND);
            setScreen(routeName);
        }
    };

    return (
        <View style={[styles.tabs, {marginBottom: bottom}]}>
            {mobileMenu && mobileMenu.length > 0 ? (
                <>
                    {mobileMenu.map((menuItem) => {
                        return (
                            <TouchableOpacity
                                key={menuItem.id}
                                onPress={() => safeNavigate(menuItem.name)}
                                style={[
                                    styles.tab,
                                    currentScreen === menuItem.name && styles.activeTab
                                ]}
                            >
                                <TabIconWrapper
                                    IconComponent={getTabIconComponent(menuItem.icon)}
                                    focused={currentScreen === menuItem.name}
                                />
                                <Text
                                    style={
                                        currentScreen === menuItem.name
                                            ? styles.activeTabText
                                            : styles.inactiveTabText
                                    }
                                >
                                    {menuItem.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Чат */}
                    <TouchableOpacity
                        onPress={() => safeNavigate(ROUTES.CHAT)}
                        style={[
                            styles.tab,
                            currentScreen === ROUTES.CHAT && styles.activeTab
                        ]}
                    >
                        <View style={{position: 'relative'}}>
                            <TabIconWrapper
                                IconComponent={getTabIconComponent('chatIcon')}
                                focused={currentScreen === ROUTES.CHAT}
                            />

                            {noReadMessagesLength > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {noReadMessagesLength > 99 ? '99+' : noReadMessagesLength}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text
                            style={
                                currentScreen === ROUTES.CHAT
                                    ? styles.activeTabText
                                    : styles.inactiveTabText
                            }
                        >
                            Чат
                        </Text>
                    </TouchableOpacity>

                    {/* Календарь */}
                    <TouchableOpacity
                        onPress={() => safeNavigate(ROUTES.CALENDAR)}
                        style={[
                            styles.tab,
                            currentScreen === ROUTES.CALENDAR && styles.activeTab
                        ]}
                    >
                        <TabIconWrapper
                            IconComponent={getTabIconComponent('calendar')}
                            focused={currentScreen === ROUTES.CALENDAR}
                        />
                        <Text
                            style={
                                currentScreen === ROUTES.CALENDAR
                                    ? styles.activeTabText
                                    : styles.inactiveTabText
                            }
                        >
                            Календарь
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <TouchableOpacity
                    onPress={() => safeNavigate(ROUTES.MAIN)}
                    style={[styles.tab, currentScreen === ROUTES.MAIN && styles.activeTab]}
                >
                    <Text
                        style={
                            currentScreen === ROUTES.MAIN
                                ? styles.activeTabText
                                : styles.inactiveTabText
                        }
                    >
                        Home
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tabs: {
        height: 75,
        paddingTop: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000', // Цвет тени
        shadowOffset: {
            width: 0,
            height: -3, // Отступ для создания тени сверху
        },
        shadowOpacity: 0.1, // Прозрачность тени
        shadowRadius: 3, // Радиус размытия тени
        elevation: 5, // Используется для Android
        backgroundColor: '#fff', // Чтобы тень была видна, нужен цвет фона
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 5,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tab: {

        flex: 1,
        //   justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {},
    inactiveTabText: {
        color: Colors.colorBlack,
        textAlign: 'center',
        fontSize:12
    },
    activeTabText: {
        textAlign: 'center',
        color: Colors.active,
        fontSize:12

    },
});
