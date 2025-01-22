import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Text } from 'react-native';
import { AlignLeft, CalendarCheck2, SendHorizontal, DollarSign } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const CreateOffer = ({ route }) => {
  const navigation = useNavigation();
  const { marketId } = route.params; // `marketId` routedan olinadi

  const [comment, setComment] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Mahsulotlarni tanlash uchun navigatsiya
  const handleSelectProducts = () => {
    navigation.navigate('SelectProducts', {
      selectedProducts,
      onProductsSelected: (products) => setSelectedProducts(products), // Tanlangan mahsulotlarni olish
    });
  };

  // Mahsulotni ro'yxatdan o'chirish
  const removeProduct = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.productId !== productId)
    );
  };

  // Tanlangan mahsulotlarni ko'rsatish
  const renderSelectedProducts = () => (
    <FlatList
      data={selectedProducts}
      keyExtractor={(item) => item.productId.toString()}
      renderItem={({ item }) => (
        <View style={styles.productCard}>
          <Text style={styles.productText}>{`${item.name} - ${item.amount}`}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeProduct(item.productId)} // O'chirish tugmasi
          >
            <Text style={styles.removeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No selected products</Text>}
    />
  );

  // Sana tanlash
  const handleSelectDate = () => {
    setShowDatePicker(true);
  };

  // Taklifni yuborish
  const handleSendOffer = async () => {
    if (!selectedProducts.length || !deliveryDate || !paymentType) {
      Alert.alert('Error', 'Please complete all fields before sending the offer.');
      return;
    }

    try {
      // Yangi taklif yaratish uchun so'rov yuborish
      const offerResponse = await fetch('/agent/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedProducts.map((product) => ({
            productId: product.productId,
            amount: product.amount,
          })),
          deliveryDate: deliveryDate.toISOString().split('T')[0],
          paymentType,
          agentId: 'agent-uuid', // Agentning IDsi (demo uchun qo'lda yozilgan)
          marketId,
        }),
      });

      const offerData = await offerResponse.json();

      if (offerResponse.ok && comment) {
        // Taklifga izoh qo'shish
        await fetch('/agent/offer/comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId: offerData.id, text: comment }),
        });
      }

      Alert.alert('Success', 'Offer sent successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send the offer.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Tanlangan mahsulotlar */}
      {renderSelectedProducts()}

      {/* Pastki bo'lim */}
      <View style={styles.footer}>
        {/* Izoh */}
        <TextInput
          style={styles.commentInput}
          placeholder="Comment"
          value={comment}
          onChangeText={setComment}
        />

        {/* Tugmalar */}
        <View style={styles.buttonRow}>
          {/* Mahsulot tanlash */}
          <TouchableOpacity style={styles.footerButton} onPress={handleSelectProducts}>
            <AlignLeft size={24} color="#fff" />
          </TouchableOpacity>

          {/* Sana tanlash */}
          <TouchableOpacity style={styles.footerButton} onPress={handleSelectDate}>
            <CalendarCheck2 size={24} color="#fff" />
          </TouchableOpacity>

          {/* To'lov turi */}
          <View style={styles.footerButton}>
            <RNPickerSelect
              onValueChange={(value) => setPaymentType(value)}
              items={[
                { label: 'Cash', value: 'cash' },
                { label: 'Credit', value: 'credit' },
              ]}
              style={{
                inputAndroid: { height: 0, width: 0 }, // Tanlov ko'rinmaydi
                inputIOS: { height: 0, width: 0 },
              }}
            />
            <TouchableOpacity>
              <DollarSign size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Taklif yuborish */}
          <TouchableOpacity style={styles.footerButton} onPress={handleSendOffer}>
            <SendHorizontal size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sana tanlash oynasi */}
      {showDatePicker && (
        <DateTimePicker
          value={deliveryDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDeliveryDate(selectedDate);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 8,
    backgroundColor: '#ff4d4d',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
  footer: {
    marginTop: 'auto',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  commentInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0167f3',
    borderRadius: 28,
  },
});

export default CreateOffer;
