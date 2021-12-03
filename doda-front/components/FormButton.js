import React from 'react'
import { Button } from 'react-native-elements'

const FormButton = ({ title, buttonType, buttonColor, buttonStyle, titleStyle, ...rest }) => (
  <Button
    {...rest}
    type={buttonType}
    title={title}
    buttonStyle={{
      borderRadius: 20,
      width: 120,
      height: 50,
      marginVertical: 40,
      backgroundColor: '#FFBD0F',
      ...buttonStyle
    }}
    titleStyle={{
      marginHorizontal: 5,
      fontFamily: 'Lobster_400Regular',
      color: 'white',
      ...titleStyle
    }}
  />
)

export default FormButton