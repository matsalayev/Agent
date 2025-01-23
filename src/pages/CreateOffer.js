import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert, Text } from 'react-native';
import { AlignLeft, CalendarCheck2, SendHorizontal, DollarSign } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { SquareMinus } from 'lucide-react-native';
import api from '../services/api';

const CreateOffer = ({ route }) => {
  const navigation = useNavigation();
  const { marketId, marketName } = route.params;
  const [comment, setComment] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [agentId, setAgentId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectProducts = () => {
    navigation.navigate('SelectProducts', {
      selectedProducts,
      onProductsSelected: (products) => {
        setSelectedProducts(products);
        if (products.length > 0) {
          setAgentId(products[0].agentId);
        }
      },
    });
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity >= 1) {
      setSelectedProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, quantity: parsedQuantity } : product
        )
      );
    }
  };

  const decreaseQuantity = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
  };

  const increaseQuantity = (productId) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
      )
    );
  };

  const renderSelectedProducts = () => (
    <FlatList
      data={selectedProducts}
      keyExtractor={(item) => item.id ? item.id.toString() : item.name + item.packaging}
      renderItem={({ item }) => (
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{`${item.name} - ${item.packaging || ''}`}</Text>
            <TouchableOpacity onPress={() => removeProduct(item.id)}>
              <SquareMinus style={styles.removeButton} />
            </TouchableOpacity>
          </View>
          <Text style={styles.productText}>{`Narxi: ${item.purchasePrice} UZS`}</Text>
          <Text style={styles.productText}>{`Sotuv turi: ${item.saleType}`}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.quantity?.toString() || '1'}
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

  const handleSelectDate = () => {
    setShowDatePicker(true);
  };

  const handlePaymentType = () => {
    setModalVisible(true);
  };

  const handleSelectPaymentType = (type) => {
    setPaymentType(type);
    setModalVisible(false);
  };

  const handleSendOffer = async () => {
    if (!selectedProducts.length || !deliveryDate || !paymentType) {
      Alert.alert('Error', 'Please complete all fields before sending the offer.');
      return;
    }

    try {
      const offerResponse = await api.post('/offer/create', {
        items: selectedProducts.map((product) => ({
          productId: product.id,
          amount: product.quantity,
        })),
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        paymentType,
        agentId,
        marketId,
      });

        const offerId = offerResponse.data;

        console.log(offerId);
        if (comment) {
          await api.post('/offer/comment', {
            offerId,
            text: comment,
          });
        }

        Alert.alert('Success', 'Offer created successfully.');
        navigation.navigate('OffersScreen', {marketId, marketName});
    } catch (error) {
      Alert.alert('Error', 'Failed to send the offer.');
    }
  };

  return (
    <View style={styles.container}>
      {renderSelectedProducts()}

      <View style={styles.footer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Izoh"
          placeholderTextColor={'gray'}
          value={comment}
          onChangeText={setComment}
        />

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

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.footerButton} onPress={handleSelectProducts}>
            <AlignLeft size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={handlePaymentType}>
            <DollarSign size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={handleSelectDate}>
            <CalendarCheck2 size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={handleSendOffer}>
            <SendHorizontal size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>To'lov turini tanlang</Text>
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
    backgroundColor: '#365E32',
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
