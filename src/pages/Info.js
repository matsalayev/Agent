import React from 'react';
import {View, Text, Button, StyleSheet, Image} from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Info = ({navigation}) => {
  const logout = async () => {
    try {
      await api.get('/auth/logout');
      await AsyncStorage.removeItem('accessToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Chiqish xatosi:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/it-forelead.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Ilovaga xush kelibsiz!</Text>
        <Text style={styles.infoText}>V 1.0</Text>
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Chiqish" onPress={logout} color="#ff4d4d" />
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
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
  logoutContainer: {
    width: '100%',
    marginTop: 20,
  },
});

export default Info;
