import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, Image, View, Keyboard, TouchableWithoutFeedback, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Slider, Badge, Overlay } from 'react-native-elements';

import trustButtonPNG from '../assets/trustButton.png'
import { MaterialIcons } from '@expo/vector-icons';
import getFormattedDate from '../utils/getFormattedDate';
import getFormattedCategory from '../utils/getFormattedCategory';

import AutoCompleter from '../components/AutoCompleter';


import CalendarPicker from 'react-native-calendar-picker';
import { iconSize, iconColor } from '../utils/Constants'
import DodaHeader from '../components/DodaHeader';
import FormInput from '../components/FormInput';

const screenWidth = Dimensions.get('screen').width;

function MainScreen(props) {

  const [location, setLocation] = useState(null);

  const [distance, setDistance] = useState(5)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCategories, setSelectedCategories] = useState([])
  const [categories, setCategories] = useState([])

  const [budget, setBudget] = useState(30)

  // get activities' categories from database on mounting => badges 
  useEffect(() => {
    const getCategories = async () => {
      var rawResponse = await fetch(`${process.env.MY_IP}/categories`);
      var response = await rawResponse.json();
      setCategories(response.categories)
    }
    getCategories();
  }, []);


  //handle calendar
  useEffect(() => {
    setTimeout(() => {
      if (selectedDate) {
        setShowCalendar(false)
      }
    }, 100)

  }, [selectedDate])

  const handleTrustDoda = async () => {
s
    let rawResponse = await fetch(`${ip}/trust-doda`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `address=${location.address}&longitude=${location.longitude}&latitude=${location.latitude}&distance=${distance}&budget=${budget}&categories=${JSON.stringify(selectedCategories)}&date=${JSON.stringify(selectedDate)}`
    })

    let response = await rawResponse.json();
    console.log('response : ', response.request)
    if (response.result == true) {
      props.onCreateTrip({
        activities: response.myDoda,
        total: response.total,
        date: selectedDate,
        longitude: location.longitude,
        latitude: location.latitude
      })

      props.navigation.navigate(('GenerateTrip', { name: 'TrustDodaResult' }))
    } else {
      alert(response.error.toString())
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <DodaHeader />
        <ScrollView style={styles.form} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          <AutoCompleter
            location={location}
            setLocation={(loc) => {
              setLocation({
                latitude: loc.latitude,
                longitude: loc.longitude,
                from: loc.from,
                address: loc.address
              })
            }} />

          <View style={styles.budgetAndDistanceContainer}>
            <FormInput
              style={{ textAlign: 'center' }}
              label="Budget"
              value={String(budget)}
              keyboardType="phone-pad"
              onTouchStart={() => {
                setShowCalendar(false)
              }}
              onChangeText={(val) => {
                const newVal = val.replace(/[^\d]+/, '');
                const notZeroVal = newVal.replace(/^0/, '');
                setBudget(notZeroVal);
              }}
              containerStyle={{ width: '40%' }}
              rightIcon={<MaterialIcons name="euro" size={iconSize} color={iconColor} />}
              leftIcon={<MaterialIcons name="account-balance-wallet" size={iconSize} color={iconColor} />}
            />

            <View style={{ width: '55%' }}>
              <Text style={{ ...styles.labelText, marginTop: 5 }}>Distance</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={{ width: '100%' }}
                  maximumTrackTintColor='#C3E2DD'
                  maximumValue={10}
                  minimumTrackTintColor='#23A892'
                  minimumValue={0}
                  orientation="horizontal"
                  step={1}
                  thumbTintColor='#23A892'
                  thumbStyle={{ height: 20, width: 20 }}
                  thumbTouchSize={{ width: 40, height: 40 }}
                  trackStyle={{ height: 10, borderRadius: 8 }}
                  value={distance}
                  onValueChange={value => setDistance(value)}
                />
                <View style={styles.textCon}>
                  <Text style={styles.textColor}>0km</Text>
                  <Text style={styles.textColor}>{distance}km</Text>
                  <Text style={styles.textColor}>10km</Text>
                </View>
              </View>
            </View>
          </View>

          <FormInput
            label="Date"
            onTouchStart={() => {
              setShowCalendar(!showCalendar)
              Keyboard.dismiss();
            }}
            showSoftInputOnFocus={false}
            caretHidden={true}
            placeholder="YYYY-MM-DD"
            value={getFormattedDate(selectedDate)}
            leftIcon={<MaterialIcons name="date-range" size={iconSize} color={iconColor} />}
          />
          <View style={styles.interests}>
            <Text style={{ ...styles.labelText, fontSize: 25 }}>Interests: </Text>
            <View style={styles.categories}>
              {categories.map((cat, index) =>
                <Badge
                  key={index}
                  value={getFormattedCategory(cat)}
                  textStyle={{ fontSize: 16 }}
                  onPress={(e) => {
                    e.persist();
                    setShowCalendar(false)
                    const indexCat = selectedCategories.indexOf(cat);
                    if (indexCat === -1) {
                      setSelectedCategories([...selectedCategories, cat])
                    } else {
                      var newList = [...selectedCategories]
                      newList.splice(indexCat, 1);
                      setSelectedCategories(newList)
                    }
                  }}

                  badgeStyle={{
                    marginVertical: 3,
                    marginRight: 10,
                    paddingHorizontal: 5,
                    height: 35,
                    borderRadius: 20,
                    backgroundColor: selectedCategories.indexOf(cat) === -1 ? "#23A892" : "#FFBD0F"
                  }}
                />
              )}
            </View>
          </View>
          <View style={styles.trustButtonView}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
              }}
              onPress={() => {
                if (location) {
                  handleTrustDoda()
                }
              }
              }>
              <Image
                style={{ width: 140, aspectRatio: 1 }}
                source={trustButtonPNG}
                resizeMode='cover'
                width={140}
                height={140}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Overlay isVisible={showCalendar}
          onBackdropPress={() => setShowCalendar(false)} >
          <CalendarPicker
            scrollable={true}
            width={screenWidth - 40}
            minDate={new Date()}
            selectedStartDate={selectedDate}
            selectedDayStyle={{ backgroundColor: '#23A892' }}
            onDateChange={(date) => setSelectedDate(date)}
          />
        </Overlay>


      </View>
    </TouchableWithoutFeedback >
  );

}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  form: {
    width: '90%',
    alignSelf: 'center',
    // backgroundColor: 'red',
    marginTop: 100,

  },
  labelText: {
    color: '#4B5C6B', fontSize: 18, fontWeight: 'bold'
  },
  AutoCompleter: {
    height: 80
  },
  budgetAndDistanceContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderContainer: {
    marginRight: 10,
    marginVertical: 15
  },
  textCon: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textColor: {
    color: '#4B5C6B'
  },
  interests: {
    marginHorizontal: 10
  },
  categories: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: "wrap"
  },
  trustButtonView: {
    marginTop: 10,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  }
});


function mapDispatchToProps(dispatch) {
  return {
    onCreateTrip: function (tripData) {
      dispatch({ type: 'createTrip', newTrip: tripData })
    }
  }
}

export default connect(null, mapDispatchToProps)(MainScreen);