import React, {useState} from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import api from '../services/api';

const ResetPassword = ({navigation}) => {
  const [phone, setPhone] = useState('');

  const handleResetPassword = async () => {
    if (!phone) {
      Alert.alert('Xato', 'Iltimos, telefon raqamingizni kiriting.');
      return;
    }

    try {
      const response = await api.post('auth/reset-password', {phone});

      if (response.status === 200) {
        Alert.alert(
          'Muvaffaqiyatli',
          'Parolni tiklash muvaffaqiyatli yakunlandi. Iltimos, qo‘shimcha ko‘rsatmalar uchun email yoki SMSni tekshiring.',
        );
        navigation.replace('Login');
      } else {
        Alert.alert(
          'Xato',
          'Biror narsa noto‘g‘ri ketdi. Iltimos, keyinroq yana urinib ko‘ring.',
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert(
          'Noto‘g‘ri telefon raqami',
          'Kiritilgan telefon raqami noto‘g‘ri. Iltimos, qayta urinib ko‘ring.',
        );
      } else {
        Alert.alert(
          'Xato',
          'Biror narsa noto‘g‘ri ketdi. Iltimos, keyinroq yana urinib ko‘ring.',
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholderTextColor={'gray'}
        placeholder="Telefon raqamingiz"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.replace('Login')}>
          <Text style={styles.buttonText}>Orqaga</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Yuborish</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f1f5f9',
  },
  input: {
    height: 50,
    borderColor: '#0167f3',
    borderWidth: 1,
    fontSize: 19,
    borderRadius: 9,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    backgroundColor: '#0167f3',
    width: '48%',
    paddingVertical: 15,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#3D30A2',
    width: '48%',
    paddingVertical: 15,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
  },
});

export default ResetPassword;
