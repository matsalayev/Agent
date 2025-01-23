import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { EditIcon, SquareX, ChevronRight, ArrowRightToLine, ChevronLeft, ArrowLeftToLine } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const SelectProducts = ({ route }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); // Cache the total pages for pagination
  const [selectedProducts, setSelectedProducts] = useState([]); // Track selected products
  const limit = 4;
  const navigation = useNavigation();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/all?limit=${limit}&page=${page}`);
      const { data, total } = response.data;
      setProducts(data);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [page, fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const toggleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      // Check if the product is already selected
      const productIndex = prev.findIndex((p) => p.id === product.id);
      if (productIndex !== -1) {
        // If already selected, remove it
        return prev.filter((p) => p.id !== product.id);
      } else {
        // If not selected, add it with quantity = 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };


  const handleSelectProducts = () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Tanlash', 'Hech qanday mahsulot tanlanmadi');
      return;
    }
    // Tanlangan mahsulotlarni uzatish
    route.params?.onProductsSelected(selectedProducts);
    navigation.goBack(); // Orqaga qaytish
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <Checkbox
          value={!!selectedProducts.find((p) => p.id === item.id)}
          onValueChange={() => toggleSelectProduct(item)}
          tintColors={{ true: '#34d399', false: '#d1d5db' }}
        />
      </View>
      <Text style={styles.productText}>{`Qadoqlanishi: ${item.packaging}`}</Text>
      <Text style={styles.productText}>{`Narxi: ${item.purchasePrice} UZS`}</Text>
      <Text style={styles.productText}>{`Sotuv turi: ${item.saleType}`}</Text>
    </View>
  );

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

      <TouchableOpacity style={styles.activeButton}>
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3D30A2" />
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.productId ? item.productId.toString() : item.id.toString()}
            ListEmptyComponent={<Text>No products available</Text>}
          />
          {renderPagination()}
          <TouchableOpacity style={styles.selectButton} onPress={handleSelectProducts}>
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  productText: {
    fontSize: 16,
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
  },
  disabledButton: {
    backgroundColor: '#0167f3',
  },
  paginationText: {
    fontSize: 18,
    color: 'black',
  },
  disabledText: {
    color: '#9ca3af',
  },
  selectButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#34d399',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default SelectProducts;
