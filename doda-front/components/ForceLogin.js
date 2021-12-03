import React, {useState} from 'react'
import { View, StyleSheet } from 'react-native'
import { Overlay, Button, Text } from 'react-native-elements';

const ForceLogin = (props) => {

  const [shown, setShown] = useState(props.display);

  if(props.display) {
    return (
      <Overlay overlayStyle={styles.overlay} isVisible={props.display} >

        <Text h4 style={{ textAlign: 'center'}}>Vous devez être connecté pour continuer !</Text>

        <View>
          <Button 
            title='Sign In / Sign up' 
            onPress={() => props.nav.navigate('Register')}
            buttonStyle={styles.signInButton}
            titleStyle={{
              marginHorizontal: 5,
              fontFamily: 'Lobster_400Regular',
            }}
          />
        </View>
      </Overlay>
    )
  } 
  else {
    return (null);
  }
}

const styles = StyleSheet.create({
  signInButton: {
    backgroundColor: '#FFBD0F',
    borderRadius: 18,
    width: 100,
    marginBottom: 10
  },
  overlay: {
    height: '40%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
  }
});

export default ForceLogin
