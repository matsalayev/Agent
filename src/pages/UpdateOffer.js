import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  Text,
} from 'react-native';
import {
  AlignLeft,
  CalendarCheck2,
  SendHorizontal,
  DollarSign,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import {SquareMinus} from 'lucide-react-native';
import api from '../services/api';

const UpdateOffer = ({route}) => {
  const navigation = useNavigation();
  const {offerId} = route.params;
  const [comment, setComment] = useState('');
  const [offerDetails, setOfferDetails] = useState(null);
  const [paymentType, setPaymentType] = useState('');
  const [agentId, setAgentId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleSelectProducts = () => {
    navigation.navigate('SelectProducts', {
      selectedProducts,
      onProductsSelected: products => {
        setSelectedProducts(products);
        if (products.length > 0) {
          setAgentId(products[0].agentId);
        }
      },
    });
  };

  const removeProduct = productId => {
    setSelectedProducts(prevProducts =>
      prevProducts.filter(product => product.id !== productId),
    );
  };

  const updateQuantity = (productId, quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity >= 1) {
      setSelectedProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? {...product, quantity: parsedQuantity}
            : product,
        ),
      );
    }
  };

  const decreaseQuantity = productId => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId && product.quantity > 1
          ? {...product, quantity: product.quantity - 1}
          : product,
      ),
    );
  };

  const increaseQuantity = productId => {
    setSelectedProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? {...product, quantity: product.quantity + 1}
          : product,
      ),
    );
  };

  const renderSelectedProducts = () => (
    <FlatList
      data={selectedProducts}
      keyExtractor={item =>
        item.id ? item.id.toString() : item.name + item.packaging
      }
      renderItem={({item}) => (
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{`${item.name} - ${
              item.packaging || ''
            }`}</Text>
            <TouchableOpacity onPress={() => removeProduct(item.id)}>
              <SquareMinus style={styles.removeButton} />
            </TouchableOpacity>
          </View>
          <Text style={styles.productText}>{`Narxi: ${formatCurrency(
            item.purchasePrice,
          )} UZS`}</Text>
          <Text
            style={styles.productText}>{`Sotuv turi: ${item.saleType}`}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => decreaseQuantity(item.id)}
              style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.quantity?.toString() || '1'}
              keyboardType="numeric"
              onChangeText={text => updateQuantity(item.id, text)}
            />
            <TouchableOpacity
              onPress={() => increaseQuantity(item.id)}
              style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.productText}>
            Umumiy narxi: {formatCurrency(item.quantity * item.purchasePrice)}{' '}
            UZS
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Mahsulotlar tanlanmadi!</Text>
      }
    />
  );

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, product) => {
      const productTotal = product.quantity * product.purchasePrice;
      return total + productTotal;
    }, 0);
  };

  function formatCurrency(number) {
    if (typeof number !== 'number') {
      throw new Error('Kiritilgan qiymat raqam bo‘lishi kerak');
    }
    return number.toLocaleString('en-US');
  }

  const handleSelectDate = () => {
    setShowDatePicker(true);
  };

  const handlePaymentType = () => {
    setModalVisible(true);
  };

  const handleSelectPaymentType = type => {
    setPaymentType(type);
    setModalVisible(false);
  };

  const handleSendOffer = async () => {
    if (!selectedProducts.length || !deliveryDate || !paymentType) {
      Alert.alert('Xatolik', "Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    try {
      const offerResponse = await api.post('/offer/create', {
        items: selectedProducts.map(product => ({
          productId: product.id,
          amount: product.quantity,
        })),
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        paymentType,
        agentId,
        marketId,
      });

      const offerId = offerResponse.data;

      if (comment) {
        await api.post('/offer/comment', {
          offerId,
          text: comment,
        });
      }

      setComment('');
      setPaymentType('');
      setSelectedProducts([]);
      setDeliveryDate(null);
      Alert.alert('Muvaffaqqiyatli!', 'Taklif muvaffaqqiyatli yuborildi.');
      navigation.navigate('OfferDetails', {offerId});
    } catch (error) {
      Alert.alert('Xatolik', 'Taklif yuborishda xatolik sodir bo‘ldi.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>{renderSelectedProducts()}</View>

      <View style={styles.footer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Izoh"
          placeholderTextColor={'gray'}
          value={comment}
          onChangeText={setComment}
        />

        {paymentType ? (
          <Text style={styles.selectedPaymentText}>
            Tanlangan to'lov turi: {paymentType}
          </Text>
        ) : (
          <Text style={styles.selectedPaymentText}>
            Hech qanday to'lov turi tanlanmagan
          </Text>
        )}

        {deliveryDate ? (
          <Text style={styles.selectedPaymentText}>
            Yetkazib berish sanasi:{' '}
            {`${String(deliveryDate.getDate()).padStart(2, '0')}/${String(
              deliveryDate.getMonth() + 1,
            ).padStart(2, '0')}/${deliveryDate.getFullYear()}`}
          </Text>
        ) : (
          <Text style={styles.selectedPaymentText}>
            Yetkazib berish sanasi belgilanmadi
          </Text>
        )}

        {selectedProducts.length > 0 ? (
          <Text style={styles.selectedPaymentText}>
            Umumiy narxi: {formatCurrency(calculateTotalPrice())} UZS
          </Text>
        ) : (
          <Text style={styles.selectedPaymentText}>
            Hech qanday mahsulot tanlanmadi
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleSelectProducts}>
            <AlignLeft size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handlePaymentType}>
            <DollarSign size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleSelectDate}>
            <CalendarCheck2 size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleSendOffer}>
            <SendHorizontal size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>To'lov turini tanlang</Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelectPaymentType('cash')}>
                <Text style={styles.optionText}>Naqt pul</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelectPaymentType('paid')}>
                <Text style={styles.optionText}>To'langan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelectPaymentType('bank_transfer')}>
                <Text style={styles.optionText}>O'tkazma</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSelectPaymentType('terminal')}>
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
    padding: 19,
    backgroundColor: '#ffffff',
    margin: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  productName: {
    fontSize: 23,
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
    fontSize: 19,
    color: '#333333',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    marginBottom: 9,
  },
  quantityButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 45,
  },
  quantityButtonText: {
    fontSize: 21,
    color: '#333',
  },
  quantityInput: {
    height: 39,
    width: 59,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    marginHorizontal: 9,
    backgroundColor: '#f9f9f9',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 225,
  },
  footer: {
    padding: 9,
    backgroundColor: '#ffffff',
    borderRadius: 9,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D30A2',
    borderRadius: 9,
    margin: 9,
  },
  commentInput: {
    height: 49,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    marginBottom: 9,
    fontSize: 19,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 19,
    borderRadius: 8,
    width: 299,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  optionButton: {
    paddingVertical: 11,
    paddingHorizontal: 89,
    backgroundColor: '#365E32',
    borderRadius: 8,
    marginBottom: 9,
  },
  optionText: {
    color: '#fff',
    fontSize: 17,
  },
  selectedPaymentText: {
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 2,
    padding: 2,
    color: '#333',
  },
});

export default UpdateOffer;
