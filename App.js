import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StoreIcon, PackagePlusIcon, ShoppingCartIcon, Bell, InfoIcon } from 'lucide-react-native';
// Import pages
import Login from './src/pages/Login';
import ResetPassword from './src/pages/ResetPassword';
import AddProduct from './src/pages/AddProduct';
import Dashboard from './src/pages/Dashboard'; // ViewMarkets
import ViewProducts from './src/pages/ViewProducts'; // List of products
import History from './src/pages/History'; // Example history
import Info from './src/pages/Info'; // Example info
import OffersScreen from './src/pages/OffersScreen';
import CreateOffer from './src/pages/CreateOffer';
import SelectProducts from './src/pages/SelectProducts';
import OfferDetails from './src/pages/OfferDetailsScreen';
import UpdaeOffer from './src/pages/UpdateOffer';
import Loading from './src/pages/Loading';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff', // Background color of the navbar
        height: 60, // Increased navbar height
        borderTopWidth: 1,
        alignItems:'center',
        borderTopColor: '#ddd', // Border color for the navbar
      },
      tabBarActiveTintColor: '#3D30A2', // Active tab color
      tabBarInactiveTintColor: '#8e8e8e', // Inactive tab color
      tabBarItemStyle: {
        display:'flex',
        justifyContent: 'center', // Center icon vertically
        alignItems: 'center', // Center icon horizontally
      },
    }}
  >
    <Tab.Screen
      name="AddProduct"
      component={AddProduct}PackagePlusIcon
      options={{
        tabBarIcon: ({ color, size }) => (
          <PackagePlusIcon size={30} color={color} />
        ),
        tabBarLabel: () => null, // Hide the title
      }}
    />
    <Tab.Screen
      name="ViewProducts"
      component={ViewProducts}
      options={{
        tabBarIcon: ({ color, size }) => (
          <ShoppingCartIcon size={30} color={color} />
        ),
        tabBarLabel: () => null, // Hide the title
      }}
    />
    <Tab.Screen
      name="ViewMarkets"
      component={Dashboard}
      options={{
        tabBarIcon: ({ color, size }) => (
          <StoreIcon size={30} color={color} />
        ),
        tabBarLabel: () => null, // Hide the title
      }}
    />
    <Tab.Screen
      name="History"
      component={History}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Bell size={30} color={color} />
        ),
        tabBarLabel: () => null, // Hide the title
      }}
    />
    <Tab.Screen
      name="Info"
      component={Info}
      options={{
        tabBarIcon: ({ color, size }) => (
          <InfoIcon size={30} color={color} />
        ),
        tabBarLabel: () => null, // Hide the title
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Authentication pages */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        {/* Main App with Bottom Tabs */}
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="OffersScreen" component={OffersScreen} /> 
        <Stack.Screen name="CreateOffer" component={CreateOffer} /> 
        <Stack.Screen name="SelectProducts" component={SelectProducts} /> 
        <Stack.Screen name="OfferDetails" component={OfferDetails} /> 
        <Stack.Screen name="UpdateOffer" component={UpdaeOffer} /> 

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
