
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { View, Text, StyleSheet, TouchableHighlight, Image, TouchableOpacity, Linking } from 'react-native'
import { ListItem, Avatar, Badge, Overlay, Button } from 'react-native-elements'
import { FontAwesome } from '@expo/vector-icons';

import titleCaracters from '../utils/titleCaracters';
import ip from '../ip';

function Activity(props) {

  const { openingHours = [], imgUrl = '', address = '', category = '', title = '', description = '', telephone = '', pricing = '' } = props

  const [visible, setVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(props.isLiked);
  }, [props.isLiked])

  var today = new Date();

  let likeColor = '#FFF'
  if (isLiked) {
    likeColor = '#E22828'
  }

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  const toggleLike = async () => {
    
    // fetch une route qui toggle le like en bdd
    let rawResponse = await fetch(`${ip}/toggle-like?userToken=${props.userToken}&activityId=${props._id}`);
    let response = await rawResponse.json();

    if (response.result) {
      setIsLiked(!isLiked);
    }
  }

  let openingHoursStr = '';
  if (openingHours.length == 1 && openingHours[0].open.time == '0000' && openingHours[0].open.day == 0) {
    openingHoursStr = "4ever open for you 😉"
  } else {
    let todayOpeningHours = openingHours.filter(el => el.open.day == today.getDay());
    let todayOpenings = openingHours.map(obj => obj.open.time);
    let todayClosings = openingHours.map(obj => obj.close.time);

    for (let i = 0; i < todayOpeningHours.length; i++) {
      openingHoursStr += ` ${todayOpenings[i].slice(0, 2) + "h" + todayOpenings[i].slice(2)} - ${todayClosings[i].slice(0, 2) + "h" + todayClosings[i].slice(2)}   `
    }
  }

  return (
    <>
      <TouchableHighlight
        style={{ borderRadius: 12 }}
        activeOpacity={1}
        underlayColor="white"
        onPress={() => toggleOverlay()}>
        <ListItem containerStyle={styles.activity} pad={10}>
          <TouchableOpacity onPress={toggleLike}>
            <Avatar
              rounded
              title={`${title.substr(0, 5)}`}
              source={{ uri: imgUrl }}
              style={{ width: 100, height: 90 }}
            />
            <FontAwesome name="heart" size={17} color={likeColor} style={{ position: 'absolute', top: 10, left: 10 }} />
          </TouchableOpacity>
          <ListItem.Content>
            <ListItem.Title>
              <Text style={{ fontSize: 17, fontWeight: 'bold', fontFamily: "Ubuntu_500Medium", color: "#4B5C6B" }}>{title}</Text>
            </ListItem.Title>
            <ListItem.Subtitle>
              <Text style={{ color: '#23A892', fontSize: 14 }}>{`${address.substr(0, 20)}...`}</Text>
            </ListItem.Subtitle>
            <ListItem.Subtitle style={{ marginTop: 10 }}>
              <Badge status="warning" value={category} />
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </TouchableHighlight>

      <Overlay isVisible={visible} onBackdropPress={toggleOverlay} overlayStyle={styles.overlay}>
        <View style={styles.overlayHeader}>

          <Text h2
            style={styles.overlayTitle}
            onPress={() => Linking.openURL('https://www.google.com/search?q=' + title.replace(' ', '+').toLowerCase())}>
            {titleCaracters(title)}&nbsp;
            <FontAwesome name="link" size={14} color="white" />
          </Text>
          
        </View>
        <TouchableOpacity onPress={toggleLike}>
          <Image
            source={{ uri: imgUrl }}
            style={styles.image}
          />
        </TouchableOpacity>
        <FontAwesome name="heart" size={20} color={likeColor} style={{ position: 'absolute', top: 80, left: 35 }} />
        <Text style={styles.overlayDescription}>{description}</Text>
        <View style={styles.overlayDetailsContainer}>
          <Text style={styles.overlayDetails}>
            <FontAwesome name="map-marker" size={20} color="#23A892" />
            &nbsp;&nbsp;{address}
          </Text>
          <Text style={styles.overlayDetails}>
            <FontAwesome name="clock-o" size={20} color="#23A892" />
            &nbsp;&nbsp;{openingHoursStr}
          </Text>
          <Text style={styles.overlayDetails} >
            <FontAwesome name="phone" size={20} color="#23A892" />
            &nbsp;&nbsp;{telephone}
          </Text>
          <Text style={styles.overlayDetails}>
            <FontAwesome name="euro" size={20} color="#23A892" />
            &nbsp;&nbsp;{pricing}
          </Text>
        </View>
        <Button
          title="Take Me There !"
          buttonStyle={{ alignSelf: 'center', padding: 12, borderRadius: 99, backgroundColor: '#FFBD0F' }}
          titleStyle={{ fontSize: 14, fontFamily: 'Lobster_400Regular', color: '#4B5C6B' }}
          onPress={() => Linking.openURL('https://www.google.com/maps/place/' + address.replace(' ', '+').toLowerCase())}></Button>
      </Overlay>
    </>
  )
}

function mapStateToProps(state) {
  return { userToken: state.token }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Activity);

const styles = StyleSheet.create({
  activity: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginHorizontal: 1,
    marginVertical: 10,
    borderRadius: 12,
  },

  overlay: {
    position: 'absolute',
    height: '80%',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    padding: 0
  },
  overlayHeader: {
    height: 44,
    width: '100%',
    backgroundColor: '#23A892',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 10,
  },
  overlayTitle: {
    fontFamily: "Ubuntu_500Medium",
    color: '#FFF',
    fontSize: 20
  },
  image: {
    height: 220,
    margin: 25,
    borderRadius: 12,
  },
  overlayDescription: {
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 16,
    color: "#4B5C6B",
    padding: 10,
    textAlign: 'center'
  },
  overlayDetailsContainer: {
    margin: 10,
    display: 'flex',
    alignItems: 'center'
  },
  overlayDetails: {
    padding: 10,
    color: "#4B5C6B"
  }

});