import React from 'react'
import { StyleSheet, TouchableHighlight, Text } from 'react-native';
import MapView from 'react-native-maps';
import {ListItem, Badge} from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';

import getFormattedCategory from '../utils/getFormattedCategory';

const formatDate = (tripDate) => {
  let date = new Date(tripDate);
  return `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1 )}/${date.getFullYear()}`
}

const TripCard = (props) => {

  const handleEditPress = () => {

  }

  let badges = props.activities.map((activity, i) => <Badge key={i} status="warning" value={getFormattedCategory(activity.category)}/>)

  let icons = <ListItem.Content style={{ flex: 0, flexDirection: 'column' }}>
    <FontAwesome name="share-alt" size={24} color="black" style={{ flex: 1 }} />
    <FontAwesome 
      name="edit" 
      size={24} 
      color="black" 
      onPress={() => props.edit(props.tripIndex)}
    />
  </ListItem.Content>;

  if(props.past) {
    icons = <ListItem.Content style={{ flex: 0, flexDirection: 'column', justifyContent: 'space-evenly' }}>
      <FontAwesome name="share-alt" size={24} color="black" style={{ flex: 1 }} />
      <FontAwesome name="thumbs-o-up" size={24} color="black" style={{ flex: 1 }}/>
      <FontAwesome name="thumbs-o-down" size={24} color="black" style={{ flex: 1 }}/>
    </ListItem.Content>;
  }

  return (
    <ListItem
      activeOpacity={1}
      underlayColor="transparent"
      containerStyle={styles.listItem}
      pad={10}
    >
      <MapView 
        style={styles.map}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        region={{
          latitude: props.latitude,  
          longitude: props.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }} />
      <ListItem.Content>
        <ListItem.Title style={{marginBottom: 5}}>
          <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{props.title}</Text>
        </ListItem.Title>
        <ListItem.Subtitle style={{ marginBottom: 5 }}>
          <Text style={{ color: '#23A892', fontSize: 14 }}>{formatDate(props.date)}</Text>
        </ListItem.Subtitle>
        {badges}
      </ListItem.Content>
      {icons}
    </ListItem>
  )
}

const styles = StyleSheet.create({
  listItem: {
    width: '90%',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 12,
    alignItems: 'flex-start'
  },
  map: {
    width: 100, 
    height: 90, 
    borderRadius: 10
  }
});

export default TripCard
