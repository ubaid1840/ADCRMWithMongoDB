import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef, useContext } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, LayoutAnimation } from 'react-native';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import styles from "../styles/styles";
import app from "../config/firebase";
import { Alert } from "react-native";
import { Layout, Text, Input, Button, } from '@ui-kitten/components'
import { PeopleContext } from "../store/context/PeopleContext";

const LoginScreen = (props) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isButtonActive, setIsButtonActive] = useState(false)

  const {state : peopleState} = useContext(PeopleContext)

  const auth = getAuth(app)

  useEffect(() => {

    if (email.includes('@') && email.includes('.com')) {
      setIsEmailValid(true)
    } else {
      setIsEmailValid(false)
    }

    if (password.length > 7) {
      setIsPasswordValid(true)
    } else {
      setIsPasswordValid(false)
    }

  }, [email, password])

  useEffect(()=>{
    if (isEmailValid == true && isPasswordValid == true) {
      setIsButtonActive(false)
    }
    else {
      setIsButtonActive(true)
    }
  },[isEmailValid, isPasswordValid])

  useEffect(() => {
    props.navigation.addListener('beforeRemove', (e) => {
      if(e.data.action.type == "GO_BACK"){
        e.preventDefault();
      }
      else{
        props.navigation.dispatch(e.data.action)
      }
    });
  }, [props.navigation]);

  const handleLogin = async () => {

    const db = getFirestore(app)

    signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log('2')
            let whereTo = []
            whereTo =[...peopleState.value.data.filter(item => item.email == email)]
            if(whereTo.length != 0){
              console.log('1')
              if(whereTo[0].designation == 'Owner'){
                setEmail("")
                setPassword("")
                setLoading(false)
                console.log('employee owner')
                props.navigation.navigate('afterlogin')
              }
              else if(whereTo[0].designation == 'Manager'){
                setEmail("")
                setPassword("")
                setLoading(false)
                console.log('employee manager')
                props.navigation.navigate('afterloginmanager')
              }
              else {
                setEmail("")
                setPassword("")
                setLoading(false)
                console.log('employee login')
                props.navigation.navigate('afterloginemployee')
              }
            }
          })
          .catch((error) => {
            setLoading(false)
           console.log(error)
            Alert.alert('Failed', error.code.replace('auth/', ""))

            // ..
          });
  }

  const CustomActivityIndicator = () => {
    return (
      <View style={styles.activityIndicatorStyle}>
        <ActivityIndicator color="#57D1D7" size="large" />
      </View>
    );
  };


  return (
    <>

      <Layout style={[styles.container]}>

        <View style={styles.oval1}></View>
        <View style={styles.oval2}></View>
        <View style={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
          <Text style={[styles.title]}>Enter credentials to login</Text>

          <View style={styles.inputContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>


              <Input
                style={[{ width: '100%', }]}
                size="large"
                placeholderTextColor="#868383DC"
                label="Enter Email"
                value={email}
                onChangeText={setEmail}
              />
              {!isEmailValid ? <Text status='danger' style={{ fontFamily: 'inter-regular', fontSize: 10, marginTop: 5, width: '100%' }}>Enter valid email</Text> : null}

              <Input
                style={[{ width: '100%', marginTop: 20 }]}
                size="large"
                placeholderTextColor="#868383DC"
                label="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry

              />
              {!isPasswordValid ? <Text status='danger' style={{ fontFamily: 'inter-regular', fontSize: 10, marginTop: 5, width: '100%' }}>Password length should be more than 8 characters</Text> : null}
            </View>
          </View>

          <View style={{ width: '100%', marginTop: 20 }}>
            <Button
              disabled={isButtonActive}
              onPress={() => {
              
                  setLoading(true)
                  handleLogin()
                
              }}>Login</Button>

            <TouchableOpacity onPress={()=> props.navigation.navigate('forgetpassword')}>
              <Text status='primary' style={{ alignSelf: 'flex-end', fontFamily: 'inter-bold', fontSize: 14, marginTop: 5 }}>Forget Password</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'inter-medium', fontSize: 14 }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => props.navigation.navigate('signup')}>
              <Text style={{ fontFamily: 'inter-bold' }} status="primary"> Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Layout >

      {loading ? CustomActivityIndicator() : null}

      <StatusBar style='light' />
    </>
  );
}

export default LoginScreen