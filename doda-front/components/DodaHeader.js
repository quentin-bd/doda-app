
import React from 'react'
import { View, ImageBackground, Text } from 'react-native'
import headerPNG from '../assets/header.png'

const DodaHeader = () =>
  <View style={{ flex: 1 }} pointerEvents='none' >
    <ImageBackground
      source={headerPNG}
      resizeMode='cover'
      pointerEvents='none'
      style={{
        height: 120,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }} >
      <Text style={{
        marginTop: -30,
        fontSize: 40,
        color: 'white',
        fontFamily: 'Lobster_400Regular'
      }}>
        Doda
      </Text>
    </ImageBackground>
  </View>


export default DodaHeader