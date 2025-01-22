import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import api from '../services/api'; // Axios konfiguratsiyasi
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone and password.');
      return;
    }

    try {
      const response = await api.post('/auth/login', { phone, password });
      const { accessToken, refreshToken } = response.data;

      // Tokenlarni saqlash
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      // Muvaffaqiyatli login
      navigation.replace('Main'); // Dashboard sahifasiga o'tish
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    }
  };

  const handleForgotPassword = () => {
    // Parolni unutdingizmi? uchun navigatsiya yoki boshqa funksiyalarni qo'shishingiz mumkin
    navigation.replace('ResetPassword');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')} // Logo rasm manzili
          style={styles.logo}
        />
      </View>

      {/* Telefon va Parol inputlari */}
      <TextInput
        style={styles.input}
        placeholder="Telefon"
        placeholderTextColor={'gray'}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Parol"
        color="black"
        placeholderTextColor={'gray'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Kirish tugmasi */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Kirish</Text>
      </TouchableOpacity>

      {/* Parolni unutdingizmi? link */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPassword}>Parolni unutdingizmi?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  logoContainer: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 350,
    height: 120,
    resizeMode: 'contain',
  },
  input: {
    height: 50,
    borderColor: '#0167f3',
    borderWidth: 1,
    borderRadius: 9,  // Dumaloq burchaklar
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#3D30A2',  // Tugma rangi
    width: '100%',  // Kengligi
    paddingVertical: 15,  // Vertikal joy
    borderRadius: 9,  // Dumaloq burchaklar
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,  // Tugma bilan input o'rtasida bo'sh joy
  },
  buttonText: {
    color: '#fff',  // Yozuv rangi
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#0167f3',  // Moviy rang
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Login;
