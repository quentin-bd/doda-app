
import React from 'react';
import { StyleSheet, View, useWindowDimensions, SafeAreaView } from 'react-native'
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Ionicons } from '@expo/vector-icons';

function GeoIcon({ panY, fetchCurrentLocation }) {
  const { height } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            panY.value,
            [-100, 0],
            [-100, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          stylesGeo.container,
          { marginBottom: height * 0.1 },
          animatedStyle,
        ]}
      >
        <View style={stylesGeo.icon}>
          <Ionicons name="navigate-outline" size={24} color="black" onPress={fetchCurrentLocation} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const stylesGeo = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    marginHorizontal: '5%',
    alignItems: 'flex-end',
  },
  icon: {
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

export default GeoIcon