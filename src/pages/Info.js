import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import api from '../services/api'; // API konfiguratsiyasi
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage dan foydalanish

const Info = ({ navigation }) => {

  // Akkaundan chiqish funksiyasi
  const logout = async () => {
    try {
      // API orqali logout qilish so'rovini yuborish
      await api.get('/auth/logout');
      
      // Tokenni o'chirish
      await AsyncStorage.removeItem('accessToken');
      
      // Foydalanuvchini Login sahifasiga yo'naltirish
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/it-forelead.png')} // Logo rasm manzili
          style={styles.logo}
        />
      </View>

      {/* Ilova haqida ma'lumot */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Welcome to the app!</Text>
        <Text style={styles.infoText}>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose.</Text>
      </View>

      {/* Akkaundan chiqish tugmasi */}
      <View style={styles.logoutContainer}>
        <Button title="Log out" onPress={logout} color="#ff4d4d" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: 'contain',
  },
  infoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  logoutContainer: {
    width: '100%',
    marginTop: 20,
  },
});

export default Info;
