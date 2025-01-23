import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert, Text } from 'react-native';
import { AlignLeft, CalendarCheck2, SendHorizontal, DollarSign } from 'lucide-react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { SquareMinus } from 'lucide-react-native';
import api from '../services/api';

const CreateOffer = ({ route }) => {
  const navigation = useNavigation();
  const { marketId } = route.params; // `marketId` routedan olinadi

  const [comment, setComment] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [agentId, setAgentId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Mahsulotlarni tanlash uchun navigatsiya
  const handleSelectProducts = () => {
    navigation.navigate('SelectProducts', {
      selectedProducts,
      onProductsSelected: (products) => {
        setSelectedProducts(products);
        if (products.length > 0) {
          const firstProduct = products[0]; // You can select how to choose the agentId if multiple products are selected
          setAgentId(firstProduct.agentId);  // Assuming each product has agentId
        }},
    });
  };

  // Mahsulotni ro'yxatdan o'chirish
  const removeProduct = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId) // id bo'yicha filtrlash
    );
  };

  // Miqdorni yangilash (validatsiya bilan)
  const updateQuantity = (productId, quantity) => {
    const parsedQuantity = parseInt(quantity, 10);

    // Faqat son kiritilgan bo'lsa va 1 dan katta bo'lsa
    if (!isNaN(parsedQuantity) && parsedQuantity >= 1) {
      setSelectedProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, quantity: parsedQuantity } : product
        )
      );
    }
  };

  // Miqdorni kamaytirish
  const decreaseQuantity = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  // Miqdorni oshirish
  const increaseQuantity = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
      )
    );
  };

  // Tanlangan mahsulotlarni ko'rsatish
  const renderSelectedProducts = () => (
    <FlatList
      data={selectedProducts}
      keyExtractor={(item) => item.id.toString()} // id ni key sifatida ishlatish
      renderItem={({ item }) => (
        <View style={styles.productCard}>
          {/* Mahsulot nomi va o'chirish tugmasi */}
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{`${item.name} - ${item.packaging || ''}`}</Text>
            <TouchableOpacity onPress={() => removeProduct(item.id)}>
              <SquareMinus style={styles.removeButton} />
            </TouchableOpacity>
          </View>
          {/* Narx va sotuv turi */}
          <Text style={styles.productText}>{`Narxi: ${item.purchasePrice} UZS`}</Text>
          <Text style={styles.productText}>{`Sotuv turi: ${item.saleType}`}</Text>

          {/* Miqdor kiritish */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.quantity?.toString() || '1'} // Miqdor 1 dan boshlansin
              keyboardType="numeric"
              onChangeText={(text) => updateQuantity(item.id, text)}
            />
            <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No selected products</Text>}
    />
  );

  // Sana tanlash
  const handleSelectDate = () => {
    setShowDatePicker(true);
  };

  // Handle when payment type is selected
  const handlePaymentType = () => {
    setModalVisible(true); // Open the modal when the button is pressed
  };

  const handleSelectPaymentType = (type) => {
    setPaymentType(type); // Set the selected payment type
    setModalVisible(false); // Close the modal
  };

  // Taklifni yuborish
  const handleSendOffer = async () => {
    if (!selectedProducts.length) {
      Alert.alert('Error', 'Please complete all fields before sending the offer.');
      return;
    }

    try {
      // Yangi taklif yaratish uchun so'rov yuborish
      const response = await api.post('/offer/create', {
          items: selectedProducts.map((product) => ({
            productId: product.id, // Agar productId bo'lmasa, id ni ishlatish
            amount: product.quantity, // Miqdorni foydalanish
          })),
          deliveryDate: deliveryDate.toISOString().split('T')[0],
          paymentType,
          agentId: agentId, // Agentning IDsi (demo uchun qo'lda yozilgan)
          marketId,
        })
      ;

            if (response.status === 201) {
              Alert.alert('Muvaffaqiyat', 'Mahsulot muvaffaqiyatli qo\'shildi!');
            }
      // const offerData = await offerResponse.json();

      // if (offerResponse.ok && comment) {
      //   // Taklifga izoh qo'shish
      //   await fetch('/agent/offer/comment', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ offerId: offerData.id, text: comment }),
      //   });
      // }

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
          placeholder="Izoh"
          placeholderTextColor={'gray'}
          value={comment}
          onChangeText={setComment}
        />
      {/* Show the selected payment type */}
      {paymentType ? (
        <Text style={styles.selectedPaymentText}>Tanlangan to'lov turi: {paymentType}</Text>
      ) : (
        <Text style={styles.selectedPaymentText}>Hech qanday to'lov turi tanlanmagan</Text>
      )}
      {deliveryDate ? (
        <Text style={styles.selectedPaymentText}>
          Yetkazib berish sanasi: {`${String(deliveryDate.getDate()).padStart(2, '0')}/${String(deliveryDate.getMonth() + 1).padStart(2, '0')}/${deliveryDate.getFullYear()}`}
        </Text>

      ) : (
        <Text style={styles.selectedPaymentText}>Yetkazib berish sanasi belgilanmadi</Text>
      )}
      {/* <Text style={styles.selectedPaymentText}>{selectedProducts.length.toString()}</Text> */}

      {/* Footer buttons */}
      <View style={styles.buttonRow}>
        {/* Mahsulot tanlash */}
        <TouchableOpacity style={styles.footerButton} onPress={handleSelectProducts}>
          <AlignLeft size={32} color="#fff" />
        </TouchableOpacity>

        {/* To'lov turi */}
        <TouchableOpacity style={styles.footerButton} onPress={handlePaymentType}>
          <DollarSign size={32} color="#fff" />
        </TouchableOpacity>

        {/* Sana tanlash */}
        <TouchableOpacity style={styles.footerButton} onPress={handleSelectDate}>
          <CalendarCheck2 size={32} color="#fff" />
        </TouchableOpacity>

        {/* Taklif yuborish */}
        <TouchableOpacity style={styles.footerButton} onPress={handleSendOffer}>
          <SendHorizontal size={32} color="#fff" />
        </TouchableOpacity>
      </View>



      {/* Modal for selecting payment type */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)} // Close modal when back is pressed
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>To'lov turini tanlang</Text>

            {/* Payment Type Options */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelectPaymentType('cash')}
            >
              <Text style={styles.optionText}>Naqt pul</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelectPaymentType('paid')}
            >
              <Text style={styles.optionText}>To'langan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelectPaymentType('bank_transfer')}
            >
              <Text style={styles.optionText}>O'tkazma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelectPaymentType('terminal')}
            >
              <Text style={styles.optionText}>Terminal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    flexWrap: 'wrap',
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  productText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 15,
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#333',
  },
  quantityInput: {
    height: 40,
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
  footer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerButton: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0167f3',
    borderRadius: 10,
    margin:10,
  },
  commentInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 90,
    backgroundColor: '#3D30A2',
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedPaymentText: {
    fontSize: 18,
    marginTop:3,
    padding:3,
    color: '#333',
  },
});

export default CreateOffer;
