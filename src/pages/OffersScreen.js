import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import {BadgePlus} from 'lucide-react-native';

const OffersScreen = ({ route }) => {
  const { marketId, marketName } = route.params;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Umumiy sahifalar soni
  const navigation = useNavigation();

  const fetchOffers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/offer/all/${marketId}`, {
        params: {
          limit: 10, // Har bir sahifada 10 ta element
          page: currentPage,
        },
      });

      const { data, totalPages } = response.data;

      setOffers(data);
      setTotalPages(totalPages); // Umumiy sahifalar sonini yangilash
      setLoading(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(page);
  },[page]);

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {/* << Tugma */}
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(1)} // Birinchi sahifaga o'tish
        disabled={page === 1}
      >
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}>{'<<'}</Text>
      </TouchableOpacity>

      {/* < Tugma */}
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(page - 1)} // Oldingi sahifaga o'tish
        disabled={page === 1}
      >
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}>{'<'}</Text>
      </TouchableOpacity>

      {/* Joriy sahifa */}
      <TouchableOpacity style={styles.activeButton}>
        <Text style={[styles.paginationText, styles.activeText]}>{page}</Text>
      </TouchableOpacity>

      {/* > Tugma */}
      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => page < totalPages && setPage(page + 1)} // Keyingi sahifaga o'tish
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}>{'>'}</Text>
      </TouchableOpacity>

      {/* >> Tugma */}
      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => page < totalPages && setPage(totalPages)} // Oxirgi sahifaga o'tish
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}>{'>>'}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header: O'ngda "Create" tugmasi */}
      <View style={styles.header}>
        <Text style={styles.title}>{marketName}</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOffer', { marketId })}
        >
          <Text style={styles.createButtonText}><BadgePlus color={'#fff'} height={32} width={32}/></Text>
        </TouchableOpacity>
      </View>

      {/* Offers ro'yxati */}
      <FlatList
        data={offers}
        keyExtractor={(item) => item.offerId}
        renderItem={({ item }) => (
          <View style={styles.offerCard}>
            <Text style={styles.offerText}>Total Price: ${item.totalPrice}</Text>
            <Text style={styles.offerText}>Status: {item.status}</Text>
            <Text style={styles.offerText}>Refunded: {item.refunded ? 'Yes' : 'No'}</Text>
          </View>
        )}
        ListFooterComponent={renderPagination} // Paginationni FlatList ostiga qo'shish
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign:'center',
  },
  createButton: {
    backgroundColor: '#3D30A2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  offerText: {
    fontSize: 16,
    marginBottom: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#3D30A2',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: '#0167f3',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  paginationText: {
    fontSize: 18,
    color: 'white',
  },
  disabledText: {
    color: '#9ca3af',
  },
  activeText: {
    color: '#fff',
  },
});

export default OffersScreen;
