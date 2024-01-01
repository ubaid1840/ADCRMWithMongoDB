import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions, ActivityIndicator, Alert } from "react-native"
import styles from "../styles/styles";
import Constants from "expo-constants";
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Popover, useTheme, Select, SelectItem } from '@ui-kitten/components';
import { PeopleContext } from "../store/context/PeopleContext";
import { AuthContext } from "../store/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { GeoPoint, addDoc, collection, doc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
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
import { DataTable } from "react-native-paper";
import universalStyles from '../styles/universalStyles'

const options = {
    year: 'numeric',
    month: 'numeric', // You can use 'short' or 'numeric' for a shorter format
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
}

const columns = [
    "Date",
    "Time In",
    "Time Out",
]

const months = [
    'All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
]

const currentYear = new Date().getFullYear();

const pastYears = Array.from({ length: 10 }, (_, index) => currentYear - index);



const AttendanceEmployeeScreen = (props) => {

    const theme = useTheme()

    const db = getFirestore(app)
    const storage = getStorage(app)

    const height = Dimensions.get('screen').height
    const [dataLoading, setDataLoading] = useState(true)
    const [attendanceArray, setAttendanceArray] = useState([])
    const [note, setNote] = useState('')

    const { state: authState } = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);
    const [modalVisible, setModalVisible] = useState(false)
    const [modalVisibleSales, setModalVisibleSales] = useState(false)


    const { state: taskState } = useContext(TaskContext)
    const [attendaceAllowed, setAttendanceAllowed] = useState(true)
    const [attendanceByLocationAllowed, setAttendanceByLocationAllowed] = useState(true)

    const [image, setImage] = useState(null)
    const [imgLoading, setImgLoading] = useState(false)
    const inputRef = useRef()

    const [selectedMonth, setSelectedMonth] = useState('All')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())





    useEffect(() => {
        // uploadDate()
    }, [])

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            setDataLoading(true)
            setAttendanceAllowed(true)
            setAttendanceByLocationAllowed(true)
            fetchData()
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Error', 'Need location access to mark attendance', [{
                        text: 'Close',
                        onPress: () => props.navigation.navigate('dashboardemployee'),
                        style: 'cancel'
                    }])
                    setDataLoading(false)
                }
                else {
                    let currentLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
                    if (currentLocation) {
                        const coordinates = [
                            { lat: 31.481186, lon: 74.241216 },
                            { lat: 31.621299, lon: 74.273994 },
                            { lat: 31.388195, lon: 74.199890 },
                            { lat: 31.470412, lon: 74.293418 },
                            { lat: 31.492994, lon: 74.396301 },
                        ];
                        let i = 0
                        for (const coord of coordinates) {
                            const distance = calculateDistance(currentLocation.coords.latitude, currentLocation.coords.longitude, coord.lat, coord.lon);
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
                }
            } catch (error) {
                Alert.alert('Error', 'Please turn on your location', [{
                    text: 'Close',
                    onPress: () => props.navigation.navigate('dashboardemployee'),
                    style: 'cancel'
                }])
            }

        });

        return unsubscribe;
    }, [props.navigation])

    const pickImage = async () => {

        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()

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
                //console.log('cancelled')
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

        const querySnapshot = await getDocs(query(collection(db, 'EmployeeAttendance'), where('attendanceBy', '==', authState.value.data.email)))
        let list = []

        querySnapshot.forEach((docs) => {
            list.push({ ...docs.data(), 'id': docs.id })
        })

        list.sort((a, b) => new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime())
        setAttendanceArray(list)
        if (list.length != 0) {
            if (list[0].timeOut) {
                if (moment(new Date(list[0].timeOut)).format("DD-MM-YYYY").toString() == moment(new Date()).format("DD-MM-YYYY").toString()) {
                    setAttendanceAllowed(false)
                }
            }
        }
        setDataLoading(false)
    }

    const handleTimeIn = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Error', 'Permission not granted', [{
                text: 'Close',
                onPress: () => null,
                style: 'cancel'
            }])
            setDataLoading(false)

        } else {
            let currentLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
            if (currentLocation) {
                const downloadURL = await uploadImageToFirebase(image);
                if (downloadURL) {
                    try {

                        await addDoc(collection(db, 'EmployeeAttendance'), {
                            'attendanceBy': authState.value.data.email,
                            'timeIn': new Date().getTime(),
                            'locationTimeIn': [currentLocation.coords.latitude, currentLocation.coords.longitude],
                            'noteTimeIn': note,
                            'imageTimeIn': downloadURL,
                        })
                    } catch (error) {
                        //console.log(error)
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

    const handleTimeInSales = async (task1, task2, task3, task4, task5) => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Error', 'Permission not granted', [{
                text: 'Close',
                onPress: () => null,
                style: 'cancel'
            }])
            setDataLoading(false)

        } else {
            let currentLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
            if (currentLocation) {
                const downloadURL = await uploadImageToFirebase(image);
                if (downloadURL) {
                    try {
                        await addDoc(collection(db, 'EmployeeAttendance'), {
                            'attendanceBy': authState.value.data.email,
                            'timeIn': new Date().getTime(),
                            'locationTimeIn': [currentLocation.coords.latitude, currentLocation.coords.longitude],
                            'noteTimeIn': note,
                            'imageTimeIn': downloadURL,
                        })

                        await addDoc(collection(db, 'Tasks'), {
                            'taskName': task1,
                            'assignedTo': authState.value.data.email,
                            'status': 'Pending',
                            'TimeStamp': new Date().getTime(),
                            'type': 'Office Task'
                        })

                        await addDoc(collection(db, 'Tasks'), {
                            'taskName': task2,
                            'assignedTo': authState.value.data.email,
                            'status': 'Pending',
                            'TimeStamp': new Date().getTime(),
                            'type': 'Office Task'
                        })

                        await addDoc(collection(db, 'Tasks'), {
                            'taskName': task3,
                            'assignedTo': authState.value.data.email,
                            'status': 'Pending',
                            'TimeStamp': new Date().getTime(),
                            'type': 'Office Task'
                        })

                        await addDoc(collection(db, 'Tasks'), {
                            'taskName': task4,
                            'assignedTo': authState.value.data.email,
                            'status': 'Pending',
                            'TimeStamp': new Date().getTime(),
                            'type': 'Office Task'
                        })

                        await addDoc(collection(db, 'Tasks'), {
                            'taskName': task5,
                            'assignedTo': authState.value.data.email,
                            'status': 'Pending',
                            'TimeStamp': new Date().getTime(),
                            'type': 'Office Task'
                        })
                    } catch (error) {
                        //console.log(error)
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

                    //console.log(parseFloat(progress).toFixed(2))


                    switch (snapshot.state) {
                        case 'paused':
                            //console.log('Upload is paused');
                            break;
                        case 'running':
                            //console.log('Upload is running');
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
        taskState.value.data.map((item) => {
            if (item.status != 'Completed') {
                i++
            }
        })
        if (i != 0) {
            // setDataLoading(false)
            Alert.alert('Error', 'You have Pending task. Do you want to time out?', [
                {
                    text: 'No',
                    onPress: () => null
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            let { status } = await Location.requestForegroundPermissionsAsync();
                            if (status !== 'granted') {
                                Alert.alert('Error', 'Need location access to mark attendance', [{
                                    text: 'Close',
                                    onPress: () => null,
                                    style: 'cancel'
                                }])
                                setDataLoading(false)

                            } else {
                                let currentLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
                                if (currentLocation) {
                                    const downloadURL = await uploadImageToFirebase(image);
                                    if (downloadURL) {
                                        await updateDoc(doc(db, 'EmployeeAttendance', attendanceArray[0].id), {
                                            'attendanceBy': authState.value.data.email,
                                            'timeOut': new Date().getTime(),
                                            'locationTimeOut': [currentLocation.coords.latitude, currentLocation.coords.longitude],
                                            'noteTimeOut': note,
                                            'imageTimeOut': downloadURL,
                                        })
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
                        } catch (error) {
                            console.log(error)
                            //console.log(error)
                            setDataLoading(false)
                        }
                    }
                },
            ])
        }
        else {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Error', 'Need location access to mark attendance', [{
                        text: 'Close',
                        onPress: () => null,
                        style: 'cancel'
                    }])

                    setDataLoading(false)

                } else {
                    let currentLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
                    if (currentLocation) {
                        const downloadURL = await uploadImageToFirebase(image);
                        if (downloadURL) {
                            await updateDoc(doc(db, 'EmployeeAttendance', attendanceArray[0].id), {
                                'attendanceBy': authState.value.data.email,
                                'timeOut': new Date().getTime(),
                                'locationTimeOut': [currentLocation.coords.latitude, currentLocation.coords.longitude],
                                'noteTimeOut': note,
                                'imageTimeOut': downloadURL,
                            })
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
            } catch (error) {
                console.log(error)
                //console.log(error)
                setDataLoading(false)
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

        const [task1, setTask1] = useState('')
        const [task2, setTask2] = useState('')
        const [task3, setTask3] = useState('')
        const [task4, setTask4] = useState('')
        const [task5, setTask5] = useState('')

        let contentToRender = null;

        if (attendanceArray.length != 0) {
            if (attendanceArray[0].timeIn) {
                if (moment(new Date(attendanceArray[0].timeIn)).format("DD-MM-YYYY").toString() == moment(new Date()).format("DD-MM-YYYY").toString()) {
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
                                disabled={!image || !note}
                                style={{ width: '40%', marginTop: 20 }}
                                onPress={() => {
                                    if (image && note.length != 0) {
                                        setDataLoading(true)
                                        setModalVisible(false)
                                        handleTimeOut()
                                    }

                                }}
                            >Time Out</Button>
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

                            {authState.value.data.designation == 'Sales'
                                ?
                                !image
                                    ?
                                    null
                                    :
                                    <>
                                        <Input
                                            style={{ marginVertical: 10 }}
                                            placeholder="Task 1"
                                            value={task1}
                                            onChangeText={(txt) => setTask1(txt)}
                                            size="large"
                                            maxLength={150}
                                        >
                                        </Input>
                                        <Input
                                            placeholder="Task 2"
                                            value={task2}
                                            onChangeText={setTask2}
                                            size="large"
                                            maxLength={150}
                                        >
                                        </Input>
                                        <Input
                                            style={{ marginVertical: 10 }}
                                            placeholder="Task 3"
                                            value={task3}
                                            onChangeText={setTask3}
                                            size="large"
                                            maxLength={150}
                                        >
                                        </Input>
                                        <Input
                                            placeholder="Task 4"
                                            value={task4}
                                            onChangeText={setTask4}
                                            size="large"
                                            maxLength={150}
                                        >
                                        </Input>
                                        <Input
                                            style={{ marginTop: 10 }}
                                            placeholder="Task 5"
                                            value={task5}
                                            onChangeText={setTask5}
                                            size="large"
                                            maxLength={150}
                                        >
                                        </Input>
                                        <Button
                                            disabled={!image || !note || !task1 || !task2 || !task3 || !task4 || !task5}
                                            style={{ width: '40%', marginTop: 20 }}
                                            onPress={() => {
                                                if (image) {
                                                    setDataLoading(true)
                                                    setModalVisibleSales(false)
                                                    handleTimeInSales(task1, task2, task3, task4, task5)
                                                }
                                            }}
                                        >Time In</Button>
                                    </>
                                :
                                <Button
                                    disabled={!image || !note}
                                    style={{ width: '40%', marginTop: 20 }}
                                    onPress={() => {
                                        if (image) {
                                            setDataLoading(true)
                                            setModalVisible(false)
                                            handleTimeIn()
                                        }
                                    }}
                                >Time In</Button>}

                        </>
                    )
                }
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

                    {authState.value.data.designation == 'Sales'
                        ?
                        !image
                        ?
                        null
                        :
                        <>
                            <Input
                                style={{ marginVertical: 10 }}
                                placeholder="Task 1"
                                value={task1}
                                onChangeText={setTask1}
                                size="large"
                                maxLength={150}
                            >
                            </Input>
                            <Input
                                placeholder="Task 2"
                                value={task2}
                                onChangeText={setTask2}
                                size="large"
                                maxLength={150}
                            >
                            </Input>
                            <Input
                                style={{ marginVertical: 10 }}
                                placeholder="Task 3"
                                value={task3}
                                onChangeText={setTask3}
                                size="large"
                                maxLength={150}
                            >
                            </Input>
                            <Input
                                placeholder="Task 4"
                                value={task4}
                                onChangeText={setTask4}
                                size="large"
                                maxLength={150}
                            >
                            </Input>
                            <Input
                                style={{ marginTop: 10 }}
                                placeholder="Task 5"
                                value={task5}
                                onChangeText={setTask5}
                                size="large"
                                maxLength={150}
                            >
                            </Input>
                            <Button
                                disabled={!image || !note || !task1 || !task2 || !task3 || !task4 || !task5}
                                style={{ width: '40%', marginTop: 20 }}
                                onPress={() => {
                                    if (image) {
                                        setDataLoading(true)
                                        setModalVisibleSales(false)
                                        handleTimeInSales(task1, task2, task3, task4, task5)
                                    }
                                }}
                            >Time In</Button>
                        </>
                        :
                        <Button
                            disabled={!image || !note}
                            style={{ width: '40%', marginTop: 20 }}
                            onPress={() => {
                                if (image) {
                                    setDataLoading(true)
                                    setModalVisible(false)
                                    handleTimeIn()
                                }
                            }}
                        >Time In</Button>}
                </>
            )
        }

        return contentToRender

    }


    const MyTable = ({ header, data, }) => {

        return (
            <Layout style={{ flex: 1, paddingVertical: 10 }}>
                <ScrollView>
                    <DataTable >
                        <DataTable.Header style={{ borderBottomWidth: 1 }} >
                            {header.map((column, index) => {
                                return (
                                    <DataTable.Title textStyle={[universalStyles.tableHeaderTxtStyle, { color: theme['color-primary-500'] }]} style={{ marginHorizontal: 10 }} key={index}>{column}</DataTable.Title>
                                )
                            })}

                        </DataTable.Header>

                        {data.map((item, index) => (
                            <DataTable.Row key={index} style={{}}>
                                <DataTable.Cell textStyle={universalStyles.formTxtStyle} style={{ marginHorizontal: 10 }}>{item.timeIn ? moment(new Date(item.timeIn)).format('DD-MM-YYYY') : '-'}</DataTable.Cell>
                                <DataTable.Cell textStyle={universalStyles.formTxtStyle} style={{ marginHorizontal: 10 }}>{item.timeIn ? moment(new Date(item.timeIn)).format('hh:mm A') : '-'}</DataTable.Cell>
                                <DataTable.Cell textStyle={universalStyles.formTxtStyle} style={{ marginHorizontal: 10 }}>{item.timeOut ? moment(new Date(item.timeOut)).format('hh:mm A') : '-'}</DataTable.Cell>
                            </DataTable.Row>
                        ))}

                    </DataTable>
                </ScrollView>
            </Layout>
        );

    }

    const clearAll = () => {
        setNote('')
        setImage(null)
    }

    return (
        <Layout style={{ flex: 1, alignItems: 'center', padding: 10 }}>
            <View style={{ flex: 1, width: '100%' }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Select
                        size="large"
                        style={{ width: 150 }}
                        label="Select Month"
                        value={selectedMonth}
                        onSelect={(index) => {
                            setSelectedMonth(months[index - 1])
                        }}
                    >
                        {months

                            .map((item, index) => (
                                <SelectItem key={index} title={item} />
                            ))}
                    </Select>

                    <Select
                        size="large"
                        style={{ width: 150 }}
                        label="Select Year"
                        value={selectedYear}
                        onSelect={(index) => {
                            setSelectedYear(pastYears[index - 1])
                        }}
                    >
                        {pastYears
                            .map((item, index) => (
                                <SelectItem key={index} title={item} />
                            ))}
                    </Select>

                    {/* <CSVLink data={downloadData}>Download me</CSVLink>; */}

                </View>
                <MyTable
                    header={columns}
                    data={selectedMonth != 'All' ? attendanceArray.filter((item) => moment(new Date(item.timeIn)).format("M").toString() == selectedMonth && moment(new Date(item.timeIn)).format("YYYY").toString() == selectedYear.toString()) : attendanceArray.filter((item) => moment(new Date(item.timeIn)).format("YYYY").toString() == selectedYear.toString())}
                />

                <View style={{ width: '90%', alignSelf: 'center' }}>

                    {
                        attendanceByLocationAllowed
                            ?
                            attendaceAllowed
                                ?
                                <Button
                                    style={{}}
                                    onPress={() => {
                                        clearAll()
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
                animationType="slide"
                onBackdropPress={() => {
                    setModalVisible(false)
                }}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                <View style={{ height: 'auto', width: Dimensions.get('screen').width, alignItems: 'center', justifyContent: 'center', }}>
                    <Card disabled style={{ width: '95%', paddingVertical: 20 }}>

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

            {/* <Modal
                visible={modalVisibleSales}
                animationType="slide"
                onBackdropPress={() => {
                    setModalVisibleSales(false)
                }}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                <View style={{ height: 'auto', width: Dimensions.get('screen').width, alignItems: 'center', justifyContent: 'center', }}>
                    <Card disabled style={{ width: '95%', paddingVertical: 20 }}>

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
            </Modal > */}

        </Layout >
    )
}

export default memo(AttendanceEmployeeScreen)