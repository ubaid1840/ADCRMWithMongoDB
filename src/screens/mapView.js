import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native"
import MapView, { Marker } from 'react-native-maps';
import { PeopleContext } from "../store/context/PeopleContext";
import { Timestamp, collection, getDocs, getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";
import app from "../config/firebase";
import * as Location from 'expo-location'
import styles from "../styles/styles";
import { Layout } from '@ui-kitten/components'
import { AuthContext } from "../store/context/AuthContext";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";


const MapViewScreen = (props) => {

    const db = getFirestore(app)
    const { state: peopleState } = useContext(PeopleContext)
    const { state: authState } = useContext(AuthContext)
    const mapRef = useRef()
    const [myLocation, setMyLocation] = useState(null)
    const [mapArray, setMapArray] = useState([])
    
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);

    // useEffect(() => {
    //     const unsubscribe = onSnapshot(query(collection(db, 'Attendance'), orderBy('TimeStamp', 'desc')), (querySnapshot) => {
    //         let list = []
    //         querySnapshot.forEach((docs) => {
    //             list.push(docs.data())
    //         })

    //         const uniqueNamesArray = [];
    //         const encounteredNames = new Set();

    //         for (const item of list) {
    //             if (!encounteredNames.has(item.attendanceBy)) {
    //                 uniqueNamesArray.push(item);
    //                 encounteredNames.add(item.attendanceBy);
    //             }
    //         }

    //         setMapArray(uniqueNamesArray);
    //     })

    //     return () => unsubscribe()
    // }, [])

    useFocusEffect(
        useCallback(() => {
            if (!isFocusedFirstTime) {

                fetchData()
            }

            // Set the flag to false after the first focus
            setIsFocusedFirstTime(false);

            // Cleanup function
            return () => {
                setIsFocusedFirstTime(true);
            };
        }, [isFocusedFirstTime])
    );

   const fetchData = async()=>{
            let list = []
           await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/attendance`)
                .then((response) => {
                    list = [...response.data.sort((a,b)=> new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime())]
                    console.log(list)
                    console.log('ubaid')
                    const uniqueNamesArray = [];
                    const encounteredNames = new Set();
    
                    for (const item of list) {
                        if (!encounteredNames.has(item.attendanceBy)) {
                            uniqueNamesArray.push(item);
                            encounteredNames.add(item.attendanceBy);
                        }
                    }
                    setMapArray(uniqueNamesArray);
                    // console.log(uniqueNamesArray)
                })
        }

    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert('Error', 'Permission to access location was denied');
                return;
            }

            await Location.watchPositionAsync({ distanceInterval: 50 }, response => {

                // console.log(response.coords.latitude)
                // console.log(response.coords.longitude)
                setMyLocation(response)
            })
            //  setLocation(location);
        })();
    }, []);


    const mapstyle = [
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#8ec3b9"
                }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1a3646"
                }
            ]
        },
        {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#4b6878"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#64779e"
                }
            ]
        },
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#4b6878"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#334e87"
                }
            ]
        },
        {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#023e58"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#283d6a"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#6f9ba5"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#023e58"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#3C7680"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#304a7d"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#98a5be"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#2c6675"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#255763"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#b0d5ce"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#023e58"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#98a5be"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#283d6a"
                }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#3a4762"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#0e1626"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#4e6d70"
                }
            ]
        }
    ]


    return (
        <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {myLocation == null || myLocation == undefined ?
                <View style={styles.activityIndicatorStyle}>
                    <ActivityIndicator color="#57D1D7" size="large" />
                </View>
                :
                <MapView
                    ref={mapRef}
                    provider='google'
                    style={{ width: '100%', height: '100%' }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    customMapStyle={mapstyle}
                    followUserLocation={true}
                    zoomEnabled={true}
                    onMapReady={() => {
                        mapRef.current.animateToRegion({
                            latitude: myLocation.coords.latitude,
                            longitude: myLocation.coords.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005
                        }, 2000)
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: myLocation.coords.latitude,
                            longitude: myLocation.coords.longitude,
                        }}
                        pinColor='orange'
                        title={authState.value.data.name}
                        description="My current location"
                    />

                    {mapArray == 0
                        ?
                        null
                        :
                        mapArray.map((item, index) => {
                            return (
                                <Marker
                                    key={index}
                                    coordinate={{
                                        latitude: item.location[0],
                                        longitude: item.location[1],
                                    }}
                                    pinColor='red'
                                    title={peopleState.value.data.find((item1) => item1._id === item.attendanceBy)?.name || 'Unknown person'}
                                    description={`Last update ${(new Date(item.TimeStamp)).toLocaleString(undefined, {
                                        year: 'numeric',
                                        month: 'numeric', // You can use 'short' or 'numeric' for a shorter format
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true,
                                    })}`}
                                />
                            )
                        })
                    }
                </MapView>
            }



        </Layout>
    )
}

export default MapViewScreen