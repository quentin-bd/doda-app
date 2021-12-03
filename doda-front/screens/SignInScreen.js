import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from 'react-native';
import { Divider } from 'react-native-elements';
import { AntDesign, Entypo, Fontisto } from '@expo/vector-icons';

import ip from "../ip";
import { iconSize, iconColor } from '../utils/Constants'
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import DodaHeader from '../components/DodaHeader';
import isEmail from '../utils/checkEmail';

function SignInScreen(props) {

    const [userInfo, setUserInfo] = useState({ email: '', password: '' })
    const [errorsSignin, setErrorsSignin] = useState([]);
    const [isSecureEntry, setIsSecureEntry] = useState(true);


    const handleSubmitSignIn = async () => {
        let rawresponse = await fetch(`${ip}/sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `emailFromFront=${userInfo.email}&passwordFromFront=${userInfo.password}`
        });
        var response = await rawresponse.json()

        //console.log(response)

        if (response.login) {
            let token = response.token
            props.sendToken(token)
            props.navigation.navigate('DodaTab')
        } else (
            setErrorsSignin(response.error)
        )
    }
    //console.log(errorsSignin)
    var tabErrorsSignin = errorsSignin.map((error, i) => {
        return (<Text key={i} style={{ textAlign: 'center', color: 'red' }}>{error}</Text>)
    })


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="auto" />
                <DodaHeader />
                <ScrollView style={styles.form} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>

                    <FormInput
                        label="Email"
                        keyboardType="email-address"
                        value={userInfo.email}
                        placeholder="Enter your email"
                        onChangeText={value => setUserInfo({ ...userInfo, email: value })}
                        onFocus={() => setUserInfo({ ...userInfo, emailFocus: true })}
                        onBlur={() => setUserInfo({ ...userInfo, emailFocus: false })}
                        errorMessage={userInfo.emailFocus && (userInfo.email.length === 0 ? "Email is required" : !isEmail(userInfo.email) ? "Invalid email" : '')}
                        leftIcon={<Fontisto name="email" size={iconSize} color={iconColor} />}
                    />

                    <FormInput
                        label="Password"
                        secureTextEntry={isSecureEntry}
                        value={userInfo.password}
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
                    {tabErrorsSignin}

                    <FormButton
                        title='Sign In'
                        onPress={handleSubmitSignIn}
                        disabled={!userInfo.email || !userInfo.password || !isEmail(userInfo.email)}
                        buttonStyle={styles.signInButton}
                    />

                    <Divider subHeader={'or'} subHeaderStyle={{ textAlign: 'center', marginTop: -20, marginBottom: 20 }} orientation="horizontal" width={1} color={'#23A892'} style={{ width: '50%', marginVertical: 20, alignSelf: 'center' }} />

                    <FormButton
                        buttonType='clear'
                        title="Don't have an account? Sign Up"
                        onPress={() => props.navigation.navigate('SignUp')}
                        buttonStyle={{ width: '100%', backgroundColor: 'transparent', marginVertical: 0 }}
                        titleStyle={{ color: '#F57C00' }}
                    />
                </ScrollView>


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
    signInButton: {
        backgroundColor: '#FFBD0F',
        borderRadius: 18,
        width: 100,
        alignSelf: 'center',
    },
    labelText: {
        color: '#4B5C6B',
        fontSize: 18,
        fontWeight: 'bold'
    },
});

function mapDispatchToProps(dispatch) {
    return {
        sendToken: function (token) {
            dispatch({ type: 'saveToken', userToken: token })
        }
    }
}


export default connect(
    null,
    mapDispatchToProps,
)(SignInScreen);
