import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Checkbox} from 'expo-checkbox';
import api from '../services/api';
import {useFocusEffect} from '@react-navigation/native';
import {
  ChevronRight,
  ArrowRightToLine,
  ChevronLeft,
  ArrowLeftToLine,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';

const SelectProducts = ({route}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const limit = 4;
  const navigation = useNavigation();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/products/all?limit=${limit}&page=${page}`,
      );
      const {data, total} = response.data;
      setProducts(data);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Mahsulotlarni olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts]),
  );

  const toggleSelectProduct = product => {
    setSelectedProducts(prev => {
      const productIndex = prev.findIndex(p => p.id === product.id);
      if (productIndex !== -1) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, {...product, quantity: 1}];
      }
    });
  };

  const handleSelectProducts = () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Tanlash', 'Hech qanday mahsulot tanlanmadi');
      return;
    }
    route.params?.onProductsSelected(selectedProducts);
    navigation.goBack();
  };

  const renderItem = ({item}) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <Checkbox
          value={!!selectedProducts.find(p => p.id === item.id)}
          onValueChange={() => toggleSelectProduct(item)}
          tintColors={{true: '#34d399', false: '#d1d5db'}}
        />
      </View>
      <Text
        style={styles.productText}>{`Qadoqlanishi: ${item.packaging}`}</Text>
      <Text style={styles.productText}>{`Narxi: ${formatCurrency(
        item.purchasePrice,
      )} UZS`}</Text>
      <Text style={styles.productText}>{`Sotuv turi: ${item.saleType}`}</Text>
    </View>
  );

  function formatCurrency(number) {
    if (typeof number !== 'number') {
      throw new Error('Kiritilgan qiymat raqam bo‘lishi kerak');
    }
    return number.toLocaleString('en-US');
  }

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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3D30A2" />
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item =>
              item.productId ? item.productId.toString() : item.id.toString()
            }
            ListEmptyComponent={<Text>Mahsulotlar mavjud emas</Text>}
          />
          {renderPagination()}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectProducts}>
            <Text style={styles.buttonText}>Tanlash</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  productCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productName: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  productText: {
    fontSize: 17,
    color: '#333333',
    marginBottom: 4,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  selectButton: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D30A2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  buttonText: {
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 23,
  },
});

export default SelectProducts;
