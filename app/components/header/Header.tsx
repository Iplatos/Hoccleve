// import React, {useState} from 'react';
// import {
//     ActivityIndicator,
//     Button,
//     Image,
//     Modal,
//     Platform,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from "react-native";
// import {useNavigation} from "@react-navigation/native";
// import HomeTabIcon from "../../assets/img/HomeTabIcon.tsx";
// import {Colors} from "../../constants/Colors.ts";
// import {getCurrentRouteName} from "../../settings/Settings.ts";
// import {useAuth} from "../../context/AuthContext.tsx";
// import {useAppSelector} from "../../redux/hooks.ts";
// import UserIcon from "../../assets/icons/User-icon.tsx";
// import GroupsIcon from "../../assets/icons/Grops-icon.tsx";
// import HamburgerMenuIcon from "../../assets/icons/Hamburger-menu-icon.tsx";
// import DocumentMinusIcon from "../../assets/icons/Document-minus-icon.tsx";
// import SmileIcon from "../../assets/icons/Smile-icon.tsx";
// import WritingIcon from "../../assets/icons/Writing-icon.tsx";
// import ListCheckmarksIcon from "../../assets/icons/List-checkmarks-icon.tsx";
// import TableIcon from "../../assets/icons/Table-icon.tsx";
// import UnevenLineIcon from "../../assets/icons/Uneven-line-copy-icon.tsx";
// import {BalanceCard} from "../BalanceCard/BalanceCard.tsx";
// import ExitIcon from "../../assets/icons/Exit-icon.tsx";
// import SupportIcon from "../../assets/icons/Support-icon.tsx";
// import {useSafeAreaInsets} from "react-native-safe-area-context";
// import axios from "axios";
// import { ROUTES } from '../../constants/Routes.ts';
//
// // Функция для получения компонента иконки
// const getIconComponent = (iconName: string) => {
//     switch (iconName) {
//         case 'user':
//             return UserIcon;
//         case 'grops':
//             return GroupsIcon;
//         case 'hamburger_menu':
//             return HamburgerMenuIcon;
//         case 'document_minus':
//             return DocumentMinusIcon;
//         case 'smile':
//             return SmileIcon;
//         case 'writing':
//             return WritingIcon;
//         case 'list_checkmarks':
//             return ListCheckmarksIcon;
//         case 'table':
//             return TableIcon;
//         case 'uneven_line_copy':
//             return UnevenLineIcon;
//         default:
//             return HomeTabIcon; // Иконка по умолчанию
//     }
// };
//
// // Карта маршрутов для навигации
// const routeMap = {
//     '/': ROUTES.MAIN,
//     '/users': ROUTES.USERS,
// //    '/journal': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.JOURNAL},
//   //  '/reports': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.REPORTS},
//     '/requests': ROUTES.REQUESTS,
//     '/direction-editor': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.DIRECTION_EDITOR},
//     '/task-bank': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.TASK_BANK},
//     '/platform-settings': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.PLATFORM_SETTINGS},
//     '/advertisement': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.ADVERTISEMENT},
//     '/departments': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.DEPARTMENTS},
//     '/news': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.NEWS},
//     '/library': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.LIBRARY},
//     'support': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.SUPPORT},
//
//
//     '/homework': ROUTES.HOME_WORK,
//   //  '/video': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.VIDEO},
//     '/play': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.PLAY},
//     '/wallet': ROUTES.WALLET,
//     '/store': {navigator: ROUTES.SETTINGS_NAVIGATOR, screen: ROUTES.STORE},
//     '/rating': ROUTES.RATING,
//     '/profile': ROUTES.SETTINGS_NAVIGATOR, // Профиль
// };
//
//
// export const Header = () => {
//     const settings = useAppSelector((state) => state.settings.data);
//     const isLoadingSettings = useAppSelector((state) => state.settings.status);
//     const logo = settings?.find(el => el.key === 'mainLogo')?.value
//
//     const currentRouteName = getCurrentRouteName();
//     const {onLogout} = useAuth()
//     const basicMenu = useAppSelector(state => state.menu.basicItems)
//     const user = useAppSelector(state => state.user.user)
//
//     const [menuVisible, setMenuVisible] = useState(false);
//     const navigation = useNavigation();
//     const logoUrl = `${axios.defaults.baseURL}${logo}`
//     const avatarUrl = `https://api.lk-impulse.ru${user?.avatar_path}`;
//
//     const toggleMenu = () => {
//         setMenuVisible(!menuVisible);
//     };
//
//     const closeMenu = () => {
//         setMenuVisible(false);
//     };
//
//     const navigateTo = (url: string) => {
//         const route = routeMap[url];
//         if (typeof route === 'string') {
//             navigation.navigate(route);
//         } else if (route && route.navigator && route.screen) {
//             navigation.navigate(route.navigator, {screen: route.screen});
//         }
//         closeMenu();
//     };
//     const {top, bottom} = useSafeAreaInsets();
//
//     return (
//         <View style={[styles.header, {marginTop: Platform.OS === 'ios' ? top : 0}]}>
//             <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
//                 {
//                     isLoadingSettings === 'loading' ? <ActivityIndicator/> : <Image
//                         source={{ uri: logoUrl }}
//                         style={styles.logoUrl}
//                     />
//                 }
//
//             </View>
//
//             <TouchableOpacity onPress={toggleMenu}>
//                 <Text style={styles.menu}>☰</Text>
//             </TouchableOpacity>
//
//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={menuVisible}
//                 onRequestClose={closeMenu}
//             >
//                 <View style={[styles.modalContainer, {marginTop: Platform.OS === 'ios' ? top : 0}]}>
//                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25}}>
//                         <Image
//                             source={{ uri: avatarUrl }}
//                             style={styles.userImg}
//                         />
//                         <Text>{user && user.name}</Text>
//                     </View>
//                     <View style={{flex: 1, width: '100%'}}>
//                         {basicMenu && basicMenu.map((item) => {
//                             const IconComponent = getIconComponent(item.icon);
//                             return (
//                                 <TouchableOpacity
//                                     key={item.id}
//                                     style={styles.modalItem}
//                                     onPress={() => navigateTo(item.url)}
//                                 >
//                                     <IconComponent focused={currentRouteName === item.url} color={Colors.textGray}/>
//                                     <Text>{item.title}</Text>
//                                 </TouchableOpacity>
//                             );
//                         })}
//
//
//                         {/*<TouchableOpacity style={styles.modalItem} onPress={() => navigateTo(ROUTES.MAIN)}>*/}
//                         {/*    <HomeTabIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Главная</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity style={styles.modalItem} onPress={() => navigateTo(ROUTES.COURSES)}>*/}
//                         {/*    <CoursesTabIcon focused={currentRouteName === ROUTES.COURSES} color={Colors.textGray}/>*/}
//                         {/*    <Text>Курсы</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity style={styles.modalItem} onPress={() => navigateTo(ROUTES.HOME_WORK)}>*/}
//                         {/*    <HomeWorkTabIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Домашняя работа</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity*/}
//                         {/*    style={styles.modalItem}*/}
//                         {/*    onPress={() => {*/}
//                         {/*        navigation.navigate(ROUTES.SETTINGS_NAVIGATOR, {screen: ROUTES.VIDEO})*/}
//                         {/*        closeMenu();*/}
//                         {/*    }}>*/}
//                         {/*    <VideoTabIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Записи занятий</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity*/}
//                         {/*    style={styles.modalItem}*/}
//                         {/*    onPress={() => {*/}
//                         {/*        navigation.navigate(ROUTES.SETTINGS_NAVIGATOR, {screen: ROUTES.PLAY})*/}
//                         {/*        closeMenu();*/}
//                         {/*    }}>*/}
//                         {/*    <PlayIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Пятиминутки и игры</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity style={styles.modalItem} onPress={() => navigateTo(ROUTES.WALLET)}>*/}
//                         {/*    <WalletTabIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Оплата и скидки</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity*/}
//                         {/*    style={styles.modalItem}*/}
//                         {/*    onPress={() => {*/}
//                         {/*        navigation.navigate(ROUTES.SETTINGS_NAVIGATOR, {screen: ROUTES.STORE})*/}
//                         {/*        closeMenu();*/}
//                         {/*    }}>*/}
//                         {/*    <StoreIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Магазин Импульс</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity style={styles.modalItem} onPress={() => navigateTo(ROUTES.RATING)}>*/}
//                         {/*    <RatingTabIcon color={Colors.textGray}/>*/}
//                         {/*    <Text>Мой рейтинг</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                         {/*<TouchableOpacity style={styles.modalItem} onPress={() => navigateTo(ROUTES.SETTINGS_NAVIGATOR)}>*/}
//                         {/*    <Text>Профиль</Text>*/}
//                         {/*</TouchableOpacity>*/}
//                     </View>
//                     <BalanceCard/>
//                     <TouchableOpacity onPress={() => navigateTo('support')} style={styles.modalItem}>
//                         <SupportIcon/>
//                         <Text>Поддержка</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.modalItem} onPress={onLogout}>
//                         <ExitIcon/>
//                         <Text>Выход</Text>
//                     </TouchableOpacity>
//                 </View>
//             </Modal>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     header: {
//         position: 'absolute',
//         width: '100%',
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: '#fff',
//         zIndex: 100,
//         shadowOffset: {width: 0, height: 2},
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//
//     },
//     logo: {
//         width: 50,
//         height: 50,
//     },
//     logoUrl:{
//         width: 130,
//         height: 30
//     },
//     userImg: {
//         width: 50,
//         height: 50,
//         borderRadius: 100,
//
//     },
//     menu: {
//         fontSize: 30,
//     },
//     modalContainer: {
//         paddingVertical: 20,
//         paddingHorizontal: 15,
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'flex-start',
//         backgroundColor: Colors.white,
//     },
//     modalItem: {
//         width: '100%',
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 10,
//         paddingVertical: 10
//         //   marginVertical: 5,
//
//     },
//     exitBtn: {
//         flexDirection: 'row',
//         alignItems: 'center',
//
//
//     }
// });
