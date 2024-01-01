import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { Image, TouchableOpacity, View, BackHandler, Alert, StyleSheet, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import Constants from "expo-constants";
import { RootSiblingParent } from 'react-native-root-siblings';
import { createRef, useContext, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location'
import * as SplashScreen from 'expo-splash-screen'
import { LogBox } from 'react-native';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

import DashboardScreen from './src/screens/dashboard'
import AssignTaskScreen from './src/screens/assignTask'
import MapViewScreen from './src/screens/mapView';
import LoginScreen from './src/screens/login';
import SignupScreen from './src/screens/signUp';
import ForgetPasswordScreen from './src/screens/forgetPassword';
import ProfileScreen from './src/screens/profile';
import PropleScreen from './src/screens/people'

import { ApplicationProvider, Text, Layout, DrawerGroup, DrawerItem, Drawer, IndexPath, Menu, MenuGroup, MenuItem } from '@ui-kitten/components';
import * as eva from '@eva-design/eva'
import { default as theme } from './custom-theme.json'
import TaskDetailScreen from './src/screens/taskDetail';

import AttendanceScreen from './src/screens/attendance';
import AttendanceRecordScreen from './src/screens/attendanceRecord';
import CheckLogin from './src/screens/checklogin';
import AuthContextProvider, { AuthContext } from './src/store/context/AuthContext';
import PeopleContextProvider from './src/store/context/PeopleContext';
import TaskContextProvider from './src/store/context/TaskContext'
import { getAuth, signOut } from 'firebase/auth';
import { Messaging } from 'firebase/messaging'
import app from './src/config/firebase';

import DashboardEmployeeScreen from './src/employee/dashboardEmployee'
import DashboardManagerScreen from './src/manager/dashboardManager'
import AttendanceEmployeeScreen from './src/employee/attendanceEmployee';
import TaskListHistoryEmployeeScreen from './src/employee/taskListHistory';
import TaskDetailEmployeeScreen from './src/employee/taskDetail';
import SingleAttendanceRecordScreen from './src/screens/singleAttendanceDetail';
import AssignTaskManagerScreen from './src/manager/assignTaskManager';
import TaskListEmployeeScreen from './src/employee/taskList'
import LocationContextProvider, { LocationContext } from './src/store/context/LocationContext';
import AttendanceScreenManager from './src/manager/attendanceManager';
import MyTaskManagerScreen from './src/manager/myTaskManager';

import * as Notifications from 'expo-notifications';
import TokenContextProvider, { TokenContext } from './src/store/context/TokenContext';
import { Linking } from 'react-native';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import TaskListHistoryManagerScreen from './src/manager/taskListHistoryManager';
import BranchExpensesScreen from './src/manager/branchExpenses';
import { PaperProvider } from "react-native-paper";
import ReimbursementEmployeeScreen from './src/employee/reimbursement';




const AppStack = createNativeStackNavigator();
const MyDrawer = createDrawerNavigator()


const customFonts = {
  'inter-regular': require('./assets/fonts/Inter/static/Inter-Regular.ttf'),
  'inter-semibold': require('./assets/fonts/Inter/static/Inter-SemiBold.ttf'),
  'inter-medium': require('./assets/fonts/Inter/static/Inter-Medium.ttf'),
  'inter-bold': require('./assets/fonts/Inter/static/Inter-Bold.ttf'),
}

const AfterLoginEmployee = (props1) => {

  const { state: authState } = useContext(AuthContext)

  useEffect(() => {
    props1.navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type == "GO_BACK") {
        e.preventDefault();
      }
      else {
        props1.navigation.dispatch(e.data.action)
      }
    });
  }, [props1.navigation]);

  useEffect(() => {
    fetchLocation()
  }, [])

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access location was denied');
      return;
    }
  }


  return (
    <MyDrawer.Navigator
      drawerContent={(props) => {
        return (
          <Layout style={{ flex: 1, paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0 }}>
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Image style={{ height: 50, width: 200 }} source={require('./assets/senfeng/senfengLogo.png')} resizeMode='contain'></Image>
            </View>

            <View style={{ marginBottom: 20, marginHorizontal: 20, padding: 15, borderRadius: 15, backgroundColor: '#1a4663', }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('./assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : '#FFFFFF'}></Image>
                <View style={{ marginLeft: 15, flex: 1 }}>
                  {authState.value.data.length != 0
                    ?
                    <Text style={{ fontFamily: 'inter-bold', fontSize: 15, }}>{authState.value.data.name}</Text>
                    :
                    null}
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
                        props.navigation.navigate('login')
                      }).catch((error) => {
                        //console.log('error')
                      });
                    }
                  }
                ])
              }}>
                <Image style={{ width: 30, height: 30, transform: [{ rotate: '180deg' }] }} source={require('./assets/logout1_icon.png')} tintColor='white'></Image>
              </TouchableOpacity>

            </View>

            <StatusBar style='light' />
          </Layout>
        )
      }}
      screenOptions={{
        drawerStyle: {

          // paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0,
          width: 300
        },
        headerStyle: {
          backgroundColor: '#232f3f'
        },
        headerTintColor: '#FFFFFF',
        drawerActiveTintColor: '#000000',
      }}
    >


      <MyDrawer.Screen name="dashboardemployee" component={DashboardEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/dashboard_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
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
        }}
      />

      <MyDrawer.Screen name="attendanceemployee" component={AttendanceEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/hr_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
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
        }}
      />

      <MyDrawer.Screen name="tasklisthistoryemployee" component={TaskListHistoryEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/task_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Task</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Task</Text>
            )
          }
        }} />

      <MyDrawer.Screen name="reimbursementemployee" component={ReimbursementEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/finance_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Reimbursement</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Reimbursement</Text>
            )
          }
        }} />

    </MyDrawer.Navigator>
  )
}

const AfterLoginManager = (props1) => {

  const { state: authState } = useContext(AuthContext)

  useEffect(() => {
    props1.navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type == "GO_BACK") {
        e.preventDefault();
      }
      else {
        props1.navigation.dispatch(e.data.action)
      }
    });
  }, [props1.navigation]);

  return (
    <MyDrawer.Navigator
      drawerContent={(props) => {
        return (
          <Layout style={{ flex: 1, paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0 }}>
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Image style={{ height: 50, width: 200 }} source={require('./assets/senfeng/senfengLogo.png')} resizeMode='contain'></Image>
              {/* <TouchableOpacity onPress={() => {
                Alert.alert('Error', 'Contact your manager to unlock all features')
              }}>
                <Text style={{ color: 'yellow' }}>Unlock features</Text>
              </TouchableOpacity> */}
            </View>
            <View style={{ marginBottom: 20, marginHorizontal: 20, padding: 15, borderRadius: 15, backgroundColor: '#1a4663', }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('./assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : '#FFFFFF'}></Image>
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
                        //console.log('error')
                      });
                    }
                  }
                ])
              }}>
                <Image style={{ width: 30, height: 30, transform: [{ rotate: '180deg' }] }} source={require('./assets/logout1_icon.png')} tintColor='white'></Image>
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
      <MyDrawer.Screen name="dashboardManager" component={DashboardManagerScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/dashboard_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
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

      <MyDrawer.Screen name="attendanceManager" component={AttendanceScreenManager}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/hr_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
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

      <MyDrawer.Screen name="assigntaskManager" component={AssignTaskManagerScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/task_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (

              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Team Task</Text>

            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Team Task</Text>
            )
          }

        }} />

      <MyDrawer.Screen name="mytaskManager" component={MyTaskManagerScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/inspection_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (

              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>My Task</Text>

            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>My Task</Text>
            )
          }

        }} />

      <MyDrawer.Screen name="reimbursementemployee" component={ReimbursementEmployeeScreen}
        options={{
          drawerIcon: ({ focused }) => {
            return (
              <Image style={{ height: 20, width: 20, }} source={require('./assets/finance_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
            )
          },
          title: ({ focused }) => {
            return (
              <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Reimbursement</Text>
            )
          },
          headerTitle: () => {
            return (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Reimbursement</Text>
            )
          }
        }} />

      {authState.value.data.branchExpensesAssigned ?
        <MyDrawer.Screen name="branchexpensesscreen" component={BranchExpensesScreen}
          options={{
            drawerIcon: ({ focused }) => {
              return (
                <Image style={{ height: 20, width: 20, }} source={require('./assets/salary_icon.png')} tintColor={focused ? '#23d3d3' : '#FFFFFF'} ></Image>
              )
            },
            title: ({ focused }) => {
              return (

                <Text style={[styles.drawerTxtStyle, { color: focused ? '#23d3d3' : '#FFFFFF' }]}>Office Expenses</Text>

              )
            },
            headerTitle: () => {
              return (
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'inter-medium' }}>Office Expenses</Text>
              )
            }

          }} />
        :
        <></>
      }

    </MyDrawer.Navigator>
  )
}

const AfterLogin = (props1) => {

  const { state: authState } = useContext(AuthContext)

  useEffect(() => {
    props1.navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type == "GO_BACK") {
        e.preventDefault();
      }
      else {
        props1.navigation.dispatch(e.data.action)
      }

    });
  }, [props1.navigation]);

  return (
    <MyDrawer.Navigator
      drawerContent={(props) => {
        return (
          <Layout style={{ flex: 1, paddingTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0 }}>
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Image style={{ height: 50, width: 200 }} source={require('./assets/senfeng/senfengLogo.png')} resizeMode='contain'></Image>
              {/* <TouchableOpacity onPress={() => {
                Alert.alert('Error', 'Contact your manager to unlock all features')
              }}>
                <Text style={{ color: 'yellow' }}>Unlock features</Text>
              </TouchableOpacity> */}
            </View>

            <View style={{ marginBottom: 20, marginHorizontal: 20, padding: 15, borderRadius: 15, backgroundColor: '#1a4663', }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('./assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : '#FFFFFF'}></Image>
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
                        //console.log('error')
                      });
                    }
                  }
                ])
              }}>
                <Image style={{ width: 30, height: 30, transform: [{ rotate: '180deg' }] }} source={require('./assets/logout_icon.png')} tintColor='white'></Image>
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
      <MyDrawer.Screen name="dashboard" component={DashboardScreen}
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

      <MyDrawer.Screen name="attendance" component={AttendanceScreen}
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

      <MyDrawer.Screen name="assigntask" component={AssignTaskScreen}
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

      <MyDrawer.Screen name="mapview" component={MapViewScreen}
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

      <MyDrawer.Screen name="people" component={PropleScreen}
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

    </MyDrawer.Navigator>
  )
}

export default function App() {

  const [permission, setPermission] = useState(false)
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navRef = useRef()
  const db = getFirestore(app)


  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
  }, [])

  useEffect(() => {

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      //console.log(notification)
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {

      const docSnap = await getDoc(doc(db, 'Tasks', response.notification.request.content.data.id))
      if (docSnap.exists()) {
        const item = { ...docSnap.data(), 'id': docSnap.id }
        if (response.notification.request.content.data.designation == 'Engineer' || response.notification.request.content.data.designation == 'Sales') {
          navRef.current.navigate('taskdetailemployee', { data: item })
        }
        else {
          navRef.current.navigate('taskdetail', { data: item })
        }

      }

    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {

    LogBox.ignoreLogs(['`new NativeEventEmitter()`', 'ExpoFirebaseCore'])
    async function prepare() {
      await SplashScreen.preventAutoHideAsync()
    }
    prepare()

  }, [])

  useEffect(() => {

    async function requestLocationPermission() {

      await Font.loadAsync(customFonts);

      const location = await Location.requestForegroundPermissionsAsync()
      if (location.status == 'granted') {
        const backgroundStatus = await Location.getBackgroundPermissionsAsync()
        if (backgroundStatus.status != 'granted') {
          Alert.alert('Location permission', 'Click open and select Allow all the time', [
            {
              text: 'Open',
              onPress: async () => {
                const locationPermission = await Location.requestBackgroundPermissionsAsync()
                if (locationPermission.status == "granted") {
                  setPermission(true)
                }
                else {
                  Alert.alert('Error', 'Go to settings and select Allow all the time', [
                    {
                      text: 'Close',
                      onPress: () => BackHandler.exitApp()
                    }
                  ])
                }
              }
            }
          ])
        }
        else {
          setPermission(true)
        }

      }
      else {
        Alert.alert("Error", "Go to settings and select Allow all the time")
      }
    }
    requestLocationPermission()

  }, [])


  if (!permission) {
    return undefined
  }
  else {
    SplashScreen.hideAsync()
  }

  return (
    <>
      <RootSiblingParent>
        <ApplicationProvider {...eva} theme={{ ...eva.dark, ...theme }}>
          <PaperProvider>
            <TokenContextProvider>
              <LocationContextProvider>
                <PeopleContextProvider>
                  <AuthContextProvider>
                    <TaskContextProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <NavigationContainer
                          ref={navRef}>
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
                            <AppStack.Screen name='taskdetail' component={TaskDetailScreen} />
                            <AppStack.Screen name='attendancerecord' component={AttendanceRecordScreen} />
                            <AppStack.Screen name='taskdetailemployee' component={TaskDetailEmployeeScreen} />
                            <AppStack.Screen name='singleattendancerecord' component={SingleAttendanceRecordScreen} />
                          </AppStack.Navigator>
                        </NavigationContainer>
                      </GestureHandlerRootView>
                    </TaskContextProvider>
                  </AuthContextProvider>
                </PeopleContextProvider>
              </LocationContextProvider>
            </TokenContextProvider>
          </PaperProvider>
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
