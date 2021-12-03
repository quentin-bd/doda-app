import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Image } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-swiper'
import { Entypo } from '@expo/vector-icons';
import FormButton from '../components/FormButton';


const screenWidth = Dimensions.get('screen').width;
const dodaColor = '#FFBD0F'
const dodaBackgroundColor = '#23A892'
const GuideScreen = (props) => {

  const [showTutorial, setShowTutorial] = useState(true)
  useEffect(() => {
    (async () => {
      const tutorialShown = await AsyncStorage.getItem('tutorial_already_shown')
      if (JSON.parse(tutorialShown)) {
        setShowTutorial(false)
        props.navigation.navigate('Register')
      }
    })();
  }, [])

  const handleExitTuto = () => {
    AsyncStorage.setItem("tutorial_already_shown", JSON.stringify(true))
    props.navigation.navigate('Register')
  }
  return (
    <View style={styles.container}>
      <Swiper style={styles.wrapper} showsButtons activeDotColor={dodaColor} loop={false} index={0}
        prevButton={<Entypo name="chevron-left" size={24} color={dodaColor} />}
        nextButton={<Entypo name="chevron-right" size={24} color={dodaColor} />}>
        <View style={styles.slide}>
          <Image source={require('../assets/tuto0.png')} resizeMode='contain' style={{ width: screenWidth * 0.8, aspectRatio: 0.7 }} />
          <FormButton title='Skip' onPress={handleExitTuto} />
        </View>
        <View style={styles.slide}>
          <Image source={require('../assets/tuto1.png')} resizeMode='contain' style={{ width: screenWidth * 0.8, aspectRatio: 0.7 }} />
          <FormButton title='Skip' onPress={handleExitTuto} />
        </View>
        <View style={styles.slide}>
          <Image source={require('../assets/tuto2.png')} resizeMode='contain' style={{ width: screenWidth * 0.8, aspectRatio: 0.7 }} />
          <FormButton title="Go to DODA" onPress={handleExitTuto} />
        </View>
      </Swiper>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: dodaBackgroundColor
  },
})
export default GuideScreen;