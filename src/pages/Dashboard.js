import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import api from '../services/api';

const Dashboard = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await api.get('/offer/markets');
        setMarkets(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Xatolik yuz berdi:', error);
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketlar</Text>
      <FlatList
        data={markets}
        keyExtractor={(item, index) =>
          item.marketId ? item.marketId.toString() : index.toString()
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.marketCard}
            onPress={() =>
              navigation.navigate('OffersScreen', {
                marketId: item.id,
                marketName: item.name,
              })
            }>
            <Text style={styles.marketName}>{item.name}</Text>
            <Text style={styles.infoText}>{item.address}</Text>
            <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  marketCard: {
    backgroundColor: '#f9f9f9',
    padding: 11,
    marginBottom: 11,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0167f3',
  },
  marketName: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 17,
  },
});

export default Dashboard;
