import React from 'react'
import { Provider } from 'react-redux'
import store from './app/redux/store/store.ts'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './app/context/AuthContext.tsx'
import { NavigationContainer } from '@react-navigation/native'
import { MainComponent } from './app/navigation/MainComponent.tsx'
import { LogBox } from 'react-native'
import { navigationRef } from './app/settings/navigationRef.ts'
import { PaperProvider } from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import Toast from 'react-native-toast-message'
import { toastConfig } from './app/settings/ToastHelper.tsx'

const App = () => {
  return (
    <Provider store={store}>
      <ActionSheetProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider>
            <AuthProvider>
              <SafeAreaProvider>
                {/*<WebSocketProvider>*/}
                <NavigationContainer
                  ref={navigationRef}
                  onReady={() => {
                    console.log(
                      'Navigation ready, current route:',
                      navigationRef.getCurrentRoute()?.name
                    )
                  }}
                  onStateChange={() => {
                    console.log('Route changed to:', navigationRef.getCurrentRoute()?.name)
                  }}
                >
                  <MainComponent />
                </NavigationContainer>
                {/*</WebSocketProvider>*/}
              </SafeAreaProvider>
            </AuthProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </ActionSheetProvider>
    </Provider>
  )
}

LogBox.ignoreLogs(['TNodeChildrenRenderer: Support for defaultProps will be removed'])
export default App
