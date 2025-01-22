import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import Login from './src/pages/Login';
import ResetPassword from './src/pages/ResetPassword';
import Dashboard from './src/pages/Dashboard';
import AddProduct from './src/pages/AddProduct';
import OffersScreen from './src/pages/OffersScreen'; // OffersScreen ni import qilish

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="OffersScreen" component={OffersScreen} /> {/* OffersScreen e'lon qilish */}
        <Stack.Screen name="AddProduct" component={AddProduct} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
