import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Product = {
  id: string;
  name: string;
  price: number;
  image: any;
};

type StoreScreenProps = {
  coins: number;
  purchasedItems: string[];
  equippedItem: string | null;
  onCoinsChange?: (coins: number) => void;
  onPurchasedItemsChange?: (items: string[]) => void;
  onEquipChange?: (itemId: string | null) => void;
};

const products: Product[] = [
  { id: 'shirtpink', name: 'SHIRT 1', price: 20, image: require('../../assets/images/shirtPink.png') },
  { id: 'shirtblue', name: 'SHIRT 2', price: 20, image: require('../../assets/images/shirtBlue.png') },
  { id: 'shirtorange', name: 'SHIRT 3', price: 20, image: require('../../assets/images/shirtOrange.png') },
  { id: 'hat1', name: 'HAT 1', price: 10, image: require('../../assets/images/hat1.png') },
  { id: 'hat2', name: 'HAT 2', price: 10, image: require('../../assets/images/hat2.png') },
  { id: 'hat3', name: 'HAT 3', price: 10, image: require('../../assets/images/hat3.png') },
];

const chunkArray = (arr: Product[], size: number) => {
  const chunked: Product[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunked.push(arr.slice(i, i + size));
  }
  return chunked;
};

const StoreScreen = ({
  coins,
  purchasedItems,
  equippedItem,
  onCoinsChange,
  onPurchasedItemsChange,
  onEquipChange,
}: StoreScreenProps) => {
  const productRows = chunkArray(products, 2);

  const handlePurchase = (product: Product) => {
    if (coins >= product.price && !purchasedItems.includes(product.id)) {
      const newCoins = coins - product.price;
      const newPurchasedItems = [...purchasedItems, product.id];
      onCoinsChange?.(newCoins);
      onPurchasedItemsChange?.(newPurchasedItems);
      console.log(`${product.name} 구매 완료`);
    } else {
      console.log('코인 부족 또는 이미 구매함');
    }
  };

  const handleEquip = (productId: string) => {
    onEquipChange?.(productId);
    console.log(`${productId} 착용 완료`);
  };

  const handleUnequip = () => {
    onEquipChange?.(null);
    console.log('착용 해제 완료');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.price}>{coins} coin</Text>
      <Text style={styles.header}>상점</Text>

      {equippedItem && (
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.equippedText}>
            현재 착용 중: {products.find((p) => p.id === equippedItem)?.name}
          </Text>
          <TouchableOpacity style={styles.unequipButton} onPress={handleUnequip}>
            <Text style={styles.unequipButtonText}>착용 해제</Text>
          </TouchableOpacity>
        </View>
      )}

      {productRows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => {
            const isPurchased = purchasedItems.includes(item.id);
            const isEquipped = equippedItem === item.id;

            return (
              <View key={item.id} style={styles.card}>
                <Image source={item.image} style={styles.image} />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price.toLocaleString()} coin</Text>
                <TouchableOpacity
                  style={[
                    styles.button,
                    (!isPurchased && coins < item.price) && { backgroundColor: '#ccc' },
                    isEquipped && { backgroundColor: '#999' },
                  ]}
                  onPress={() => {
                    if (isPurchased) {
                      handleEquip(item.id);
                    } else {
                      handlePurchase(item);
                    }
                  }}
                  disabled={!isPurchased && coins < item.price}
                >
                  <Text style={styles.buttonText}>
                    {isPurchased
                      ? isEquipped
                        ? '착용 중'
                        : '착용'
                      : coins >= item.price
                      ? '구매'
                      : '부족'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {row.length < 2 && <View style={styles.card} />}
        </View>
      ))}
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  equippedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4a90e2',
  },
  unequipButton: {
    marginTop: 8,
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unequipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    alignItems: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default StoreScreen;
