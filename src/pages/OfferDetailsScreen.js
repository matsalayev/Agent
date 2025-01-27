import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import api from '../services/api';

const OfferDetailsScreen = ({route}) => {
  const {offerId} = route.params;
  const [offerDetails, setOfferDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await api.get(`/offer/${offerId}`);
        setOfferDetails(response.data);
      } catch (error) {
        console.error(
          'Taklif tafsilotlarini olishda xatolik yuz berdi:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetails();
  }, [offerId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!offerDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Ma'lumotlarni yuklashning iloji bo'lmadi
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Taklif Tafsilotlari</Text>
      <Text style={styles.detailText}>
        Market nomi: {offerDetails.marketName}
      </Text>
      <Text style={styles.detailText}>
        To'lov turi: {offerDetails.paymentType}
      </Text>
      <Text style={styles.detailText}>
        Yetkazilish sanasi: {offerDetails.deliveryDate}
      </Text>
      <Text style={styles.detailText}>
        Umumiy Narxi: {formatCurrency(offerDetails.totalPrice)} UZS
      </Text>
      <Text style={styles.detailText}>Holat: {offerDetails.offerStatus}</Text>
      <Text style={styles.detailText}>
        Kim tomonidan taklif qilingan: {offerDetails.requestedBy}
      </Text>
      <Text style={styles.detailText}>
        Qaytarib yuborilgan: {offerDetails.refunded ? 'Ha' : "Yo'q"}
      </Text>

      <FlatList
        data={offerDetails.items}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemText}>
              Mahsulot nomi: {item.productName}
            </Text>
            <Text style={styles.itemText}>Qadoqlash: {item.packaging}</Text>
            <Text style={styles.itemText}>Savdo turi: {item.saleType}</Text>
            <Text style={styles.itemText}>
              Narxi: {formatCurrency(item.salePrice)} UZS
            </Text>
            <Text style={styles.itemText}>Miqdori: {item.amount}</Text>
            <Text style={styles.itemText}>
              Qaytarilgan: {item.refunded ? 'Ha' : "Yo'q"}
            </Text>
          </View>
        )}
      />
    </View>
  );
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 17,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 17,
    color: 'red',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 15,
    marginBottom: 4,
  },
});

export default OfferDetailsScreen;
