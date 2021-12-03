import React, { useState } from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, View } from 'react-native';
import axios from 'axios';

import FormInput from './FormInput';
import * as Location from 'expo-location';

import { iconSize, iconColor } from '../utils/Constants'
import { MaterialIcons, Entypo } from '@expo/vector-icons';


export default function AutoCompleter(props) {

    const { location, setLocation } = props;
    
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState({});
    const [isShowingResults, setIsShowingResults] = useState(false)
    const [editCurrentAddress, setEditCurrentAddress] = useState(false);

    const searchLocation = async (text) => {
        setSearchKeyword(text);
        if (!text.length) {
            return setSearchResults([])
        }
        axios
            .request({
                method: 'post',
                url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${process.env.SECRET_SAUCE}&input=${searchKeyword}`,
            })
            .then((response) => {
                setSearchResults(response.data.predictions)
                setIsShowingResults(true)
            })
            .catch((e) => {
                console.log(e.response);
            });
    };

    return (
        <SafeAreaView style={styles.container}>

            <FormInput
                label="Location"
                value={searchKeyword}
                onChangeText={(text) => searchLocation(text)}
                errorMessage={editCurrentAddress && (!searchKeyword ? "Address can't be empty" : !location?.address ? "Location can't be empty" : "")}
                onFocus={() => setEditCurrentAddress(true)}
                onBlur={() => setEditCurrentAddress(false)}
                placeholder="enter your starting point"
                placeholderTextColor='rgba(75, 92, 107, 0.3)'
                leftIcon={<Entypo name="location-pin" size={iconSize} color={iconColor} />}
                rightIcon={
                    <MaterialIcons name="my-location" size={iconSize} color={iconColor}
                        onPress={async () => {
                            let { status } = await Location.requestForegroundPermissionsAsync();

                            if (status !== 'granted') {
                                Alert.alert(
                                    'Permission not granted',
                                    'Allow the app to use location service.',
                                    [{ text: 'OK' }],
                                    { cancelable: false }
                                );
                            }

                            var { coords } = await Location.getCurrentPositionAsync();
                            if (coords) {
                                const { latitude, longitude } = coords;
                                var response = await Location.reverseGeocodeAsync({ latitude, longitude });
                                for (var item of response) {
                                    var address = `${item.name},${item.street}, ${item.postalCode} ${item.city}`;

                                    setSearchKeyword(address)
                                    setSearchResults([])
                                    setIsShowingResults(false)
                                    setLocation({ latitude: coords.latitude, longitude: coords.longitude, address, from: 'current' })

                                }
                            }
                        }}
                    />}
            />

            {isShowingResults &&
                <ScrollView style={styles.searchResultsContainer} keyboardShouldPersistTaps='always'>
                    {searchResults.map((item, index) => (
                        <View
                            key={index}
                            style={styles.resultItem}
                            onTouchEnd={() => {
                                setSearchKeyword(item.description)
                                setIsShowingResults(false)
                                axios
                                    .request({
                                        method: 'GET',
                                        url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${process.env.SECRET_SAUCE}`
                                    })
                                    .then((response) => {

                                        const loc = response.data.result.geometry.location
                                        setLocation({ latitude: loc.lat, longitude: loc.lng, address: item.description, from: 'autocomplete' })
                                    })
                                    .catch((e) => {
                                        console.log(e.response)
                                    })
                            }}>
                            <Text>{item.description}</Text>
                        </View>
                    ))}
                </ScrollView>
            }
        </SafeAreaView >
    );
}


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    searchResultsContainer: {
        width: '100%',
        marginBottom: 20,
        borderColor: 'black',
        borderWidth: 0.5
    },
    resultItem: {
        width: '100%',
        justifyContent: 'center',
        height: 40,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingLeft: 15,
    }
});