import React from 'react'
import { Input } from 'react-native-elements'
import { StyleSheet, View } from 'react-native'

const FormInput = ({
  label,
  iconName,
  iconColor,
  returnKeyType,
  keyboardType,
  name,
  placeholder,
  value,
  style,
  containerStyle,
  ...rest
}) => (
  <Input
    {...rest}
    autoCapitalize='none'
    label={label}
    labelStyle={styles.labelStyle}
    style={{ color: "#6D7580", ...style }}
    inputContainerStyle={styles.inputContainerStyle}
    leftIconContainerStyle={styles.iconStyle}
    placeholderTextColor="grey"
    errorStyle={{ marginTop: -10, marginLeft: 30 }}
    name={name}
    value={value}
    placeholder={placeholder}
    containerStyle={{ ...containerStyle }}
  />
)

const styles = StyleSheet.create({

  labelStyle: {
    color: '#4B5C6B',
    fontSize: 18,
    fontWeight: 'bold'
  },
  inputContainerStyle: {
    borderWidth: 1,
    borderStyle: 'solid',
    marginVertical: 10,
    borderRadius: 8,
  },
  iconStyle: {
    marginHorizontal: 10
  }
})

export default FormInput