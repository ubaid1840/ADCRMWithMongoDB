import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions, ActivityIndicator, Alert } from "react-native"
import styles from "../styles/styles";
import Constants from "expo-constants";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Popover } from '@ui-kitten/components';
import { PeopleContext } from "../store/context/PeopleContext";
import { AuthContext } from "../store/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { GeoPoint, addDoc, collection, doc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import app from "../config/firebase";
import moment from "moment";
import * as Location from 'expo-location'
import { TaskContext } from '../store/context/TaskContext'
import { LocationContext } from "../store/context/LocationContext";
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRef } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import axios from "axios";

const options = {
    year: 'numeric',
    month: 'numeric', // You can use 'short' or 'numeric' for a shorter format
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
}

const AttendanceEmployeeScreen = (props) => {

    const db = getFirestore(app)
    const storage = getStorage(app)

    const height = Dimensions.get('screen').height
    const [dataLoading, setDataLoading] = useState(true)
    const [attendanceArray, setAttendanceArray] = useState([])
    const [note, setNote] = useState('')

    const { state: authState } = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);
    const [modalVisible, setModalVisible] = useState(false)
    const [attendaceAllowed, setAttendanceAllowed] = useState(true)

    const { state: taskState } = useContext(TaskContext)
    const { state: locationState } = useContext(LocationContext)
    const [attendanceByLocationAllowed, setAttendanceByLocationAllowed] = useState(true)

    const [image, setImage] = useState(null)
    const [imgLoading, setImgLoading] = useState(false)
    const inputRef = useRef()

    useFocusEffect(
        useCallback(() => {
            if (!isFocusedFirstTime) {
                fetchData()
                const coordinates = [
                    { lat: 31.481186, lon: 74.241216 },
                    { lat: 31.621299, lon: 74.273994 },
                    { lat: 31.388195, lon: 74.199890 },
                    { lat: 31.470412, lon: 74.293418 },
                    { lat: 31.492994, lon: 74.396301 },
                ];
                let i = 0
                for (const coord of coordinates) {
                    const distance = calculateDistance(locationState.value.data.coords.latitude, locationState.value.data.coords.longitude, coord.lat, coord.lon);

                    if (distance <= 1000) {
                        i++
                    }
                }
                if (i == 0) {
                    setAttendanceByLocationAllowed(true)
                }
                else {
                    setAttendanceByLocationAllowed(false)
                }
            }

            setIsFocusedFirstTime(false);
            return () => {
                setAttendanceArray([])
                setDataLoading(true)
            };
        }, [isFocusedFirstTime])
    );

    const pickImage = async () => {

        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()

        // console.log(cameraPermission.status == 'granted')

        if (cameraPermission.status == 'granted') {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const manipResult = await manipulateAsync(result.assets[0].uri, [{ resize: { height: 600, width: 600 } }])
                setImage(manipResult.uri)
                setImgLoading(false)
            }

            if (result.canceled) {
                console.log('cancelled')
                setImgLoading(false)
            }
        }



    };

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadius = 6371000; // Earth's radius in meters (approximately)

        // Convert latitude and longitude from degrees to radians
        const lat1Rad = (Math.PI / 180) * lat1;
        const lon1Rad = (Math.PI / 180) * lon1;
        const lat2Rad = (Math.PI / 180) * lat2;
        const lon2Rad = (Math.PI / 180) * lon2;

        // Haversine formula
        const dLat = lat2Rad - lat1Rad;
        const dLon = lon2Rad - lon1Rad;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Calculate the distance
        const distance = earthRadius * c;

        return distance;
    }

    const fetchData = async () => {
        setImage(null)
        await axios.get(`https://fragile-hospital-gown-cow.cyclic.app/attendance`)
            .then((response) => {
                let list = [...response.data]

                list.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime())
                const updatedList = list.filter(item => item.attendanceBy === authState.value.data._id)
                setAttendanceArray(updatedList)

                if (updatedList.length != 0) {
                    const timestampDate = new Date(updatedList[0].TimeStamp)
                    const today = new Date()

                    const timestampYear = moment(timestampDate).format('YYYY')
                    const timestampMonth = moment(timestampDate).format('MM')
                    const timestampDay = moment(timestampDate).format('DD')



                    const todayYear = moment(today).format('YYYY')
                    const todayMonth = moment(today).format('MM')
                    const todayDay = moment(today).format('DD')

                    console.log(timestampYear, timestampMonth, timestampDay)
                    console.log(todayYear, todayMonth, todayDay)

                    if (timestampYear === todayYear && timestampMonth === todayMonth && timestampDay === todayDay) {
                        if (updatedList[0].status == 'Time Out') {
                            console.log('1')
                            setAttendanceAllowed(false)
                        }
                        else {
                            console.log('2')
                            setAttendanceAllowed(true)
                        }
                    }

                    else {
                        setAttendanceAllowed(true)
                        console.log('3')
                    }
                }
                setDataLoading(false)
            })
    }


    const renderEmptyAsset = () => {

        return (
            <View style={{ height: height / 1.5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 60 }}>
                <View style={{ height: 110, width: 110, borderRadius: 55, backgroundColor: '#24303E', justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: 90, width: 90 }} source={require('../../assets/profile_icon.png')} tintColor='#5B6D84'></Image>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 16, marginVertical: 15, fontWeight: '700' }}>No result</Text>
            </View>
        )
    }

    const handleTimeIn = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission not granted', [{
                text: 'Close',
                onPress: () => null,
                style: 'cancel'
            }])

            setDataLoading(false)

        } else {
            let currentLocation = await Location.getCurrentPositionAsync()
            if (currentLocation) {
                const downloadURL = await uploadImageToFirebase(image);
                if (downloadURL) {
                    try {


                        const newAttendance = {
                            'attendanceBy': authState.value.data._id,
                            'status': 'Time In',
                            'location': [currentLocation.coords.latitude, currentLocation.coords.longitude],
                            'note': note,
                            'image': downloadURL
                        }

                        await axios.post(`https://fragile-hospital-gown-cow.cyclic.app/attendance`, newAttendance)
                            .then((response) => {
                                console.log('done')
                            })
                            .catch((err) => {
                                console.log(err)
                                setDataLoading(false)
                            })

                    } catch (error) {
                        console.log(error)
                        setDataLoading(false)
                    }
                    fetchData()
                }
                else {
                    Alert.alert('Error', 'Please try again')
                    fetchData()
                }
            }
            else {

                setDataLoading(false)
                Alert.alert('Error', 'Please try again')
            }
        }


    }

    const uploadImageToFirebase = async (uri) => {

        //console.log('5')

        return new Promise(async (resolve, reject) => {

            const currentTimeInMilliseconds = new Date().getTime();

            const blobImage = await new Promise((resole, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resole(xhr.response);
                };
                xhr.onerror = function () {
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uri, true);
                xhr.send(null);
            });

            // Create the file metadata
            /** @type {any} */
            const metadata = {
                contentType: 'image/jpeg'
            };

            //upload image to firestore
            const storageRef = ref(storage, 'FormImages/' + currentTimeInMilliseconds);
            const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {

                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    console.log(parseFloat(progress).toFixed(2))


                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            break;
                        case 'storage/canceled':
                            break;


                        case 'storage/unknown':
                            break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // dbUpdate(downloadURL)
                        resolve(downloadURL);
                    }).catch((error) => {
                        reject(null);
                    })
                }
            );
        })
    };

    const handleTimeOut = async () => {

        let i = 0

        //     console.log(taskState.value.data)

        taskState.value.data.map((item) => {
            if (item.status != 'Completed') {
                console.log(item)
                i++
            }
        })
        if (i != 0) {
            setDataLoading(false)
            Alert.alert('Error', 'Kindly close your pending task')
        }
        else {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission not granted', [{
                    text: 'Close',
                    onPress: () => null,
                    style: 'cancel'
                }])

                setDataLoading(false)

            } else {
                let currentLocation = await Location.getCurrentPositionAsync()
                if (currentLocation) {
                    const downloadURL = await uploadImageToFirebase(image);
                    if (downloadURL) {
                        try {
                            const newAttendance = {
                                'attendanceBy': authState.value.data._id,
                                'status': 'Time Out',
                                'location': [currentLocation.coords.latitude, currentLocation.coords.longitude],
                                'note': note,
                                'image': downloadURL
                            }
    
                            await axios.post(`https://fragile-hospital-gown-cow.cyclic.app/attendance`, newAttendance)
                                .then((response) => {
                                    console.log('done')
                                })
                                .catch((err) => {
                                    console.log(err)
                                    setDataLoading(false)
                                })
    
                        } catch (error) {
                            console.log(error)
                            setDataLoading(false)
                        }
                        fetchData()
                    }
                    else {
                        Alert.alert('Error', 'Please try again')
                        fetchData()
                    }

                }
            }
        }



    }

    const CustomActivityIndicator = () => {
        return (
            <View style={styles.activityIndicatorStyle}>
                <ActivityIndicator color="#57D1D7" size="large" />
            </View>
        );
    };

    const RenderButton = () => {

        let contentToRender = null;

        if (attendanceArray.length != 0) {
           
            const timestampDate = new Date(attendanceArray[0].TimeStamp)
            const today = new Date()
            const timestampYear = moment(timestampDate).format('YYYY')
            const timestampMonth = moment(timestampDate).format('MM')
            const timestampDay = moment(timestampDate).format('DD')

            const todayYear = moment(today).format('YYYY')
            const todayMonth = moment(today).format('MM')
            const todayDay = moment(today).format('DD')

            if (timestampYear == todayYear && timestampMonth == todayMonth && timestampDay == todayDay) {
                if (attendanceArray[0].status == 'Time Out') {
                    contentToRender = (
                        <>
                            {imgLoading ?
                                <View style={{ marginTop: 10 }}>
                                    <ActivityIndicator color="#57D1D7" size='large' />
                                </View>
                                : null}
                            {image
                                ?
                                <Image style={{ width: 100, height: 100, marginTop: 10 }} source={{ uri: image }}></Image>
                                :
                                <Button
                                    status='info'
                                    style={{ width: '40%', marginTop: 20 }}
                                    onPress={() => {
                                        setImgLoading(true)
                                        pickImage()
                                    }}
                                >Add Image</Button>
                            }


                            <Button
                                status='info'
                                style={{ width: '40%', marginTop: 20 }}
                                onPress={() => {
                                    if (image) {
                                        setDataLoading(true)
                                        setModalVisible(false)
                                        handleTimeIn()
                                    }

                                }}
                            >Time In</Button>
                        </>
                    )
                }
                else {
                    contentToRender = (
                        <>
                            {imgLoading ?
                                <View style={{ marginTop: 10 }}>
                                    <ActivityIndicator color="#57D1D7" size='large' />
                                </View>
                                : null}
                            {image
                                ?
                                <Image style={{ width: 100, height: 100, marginTop: 10 }} source={{ uri: image }}></Image>
                                :
                                <Button
                                    status='info'
                                    style={{ width: '40%', marginTop: 20 }}
                                    onPress={() => {
                                        setImgLoading(true)
                                        pickImage()
                                    }}
                                >Add Image</Button>
                            }
                            <Button status="danger"
                                style={{ width: '40%', marginTop: 20 }}
                                onPress={() => {
                                    if (image) {
                                        setDataLoading(true)
                                        setModalVisible(false)
                                        handleTimeOut()
                                    }

                                }}
                            >Time Out</Button>
                        </>
                    )
                }
            }
            else {
                contentToRender = (
                    <>
                        {imgLoading ?
                            <View style={{ marginTop: 10 }}>
                                <ActivityIndicator color="#57D1D7" size='large' />
                            </View>
                            : null}
                        {image
                            ?
                            <Image style={{ width: 100, height: 100, marginTop: 10 }} source={{ uri: image }}></Image>
                            :
                            <Button
                                status='info'
                                style={{ width: '40%', marginTop: 20 }}
                                onPress={() => {
                                    setImgLoading(true)
                                    pickImage()
                                }}
                            >Add Image</Button>
                        }

                        <Button
                            style={{ width: '40%', marginTop: 20 }}
                            onPress={() => {
                                if (image) {
                                    setDataLoading(true)
                                    setModalVisible(false)
                                    handleTimeIn()
                                }
                            }}
                        >Time In</Button>
                    </>
                )
            }
        }
        else {
            contentToRender = (
                <>
                    {imgLoading ?
                        <View style={{ marginTop: 10 }}>
                            <ActivityIndicator color="#57D1D7" size='large' />
                        </View>
                        : null}
                    {image
                        ?
                        <Image style={{ width: 100, height: 100, marginTop: 10 }} source={{ uri: image }}></Image>
                        :
                        <Button
                            status='info'
                            style={{ width: '40%', marginTop: 20 }}
                            onPress={() => {
                                setImgLoading(true)
                                pickImage()
                            }}
                        >Add Image</Button>
                    }

                    <Button
                        style={{ width: '40%', marginTop: 20 }}
                        onPress={() => {
                            if (image) {
                                setDataLoading(true)
                                setModalVisible(false)
                                handleTimeIn()
                            }
                        }}
                    >Time In</Button>
                </>
            )
        }

        return contentToRender
    }

    return (
        <Layout style={{ flex: 1, alignItems: 'center', paddingVertical: 10, }}>

            <View style={{ flex: 1, width: '100%' }}>

                <FlatList style={{ width: '100%', marginVertical: 20, paddingHorizontal: 20 }}
                    data={attendanceArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardStatus}>{item.status}</Text>
                                    {item.TimeStamp ?
                                        <Text style={styles.cardTimestamp}>{(new Date(item.TimeStamp)).toLocaleString(undefined, options)}</Text>
                                        : <ActivityIndicator color="#57D1D7" />}
                                </View>
                                <Text style={styles.cardNote}>{item.note}</Text>
                            </View>
                        )
                    }}
                    ListEmptyComponent={() => renderEmptyAsset()} />

                <View style={{ width: '90%', alignSelf: 'center' }}>

                    {
                        attendanceByLocationAllowed
                            ?
                            attendaceAllowed
                                ?
                                <Button
                                    style={{}}
                                    onPress={() => {
                                        setNote('')
                                        setModalVisible(true)
                                    }}
                                >Mark attendance</Button>
                                :
                                null
                            : null}

                </View>
            </View>

            {dataLoading ? CustomActivityIndicator() : null}

            <Modal
                visible={modalVisible}
                animationType="slide">
                <View style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC58', }}>
                    <Card style={{ width: '95%', }}>
                        <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 20, width: '100%', }}
                            onPress={() => {
                                setImage(null)
                                setModalVisible(false)
                            }}>
                            <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
                        </TouchableOpacity>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Input
                                placeholder="Enter Note"
                                value={note}
                                onChangeText={setNote}
                                size="large"
                                maxLength={150}
                            >
                            </Input>

                            <Text style={{ alignSelf: 'flex-start', marginTop: 10, fontSize: 10, color: 'red' }}>{150 - note.length} characters limit</Text>
                            <RenderButton />


                        </View>


                    </Card>
                </View>
            </Modal >

        </Layout >
    )
}

export default AttendanceEmployeeScreen