import React, {useEffect, useState, useCallback} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import {
  ClipboardPlus,
  ChevronLeft,
  ArrowLeftToLine,
  ChevronRight,
  ArrowRightToLine,
} from 'lucide-react-native';

const History = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigation = useNavigation();
  const limit = 5;

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/offer/requested`, {
        params: {
          limit: limit,
          page: page,
        },
      });

      const {data, total} = response.data;

      setOffers(data);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Xatolik yuz berdi:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOffers();
  }, [page, fetchOffers]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers(page);
    }, [page, fetchOffers]),
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(1)}
        disabled={page === 1}>
        <Text
          style={[styles.paginationText, page === 1 && styles.disabledText]}>
          <ArrowLeftToLine color="#fff" />
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(page - 1)}
        disabled={page === 1}>
        <Text
          style={[styles.paginationText, page === 1 && styles.disabledText]}>
          <ChevronLeft color="#fff" />
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.activeButton} disabled={true}>
        <Text style={styles.paginationText}>{page}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          page === totalPages && styles.disabledButton,
        ]}
        onPress={() => page < totalPages && setPage(page + 1)}
        disabled={page === totalPages}>
        <Text
          style={[
            styles.paginationText,
            page === totalPages && styles.disabledText,
          ]}>
          <ChevronRight color="#fff" />
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          page === totalPages && styles.disabledButton,
        ]}
        onPress={() => page < totalPages && setPage(totalPages)}
        disabled={page === totalPages}>
        <Text
          style={[
            styles.paginationText,
            page === totalPages && styles.disabledText,
          ]}>
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
        <Text style={styles.title}>Xabarlar</Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('OfferDetails', {offerId: item.id})
            }>
            <View style={styles.offerCard}>
              <Text style={styles.offerText}>Market: {item.marketName}</Text>
              <Text style={styles.offerText}>
                Umumiy Narxi: {formatCurrency(item.totalPrice)} UZS
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.offerText}>Status: </Text>
                <Text
                  style={[
                    styles.offerText,
                    {color: getStatusTextColor(item.offerStatus)},
                  ]}>
                  {getStatusText(item.offerStatus)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {renderPagination()}
    </View>
  );
};

const getStatusTextColor = status => {
  switch (status) {
    case 'requested':
      return '#FFD700';
    case 'approved':
      return '#008000';
    case 'cancelled':
      return '#FF0000';
    default:
      return '#000000';
  }
};

const getStatusText = status => {
  switch (status) {
    case 'requested':
      return "So'ralgan";
    case 'approved':
      return 'Tasdiqlangan';
    case 'cancelled':
      return 'Rad qilingan';
    default:
      return status;
  }
};

function formatCurrency(number) {
  if (typeof number !== 'number') {
    throw new Error('Kiritilgan qiymat raqam bo‘lishi kerak');
  }
  return number.toLocaleString('en-US');
}

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
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createButton: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D30A2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  createButtonText: {
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 23,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerCard: {
    backgroundColor: '#f9f9f9',
    padding: 11,
    marginBottom: 11,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'gray',
  },
  offerText: {
    fontSize: 19,
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
    width: 65,
    backgroundColor: '#3D30A2',
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
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
    fontSize: 21,
    color: 'black',
  },
  disabledText: {
    color: '#9ca3af',
  },
});

export default History;
