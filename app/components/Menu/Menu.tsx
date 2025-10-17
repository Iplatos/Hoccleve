import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors } from '../../constants/Colors.ts'
import { BalanceCard } from '../BalanceCard/BalanceCard.tsx'
import SupportIcon from '../../assets/icons/Support-icon.tsx'
import ExitIcon from '../../assets/icons/Exit-icon.tsx'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts'
import { API_URL, useAuth } from '../../context/AuthContext.tsx'
import UserIcon from '../../assets/icons/User-icon.tsx'
import GroupsIcon from '../../assets/icons/Grops-icon.tsx'
import HamburgerMenuIcon from '../../assets/icons/Hamburger-menu-icon.tsx'
import DocumentMinusIcon from '../../assets/icons/Document-minus-icon.tsx'
import SmileIcon from '../../assets/icons/Smile-icon.tsx'
import WritingIcon from '../../assets/icons/Writing-icon.tsx'
import ListCheckmarksIcon from '../../assets/icons/List-checkmarks-icon.tsx'
import TableIcon from '../../assets/icons/Table-icon.tsx'
import UnevenLineIcon from '../../assets/icons/Uneven-line-copy-icon.tsx'
import HomeTabIcon from '../../assets/img/HomeTabIcon.tsx'
import { fetchMenu } from '../../redux/slises/menuSlice.ts'
import { useNavigation } from '@react-navigation/native'
import { ROUTES } from '../../constants/Routes.ts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LottieView from 'lottie-react-native'
import ListIcon from '../../assets/icons/List-Icon.tsx'
import UserRoundIcon from '../../assets/icons/User-round-icon.tsx'
import MicrophoneIcon from '../../assets/icons/Microphone-icon.tsx'
import UsersIcon from '../../assets/icons/Users-Icon.tsx'
import FAQIcon from '../../assets/icons/FAQ-Icon.tsx'
import PenIcon from '../../assets/icons/Pen-icon.tsx'
import CreditCard2Icon from '../../assets/icons/Credit-card2-icon.tsx'
import AlignCenterIcon from '../../assets/icons/Align-centr-icon.tsx'
import { AntDesign } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { toastConfig } from '../../settings/ToastHelper.tsx'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

interface MenuProps {
  currentScreen: string
  menuOpen: boolean
  onMenuItemPress: (screen: string) => void
}

// Функция для получения компонента иконки
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'user':
      return UserIcon
    case 'grops':
      return GroupsIcon
    case 'hamburger_menu':
      return HamburgerMenuIcon
    case 'document_minus':
      return DocumentMinusIcon
    case 'smile':
      return SmileIcon
    case 'writing':
      return WritingIcon
    case 'list_checkmarks':
      return ListCheckmarksIcon
    case 'table':
      return TableIcon
    case 'uneven_line_copy':
      return UnevenLineIcon
    case 'list':
      return ListIcon
    case 'user_round':
      return UserRoundIcon
    case 'microphone':
      return MicrophoneIcon
    case 'users':
      return UsersIcon
    case 'Artboard_123':
      return FAQIcon
    case 'pen':
      return PenIcon
    case 'credit_card_2':
      return CreditCard2Icon
    case 'align_center':
      return AlignCenterIcon
    default:
      return HomeTabIcon // Иконка по умолчанию
  }
}

export const Menu: React.FC<MenuProps> = ({ menuOpen, currentScreen, onMenuItemPress }) => {
  const dispatch = useAppDispatch()
  const { onLogout } = useAuth()
  const navigation = useNavigation()
  const { top } = useSafeAreaInsets()

  const user = useAppSelector((state) => state.user.user)
  const basicMenu = useAppSelector((state) => state.menu.basicItems)
  const settings = useAppSelector((state) => state.settings.data)

  const logo = settings?.find((el) => el.key === 'mainLogo')?.value
  const [apiUrl, setApiUrl] = useState<string | null>(null)

  const avatarUrl = `${apiUrl}${user?.avatar_path}`
  const isDisableStudentSupportRequests =
    settings?.find((el) => el.key === 'isDisableStudentSupportRequests')?.value === '1'
  const isFreeCourses = settings?.find((el) => el.key === 'isFreeCourses')?.value === '1'

  useEffect(() => {
    const loadTokenAndPlatform = async () => {
      const platform = await AsyncStorage.getItem(API_URL)
      setApiUrl(platform)
    }
    loadTokenAndPlatform()
  }, [logo])

  const onLogoutHandler = () => {
    // @ts-ignore
    onLogout()
    onMenuItemPress(ROUTES.MAIN)
  }

  const iconColor = useCallback(
    (name: string) => (currentScreen === name ? Colors.colorAccent : Colors.textGray),
    [currentScreen]
  )

  /**
   * id открытых папок
   */
  const [expandedFolders, setExpandedFolders] = useState<number[]>([])
  console.log(basicMenu)

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      if (prev.includes(folderId)) {
        return prev.filter((id) => id !== folderId)
      } else {
        return [...prev, folderId]
      }
    })
  }

  const ROUTE_VALUES = Object.values(ROUTES)

  const safeNavigate = (routeName: string) => {
    console.log(routeName)
    if (routeName === 'home-work') {
      navigation.navigate(ROUTES.HOME_WORK)
      onMenuItemPress('homeWork')
    }
    if (ROUTE_VALUES.includes(routeName)) {
      // @ts-ignore
      navigation.navigate(routeName)
      onMenuItemPress(routeName)
    } else {
      // @ts-ignore
      navigation.navigate(ROUTES.NOT_FOUND)
      onMenuItemPress(routeName)
    }
  }

  return (
    <SafeAreaView>
      <Modal animationType="slide" transparent visible={menuOpen}>
        <View
          style={[
            styles.modalContainer,
            {
              marginTop: Platform.OS === 'ios' ? top : 0,
              height: Platform.OS === 'ios' ? windowHeight - 50 : windowHeight,
            },
          ]}
        >
          {/* Верхний блок */}
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 10 }}>
              <Image source={{ uri: avatarUrl }} style={styles.userImg} />
              <Text style={{ fontSize: 18 }}>{user?.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onMenuItemPress(currentScreen)}
              style={styles.closeButton}
            >
              <Text style={{ fontSize: 24 }}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {basicMenu.map((section, idx) => {
              const folder = section.folder
              const items = section.items

              if (folder) {
                const isExpanded = expandedFolders.includes(folder.id)
                return (
                  <View key={folder.id} style={{ backgroundColor: '#ebfff4', borderRadius: 10 }}>
                    <TouchableOpacity
                      style={styles.folderHeader}
                      onPress={() => toggleFolder(folder.id)}
                    >
                      <Text style={styles.folderTitle}>{folder.title}</Text>
                      <AntDesign
                        name={isExpanded ? 'up' : 'down'}
                        size={18}
                        color={Colors.colorDark}
                      />
                    </TouchableOpacity>
                    {isExpanded &&
                      items.map((item) => {
                        const IconComponent = getIconComponent(item.icon)
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.modalItem, { paddingLeft: 20 }]}
                            onPress={() => {
                              safeNavigate(item.name)
                            }}
                          >
                            <IconComponent
                              focused={currentScreen === item.name}
                              color={iconColor(item.name)}
                            />
                            <Text
                              style={{
                                color: iconColor(item.name),
                              }}
                            >
                              {item.title}
                            </Text>
                            {item.noticeCount !== null && item?.noticeCount > 0 && (
                              <View style={styles.countBlock}>
                                <Text style={styles.count}>{String(item.noticeCount)}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        )
                      })}
                  </View>
                )
              } else {
                // Без папки
                return items.map((item) => {
                  const IconComponent = getIconComponent(item.icon)
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.modalItem}
                      onPress={() => {
                        safeNavigate(item.name)
                      }}
                    >
                      <IconComponent
                        focused={currentScreen === item.name}
                        color={iconColor(item.name)}
                      />
                      <Text
                        style={{
                          color: iconColor(item.name),
                        }}
                      >
                        {item.title}
                      </Text>
                      {item.noticeCount !== null && item?.noticeCount > 0 && (
                        <View style={styles.countBlock}>
                          <Text style={styles.count}>{String(item.noticeCount)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })
              }
            })}
          </ScrollView>
          {/* Блок с балансом */}
          {/* {isFreeCourses && <BalanceCard/>} */}

          {/* Кнопка поддержки */}
          {!isDisableStudentSupportRequests && (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                // @ts-ignore
                navigation.navigate(ROUTES.SUPPORT)
                onMenuItemPress(ROUTES.SUPPORT)
              }}
            >
              <SupportIcon />
              <Text style={{ color: iconColor(ROUTES.SUPPORT) }}>Поддержка</Text>
            </TouchableOpacity>
          )}

          {/* Кнопка выхода */}
          <TouchableOpacity style={styles.modalItem} onPress={onLogoutHandler}>
            <ExitIcon />
            <Text>Выход</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  closeButton: {
    padding: 10,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: '100%',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  folderHeader: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ebfff4',
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.colorDark,
  },
  menuItem: {
    padding: 16,
  },
  activeMenuText: {
    fontWeight: 'bold',
  },
  inactiveMenuText: {
    color: '#888',
  },
  countBlock: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundPurple,
  },
  count: {
    fontSize: 16,
    color: Colors.white,
  },

  userImg: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  modalContainer: {
    //   position: 'absolute',
    //   width: windowWidth,
    //  height: bottomHeight,
    paddingVertical: 20,
    paddingHorizontal: 15,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
  },
  modalItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    //   marginVertical: 5,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
