import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import api from '../services/api';

const OfferDetailsScreen = ({ route }) => {
  const { offerId } = route.params;
  const [offerDetails, setOfferDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await api.get(`/offer/${offerId}`);
        setOfferDetails(response.data);
      } catch (error) {
        console.error('Error fetching offer details:', error);
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
        <Text style={styles.errorText}>Failed to load offer details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offer Details</Text>
      <Text style={styles.detailText}>Market nomi: {offerDetails.marketName}</Text>
      <Text style={styles.detailText}>To'lov turi: {offerDetails.paymentType}</Text>
      <Text style={styles.detailText}>Yetkazilish sanasi: {offerDetails.deliveryDate}</Text>
      <Text style={styles.detailText}>Total Price: ${offerDetails.totalPrice}</Text>
      <Text style={styles.detailText}>Status: {offerDetails.offerStatus}</Text>
      <Text style={styles.detailText}>Kim tomonidan taklif qilingan: {offerDetails.requestedBy}</Text>
      <Text style={styles.detailText}>
        Qaytarib yuborilgan: {offerDetails.refunded ? 'Ha' : 'Yo\'q'}
      </Text>

      {/* FlatList */}
      <FlatList
        data={offerDetails.items}
        keyExtractor={(item) => item.id} // `id` o'rniga ma'lumotdagi haqiqiy identifikator maydonini ishlating
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemText}>Mahsulot nomi: {item.productName}</Text>
            <Text style={styles.itemText}>Qadoqlash: {item.packaging}</Text>
            <Text style={styles.itemText}>Savdo turi: {item.saleType}</Text>
            <Text style={styles.itemText}>Narxi: ${item.salePrice}</Text>
            <Text style={styles.itemText}>Miqdori: {item.amount}</Text>
            <Text style={styles.itemText}>Qaytarilgan: {item.refunded ? 'Ha' : 'Yo\'q'}</Text>
          </View>
        )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 18,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
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
    fontSize: 16,
    marginBottom: 4,
  },
});

export default OfferDetailsScreen;
