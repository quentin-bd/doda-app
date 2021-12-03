import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, ImageBackground, TouchableOpacity } from 'react-native';
import { List, Modal, Checkbox, Avatar, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { connect } from 'react-redux';
import { AntDesign, Entypo, } from '@expo/vector-icons';


import getFormattedDate from '../utils/getFormattedDate';
import ip from "../ip";
import headerPNG from '../assets/header.png';
import FormInput from '../components/FormInput';
import { iconSize, iconColor } from '../utils/Constants';
import FormButton from '../components/FormButton';
import { ScrollView } from 'react-native-gesture-handler';
import titleCaracters from '../utils/titleCaracters';

function ProfileScreen(props) {

  const [userInfo, setUserInfo] = useState({})
  const [visible, setVisible] = useState(false)
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('')
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    async function getUserInfo() {
      var rawResponse = await fetch(`${ip}/get-userInfo?tokenFromFront=${props.tokenToDisplay}`);
      var response = await rawResponse.json();
      if(response.result) {
        setUserInfo(response.userInfo);
      }
      
    }
    getUserInfo()
  }, []);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white', padding: 20 };

  //fonction pour unlike une activité

  const handleUnlike = async (like) => {

    let rawResponse = await fetch(`${ip}/toggle-like?userToken=${props.tokenToDisplay}&activityId=${like}`); 
    let response = await rawResponse.json();

    let newUserInfo = {...userInfo}

    let unlikedActivities = newUserInfo.likes.filter(e => e._id != like)

    newUserInfo.likes = unlikedActivities
  
    if (response.result){
      setUserInfo(newUserInfo)
    }
  }
  
  //fonction pour faire le logout
  const handleLogout = async () => {
    props.deleteToken()
    props.navigation.navigate("Register")
  }
  
  //fonction pour supprimer un utilisateur
  const handleDelete = async () => {
    let rawResponse = await fetch(`${ip}/delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `tokenFromFront=${props.tokenToDisplay}&passwordFromFront=${confirmPassword}`
    });
    var response = await rawResponse.json();
    if (response.result) {
      props.navigation.navigate("Register")
    } else {
      alert('wrong password')
    }
  }

  let checkbox = <Checkbox
    label='architecture'
    status={checked ? 'checked' : 'unchecked'}
    onPress={() => {
      setChecked(!checked);
    }}
  />
  
  let likedActivities = userInfo.likes?.map((e, i) =>  {
    return (
      <List.Item
       key={i}
       title={titleCaracters(e.title)}
       left={props => <Avatar.Image size={24} source={{uri: e.imgUrl}} />} 
       right={props => <IconButton
        icon="thumb-down"
        //color={Colors.red500}
        size={20}
        onPress={() => handleUnlike(e._id)}
      />}
       />
    )
  })

  return (

    
    <SafeAreaView style={styles.container}>

      <LinearGradient
        colors={['#FFFFFF', '#D6D6D6']}
        style={styles.background} />

      <ImageBackground source={headerPNG} resizeMode='cover' style={styles.header}>
        <Text style={{ marginTop: -30, color: 'white', fontFamily: 'Lobster_400Regular', fontSize: 40 }}>Doda</Text>
      </ImageBackground>


      <ScrollView contentContainerStyle={{ alignItems: 'center' }} style={{ width: '100%', marginTop: 100, flex: 1 }}>

      <List.Section width="100%">
        <List.Accordion

          title="Personnal Information"
          left={props => <List.Icon {...props} icon="account" />}>
          <List.Item title={`Username: ${userInfo.username}`} />
          <List.Item title={`Email: ${userInfo.email}`} />
          <List.Item title={`Birthday: ${getFormattedDate(userInfo.birthday)}`} />
          <List.Item title={`Nationality: ${userInfo.nationality}`} />

        </List.Accordion>

        <List.Accordion
          style={{ backgroundColor: "#D6D6D6" }}
          title="My Interests"
          left={props => <List.Icon {...props} icon="star" />}>
          <Checkbox.Item
            status={checked ? 'checked' : 'unchecked'}
            label='architecture'
            onPress={() => {
              setChecked(!checked);
            }}
          /> 
          <List.Item title="Second item" />
        </List.Accordion>

         <ScrollView>   
        <List.Accordion
          title="Liked activities"
          left={props => <List.Icon {...props} icon="thumb-up" />}>
          {likedActivities}   
        </List.Accordion>
        </ScrollView>

        <List.Accordion
          title="Statistics"
          left={props => <List.Icon {...props} icon="chart-bar" />}>
          <List.Item title="First item" />
          <List.Item title="Second item" />
        </List.Accordion>

        <TouchableOpacity
          onPress={() => handleLogout()}>
          <List.Item
            title="Log-out"
            left={props => <List.Icon {...props} icon="logout" />} />
        </TouchableOpacity>

        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <Text>Please confirm your password to delete your account:</Text>
          <FormInput
            label="Password"
            secureTextEntry={isSecureEntry}
            value={confirmPassword}
            placeholder="Enter your password"
            onChangeText={value => setConfirmPassword(value)}
            leftIcon={<AntDesign name="lock" size={iconSize} color={iconColor} />}
            rightIcon={
              <TouchableOpacity
                onPress={() => { setIsSecureEntry((prev) => !prev) }}>
                {isSecureEntry ?
                  <Entypo name="eye" size={24} color="black" /> :
                  <Entypo name="eye-with-line" size={24} color="black" />}
              </TouchableOpacity>
            }
          />
          <FormButton title="Submit" buttonStyle={{ alignSelf: 'center' }} onPress={() => handleDelete()} />
        </Modal>

        <TouchableOpacity
          onPress={() => showModal()}>
          <List.Item
            title="Delete account"
            left={props => <List.Icon {...props} icon="account-remove" />} />
        </TouchableOpacity>
      </List.Section>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    width: "100%",
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
});

function mapDispatchToProps(dispatch) {
  return {
    deleteToken: function () {
      dispatch({ type: 'deleteToken' })
    }
  }
}
function mapStateToProps(state) {
  return { tokenToDisplay: state.token }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfileScreen);