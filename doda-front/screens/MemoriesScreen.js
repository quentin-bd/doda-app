import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View, Keyboard, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import getFormattedDate from '../utils/getFormattedDate';

import ip from '../ip';

import DodaHeader from '../components/DodaHeader';
import ForceLogin from '../components/ForceLogin'
import TripCard from '../components/TripCard';

function MemoriesScreen(props) {

  const [isMemorySelected, setIsMemorySelected] = useState(false);
  const [pastTrips, setPastTrips] = useState([]);
  const [nextTrips, setNextTrips] = useState([]);
  const [isLogin, setIsLogin] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {

    // FETCH MY TRIPS FROM BACK END AND SAVE THEM IN STATES PAST TRIPS/NEXT TRIPS
    const fetchTrips = async (token) => {
      let rawRes = await fetch(`${ip}/usertrips/${token}`);
      let response = await rawRes.json();

      if (response.result) {
        let today = new Date();
        today = new Date(getFormattedDate(today)); // use date Formatting so that every date is at 00:00:00 time 

        setNextTrips(
          response.trips
            .map(trip => {
              return { ...trip, date: new Date(getFormattedDate(trip.date)) }
            })
            .filter(trip => trip.date.getTime() >= today.getTime())
            .sort((a, b) => a.date - b.date)
        );
        setPastTrips(
          response.trips
            .map(trip => {
              return { ...trip, date: new Date(getFormattedDate(trip.date)) }
            })
            .filter(trip => trip.date.getTime() < today.getTime())
            .sort((a, b) => b.date - a.date)
        );
      }
    };

    // IF NO USER, FORCE LOGIN, ELSE FETCH USER'S TRIPS
    if (props.userToken === '') {
      setIsLogin(false);
    } else {
      fetchTrips(props.userToken);
      setIsLogin(true);
    }

  }, [props.userToken, isFocused]) //DO THE CHECK EVERY TIME THE SCREEN COMES IN FOCUS

  // for reverse data flow, sent to next trip cards
  const editNextTrip = (tripIdx) => {
    props.editTrip(nextTrips[tripIdx]);
    props.navigation.navigate('EditTrip')
  }

  let cardList = [];

  // GENERATE CARD LIST DEPENDING WETHER WE WANT PAST OR NEXT TRIPS
  if (isMemorySelected) {
    cardList = pastTrips.map((trip, i) => {
      return (<TripCard
        key={i}
        past
        latitude={trip.latitude}
        longitude={trip.longitude}
        title={trip.title}
        date={trip.date}
        activities={trip.activities}
        tripId={trip.id}
      />)
    });
  } else {
    cardList = nextTrips.map((trip, i) => {
      return (<TripCard
        key={i}
        latitude={trip.latitude}
        longitude={trip.longitude}
        title={trip.title}
        date={trip.date}
        activities={trip.activities}
        edit={editNextTrip}
        tripIndex={i}
      />)
    });
  }

  return (

    <View style={styles.container}>

      <DodaHeader />

      {/* Navigation tabs */}

      <View style={styles.topTabsNav}>
        <View style={isMemorySelected ? styles.topTab : styles.selectedTopTab}>
          <Text
            style={isMemorySelected ? styles.topTabLabel : styles.selectedTopTabLabel}
            onPress={() => setIsMemorySelected(false)}>
            Next Trips
          </Text>
        </View>
        <View style={isMemorySelected ? styles.selectedTopTab : styles.topTab} >
          <Text
            style={isMemorySelected ? styles.selectedTopTabLabel : styles.topTabLabel}
            onPress={() => setIsMemorySelected(true)}>
            Memories
          </Text>
        </View>
      </View>

      {/* Force Login Overlay */}

      <ForceLogin
        display={!isLogin && isFocused}
        signin={() => props.navigation.navigate('SignIn')}
        signup={() => props.navigation.navigate('SignUp')}
        nav={props.navigation}
      />

      {/* Background */}
      <LinearGradient
        colors={['#FFFFFF', '#D6D6D6']}
        style={styles.background}
      />
      <StatusBar style="auto" />

      {/* Trip Cards */}
        <ScrollView style={styles.content}>
          {cardList}
        </ScrollView>

    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    zIndex: -200,
  },
  topTabsNav: {
    position: 'absolute',
    top: 30,
    zIndex: -1,
    width: '98%',
    marginLeft: '1%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  topTab: {
    width: '45%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#23A892',
    justifyContent: 'flex-end',
  },
  selectedTopTab: {
    width: '45%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#23A892',
    justifyContent: 'flex-end',
    transform: [{ translateY: 30 }]
  },
  topTabLabel: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'Lobster_400Regular',
    paddingBottom: 10,
    paddingTop: 40
  },
  selectedTopTabLabel: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'Lobster_400Regular',
    paddingBottom: 20,
    paddingTop: 40,
    fontSize: 25
  },
  content: {
    width: '100%',
    height: '100%',
    marginTop: 160,
  },
});

function mapStateToProps(state) {
  return { userToken: state.token, trip: state.trip }
}

// TODO : brancher ca au reducer de Quentin permettant de définir le Trip en cours de modif
function mapDispatchToProps(dispatch) {
  return {
    editTrip: function (trip) {
      dispatch({ type: 'editTrip', trip })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MemoriesScreen);