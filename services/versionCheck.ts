import * as Application from 'expo-application'
import { Platform, Alert, Linking } from 'react-native'

class VersionCheckService {
  // URL для проверки версий
  static STORE_URLS = {
    ios: 'https://itunes.apple.com/lookup?bundleId=com.ipla.hoccleve',
    android: 'https://play.google.com/store/apps/details?id=com.ipla.hoccleve&hl=en',
  }

  // Тестовый режим - принудительно показывать уведомление
  static TEST_MODE = false
  static TEST_VERSION = '1.0.4' // Версия для тестирования

  // Проверка обновления
  async checkForUpdate() {
    try {
      const currentVersion = Application.nativeApplicationVersion
      console.log('📱 Текущая версия приложения:', currentVersion)

      // Тестовый режим - принудительно показываем уведомление
      if (this.constructor.TEST_MODE) {
        console.log('🧪 Тестовый режим: принудительно показываем уведомление')
        this.showUpdateAlert()
        return true
      }

      const storeVersion = await this.getStoreVersion()
      console.log('🛒 Версия в магазине:', storeVersion)

      if (storeVersion && this.compareVersions(storeVersion, currentVersion) > 0) {
        console.log('✅ Найдена новая версия!')
        this.showUpdateAlert()
        return true
      } else {
        console.log('ℹ️ У вас актуальная версия приложения')
      }
      return false
    } catch (error) {
      console.error('❌ Ошибка при проверке обновлений:', error)
      return false
    }
  }

  // Получение версии из app store / google play
  async getStoreVersion() {
    try {
      if (Platform.OS === 'ios') {
        return await this.getIOSVersion()
      } else {
        return await this.getAndroidVersion()
      }
    } catch (error) {
      console.error('❌ Ошибка получения версии из магазина:', error)
      return null
    }
  }

  // Для iOS - используем iTunes API
  async getIOSVersion() {
    try {
      console.log('🔍 Проверяем версию в App Store...')
      const response = await fetch(this.constructor.STORE_URLS.ios)
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const version = data.results[0].version
        console.log('🍎 iOS версия в App Store:', version)
        return version
      }
      console.log('⚠️ Не удалось получить данные из App Store')
      return null
    } catch (error) {
      console.error('❌ Ошибка получения iOS версии:', error)
      return null
    }
  }

  // Для Android - парсим страницу Google Play
  // Для Android - используем официальный Google Play API
  async getAndroidVersion() {
    try {
      console.log('🔍 Проверяем версию в Google Play...')

      // Способ 1: Используем официальный Play Store API
      const playStoreUrl = `https://play.google.com/store/apps/details?id=com.ipla.hoccleve&hl=en`
      const response = await fetch(playStoreUrl)
      const text = await response.text()

      // Разные паттерны для поиска версии
      const patterns = [
        /<div[^>]*>Current Version<\/div><div[^>]*><span[^>]*>([0-9.]+)<\/span>/,
        /\[\[\[\"([0-9.]+)\"\]\]/,
        /"version":"([0-9.]+)"/,
        /Current Version.+?([0-9.]+)</,
        /itemprop="softwareVersion">([0-9.]+)</,
        /\[\[\["([0-9.]+)"\]\]/,
        /<div[^>]*class="[^"]*BgcNfc[^"]*"[^>]*>Current Version<\/div><span[^>]*>([0-9.]+)<\/span>/,
        /softwareVersion[^>]*>([0-9.]+)</,
      ]

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          const version = match[1]
          console.log('🤖 Android версия в Google Play:', version)
          return version
        }
      }

      // Способ 2: Альтернативный подход - используем сервисы-прокси
      console.log('🔄 Пробуем альтернативный метод...')
      const altVersion = await this.getAndroidVersionAlternative()
      if (altVersion) {
        return altVersion
      }

      console.log('⚠️ Не удалось найти версию на странице Google Play')
      return null
    } catch (error) {
      console.error('❌ Ошибка получения Android версии:', error)
      // Пробуем альтернативный метод при ошибке
      return await this.getAndroidVersionAlternative()
    }
  }

  // Альтернативный метод для Android
  async getAndroidVersionAlternative() {
    try {
      // Используем сторонний сервис для парсинга Google Play
      const proxyUrl = `https://api.playstoreapi.xyz/v1/app/com.ipla.hoccleve`

      const response = await fetch(proxyUrl)
      const data = await response.json()

      if (data && data.version) {
        console.log('🤖 Android версия через API:', data.version)
        return data.version
      }

      return null
    } catch (error) {
      console.error('❌ Ошибка альтернативного метода:', error)
      return null
    }
  }
  // Сравнение версий
  compareVersions(version1, version2) {
    console.log(version1)

    const v1 = version1.split('.').map(Number)
    const v2 = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0
      const num2 = v2[i] || 0

      if (num1 > num2) return 1
      if (num1 < num2) return -1
    }

    return 0
  }

  // Показ алерта с предложением обновить
  showUpdateAlert() {
    Alert.alert(
      'Доступно обновление 📱',
      'Вышла новая версия приложения. Обновите для получения новых функций и исправлений.',
      [
        {
          text: 'Обновить сейчас',
          onPress: () => this.openStore(),
          style: 'default',
        },
        {
          text: 'Напомнить позже',
          style: 'cancel',
          onPress: () => console.log('Пользователь отложил обновление'),
        },
      ],
      { cancelable: false }
    )
  }

  // Открытие магазина приложений
  // Открытие магазина приложений (упрощенная версия)
  openStore() {
    console.log('📲 Открываем магазин приложений...')

    if (Platform.OS === 'ios') {
      // Для iOS сразу открываем App Store
      const iosUrl = 'itms-apps://itunes.apple.com/app/com.ipla.hoccleve'
      console.log('🍎 Открываем App Store...')

      Linking.openURL(iosUrl).catch((err) => {
        console.log('❌ Не удалось открыть App Store через схему, пробуем веб-версию...')
        const webUrl = 'https://apps.apple.com/app/com.ipla.hoccleve'
        Linking.openURL(webUrl)
      })
    } else {
      // Для Android сразу открываем Google Play
      const androidUrl = 'market://details?id=com.ipla.hoccleve'
      console.log('🤖 Открываем Google Play...')

      Linking.openURL(androidUrl).catch((err) => {
        console.log('❌ Не удалось открыть Google Play через схему, пробуем веб-версию...')
        const webUrl = 'https://play.google.com/store/apps/details?id=com.ipla.hoccleve'
        Linking.openURL(webUrl)
      })
    }
  }

  // Метод для включения тестового режима
  enableTestMode() {
    this.constructor.TEST_MODE = true
    console.log('🧪 Тестовый режим включен')
  }

  // Метод для выключения тестового режима
  disableTestMode() {
    this.constructor.TEST_MODE = false
    console.log('🧪 Тестовый режим выключен')
  }
}

export default new VersionCheckService()
