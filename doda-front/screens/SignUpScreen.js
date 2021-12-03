import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, ScrollView, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import { Overlay, Divider } from 'react-native-elements';
import CountryPicker from 'react-native-country-picker-modal'
import CalendarPicker from 'react-native-calendar-picker';
import { connect } from 'react-redux';
import { AntDesign, Entypo, Fontisto, MaterialIcons } from '@expo/vector-icons';

import getFormattedDate from '../utils/getFormattedDate';
import ip from "../ip";
import { iconSize, iconColor } from '../utils/Constants'

import DodaHeader from '../components/DodaHeader';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import isEmail from '../utils/checkEmail';

const screenWidth = Dimensions.get('screen').width;

function SignUpScreen(props) {
    const { userInfo: { name: username = '', email = '', birthday = '', password = '' } = {} } = props
    const [userInfo, setUserInfo] = useState({ username, email, birthday, password })
    const [showCountryPicker, setCountryPicker] = useState(false)
    const [errorsSignup, setErrorsSignup] = useState([]);
    const [isSecureEntry, setIsSecureEntry] = useState(true);

    const handleSubmitSignUp = async () => {
        let rawresponse = await fetch(`${ip}/sign-up`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `usernameFromFront=${userInfo.username}&emailFromFront=${userInfo.email}&passwordFromFront=${userInfo.password}&birthdayFromFront=${userInfo.birthday ?? ''}&nationalityFromFront=${userInfo.country ?? ''}`
        });
        var response = await rawresponse.json()

        if (response.result == true) {
            let token = response.token
            props.sendToken(token);
            props.navigation.navigate('DodaTab')
        } else (
            setErrorsSignup(response.error)
        )
    }

    var tabErrorsSignup = errorsSignup.map((error, i) => {
        return (<Text style={{ textAlign: 'center', color: 'red' }} key={i}>{error}</Text>)
    })

    useEffect(() => {
        if (userInfo.birthday) {
            setTimeout(() => {
                setUserInfo({ ...userInfo, showCalendar: false })
            }, 100)
        }
    }, [userInfo.birthday])
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="auto" />
                <DodaHeader />
                <ScrollView style={styles.form} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                    <FormInput
                        label="Username"
                        value={userInfo.username}
                        placeholder="Enter your username"
                        onChangeText={value => setUserInfo({ ...userInfo, username: value })}
                        onFocus={() => setUserInfo({ ...userInfo, usernameFocus: true })}
                        onBlur={() => setUserInfo({ ...userInfo, usernameFocus: false })}
                        errorMessage={userInfo.usernameFocus && userInfo.username.length === 0 ? "Username is required" : ''}
                        leftIcon={<AntDesign name="user" size={iconSize} color={iconColor} />}
                    />
                    <FormInput
                        label="Email"
                        value={userInfo.email}
                        keyboardType="email-address"
                        placeholder="Enter your email"
                        onChangeText={value => setUserInfo({ ...userInfo, email: value })}
                        onFocus={() => setUserInfo({ ...userInfo, emailFocus: true })}
                        onBlur={() => setUserInfo({ ...userInfo, emailFocus: false })}
                        errorMessage={userInfo.emailFocus && (userInfo.email.length === 0 ? "Email is required" : !isEmail(userInfo.email) ? "Invalid email" : '')}
                        leftIcon={<Fontisto name="email" size={iconSize} color={iconColor} />}
                    />

                    <FormInput
                        label="Password"
                        value={userInfo.password}
                        secureTextEntry={isSecureEntry}
                        placeholder="Enter your password"
                        onChangeText={value => setUserInfo({ ...userInfo, password: value })}
                        onFocus={() => setUserInfo({ ...userInfo, passwordFocus: true })}
                        onBlur={() => setUserInfo({ ...userInfo, passwordFocus: false })}
                        errorMessage={userInfo.passwordFocus && !userInfo.password.length ? "Password is required" : ''}
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
                    <FormInput
                        label="Birthday"
                        onTouchStart={() => {
                            // setShowCalendar(true)
                            setUserInfo({ ...userInfo, showCalendar: true })
                            Keyboard.dismiss();
                        }}
                        showSoftInputOnFocus={false}
                        caretHidden={true}
                        labelStyle={styles.labelText}
                        placeholder="YYYY-MM-DD"
                        value={userInfo.birthday}
                        leftIcon={<MaterialIcons name="date-range" size={iconSize} color={iconColor} />}
                        leftIconContainerStyle={{ marginLeft: 10 }}
                    />
                    <FormInput
                        label="Country"
                        onTouchStart={() => {
                            setCountryPicker(true)
                            Keyboard.dismiss();
                        }}
                        showSoftInputOnFocus={false}
                        caretHidden={true}
                        placeholder="Select your country"
                        value={userInfo.country}
                        leftIcon={<AntDesign name="flag" size={iconSize} color={iconColor} />}
                        leftIconContainerStyle={{ marginLeft: 10 }}
                    />
                    {tabErrorsSignup}

                    <FormButton
                        title='Sign Up'
                        buttonStyle={{
                            marginTop: 30,
                            marginBottom: 10,
                            alignSelf: 'center'
                        }}
                        disabled={!userInfo.username || !userInfo.email || !userInfo.password || !isEmail(userInfo.email)}
                        onPress={() => {
                            setUserInfo({ ...userInfo })
                            handleSubmitSignUp()
                        }}
                    />
                    <Divider subHeader={'or'} subHeaderStyle={{ textAlign: 'center', marginTop: -20, marginBottom: 0 }} orientation="horizontal" width={1} color={'#23A892'} style={{ width: '50%', marginVertical: 20, alignSelf: 'center' }} />

                    <FormButton
                        buttonType='clear'
                        title="Have an account? Sign In"
                        onPress={() => props.navigation.navigate('SignIn')}
                        buttonStyle={{ width: '100%', backgroundColor: 'transparent', marginVertical: 0 }}
                        titleStyle={{ color: '#F57C00' }}
                    />

                </ScrollView>

                <Overlay isVisible={userInfo.showCalendar ?? false}
                    onBackdropPress={() => setUserInfo({ ...userInfo, showCalendar: false })} >
                    <CalendarPicker
                        scrollable={true}
                        maxDate={new Date()}
                        width={screenWidth - 40}
                        selectedDayStyle={{ backgroundColor: '#23A892' }}
                        enableDateChange={true}
                        onDateChange={(date) => setUserInfo({ ...userInfo, birthday: getFormattedDate(date) })}
                    />
                </Overlay>
                {showCountryPicker &&
                    <View style={{ backgroundColor: 'red', marginBottom: -30 }}>
                        <CountryPicker
                            visible
                            withFilter
                            withAlphaFilter
                            onSelect={(value) => setUserInfo({ ...userInfo, country: value.name })}
                        />
                    </View>}

            </View>
        </TouchableWithoutFeedback >
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
    },
    form: {
        marginTop: 100,
        width: '90%',
        alignSelf: 'center'
    },
    labelText: {
        color: '#4B5C6B',
        fontSize: 18,
        fontWeight: 'bold'
    },
});


function mapStateToProps(state) {
    return { userInfo: state.userInfo }
}

function mapDispatchToProps(dispatch) {
    return {
        sendToken: function (token) {
            dispatch({ type: 'saveToken', userToken: token })
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SignUpScreen);

