import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../redux/hooks.ts'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../context/AuthContext.tsx'
import { Colors } from '../constants/Colors.ts'
import { TodayLessonButton } from '../components/TodayLessonButton/TodayLessonButton.tsx'

export const Header: React.FC<{ title: string; onMenuPress: () => void }> = ({
  title,
  onMenuPress,
}) => {
  const settings = useAppSelector((state) => state.settings.data)
  const isLoadingSettings = useAppSelector((state) => state.settings.status)

  const logo = settings?.find((el) => el.key === 'mainLogo')?.value
  const [apiUrl, setApiUrl] = useState<string | null>(null)
  const logoUrl = `https://backend.hoccleveclub.ru${logo}`
  const { top } = useSafeAreaInsets()

  useEffect(() => {
    const loadTokenAndPlatform = async () => {
      const platform = await AsyncStorage.getItem(API_URL)
      setApiUrl(platform)
    }
    loadTokenAndPlatform()
  }, [logo])

  return (
    <View style={[styles.header, { marginTop: Platform.OS === 'ios' ? top : top }]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        {isLoadingSettings === 'loading' ? (
          <ActivityIndicator />
        ) : (
          <Image source={{ uri: logoUrl }} style={styles.logoUrl} />
        )}
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
      </View>
      <TodayLessonButton />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    // height: 90,
    flexDirection: 'column',
    gap: 10,
    // alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    zIndex: 100,
    shadowColor: Colors.colorBlack, // Цвет тени
    shadowOffset: { width: 0, height: 4 }, // Смещение тени вниз, создавая тень только снизу
    shadowOpacity: 0.1, // Прозрачность тени
    shadowRadius: 4, // Радиус размытия тени
    elevation: 3, // Высота тени для Android
  },
  menuButton: {
    //  padding: 10,
    //  marginLeft: 10,
  },
  menuText: {
    color: '#000',
    fontSize: 30,
  },
  logoUrl: {
    width: 35,
    height: 35,
  },
})
