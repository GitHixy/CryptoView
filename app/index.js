import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, 
  FlatList, Image, Button, Dimensions, ImageBackground } from 'react-native';
import axios from 'axios';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LineChart } from 'react-native-chart-kit';

const Stack = createStackNavigator();

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000', 
  },
};

function HomeScreen({ navigation }) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=layer-1&order=market_cap_desc&per_page=50&price_change_percentage=24h&precision=6');
        setList(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchList();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name} ({item.symbol.toUpperCase()})</Text>
        <Text>Current Price: ${item.current_price.toFixed(5)}</Text>
        <Text>Market Cap: ${item.market_cap.toLocaleString()}</Text>
        <Text>24h Change: {item.price_change_percentage_24h.toFixed(2)}%</Text>
        <Button
          title="View Chart"
          onPress={() => navigation.navigate('Details', { coinId: item.id })}
        />
      </View>
    </View>
  );

  return (
    
    <ImageBackground source={require('../assets/images/csbg.png')} style={styles.backgroundImage}>
      <View style={styles.containerHome}>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
        <Text style={styles.miniTitleBottom}>Powered by CoinGecko</Text>
        <View style={styles.spacer}></View>
      </View>
    </ImageBackground>
    
  );
}

function DetailsScreen({ route }) {
  const { coinId } = route.params;
  const [coinData, setCoinData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const coinResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        setCoinData(coinResponse.data);

        const marketResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`);
        setMarketData(marketResponse.data);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(true);
        setLoading(false);
      }
    };
    fetchCoinData();
  }, [coinId]);

  if (loading) {
    return (
      <ImageBackground source={require('../assets/images/csbg.png')} style={styles.backgroundImage}>
        <View style={styles.containerHome}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={require('../assets/images/csbg.png')} style={styles.backgroundImage}>
        <View style={styles.containerHome}>
          <Text style={styles.title}>Error Fetching Data</Text>
          <Text style={styles.title}>Try Again Later</Text>
        </View>
      </ImageBackground>
    );
  }

  const formatMarketData = () => {
    const prices = marketData.prices.map(([timestamp, price]) => ({
      timestamp: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price
    }));
    const recentPrices = prices.slice(-7);
    const labels = recentPrices.map(p => p.timestamp);
    const data = recentPrices.map(p => p.price);

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
        }
      ]
    };
  };

  return (
    
    <ImageBackground source={require('../assets/images/csbg.png')} style={styles.backgroundImage}>
      <View style={styles.containerHome}>
        <Text style={styles.title}>- {coinData.name} -</Text>
        <Text style={styles.miniTitle}>[{coinData.symbol.toUpperCase()}]</Text>
        <Text style={styles.miniTitle}>Current Price: ${coinData.market_data.current_price.usd}</Text>
        <View style={styles.spacer} />
        <Text style={styles.title}>7 Days Chart</Text>
        <View style={styles.spacer} />
        {/* Chart */}
        {marketData && (
          <LineChart
            data={formatMarketData()}
            width={Dimensions.get('window').width}
            height={400}
            chartConfig={{
              backgroundColor: '#000',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: '0'
              }
            }}
            bezier
          />
        )}
      </View>

      <Text style={styles.miniTitle}>Chart Provided by CoinGecko</Text>
    </ImageBackground>
    
  );
}

export default function Index() {
  return (
   
    <NavigationContainer independent={true} theme={MyTheme}>
    
    
      <Stack.Navigator
        initialRouteName="Welcome to CryptoView"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
      
    </NavigationContainer>
    
    
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'red',
  },
  containerHome: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  miniTitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2
  },
  miniTitleBottom: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    padding: 2,
    width: Dimensions.get('window').width,
    backgroundColor: '#000',
    marginTop: 15,
  },
  item: {
    width: 350,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    opacity: 0.9,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
});

