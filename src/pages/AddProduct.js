import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { SearchIcon } from 'lucide-react-native';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [saleType, setSaleType] = useState('');
  const [packaging, setPackaging] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigation = useNavigation();

  // Mahsulotni qidirish funksiyasi
  const handleSearchProduct = async () => {
    if (!searchQuery) {
      Alert.alert('Xatolik', 'Qidiruv maydonini to‘ldiring.');
      return;
    }
    try {
      const response = await api.post('/products/details', {
        barcode: isNaN(searchQuery) ? null : searchQuery,
        name: isNaN(searchQuery) ? searchQuery : null,
      });
      console.log('API Response:', response.data); // Ma'lumotni konsolda tekshiring
      const results = response.data.data || []; // Use data property which is an array
      setSearchResults(results.slice(0, 5)); // Faqat so'nggi 5 ta mahsulot
    } catch (error) {
      console.error('API Error:', error.response || error.message);
      Alert.alert('Xatolik', 'Mahsulot qidirishda xato yuz berdi!');
    }
  };

  // Tanlangan mahsulotni formga to'ldirish
  const handleSelectProduct = (product) => {
    setName(product.name);
    setSaleType(product.saleType);
    setPackaging(product.packaging);
    setPurchasePrice(product.purchasePrice.toString());
    setBarcode(product.barcode);
    setSearchResults([]); // Qidiruv natijalarini tozalash
  };

  // Yangi mahsulot qo'shish funksiyasi
  const handleAddProduct = async () => {
    if (!name || !saleType || !packaging || !purchasePrice) {
      Alert.alert('Xatolik', 'Barcha maydonlarni to\'ldiring.');
      return;
    }

    try {
      const response = await api.post('/products/add', {
        name,
        saleType,
        packaging,
        purchasePrice: parseFloat(purchasePrice),
        barcode,
      });

      if (response.status === 201) {
        Alert.alert('Muvaffaqiyat', 'Mahsulot muvaffaqiyatli qo\'shildi!');
        setName('');
        setSaleType('');
        setPackaging('');
        setPurchasePrice('');
        setBarcode('');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Alert.alert('Sessiya tugadi', 'Iltimos, qaytadan tizimga kiring.');
        navigation.replace('Login');
      } else {
        console.error('API Error:', error.response || error.message);
        Alert.alert('Xatolik', 'Mahsulot qo\'shishda xato yuz berdi!');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={[1]} // Placeholder to enable FlatList
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <View style={styles.scrollContainer}>
            <Text style={styles.title}>Yangi mahsulot qo'shish</Text>

            {/* Qidiruv maydoni */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Mahsulot nomi yoki barcodi"
                  value={searchQuery}
                  placeholderTextColor={'gray'}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchProduct}
                />
                <TouchableOpacity style={styles.searchIcon} onPress={handleSearchProduct}>
                  <SearchIcon color={'#fff'}/>
                </TouchableOpacity>
              </View>

              {/* Qidiruv natijalari */}
              {searchResults.length > 0 && (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => handleSelectProduct(item)}
                    >
                      <Text style={styles.searchResultText}>
                        {item.name} - {item.packaging}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            {/* Form maydonlari */}
            <View style={styles.formWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Mahsulot nomi"
                value={name}
                placeholderTextColor={'gray'}
                onChangeText={setName}
              />

              <Text style={styles.label}>Sotish turi</Text>
              <DropDownPicker
                open={dropdownOpen}
                value={saleType}
                items={[
                  { label: 'Litre', value: 'litre' },
                  { label: 'Amount', value: 'amount' },
                  { label: 'Kg', value: 'kg' },
                  { label: 'G', value: 'g' },
                ]}
                setOpen={setDropdownOpen}
                setValue={setSaleType}
                placeholder="Sotish turini tanlang"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownStyle}
              />

              <TextInput
                style={styles.input}
                placeholderTextColor={'gray'}
                placeholder="Qadoqlash turi"
                value={packaging}
                onChangeText={setPackaging}
              />

              <TextInput
                style={styles.input}
                placeholderTextColor={'gray'}
                placeholder="Sotib olish narxi"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.sendButton} onPress={handleAddProduct}>
                <Text style={styles.sendButtonText}>Saqlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start', // Ensures the content starts from the top
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  searchWrapper: {
    marginBottom: 20, // Add space below the search
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 9,
    paddingLeft: 12,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginLeft: 8,
    backgroundColor: '#0167f3',
    width: 43,
    height: 43,
    borderRadius: 10,
    justifyContent: 'center', // Vertikal markazlash
    alignItems: 'center',    // Gorizontal markazlash
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 9,
    marginBottom: 16,
    paddingLeft: 12,
    backgroundColor: '#fff',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 9,
  },
  dropdownStyle: {
    backgroundColor: '#fafafa',
  },
  searchResultItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#3D30A2',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  formWrapper: {
    flex: 1, // Ensures the form is centered within the remaining space
    justifyContent: 'center',
  },
});

export default AddProduct;
