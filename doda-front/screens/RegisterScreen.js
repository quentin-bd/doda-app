import { connect } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Platform, ScrollView } from 'react-native';
import { SocialIcon, Divider, Button } from 'react-native-elements';
import headerRegister from '../assets/headerRegister_notext.png'
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, FACEBOOK_APP_ID } from '../utils/SuperSecretKeys';
import * as Facebook from 'expo-facebook';
import * as Google from 'expo-google-app-auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import ip from "../ip";
import FormButton from '../components/FormButton';

function RegisterScreen(props) {

  const [errorMessage, setErrorMessage] = useState(null);

  async function signUpWithGoogleAsync() {
    setErrorMessage(null);
    try {
      const result = await Google.logInAsync({
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        scopes: ['profile'],
      });

      if (result.type === 'success') {
        const clientId = Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : GOOGLE_ANDROID_CLIENT_ID;
        await fetch(`${ip}/google-sign-in/${result.idToken}/${clientId}`)
          .then(rawResponse => rawResponse.json())
          .then(({ status, next, token, userInfo }) => {
            if (status === "success") {
              if (next === 'signin') {
                props.sendToken(token)
                props.navigation.navigate('DodaTab')
              }
              else {
                props.saveUserInfoFromSocial(userInfo)
                props.navigation.navigate('SignUp')
              }
            }
          });

      } else {
        setErrorMessage(`Google Login Cancelled`)
      }
    } catch (message) {
      setErrorMessage(`Google Login Error: ${message}`)
    }
  }
  async function signUpWithFacebookAsync() {
    setErrorMessage(null);
    try {
      await Facebook.initializeAsync({
        appId: FACEBOOK_APP_ID,
      });
      const {
        type,
        token
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'user_birthday', 'email']
      });
      if (type === 'success') {
        await fetch(`${ip}/facebook-sign-in/${token}`)
          .then(rawResponse => rawResponse.json())
          .then(({ status, next, token, userInfo, err }) => {
            if (status === "success") {
              if (next === 'signin') {
                props.sendToken(token)
                props.navigation.navigate('DodaTab')
              }
              else {
                props.saveUserInfoFromSocial(userInfo)
                props.navigation.navigate('SignUp')
              }
            } else {
              setErrorMessage(err)
            }
          });
      } else {
        setErrorMessage(`Facebook Login Cancelled`)
      }
    } catch ({ message }) {
      setErrorMessage(`Facebook Login Error: ${message}`)
    }
  }
  async function signUpWithAppleAsync() {

    setErrorMessage(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      await fetch(`${ip}/apple-sign-in/${JSON.stringify(credential)}`)
        .then(rawResponse => rawResponse.json())
        .then(({ status, next, token, userInfo, err }) => {
          if (status === "success") {
            if (next === 'signin') {
              props.sendToken(token)
              props.navigation.navigate('DodaTab')
            }
            else {
              props.saveUserInfoFromSocial(userInfo)
              props.navigation.navigate('SignUp')
            }
          } else {
            setErrorMessage(err)
          }
        });
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
        setErrorMessage(`Apple Login Cancelled`)
      } else {
        // handle other errors
        setErrorMessage(`Apple Login Error ${e}`)
      }
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ImageBackground source={headerRegister} resizeMode='cover' style={styles.header} height={220}>
        <Text style={{ color: 'white', fontFamily: 'Lobster_400Regular', fontSize: 90 }}>Doda</Text>
      </ImageBackground>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.socialButtons}>

          <SocialIcon
            button
            type='facebook'
            title='Continue With Facebook'
            onPress={signUpWithFacebookAsync}
          />
          <SocialIcon
            button
            type='google'
            title='Continue With Google'
            onPress={signUpWithGoogleAsync}
          />
          {Platform.OS === 'ios' && <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={20}
            style={{
              height: 50,
              width: '95%',
              marginVertical: 10,
              alignSelf: 'center',
            }}
            onPress={signUpWithAppleAsync}
          />}
        </View>
        {errorMessage && <Text style={{ textAlign: 'center' }}>{errorMessage}</Text>}
        <Divider orientation="horizontal" width={3} color={'#23A892'} style={{ width: '60%', marginTop: 0, alignSelf: 'center' }} />

        <View style={styles.buttons}>
          <FormButton title="Sign In" onPress={() => {
            setErrorMessage(null);
            props.navigation.navigate('SignIn')
          }} />
          <FormButton title="Sign Up" onPress={() => {
            setErrorMessage(null);
            props.navigation.navigate('SignUp')
          }} />
        </View>

        <Button
          title="Skip"
          type="clear"
          titleStyle={styles.skipButton}
          onPress={() => props.navigation.navigate('DodaTab')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  header: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center'
  },
  socialButtons: {
    width: '80%',
    marginVertical: 50,
    alignSelf: 'center',
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  skipButton: {
    fontFamily: 'Lobster_400Regular',
    fontSize: 20,
    textDecorationLine: 'underline',
    alignSelf: 'center',
    color: '#23A892'
  },
});

function mapDispatchToProps(dispatch) {
  return {
    saveUserInfoFromSocial: function (userInfo) {
      dispatch({ type: 'saveUserInfoFromSocial', userInfo })
    },
    sendToken: function (token) {
      dispatch({ type: 'saveToken', userToken: token })
    }
  }
}


export default connect(
  null,
  mapDispatchToProps,
)(RegisterScreen);
