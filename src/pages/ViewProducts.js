import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { EditIcon, SquareX, ChevronRight, ArrowRightToLine, ChevronLeft, ArrowLeftToLine } from 'lucide-react-native';

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0); // Cache the total pages for pagination
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const limit = 4;

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/all?limit=${limit}&page=${page}`);
      const { data, total } = response.data;
      setProducts(data);
      setTotal(total);
      setTotalPages(Math.ceil(total / limit)); // Calculate total pages once and cache it
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts(page);
    }, [page, fetchProducts])
  );

  const handleUpdateProduct = async () => {
    try {
      await api.put('/products/update', selectedProduct);
      Alert.alert('Success', 'Product updated successfully');
      setModalVisible(false);
      fetchProducts(page); // Refetch products after updating
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this product?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await api.delete(`/products/${productId}`);
            Alert.alert('Success', 'Product deleted successfully');
            fetchProducts(page);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete product');
            console.error(error);
          }
        },
      },
    ]);
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {/* << Button */}
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(1)} // Go to the first page
        disabled={page === 1}
      >
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}><ArrowLeftToLine color="#fff" /></Text>
      </TouchableOpacity>

      {/* < Button */}
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => page > 1 && setPage(page - 1)} // Go to the previous page
        disabled={page === 1}
      >
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}><ChevronLeft color="#fff" /></Text>
      </TouchableOpacity>

      {/* Display current page only */}
      <TouchableOpacity style={styles.activeButton}>
        <Text style={styles.paginationText}>{page}</Text>
      </TouchableOpacity>

      {/* > Button */}
      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => page < totalPages && setPage(page + 1)} // Go to the next page
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}><ChevronRight color="#fff" /></Text>
      </TouchableOpacity>

      {/* >> Button */}
      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => page < totalPages && setPage(totalPages)} // Go to the last page
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}><ArrowRightToLine color="#fff" /></Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.iconActions}>
          <TouchableOpacity onPress={() => {
            setSelectedProduct(item);
            setModalVisible(true);
          }}>
            <EditIcon style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
            <SquareX style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.productText}>{`Qadoqlanishi: ${item.packaging}`}</Text>
      <Text style={styles.productText}>{`Narxi: ${item.purchasePrice} UZS`}</Text>
      <Text style={styles.productText}>{`Sotuv turi: ${item.saleType}`}</Text>
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
        </>
      )}

      {/* Modal for updating product */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mahsulot malumotlarini yangilash</Text>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={selectedProduct?.name || ''}
              onChangeText={(text) => setSelectedProduct({ ...selectedProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Packaging"
              value={selectedProduct?.packaging || ''}
              onChangeText={(text) => setSelectedProduct({ ...selectedProduct, packaging: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Purchase Price"
              value={selectedProduct?.purchasePrice?.toString() || ''}
              onChangeText={(text) => setSelectedProduct({ ...selectedProduct, purchasePrice: parseFloat(text) })}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Bekor qilish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProduct}
              >
                <Text style={styles.buttonText}>Saqlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  iconActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 10,
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    marginHorizontal: 5,
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
  activeText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#34d399',
    borderRadius: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default ViewProducts;
