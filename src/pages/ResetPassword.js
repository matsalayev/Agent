import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import api from '../services/api'; // Axios konfiguratsiyasi

const ResetPassword = ({ navigation }) => {
  const [phone, setPhone] = useState('');

  const handleResetPassword = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    try {
      const response = await api.post('auth/reset-password', { phone });

      if (response.status === 200) {
        Alert.alert('Success', 'Password reset successful. Please check your email or SMS for further instructions.');
        navigation.replace('Login'); // Redirect to login page after successful reset
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert('Invalid phone number', 'The phone number you entered is invalid. Please try again.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Telefon raqami inputi */}
      <TextInput
        style={styles.input}
        placeholderTextColor={'gray'}
        placeholder="Telefon raqamingiz"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Tugmalar paneli */}
      <View style={styles.buttonContainer}>
        {/* Orqaga tugmasi */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.buttonText}>Orqaga</Text>
        </TouchableOpacity>

        {/* Yuborish tugmasi */}
        <TouchableOpacity style={styles.sendButton} onPress={handleResetPassword}>
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
    borderRadius: 9,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row', // Horizontal layout for buttons
    justifyContent: 'space-between', // Space between the buttons
    width: '100%', // Make it take full width
  },
  backButton: {
    backgroundColor: '#0167f3', // Light gray color for back button
    width: '48%', // Make it almost half of the width
    paddingVertical: 15,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#3D30A2', // Dark purple color for send button
    width: '48%', // Make it almost half of the width
    paddingVertical: 15,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResetPassword;
