import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, Dimensions, ActivityIndicator } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Datepicker, Modal, Card, Button, Input, Select, SelectItem } from '@ui-kitten/components';
import { PeopleContext } from "../store/context/PeopleContext";
import { AuthContext } from "../store/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { GeoPoint, Timestamp, addDoc, collection, doc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import app from "../config/firebase";
import moment from "moment";
import * as Location from 'expo-location'
import Constants from "expo-constants";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";

const options = {
    year: 'numeric',
    month: 'numeric', // You can use 'short' or 'numeric' for a shorter format
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
}

const timeStatus = [
    'Time In',
    'Time Out'
]

const AttendanceRecordScreen = (props) => {
    const data = props.route.params.data

    const db = getFirestore(app)
    const [attendanceArray, setAttendanceArray] = useState([])

    const height = Dimensions.get('screen').height
    const width = Dimensions.get('screen').width

    const [loading, setLoading] = useState(true)
    const [dataLoading, setDataLoading] = useState(true)
    const [searchPeople, setSearchPeople] = useState('')

    const [modalVisible, setModalVisible] = useState(false)

    const [email, setEmail] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(false)

    const [arrayIndex, setArrayIndex] = useState(0)

    const [selectedData, setSelectedData] = useState('')

    const { state: peopleState } = useContext(PeopleContext)
    const { state: authState } = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);
    const initialDate = new Date();
    initialDate.setDate(initialDate.getDate() - 30);
    const [firstDate, setFirstDate] = useState(initialDate);
    const [secondDate, setSecondDate] = useState(new Date())
    const [totalHours, setTotalHours] = useState(0)

    const [addTimeModalVisible, setAddTimeModalVisible] = useState(false)
    const [addTimeSelectDate, setAddTimeSelectDate] = useState(new Date())
    const [addTimeSelectTime, setAddTimeSelectTime] = useState(new Date())
    const [showTime, setShowTime] = useState("")

    const [selectedStatus, setSelectedStatus] = useState('Time Out')

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [note, setNote] = useState("")

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setShowTime(moment(date).format("hh:mm A"))
        setAddTimeSelectTime(date)
        hideDatePicker();
    };


    useFocusEffect(
        useCallback(() => {
            if (!isFocusedFirstTime) {

                fetchData()
            }

            // Set the flag to false after the first focus
            setIsFocusedFirstTime(false);

            // Cleanup function
            return () => {
                setDataLoading(true)
            };
        }, [isFocusedFirstTime, firstDate, secondDate])
    );

    // useEffect(() => {
    //     fetchData()
    // }, [firstDate, secondDate])

    const fetchData = useCallback(async () => {
        let list = []

        await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/attendance`)
            .then((response) => {
                list = [...response.data]
                list.sort((a, b) => new Date(a.TimeStamp).getTime() - new Date(b.TimeStamp).getTime())
                const updatedList = [...list.filter(item => item.attendanceBy == data._id)]
                const filteredArray = [...updatedList.filter(item => isWithinDateRange(item, firstDate, secondDate))]
                let totalWorkingHours = 0

                for (let i = 0; i < filteredArray.length; i++) {

                    if (filteredArray[i + 1] == undefined) {
                        continue
                    }

                    if (moment(new Date(filteredArray[i].TimeStamp)).format('DD-MM-YYYY') !== moment(new Date(filteredArray[i + 1].TimeStamp)).format('DD-MM-YYYY')) {
                        alert(`Time Out is not punched on ${moment(new Date(filteredArray[i].TimeStamp)).format('DD-MM-YYYY')} `);
                        continue;
                    }

                    const timeInTimestamp = new Date(filteredArray[i + 1].TimeStamp).getHours();
                    const timeOutTimestamp = new Date(filteredArray[i].TimeStamp).getHours()
                    const hoursForPair = timeOutTimestamp - timeInTimestamp
                    totalWorkingHours += hoursForPair;
                    i++
                }
                setTotalHours(totalWorkingHours)
                setAttendanceArray([...updatedList.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime())])
                setLoading(false)
                setDataLoading(false)
            })


    }, [firstDate, secondDate])

    const renderEmptyList = () => {

        return (
            <View style={{ height: height / 1.5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 60 }}>
                <View style={{ height: 110, width: 110, borderRadius: 55, backgroundColor: '#24303E', justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: 90, width: 90 }} source={require('../../assets/profile_icon.png')} tintColor='#5B6D84'></Image>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 16, marginVertical: 15, fontWeight: '700' }}>No result</Text>
            </View>
        )
    }

    const CheckTimeStatus = ({ value, status }) => {
        if (status == 'Time In') {
            const timestampDate = new Date(value);
            const timestampHours = timestampDate.getHours();
            const timestampMinutes = timestampDate.getMinutes();
            const totalTimestampMinutes = timestampHours * 60 + timestampMinutes;
            const total1030AMMinutes = 10 * 60 + 30;

            if (totalTimestampMinutes > total1030AMMinutes) {
                return (
                    <View style={styles.timeStatus1}></View>
                )
            }
            else {
                return (
                    <View style={styles.timeStatus2}></View>
                )
            }
        }
        else {
            const timestampDate = new Date(value);
            const timestampHours = timestampDate.getHours();
            if (timestampHours < 17) {
                return (
                    <View style={styles.timeStatus1}></View>
                )
            }
            else {
                return (
                    <View style={styles.timeStatus2}></View>
                )
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

    const isWithinDateRange = (item, startDate, endDate) => {

        const timestampDate = new Date(item.TimeStamp);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return timestampDate >= startDate && timestampDate <= endDate;
    };

    async function convertToMilliseconds(dateString, timeString) {

        const date = new Date(dateString);
        const time = new Date(timeString);

        // Set the time components from the 'time' date object
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(time.getSeconds());
        // date.setMilliseconds(time.getMilliseconds());

        // Return the result in milliseconds
        return date;
    }

    const handleAddNewTime = async (result) => {

        let i = 0

        // console.log(attendanceArray)
        attendanceArray.map((item) => {
            if (moment(new Date(item.TimeStamp)).format("DD-MM-YYYY") == moment(new Date(result)).format("DD-MM-YYYY")) {
                if (item.status == selectedStatus) {
                    setDataLoading(false)
                    alert(`Same date already exists : ${moment(new Date(item.TimeStamp)).format("DD-MM-YYYY")} ${item.status}`)
                    i++
                    return
                }
            }
        })

        if (i != 0) {
            console.log("date already exists")
            setDataLoading(false)
        }
        else {
            try {
                const newAttendance = {
                    'status': selectedStatus,
                    'location': [0, 0],
                    'note': note,
                    'TimeStamp': result,
                }
                await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/attendance`, newAttendance)
                    .then((response) => {
                        console.log(response.data)
                        setAddTimeModalVisible(false)
                        fetchData()
                    })

            } catch (error) {
                alert(error)
                setDataLoading(false)
                fetchData()
            }
           
        }

    }


    return (
        <Layout style={styles.mainLayout}>
            <View style={{ width: '100%', height: 50, backgroundColor: '#1B1E35', flexDirection: 'row', marginTop: Constants.statusBarHeight, alignItems: 'center' }}>
                <View style={{ position: 'absolute', left: 10 }}>
                    <TouchableOpacity onPress={() => {
                        props.navigation.goBack()
                    }}>
                        <Image style={{ height: 30, width: 30 }} source={require('../../assets/backarrow_icon.png')} tintColor='#FFFFFF'></Image>
                    </TouchableOpacity>
                </View>
                <View style={{ justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'inter-medium', }}>Attendance Record</Text>
                </View>

                <View style={{ position: 'absolute', right: 10 }}>
                    <TouchableOpacity onPress={() => {
                        setShowTime("")
                        setAddTimeSelectDate(new Date())
                        setAddTimeSelectTime(new Date())
                        setAddTimeModalVisible(true)
                    }}>
                        <Image style={{ height: 30, width: 30 }} source={require('../../assets/add_btn_icon.png')} tintColor='green'></Image>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 20 }}>
                <Datepicker
                    date={firstDate}
                    max={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                    onSelect={nextDate => {
                        setFirstDate(nextDate)
                    }}
                    label='Start date'
                    accessoryRight={() => {
                        return (
                            <Image style={{ width: 20, height: 20 }} tintColor='grey' source={require('../../assets/calendar_icon.png')}></Image>
                        )
                    }}
                />

                <Datepicker
                    date={secondDate}
                    max={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                    onSelect={nextDate => setSecondDate(nextDate)}
                    label='End date'
                    accessoryRight={() => {
                        return (
                            <Image style={{ width: 20, height: 20 }} tintColor='grey' source={require('../../assets/calendar_icon.png')}></Image>
                        )
                    }}
                />
            </View>

            <FlatList style={{ width: '100%', marginVertical: 20, }}
                data={[...attendanceArray.filter(item => isWithinDateRange(item, firstDate, secondDate))]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return (
                        <SafeAreaView style={{ width: '100%', alignItems: 'center' }}>
                            <View style={[{ width: '100%', borderColor: '#FFFFFF', justifyContent: 'space-between', marginVertical: 15, alignItems: 'center', paddingVertical: 0, flexDirection: 'row', paddingHorizontal: 20 },]}
                            >
                                {item.TimeStamp
                                    ?
                                    <CheckTimeStatus
                                        value={item.TimeStamp}
                                        status={item.status} />
                                    :
                                    null
                                }
                                <View style={{ width: '25%' }}>
                                    <Text style={{ fontSize: 12 }}>{item.status}</Text>
                                </View>
                                <View style={{ width: '50%', }}>
                                    {item.TimeStamp ?
                                        <Text style={{ fontSize: 12 }}>{(new Date(item.TimeStamp)).toLocaleString(undefined, options)}</Text>
                                        : <ActivityIndicator color="#57D1D7" />}
                                </View>
                                <TouchableOpacity onPress={() => {
                                    props.navigation.navigate('singleattendancerecord', { data: item })
                                }}>
                                    <Image style={{ height: 20, width: 20, transform: [{ rotate: '90deg' }] }} source={require('../../assets/up_arrow_action_icon.png')} tintColor='#23d3d3'></Image>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '100%', borderBottomWidth: 1, borderColor: '#ffffff' }}></View>

                        </SafeAreaView>
                    )
                }}
                ListEmptyComponent={() => renderEmptyList()} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%', alignSelf: 'center' }}>
                <Text style={{ fontFamily: 'inter-medium', fontSize: 16 }}>Total Hours</Text>
                <Text status="danger" style={{ fontFamily: 'inter-bold', fontSize: 26 }}>{totalHours}</Text>

            </View>

            <Modal
                visible={addTimeModalVisible}
                animationType="slide">
                <View style={{ height: 450, width: 400, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC58', }}>
                    <Card style={{ width: '95%', }}>
                        <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 20, width: '100%', }}
                            onPress={() => setAddTimeModalVisible(false)}>
                            <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
                        </TouchableOpacity>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Datepicker
                                style={{ width: '100%' }}
                                date={addTimeSelectDate}
                                max={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                                onSelect={nextDate => {
                                    setAddTimeSelectDate(nextDate)
                                }}
                                label='Pick Date'
                                accessoryRight={() => {
                                    return (
                                        <Image style={{ width: 20, height: 20 }} tintColor='grey' source={require('../../assets/calendar_icon.png')}></Image>
                                    )
                                }}
                            />



                            {/* <Button status = "info" onPress={showDatePicker} >Pick time</Button> */}
                            <Input
                                style={{ width: '100%', marginTop: 10 }}
                                caretHidden={true}
                                label="Pick Time"
                                value={showTime}
                                // onChangeText={setNote}
                                size="large"
                                // maxLength={150}
                                onFocus={() => setDatePickerVisibility(true)}
                                onBlur={() => setDatePickerVisibility(false)}
                            >

                            </Input>

                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="time"
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                            />

                            <Select
                                style={{ width: '100%', marginTop: 10 }}
                                size="large"
                                label='Status'
                                //   selectedIndex={selectedIndex}
                                value={selectedStatus}
                                onSelect={(index) => setSelectedStatus(timeStatus[index - 1])}
                            >
                                {timeStatus.map((item, index) => {
                                    return (
                                        <SelectItem key={index} title={item} />
                                    )
                                })}
                            </Select>

                            <Input
                                style={{ width: '100%', marginTop: 10 }}
                                label="Enter Note"
                                value={note}
                                onChangeText={setNote}
                                size="large"
                                maxLength={150}
                            >
                            </Input>

                            <Button onPress={async () => {
                                if (showTime == "") {

                                }
                                else {
                                    setDataLoading(true)
                                    const result = await convertToMilliseconds(addTimeSelectDate, addTimeSelectTime)

                                    handleAddNewTime(result)
                                }

                            }} appearance="filled" status='primary' style={{ marginTop: 40, width: 200, marginBottom: 10 }}>Add</Button>
                        </View>


                    </Card>
                </View>
            </Modal>
            {dataLoading ? CustomActivityIndicator() : null}

        </Layout>
    )
}

export default AttendanceRecordScreen