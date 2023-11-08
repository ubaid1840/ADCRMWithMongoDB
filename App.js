import { NavigationContainer, useIsFocused, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { Image, SafeAreaView, TouchableOpacity, View, BackHandler, Alert, StyleSheet, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import Constants from "expo-constants";
import { RootSiblingParent } from 'react-native-root-siblings';
import { useContext, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker';
import * as SplashScreen from 'expo-splash-screen'
import { LogBox } from 'react-native';
import { Platform } from 'react-native';

import DashboardScreen from './src/screens/dashboard'
import AssignTaskScreen from './src/screens/assignTask'
import MapViewScreen from './src/screens/mapView';
import LoginScreen from './src/screens/login';
import SignupScreen from './src/screens/signUp';
import ForgetPasswordScreen from './src/screens/forgetPassword';
import ProfileScreen from './src/screens/profile';
import BeforeLoginScreen from './src/screens/beforeLogin';
import PropleScreen from './src/screens/people'
import { PaperProvider } from 'react-native-paper';

import AddPeopleScreen from './src/screens/addPeople'

import { ApplicationProvider, Text, Layout, } from '@ui-kitten/components';
import * as eva from '@eva-design/eva'
import { default as theme } from './custom-theme.json'
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import TaskDetailScreen from './src/screens/taskDetail';

import AttendanceScreen from './src/screens/attendance';
import AttendanceRecordScreen from './src/screens/attendanceRecord';
import CheckLogin from './src/screens/checklogin';
import AuthContextProvider, { AuthContext } from './src/store/context/AuthContext';
import PeopleContextProvider from './src/store/context/PeopleContext';
import TaskContextProvider from './src/store/context/TaskContext'
import { getAuth, signOut } from 'firebase/auth';
import app from './src/config/firebase';

import DashboardEmployeeScreen from './src/employee/dashboardEmployee'
import DashboardManagerScreen from './src/manager/dashboardManager'
import AttendanceEmployeeScreen from './src/employee/attendanceEmployee';
import TaskListHistoryEmployeeScreen from './src/employee/taskListHistory';
import TaskDetailEmployeeScreen from './src/employee/taskDetail';
import SingleAttendanceRecordScreen from './src/screens/singleAttendanceDetail';
import AssignTaskManagerScreen from './src/manager/assignTaskManager';
import TaskDetailManagerScreen from './src/manager/taskDetailManager';
import TaskListEmployeeScreen from './src/employee/taskList'
import LocationContextProvider, { LocationContext } from './src/store/context/LocationContext';


const AppStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator()


const customFonts = {
  'inter-regular': require('./assets/fonts/Inter/static/Inter-Regular.ttf'),
  'inter-semibold': require('./assets/fonts/Inter/static/Inter-SemiBold.ttf'),
  'inter-medium': require('./assets/fonts/Inter/static/Inter-Medium.ttf'),
  'inter-bold': require('./assets/fonts/Inter/static/Inter-Bold.ttf'),
}

const AfterLoginEmployee = (props1) => {

  const { state: authState } = useContext(AuthContext)
  const {state : locationState, setLocation} = useContext(LocationContext)

  useEffect(() => {
    props1.navigation.addListener('beforeRemove', (e) => {
      if(e.data.action.type == "GO_BACK"){
        e.preventDefault();
      }
      else{
        props1.navigation.dispatch(e.data.action)
      }
    });
  }, [props1.navigation]);

  useEffect(()=>{
    fetchLocation()
  },[])

  const fetchLocation =  async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Error','Permission to access location was denied');
        return;
    }

    await Location.watchPositionAsync({ distanceInterval: 100, accuracy : 6 }, response => {
        setLocation(response)
    })
  }


  return (
    <Drawer.Navigator
      drawerContent={(props) => {
        return (
          <Layout style={{ flex: 1, paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0 }}>
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Image style={{ height: 50, width: 200 }} source={require('./assets/senfeng/senfengLogo.png')} resizeMode='contain'></Image>
              <TouchableOpacity onPress={()=>{
                    Alert.alert('Error', 'Contact your manager to unlock all features')                    
                  }}>
                    <Text style={{color:'yellow'}}>Unlock features</Text>
                  </TouchableOpacity>
            </View>
            
            <View style={{ marginBottom: 20, marginHorizontal: 20, padding: 15, borderRadius: 15, backgroundColor: '#1a4663', }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={require('./assets/profile_icon.png')} tintColor={'#FFFFFF'}></Image>
                <View style={{ marginLeft: 15, flex: 1 }}>
                  {authState.value.data.length != 0
                    ?
                    <Text style={{ fontFamily: 'inter-bold', fontSize: 15, }}>{authState.value.data.name}</Text>
                    :
                    null}

                  {/* <TouchableOpacity onPress={() => {
                    props.navigation.closeDrawer();
                    // props1.navigation.navigate('profile')
                  }}>
                    <Text style={{ fontFamily: 'inter-regular', color: '#23d3d3' }}>Profile</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
            <DrawerItemList {...props} />

            <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', marginBottom: 40, marginLeft: 20 }}>

                

              <TouchableOpacity onPress={() => {
                Alert.alert('Confirm', 'Do you want to logout?', [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      const auth = getAuth(app)
                      signOut(auth).then(() => {
                        // Sign-out successful.
                        props.navigation.navigate('login')
                      }).catch((error) => {
                        console.log('error')
                      });
                    }
                  }
                ])
              }}>
                <Image style={{ width: 40, height: 40, transform: [{ rotate: '180deg' }] }} source={require('./assets/logout_icon.png')} tintColor='white'></Image>
              </TouchableOpacity>

            </View>

            <StatusBar style='light' />
          </Layout>
        )
      }}
      screenOptions={{
        drawerStyle: {

          // paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0,
          width: '70%'
        },
        headerStyle: {
          backgroundColor: '#232f3f'
        },
        headerTintColor: '#FFFFFF',
        drawerActiveTintColor: '#000000',
      }} >
      <Drawer.Screen name="dashboardemployee" component={DashboardEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/dashboard.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Dashboard</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Dashboard</Text>
            )
          }
        }} />

      <Drawer.Screen name="attendanceemployee" component={AttendanceEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/attendance.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Attendance History</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Attendance History</Text>
            )
          }
        }} />

      <Drawer.Screen name="tasklistemployee" component={TaskListEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/attendance.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Today Task</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Today Task</Text>
            )
          }
        }} />

      <Drawer.Screen name="tasklisthistoryemployee" component={TaskListHistoryEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/attendance.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Task History</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Task History</Text>
            )
          }
        }} />

    </Drawer.Navigator>
  )
}

const AfterLoginManager = (props1) => {

  const { state: authState } = useContext(AuthContext)

  useEffect(() => {
    props1.navigation.addListener('beforeRemove', (e) => {
      if(e.data.action.type == "GO_BACK"){
        e.preventDefault();
      }
      else{
        props1.navigation.dispatch(e.data.action)
      }
    });
  }, [props1.navigation]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => {
        return (
          <Layout style={{ flex: 1, paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0 }}>
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Image style={{ height: 50, width: 200 }} source={require('./assets/senfeng/senfengLogo.png')} resizeMode='contain'></Image>
              <TouchableOpacity onPress={()=>{
                    Alert.alert('Error', 'Contact your manager to unlock all features')                    
                  }}>
                    <Text style={{color:'yellow'}}>Unlock features</Text>
                  </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 20, marginHorizontal: 20, padding: 15, borderRadius: 15, backgroundColor: '#1a4663', }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={require('./assets/profile_icon.png')} tintColor={'#FFFFFF'}></Image>
                <View style={{ marginLeft: 15, flex: 1 }}>
                  {authState.value.data.length != 0
                    ?
                    <Text style={{ fontFamily: 'inter-bold', fontSize: 15, }}>{authState.value.data.name}</Text>
                    :
                    null}

                  {/* <TouchableOpacity onPress={() => {
                    props.navigation.closeDrawer();
                    // props1.navigation.navigate('profile')
                  }}>
                    <Text style={{ fontFamily: 'inter-regular', color: '#23d3d3' }}>Profile</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
            <DrawerItemList {...props} />

            <StatusBar style='light' />

            <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', marginBottom: 40, marginLeft: 20 }}>
              <TouchableOpacity onPress={() => {
                Alert.alert('Confirm', 'Do you want to logout?', [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      const auth = getAuth(app)
                      signOut(auth).then(() => {
                        // Sign-out successful.
                        props.navigation.navigate('login')
                      }).catch((error) => {
                        console.log('error')
                      });
                    }
                  }
                ])
              }}>
                <Image style={{ width: 40, height: 40, transform: [{ rotate: '180deg' }] }} source={require('./assets/logout_icon.png')} tintColor='white'></Image>
              </TouchableOpacity>

            </View>
          </Layout>
        )
      }}
      screenOptions={{
        drawerStyle: {

          // paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0,
          width: '70%'
        },
        headerStyle: {
          backgroundColor: '#232f3f'
        },
        headerTintColor: '#FFFFFF',
        drawerActiveTintColor: '#000000',
      }} >
      <Drawer.Screen name="dashboardManager" component={DashboardManagerScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/dashboard.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Dashboard</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Dashboard</Text>
            )
          }
        }} />

      <Drawer.Screen name="assigntaskManager" component={AssignTaskManagerScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/task.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (

              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Assign Task</Text>

            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Assign Task</Text>
            )
          }

        }} />


    </Drawer.Navigator>
  )
}

const AfterLogin = (props1) => {

  const { state: authState } = useContext(AuthContext)

  useEffect(() => {
    props1.navigation.addListener('beforeRemove', (e) => {
      if(e.data.action.type == "GO_BACK"){
        e.preventDefault();
      }
      else{
        props1.navigation.dispatch(e.data.action)
      }
     
    });
  }, [props1.navigation]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => {
        return (
          <Layout style={{ flex: 1, paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0 }}>
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Image style={{ height: 50, width: 200 }} source={require('./assets/senfeng/senfengLogo.png')} resizeMode='contain'></Image>
              <TouchableOpacity onPress={()=>{
                    Alert.alert('Error', 'Contact your manager to unlock all features')                    
                  }}>
                    <Text style={{color:'yellow'}}>Unlock features</Text>
                  </TouchableOpacity>
            </View>
           
            <View style={{ marginBottom: 20, marginHorizontal: 20, padding: 15, borderRadius: 15, backgroundColor: '#1a4663', }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={require('./assets/profile_icon.png')} tintColor={'#FFFFFF'}></Image>
                <View style={{ marginLeft: 15, flex: 1 }}>
                  {authState.value.data.length != 0
                    ?
                    <Text style={{ fontFamily: 'inter-bold', fontSize: 15, }}>{authState.value.data.name}</Text>
                    :
                    null}

                  {/* <TouchableOpacity onPress={() => {
                    props.navigation.closeDrawer();
                    // props1.navigation.navigate('profile')
                  }}>
                    <Text style={{ fontFamily: 'inter-regular', color: '#23d3d3' }}>Profile</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
            <DrawerItemList {...props} />

            <StatusBar style='light' />

            <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', marginBottom: 40, marginLeft: 20 }}>
              <TouchableOpacity onPress={() => {
                Alert.alert('Confirm', 'Do you want to logout?', [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      const auth = getAuth(app)
                      signOut(auth).then(() => {
                        // Sign-out successful.
                        props.navigation.navigate('login')
                      }).catch((error) => {
                        console.log('error')
                      });
                    }
                  }
                ])
              }}>
                <Image style={{ width: 40, height: 40, transform: [{ rotate: '180deg' }] }} source={require('./assets/logout_icon.png')} tintColor='white'></Image>
              </TouchableOpacity>

            </View>
          </Layout>
        )
      }}
      screenOptions={{
        drawerStyle: {

          // paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0,
          width: '70%'
        },
        headerStyle: {
          backgroundColor: '#232f3f'
        },
        headerTintColor: '#FFFFFF',
        drawerActiveTintColor: '#000000',
      }} >
      <Drawer.Screen name="dashboard" component={DashboardScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/dashboard.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Dashboard</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Dashboard</Text>
            )
          }
        }} />

      <Drawer.Screen name="attendance" component={AttendanceScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/attendance.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Attendance</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Attendance</Text>
            )
          }
        }} />

      <Drawer.Screen name="assigntask" component={AssignTaskScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/task.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (

              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Assign Task</Text>

            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Assign Task</Text>
            )
          }

        }} />

      <Drawer.Screen name="mapview" component={MapViewScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/maps.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Map View</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Map View</Text>
            )
          }
        }} />

      <Drawer.Screen name="people" component={PropleScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/people.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>People</Text>
            )
          },
          headerTitle: () => {
            return (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>People</Text>

                {/* <TouchableOpacity onPress={() => props1.navigation.navigate('addpeople')}>
                  <Image style={{ height: 20, width: 20 }} source={require('./assets/add_plus_btn_icon.png')} tintColor='#23d3d3'></Image>
                </TouchableOpacity> */}
              </View>

            )
          }
        }} />

    </Drawer.Navigator>
  )
}

export default function App() {


  const [permission, setPermission] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {

    LogBox.ignoreLogs(['`new NativeEventEmitter()`', 'ExpoFirebaseCore'])
    // async function prepare() {
    //   await SplashScreen.preventAutoHideAsync()
    // }
    // prepare()

  }, [])

  useEffect(() => {

    async function requestLocationPermission() {
      await Font.loadAsync(customFonts);
      // let locationPermission = await Location.requestForegroundPermissionsAsync();

      // if (locationPermission.status == 'granted') {
      //   setPermission(true)
      // }
      // else {
      //   Alert.alert('Error', 'Go to settings and allow location permissions', [
      //     {
      //       text: 'Close',
      //       onPress: () => BackHandler.exitApp()
      //     }
      //   ])
      // }

    }
    requestLocationPermission()

  }, [])


  // if(!permission){
  //   return undefined
  // }
  // else {
  //   SplashScreen.hideAsync()
  // }

  return(
    <>
    <RootSiblingParent>
      <ApplicationProvider {...eva} theme={{ ...eva.dark, ...theme }}>
        <LocationContextProvider>
          <PeopleContextProvider>
            <AuthContextProvider>
              <TaskContextProvider>
                <NavigationContainer >
                  <AppStack.Navigator initialRouteName='checklogin' screenOptions={{ headerShown: false, gestureEnabled: false }}>
                    <AppStack.Screen name='afterlogin' component={AfterLogin} />
                    <AppStack.Screen name='afterloginemployee' component={AfterLoginEmployee} />
                    <AppStack.Screen name='afterloginmanager' component={AfterLoginManager} />
                    <AppStack.Screen name='login' component={LoginScreen} />
                    <AppStack.Screen name='signup' component={SignupScreen} />
                    <AppStack.Screen name='forgetpassword' component={ForgetPasswordScreen} />
                    <AppStack.Screen name='dashboard' component={DashboardScreen} />
                    <AppStack.Screen name='dashboardmanager' component={DashboardManagerScreen} />
                    <AppStack.Screen name='dashboardemployee' component={DashboardEmployeeScreen} />
                    <AppStack.Screen name='profile' component={ProfileScreen} />
                    <AppStack.Screen name='checklogin' component={CheckLogin} />
                    <AppStack.Screen name='addpeople' component={AddPeopleScreen} />
                    <AppStack.Screen name='taskdetail' component={TaskDetailScreen} />
                    <AppStack.Screen name='attendancerecord' component={AttendanceRecordScreen} />
                    <AppStack.Screen name='taskdetailemployee' component={TaskDetailEmployeeScreen} />
                    <AppStack.Screen name='singleattendancerecord' component={SingleAttendanceRecordScreen} />
                    <AppStack.Screen name='taskdetailmanager' component={TaskDetailManagerScreen} />
                  </AppStack.Navigator>
                </NavigationContainer>
              </TaskContextProvider>
            </AuthContextProvider>
          </PeopleContextProvider>
        </LocationContextProvider>
      </ApplicationProvider>
    </RootSiblingParent>
    <StatusBar style='light' />
  </>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
