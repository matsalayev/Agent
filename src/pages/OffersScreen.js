import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { ClipboardPlus, ChevronLeft, ArrowLeftToLine, ChevronRight, ArrowRightToLine} from 'lucide-react-native';

const OffersScreen = ({ route }) => {
  const { marketId, marketName } = route.params;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigation = useNavigation();
  const limit = 5;

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/offer/all/${marketId}`, {
        params: {
          limit: limit,
          page: page,
        },
      });

      const { data, total } = response.data;

      // Ma'lumotlarni to'g'ri shaklda yangilash
      setOffers(data);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }, [marketId, page]);

  useEffect(() => {
    fetchOffers();
  }, [page, fetchOffers]);

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(1)}
        disabled={page === 1}
      >
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}>
          <ArrowLeftToLine color="#fff" />
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(page - 1)}
        disabled={page === 1}
      >
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}>
          <ChevronLeft color="#fff" />
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.activeButton} disabled={true}>
        <Text style={styles.paginationText}>{page}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => page < totalPages && setPage(page + 1)}
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}>
          <ChevronRight color="#fff" />
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => page < totalPages && setPage(totalPages)}
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}>
          <ArrowRightToLine color="#fff" />
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{marketName}</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOffer', { marketId, marketName })}
        >
          <Text style={styles.createButtonText}>
            <ClipboardPlus color={'#fff'} height={32} width={32} />
            {/* Mahsulot taklif qilish <ClipboardPlus /> */}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })}
          >
            <View style={styles.offerCard}>
              <Text style={styles.offerText}>Total Price: ${item.totalPrice}</Text>
              <Text style={styles.offerText}>Status: {item.status}</Text>
              <Text style={styles.offerText}>Refunded: {item.refunded ? 'Yes' : 'No'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {renderPagination()}
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign:'center',
  },
  createButton: {
    marginTop:8,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#3D30A2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  createButtonText: {
    justifyContent:'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
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
    fontSize: 20,
    marginBottom: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  paginationButton: {
    paddingVertical: 8,
    // paddingHorizontal: 24,
    width:65,
    backgroundColor: '#3D30A2',
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems:'center'
  },
  activeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: '#0167f3',
  },
  paginationText: {
    fontSize: 22,
    color: 'black',
  },
  disabledText: {
    color: '#9ca3af',
  },
});

export default OffersScreen;
