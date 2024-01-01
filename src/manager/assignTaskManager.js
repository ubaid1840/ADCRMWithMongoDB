
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions, Alert } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { addDoc, collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../store/context/AuthContext";


const sorting = [
    'All',
    'Today',
    'Completed',
    'Pending',
]



const AssignTaskManagerScreen = (props) => {

    const db = getFirestore(app)

    const height = Dimensions.get('screen').height
    const width = Dimensions.get('screen').width

    const [loading, setLoading] = useState(true)
    const [dataLoading, setDataLoading] = useState(false)
    const [searchTask, setSearchTask] = useState('')

    const [modalVisible, setModalVisible] = useState(false)

    const [email, setEmail] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(false)
    const [task, setTask] = useState('')
    const [selectedPeople, setSelectedPeople] = useState('')
    const [taskArray, setTaskArray] = useState([])
    const [userID, setUserID] = useState(0)

    const [selectedSort, setSelectedSort] = useState('All')

    const { state: peopleState, setPeople } = useContext(PeopleContext)
    const { state: authState } = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);


    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            setTask('')
            setSelectedPeople('')
            setSearchTask('')
            setLoading(true)
            fetchData()
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [props.navigation])


    useFocusEffect(
        useCallback(() => {
            if (!isFocusedFirstTime) {

                fetchData()
            }

            // Set the flag to false after the first focus
            setIsFocusedFirstTime(false);

            // Cleanup function
            return () => {
                setTask('')
                setSelectedPeople('')
                setSearchTask('')
                setTaskArray([])
                setLoading(true)
            };
        }, [isFocusedFirstTime])
    );

    useEffect(() => {
        if (email.includes('@') && email.includes('.com')) {
            setIsEmailValid(true)
        }
        else {
            setIsEmailValid(false)
        }
    }, [email])

    const fetchData = async () => {

        await getDocs(query(collection(db, 'AllowedUsers'), orderBy('name', 'asc')))
            .then((snapshop) => {
                let list1 = []
                snapshop.forEach((docs) => {
                    list1.push({ ...docs.data(), 'id': docs.id })
                })
                setPeople(list1)
            })
        let list = []
        const snapshot = await getDocs(query(collection(db, 'Tasks'), where('assignedBy', '==', authState.value.data.email)))

        snapshot.forEach((docs) => {
            list.push({ ...docs.data(), "id": docs.id })
        })
      list.sort((a,b)=> b.TimeStamp - a.TimeStamp)
        setTaskArray(list)
        setLoading(false)
    }

    const renderEmptyAsset = () => {
        if (loading == true) {
            return (
                <View style={{ marginTop: 50 }}>
                    <ActivityIndicator color="#57D1D7" size='large' />
                </View>
            )
        }

        return (
            <View style={{ height: height / 1.5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 60 }}>
                <View style={{ height: 110, width: 110, borderRadius: 55, backgroundColor: '#24303E', justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: 90, width: 90 }} source={require('../../assets/profile_icon.png')} tintColor='#5B6D84'></Image>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 16, marginVertical: 15, fontWeight: '700' }}>No result</Text>
            </View>
        )
    }

    const handleAddTask = async () => {

        try {

            await addDoc(collection(db, 'Tasks'), {
                'taskName': task,
                'assignedTo': userID,
                'assignedBy': authState.value.data.email,
                'status': 'Pending',
                'TimeStamp': new Date().getTime(),
                'type' : 'Office Task'
            })
            fetchData()

        } catch (error) {
            Alert.alert('Error', error)
        }
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
            <Layout style={styles.mainLayout}>
                <View style={{ width: '100%', alignSelf: 'center', marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Input
                        style={{ width: '50%' }}
                        value={searchTask}
                        onChangeText={setSearchTask}
                        size='large'
                        label='Search task'></Input>


                    <Select
                        style={{ width: '40%' }}
                        size="large"
                        label='Sort'
                        //   selectedIndex={selectedIndex}
                        value={selectedSort}
                        onSelect={(index) => setSelectedSort(sorting[index - 1])}
                    >
                        {sorting.map((item, index) => {
                            return (
                                <SelectItem key={index} title={item} />
                            )
                        })}
                    </Select>

                </View>

                <View style={{ flex: 1, width: '100%' }}>

                    <FlatList style={{ width: '100%', marginVertical: 5, }}
                        data={selectedSort == 'All' ? taskArray : selectedSort == 'Today' ? taskArray.filter(item => moment(new Date(item?.TimeStamp)).format("DD-MM-YYYY") == moment(new Date()).format("DD-MM-YYYY")) : taskArray.filter(item => item.status === selectedSort)}
                        refreshing={false}
                        onRefresh={() => {
                            setLoading(true)
                            fetchData()
                        }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {

                            if (searchTask === "" || item.taskName.toLowerCase().includes(searchTask.toLowerCase()))
                                return (
                                    <SafeAreaView key={index} style={{ width: '100%', alignItems: 'center' }}>
                                        <TouchableOpacity style={[{ width: '100%', paddingHorizontal: 20, paddingVertical: 20, borderColor: '#FFFFFF', marginVertical: 2, backgroundColor: '#151A3060' }]}
                                            onPress={() => props.navigation.navigate('taskdetail', { data: item })}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                                <Text style={{ color: '#FFFFFF', fontSize: 13, maxWidth: '65%', fontFamily: 'inter-regular' }}>{item.taskName}</Text>
                                                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'inter-medium' }}>{item.status}</Text>
                                            </View>
                                            {item.TimeStamp
                                                ?
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ color: '#B3B3B3', fontSize: 10, fontFamily: 'inter-regular', marginTop: 3 }}>{moment(new Date(item.TimeStamp)).format('hh:mm A')}</Text>
                                                    <Text style={{ color: '#B3B3B3', fontSize: 10, fontFamily: 'inter-regular', marginTop: 3 }}>{moment(new Date(item.TimeStamp)).format('DD-MMM-YYYY')}</Text>
                                                </View>
                                                :
                                                null}

                                        </TouchableOpacity>
                                    </SafeAreaView>
                                )
                        }}
                        ListEmptyComponent={() => renderEmptyAsset()} />
                    <View style={{ width: '80%', alignSelf: 'center' }}>

                        <Button appearance='filled' onPress={() => {
                            setTask('')
                            setSelectedPeople('')
                            setModalVisible(true)
                        }}>Add Task</Button>
                    </View>

                </View>

                <Modal
                    visible={modalVisible}
                    animationType="slide">
                    <View style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC58', }}>
                        <Card style={{ width: '95%', }}>
                            <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 20, width: '100%', }}
                                onPress={() => setModalVisible(false)}>
                                <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
                            </TouchableOpacity>
                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <Input
                                    placeholder="Enter task"
                                    value={task}
                                    onChangeText={setTask}
                                    size="large"
                                >
                                </Input>

                                <Select size="large" style={{ width: '100%', marginTop: 20 }} label='Select team member'
                                    //   selectedIndex={selectedIndex}
                                    value={selectedPeople}
                                    onSelect={(index) => {
                                        const filteredPeople = [...peopleState.value.data.filter((item) => {
                                            if (item.designation !== 'Owner' && item.designation !== 'Manager') {
                                                return item
                                            }
                                        })];
                                        const selectedPerson = filteredPeople[index - 1];
                                        setUserID(selectedPerson.email);
                                        setSelectedPeople(selectedPerson.name);

                                    }}
                                >
                                    {peopleState.value.data
                                        .filter((item) => {
                                            if (item.designation !== 'Owner' && item.designation !== 'Manager') {
                                                return item
                                            }
                                        })
                                        .map((person, index) => (
                                            <SelectItem key={index} title={person.name} />
                                        ))}
                                </Select>
                                <Button
                                disabled={!task || !selectedPeople} onPress={() => {
                                    setModalVisible(false)
                                    setTaskArray([])
                                    setLoading(true)
                                    handleAddTask()
                                }} appearance="filled" status='primary' style={{ marginTop: 40, width: 200, marginBottom: 10 }}>Add</Button>
                            </View>


                        </Card>
                    </View>
                </Modal>
            </Layout>

            {dataLoading ? CustomActivityIndicator() : null}
        </>
    )
}

export default AssignTaskManagerScreen