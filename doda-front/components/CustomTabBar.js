import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: "#23A892",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
      }}>
      {state.routes.map((route, index) => {
        const { options, color } = descriptors[route.key];

        let iconName;
        if (route.name === 'MyDodas') {
          iconName = "home-sharp"
        } else if (route.name === 'GenerateTrip') {
          iconName = "earth-sharp"
        } else if (route.name === 'Profile') {
          iconName = "person"
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityStates={isFocused ? ['selected'] : []}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={{ flex: 1, alignItems: "center" }}
          >
            <Ionicons name={iconName} size={25} color={isFocused ? '#FFBD0F' : '#FFFFFF'} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default CustomTabBar