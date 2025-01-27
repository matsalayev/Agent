import React, {useState} from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Xato', 'Iltimos, telefon va parolni kiriting.');
      return;
    }

    try {
      const response = await api.post('/auth/login', {phone, password});
      const {accessToken, refreshToken} = response.data;

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      navigation.replace('Main');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert(
          'Kirish xatosi',
          "Noto'g'ri ma'lumotlar. Iltimos, qayta urinib ko'ring.",
        );
      } else {
        Alert.alert(
          'Xato',
          "Biror narsa noto'g'ri ketdi. Iltimos, keyinroq yana urinib ko'ring.",
        );
      }
    }
  };

  const handleForgotPassword = () => {
    navigation.replace('ResetPassword');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Kirish</Text>
      </TouchableOpacity>

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
    fontSize: 19,
    borderColor: '#0167f3',
    borderWidth: 1,
    borderRadius: 9,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#3D30A2',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#0167f3',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 21,
    textDecorationLine: 'underline',
  },
});

export default Login;
