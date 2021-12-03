import React, { useEffect, useRef, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { Text, StyleSheet, View, KeyboardAvoidingView, TouchableOpacity } from 'react-native'
import { useIsFocused } from '@react-navigation/native';
import { Button, Overlay, Input, Icon } from 'react-native-elements'
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import Animated, {useSharedValue, withTiming, useAnimatedRef, useAnimatedStyle, useAnimatedGestureHandler } from "react-native-reanimated";
import { PanGestureHandler, Swipeable } from "react-native-gesture-handler";

import Activity from '../components/Activity';
import randomColor from '../utils/randomColor';
import getFormattedDate from '../utils/getFormattedDate';
import ForceLogin from '../components/ForceLogin';

import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import GeoIcon from '../components/GeoIcon';
import optimizedNextTripPath from '../utils/optimizedNextTripPath';

function GeneratedTrip(props) {

  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(false);
  
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  const [currentLocation, setCurrentLocation] = useState(null)
  const [tripTitle, setTripTitle] = useState('');

  const [nextTrip, setNextTrip] = useState(null)
  const [directions, setDirections] = useState([])
  const [likedActivities, setLikedActivities] = useState([]);
  const [forceLogin, setForceLogin] = useState(false);

  const [subscriber, setSubscriber] = useState(null);
  const mapRef = useRef(null);
  const scrollY = useSharedValue(0);
  const scrollView = useAnimatedRef();
  
  const animateToRegion = useCallback((r) => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion(r, 1000);
  }, [mapRef]);

  
  useEffect(() => {

    const startWatching = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      const sub = await Location.watchPositionAsync(
        { distanceInterval: 20 },
        (loc) => setCurrentLocation(loc.coords)
      );
      setSubscriber(sub);
    }
    startWatching()
    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    }
  }, [])

  useEffect(() => {
    const fetchLikes = async (token) => {
      // fetch la liste des activités likés par cet utilisateur --> route dans le back 'get activities' en fonction du token
      let rawResponse = await fetch(`${process.env.MY_IP}/get-likes/${token}`);
      let response = await rawResponse.json();

      if (response.result) {
        setLikedActivities(response.likes);
      }
    }

    if (isFocused) {

      if (props.trip) { //get trip that is in the store,
        setNextTrip(props.trip.data);
        setTripTitle(props.trip.data.title ? props.trip.data.title : 'My New Trip');
      } else { //if there is none redirect to search page
        props.navigation.navigate('Main');
      }

      if (props.userToken != '') {
        setForceLogin(false);
        fetchLikes(props.userToken);
      }
    }
  }, [isFocused])

  useEffect(() => {
    const path = optimizedNextTripPath(nextTrip)
    setDirections([...path])
  }, [nextTrip])

  const handleSaveButton = async () => {

    if (props.trip.type === 'edit' && props.userToken !== '') {
      //EDIT TRIP IN DB
      await fetch(`${ip}/updateTrip/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `user=${props.userToken}&tripId=${props.trip.data._id}&tripData=${JSON.stringify(nextTrip)}`
      })
        .then(response => response.json())
        .then(res => {
          if (res.result) {
            // EDIT SAVED : EMPTY STORE AND NAVIGATE TO MY TRIPS
            props.navigation.navigate('MyTrips')
            props.clearEditedTrip();
          }
        });
    } else if (props.trip.type === 'new' && props.userToken !== '') {
      // SAVE TRIP IN DB
      await fetch(`${ip}/saveTrip/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `user=${props.userToken}&tripData=${JSON.stringify(nextTrip)}`
      })
        .then(response => response.json())
        .then(res => {
          if (res.result) {
            // NEW TRIP SAVED : EMPTY STORE AND NAVIGATE TO MY TRIPS
            props.navigation.jumpTo('MyDodas');
            props.clearEditedTrip();
          }
        });
    } else {
      // USER NOT SIGNED IN CAN'T SAVE TRIP : FORCE LOGIN AND KEEP TRIP IN STORE TO BE ABLE TO COME BACK TO IT AFTER SIGN IN
      setForceLogin(true);
    }
  }

  const swipeButtonStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    width: 100,
  }

  let swipeArr = [];
  let prevOpenedSwipe;
  const closeSwipe = (index, isDelete = false) => {
    if ((prevOpenedSwipe && swipeArr[index] !== prevOpenedSwipe) || isDelete) {
      prevOpenedSwipe.close();
    }
    prevOpenedSwipe = swipeArr[index];
  }

  var y = useSharedValue(0);
  const tripHeaderColor = useSharedValue('#23A892')

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = y.value;
    },
    onActive: (event, ctx) => {
      y.value = ctx.startY + event.translationY;
      if (y.value > 210) {
        tripHeaderColor.value = '#FFBD0F'
      } else {
        tripHeaderColor.value = '#23A892'
      }
    },
    onEnd: () => {
      if (y.value > 210) {
        y.value = withTiming(230)

      } else if (y.value < 0) {
        y.value = withTiming(0)
      }
    },
  });

  const styleScroll = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: y.value,
        },
      ],
    };
  });

  const styleHeader = useAnimatedStyle(() => {
    return {
      backgroundColor: tripHeaderColor.value,
    };
  });

  const styleMap = useAnimatedStyle(() => {
    return {
      height: 300 + y.value
    };
  });

  if (!nextTrip) {
    return <View />
  }
  return (
    <View style={styles.container}>

      {/* Force Login Overlay */}

      <ForceLogin
        display={forceLogin && isFocused}
        nav={props.navigation}
      />

      {/* back to main page */}
      <View style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" onPress={() => props.navigation.goBack()} />
      </View>
      {isFocused &&
        <Animated.View style={[styleMap]}>
          <View style={styles.mapView}>
            <MapView
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
              zoomEnabled={true}
              initialRegion={{
                latitude: nextTrip.latitude,
                longitude: nextTrip.longitude,
                latitudeDelta: 0.0322,
                longitudeDelta: 0.0421,
              }}
            >
              {currentLocation && <Marker
                coordinate={{ latitude: currentLocation?.latitude, longitude: currentLocation?.longitude }}
                title="I am here"
              />}
              {nextTrip && nextTrip?.activities &&
                <>
                  {!!nextTrip?.latitude && !!nextTrip?.longitude &&
                    <Marker
                      pinColor='yellow'
                      coordinate={{ latitude: nextTrip.latitude, longitude: nextTrip.longitude }}
                      title={nextTrip?.title}
                    />}
                  {nextTrip.activities.map((point, index) =>
                    <Marker
                      key={index}
                      pinColor='blue'
                      coordinate={{ latitude: point?.latitude, longitude: point?.longitude }}
                      title={point?.title}
                      description={point?.desc}
                    />)}

                  {directions.length !== 0 && directions.map((point, index, arr) => {
                    if (index + 1 >= arr.length || !point) return;

                    const start = { latitude: point.latitude, longitude: point.longitude }
                    const end = { latitude: directions[index + 1]?.latitude, longitude: directions[index + 1]?.longitude }
                    return (<MapViewDirections
                      key={index}
                      origin={start}
                      destination={end}
                      apikey={process.env.GOOGLE_MAPS_APIKEY}
                      strokeWidth={3}
                      strokeColor={randomColor()}
                      lineDashPattern={[0]}
                      mode="WALKING"
                    />);
                  })}
                </>}
            </MapView>
          </View>
        </Animated.View>
      }

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styleScroll]}>
          <View style={styles.listActivities}>
            <Animated.View style={[styles.listHeader, styleHeader]}>
              <>
                <GeoIcon panY={y} fetchCurrentLocation={() => animateToRegion(currentLocation)} />
                <View style={styles.listHeaderLeft}>
                  <View style={styles.titleEdit}>
                    <Text style={{ color: 'white', fontFamily: 'Lobster_400Regular' }}>{nextTrip?.title}</Text>
                    <MaterialIcons name="mode-edit" size={16} color="white" onPress={toggleOverlay} />
                  </View>
                  <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontFamily: 'Lobster_400Regular' }}>
                    {getFormattedDate(nextTrip?.date)}
                  </Text>
                </View>
                <Text style={{ textAlign: 'center', color: "white" }}>Estimated budget : {nextTrip?.budget}€</Text>

              </>
            </Animated.View>

            {
              nextTrip && nextTrip?.activities &&
              <View style={styles.listContent}>

                {/* SHOW TRUST DODA AGAIN button when no activity found in current trip */}
                {nextTrip.activities.length === 0 &&
                  <View style={styles.noActivitiesView}>
                    <Text h1 style={{ color: '#23A892', fontSize: 30 }}>
                      No Activity in current Trip
                    </Text>
                    <Button
                      title="TRUST DODA AGAIN"
                      buttonStyle={styles.trustDodaAgainButton}
                      titleStyle={{ fontSize: 20 }}
                      onPress={() => props.navigation.goBack()}
                    />
                  </View>}

                {/* list all activities in current trip */}
                <Animated.ScrollView
                  ref={scrollView}
                  style={{ backgroundColor: 'white' }}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                >
                  {nextTrip.activities.map((item, index) =>

                    <View key={index} style={styles.activityWithSwipe}>

                      {/* Each activity can be swipable, swipe left to delete, swipe right to refresh */}
                      <Swipeable
                        ref={ref => swipeArr[index] = ref}
                        friction={2}
                        leftThreshold={80}
                        rightThreshold={10}
                        style={styles.activityWithSwipe}
                        onSwipeableWillOpen={() => closeSwipe(index)}
                        renderLeftActions={() =>
                          <TouchableOpacity
                            style={{
                              ...swipeButtonStyle,
                              backgroundColor: '#23A892',
                              borderTopStartRadius: 12,
                              borderBottomLeftRadius: 12
                            }}
                            onPress={async () => {
                              await fetch(`${ip}/refresh-activity/${item._id}/${JSON.stringify(nextTrip.activities.filter(e => e != item).map(e => e._id))}`)
                                .then(rawResponse => rawResponse.json())
                                .then(response => {
                                  if (response.status === "success") {
                                    const newNextTrip = { ...nextTrip };
                                    const indexAct = newNextTrip?.activities.findIndex(activity => activity._id == item._id)
                                    if (indexAct !== -1) {
                                      newNextTrip?.activities.splice(indexAct, 1, response.activity)
                                      setNextTrip(newNextTrip)
                                      closeSwipe(index)
                                    }
                                  }
                                });
                            }}>
                            <FontAwesome name="refresh" size={50} color="white" />
                          </TouchableOpacity>}
                        renderRightActions={() =>
                          <TouchableOpacity
                            style={{
                              ...swipeButtonStyle,
                              backgroundColor: 'red',
                              borderTopEndRadius: 12,
                              borderBottomRightRadius: 12
                            }}
                            onPress={() => {
                              const newNextTrip = { ...nextTrip };
                              const indexAct = newNextTrip?.activities.findIndex(activity => activity._id == item._id)
                              if (indexAct !== -1) {
                                newNextTrip?.activities.splice(indexAct, 1)
                                setNextTrip(newNextTrip)
                                closeSwipe(indexAct, true)
                              }
                            }}
                          >
                            <AntDesign name="delete" size={40} color="white" />
                          </TouchableOpacity>}
                      >

                        <Activity {...item} isLiked={likedActivities.find(e => e == item._id)} />

                      </Swipeable>
                    </View>
                  )}
                  <View style={styles.listFooter}>
                    <Button
                      title="Save"
                      buttonStyle={styles.saveButton}
                      titleStyle={{
                        marginHorizontal: 5,
                        fontFamily: 'Lobster_400Regular',
                      }}
                      onPress={() => handleSaveButton()}
                    />
                  </View>
                </Animated.ScrollView>
              </View>
            }
          </View >

        </Animated.View>
      </PanGestureHandler>

      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View overlayStyle={{ width: "90%" }}>
            <Input
              value={tripTitle}
              placeholder='please set a trip title'
              errorMessage={tripTitle.length === 0 ? "Oops! can't be empty!" : ''}
              onChangeText={value => setTripTitle(value)}
              rightIcon={
                <MaterialIcons
                  name="clear"
                  size={24}
                  color="#23A892"
                  onPress={() => setTripTitle('')}
                />}
            />
            <Button
              title="Save title"
              onPress={() => {
                if (tripTitle) {
                  setNextTrip({ ...nextTrip, title: tripTitle })
                }
                toggleOverlay()
              }}
              buttonStyle={{ backgroundColor: "#23A892", width: '100%' }}
            />
          </View>
        </KeyboardAvoidingView>
      </Overlay>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  mapView: {
    width: ScreenWidth,
    height: ScreenHeight + 500,
    marginTop: -500,
    backgroundColor: 'red'
  },
  listActivities: {
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  listHeader: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopStartRadius: 12,
    borderTopEndRadius: 12
  },
  listHeaderLeft: {
    color: 'white',
    minWidth: 100,
    marginRight: 10,
    padding: 10,
  },
  titleEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    width: '100%',
    height: '100%',
    marginBottom: 0,
  },
  noActivitiesView: {
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  trustDodaAgainButton: {
    marginVertical: 20,
    borderRadius: 18,
    backgroundColor: '#FFBD0F'
  },
  activityWithSwipe: {
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
    flex: 1,
  },
  swipeButton: {
    alignSelf: 'center',
    aspectRatio: 1,
    flexDirection: 'column',
    padding: 10,
  },
  listFooter: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#FFBD0F',
    borderRadius: 18,
    width: 100,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 30,
    backgroundColor: 'transparent',
    zIndex: 20,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {
      height: 6,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  }
});

function mapStateToProps(state) {
  return { trip: state.trip, userToken: state.token }
}

function mapDispatchToProps(dispatch) {
  return {
    updateEditedTrip: function (trip) {
      dispatch({ type: 'editTrip', newTrip: trip })
    },
    clearEditedTrip: function () {
      dispatch({ type: 'deleteTrip' })
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GeneratedTrip);