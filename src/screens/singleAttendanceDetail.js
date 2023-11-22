import { View, TouchableOpacity, Image, Platform, ScrollView } from "react-native"
import Constants from "expo-constants";
import { ApplicationProvider, Layout, Text, Button, Input, Card, useTheme } from '@ui-kitten/components';
import { useContext, useRef, useState } from "react";
import * as eva from '@eva-design/eva'
import { PeopleContext } from "../store/context/PeopleContext";
import moment from 'moment'
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import app from "../config/firebase";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import styles from "../styles/styles";
import ImageView from "react-native-image-viewing";

const options = {
    year: 'numeric',
    month: 'numeric', // You can use 'short' or 'numeric' for a shorter format
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
}

const SingleAttendanceRecordScreen = (props) => {

    const data = props.route.params.data
    const { state: peopleState } = useContext(PeopleContext)
    const mapRef = useRef()
    const [openImage, setOpenImage] = useState([])
    const [openImageVisible, setOpenImageVisble] = useState(false)

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
        <Layout style={styles.mainLayout} >
            <View style={{ width: '100%', height: 50, backgroundColor: '#232f3f', flexDirection: 'row', marginTop: Constants.statusBarHeight, alignItems: 'center' }}>
                <View style={{ position: 'absolute', left: 10 }}>
                    <TouchableOpacity onPress={() => {
                        props.navigation.goBack()
                    }}>
                        <Image style={{ height: 30, width: 30 }} source={require('../../assets/backarrow_icon.png')} tintColor='#FFFFFF'></Image>
                    </TouchableOpacity>
                </View>
                <View style={{ justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'inter-medium', }}>Single Record</Text>
                </View>
            </View>

            <ScrollView style={{ width: '100%' }}
                contentContainerStyle={{ flex: 1, alignItems: 'center' }}>
                <Card status="primary" style={{ marginTop: 40, width: '95%', }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <Text style={styles.singleRecordText}>Status</Text>
                        <Text style={styles.singleRecordText}>{data.status}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <Text style={styles.singleRecordText}>Date and Time</Text>
                        {data.TimeStamp
                            ?
                            <Text style={styles.singleRecordText}>{(new Date(data.TimeStamp)).toLocaleString(undefined, options)}</Text>
                            : null
                        }

                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <Text style={styles.singleRecordText}>Employee</Text>
                        <Text style={styles.singleRecordText}>{peopleState.value.data.find((item) => item._id === data.attendanceBy)?.name || 'Unknown person'}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <Text style={styles.singleRecordText}>Note</Text>
                        <Text style={styles.singleRecordText}>{data.note}</Text>
                    </View>

                </Card>
                {data
                    ?
                    <Card status='danger' appearance="outline" style={{ flex: 1, width: '95%', marginTop: 30 }}>
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={{ width: '100%', height: '100%' }}
                            // showsUserLocation={true}
                            // showsMyLocationButton={true}
                            customMapStyle={mapstyle}
                            // followUserLocation={true}
                            zoomEnabled={true}
                            onMapReady={() => {
                                mapRef.current.animateToRegion({
                                    latitude: data.location[0],
                                    longitude: data.location[1],
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005
                                }, 2000)
                            }}
                        //     initialRegion={{
                        //         latitude: location.coords.latitude,
                        // longitude: location.coords.longitude,
                        // latitudeDelta : 0.005,
                        // longitudeDelta : 0.005
                        //     }}

                        >
                            <Marker
                                coordinate={{
                                    latitude: data.location[0],
                                    longitude: data.location[1],
                                }}
                                pinColor='orange'
                                title={peopleState.value.data.find((item) => item._id === data.attendanceBy)?.name || 'Unknown person'}
                                description={data.status}
                            />
                        </MapView>
                    </Card>
                    :
                    null}

                {data.image
                    ?
                    <Card status='info' appearance="outline" style={{ flex: 1, width: '95%', marginTop: 30 }}>
                        <TouchableOpacity onPress={() => {
                            const temp = []
                            temp.push({
                                uri: data.image
                            })
                            setOpenImage(temp)
                            setOpenImageVisble(true)
                        }}>
                            <Image style={{ height: '100%', width: '100%' }} resizeMode="contain" source={{ uri: data.image }}></Image>
                        </TouchableOpacity>
                    </Card>
                    :
                    null}
            </ScrollView>

            <ImageView
                images={openImage}
                imageIndex={0}
                visible={openImageVisible}
                onRequestClose={() => setOpenImageVisble(false)}

            />
        </Layout>
    )
}

export default SingleAttendanceRecordScreen