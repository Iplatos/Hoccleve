import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { useAuth } from '../../context/AuthContext.tsx'
import { Colors } from '../../constants/Colors.ts'
import { GlobalStyle } from '../../constants/GlobalStyle.ts'

export const LoginScreen = () => {
  const [email, setEmail] = useState('')
  //  const [email, setEmail] = useState('artur.a@impulsschool.ru');
  // const [password, setPassword] = useState('artur.a@impulsschool.ru');
  const [password, setPassword] = useState('')
  //  const [password, setPassword] = useState('fhneh12345678');
  const [showPassword, setShowPassword] = useState(false)
  const { onLogin, loading } = useAuth()

  const disabledBtn = email.length === 0 || password.length === 0
  const disabledStyle = {
    color: loading || email.length === 0 || password.length === 0 ? Colors.textLight : Colors.white,
    backgroundColor:
      loading || email.length === 0 || password.length === 0
        ? Colors.backgroundDisabled
        : Colors.backgroundPurple,
  }

  const login = async () => {
    const result = await onLogin!(email, password)
    if (result && result.error) {
      alert(result.msg)
    }
  }

  return (
    <>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.block}>
            <TextInput
              style={GlobalStyle.input}
              placeholderTextColor={Colors.textGray}
              placeholder="E-mail или телефон"
              value={email}
              onChangeText={setEmail}
              inputMode={'email'}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={GlobalStyle.input}
                placeholder="Пароль"
                placeholderTextColor={Colors.textGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={{ fontSize: 20 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              disabled={loading || disabledBtn}
              onPress={login}
              style={[styles.button, disabledStyle]}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={[styles.buttonText, disabledStyle]}>Войти</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: Colors.background,
    padding: 20,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 20,
  },
  togglePassword: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
})
