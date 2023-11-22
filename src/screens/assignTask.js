
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions, Alert } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../store/context/AuthContext";


const sorting = [
    'Completed',
    'Pending',
    'Awaiting approval',
    'All'
]



const AssignTaskScreen = (props) => {

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
    const [selectedPeople, setSelectedPeople] = useState('None')
    const [taskArray, setTaskArray] = useState([])
    const [userID, setUserID] = useState(0)

    const [selectedSort, setSelectedSort] = useState('All')

    const { state: peopleState, setPeople } = useContext(PeopleContext)
    const {state : authState} = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);


    useFocusEffect(
        useCallback(() => {
            if (!isFocusedFirstTime) {

                fetchData()
            }
            setIsFocusedFirstTime(false);

            return () => {
                setTask('')
                setSelectedPeople('None')
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

        let list = []

        // await getDocs(collection(db, 'Tasks'), orderBy('id', 'desc'))
        //     .then((snapshot) => {
        //         snapshot.forEach((docs) => {
        //             list.push(docs.data())
        //         })
        //     })
        await axios.get(`https://fragile-hospital-gown-cow.cyclic.app/tasks`)
            .then((response) => {
                list = [...response.data]
                list.sort((a, b) => {
                    return parseFloat(new Date(b.TimeStamp).getTime()) - parseFloat(new Date(a.TimeStamp).getTime())
                })
                setTaskArray(list)
                setLoading(false)
            })



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
            const newTask = {
                'taskName': task,
                'assignedTo': userID,
                'assignedBy' : authState.value.data._id,
                'status': 'Pending',
              
            }

            await axios.post(`https://fragile-hospital-gown-cow.cyclic.app/tasks`, newTask)
                .then((response) => {
                    //console.log(response.data)
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
                <View style={{ width: '90%', alignSelf: 'center', marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
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

                    {/* <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', marginTop:10, paddingHorizontal:20,}}>
                    <Text  status='info' style={{fontFamily:'inter-semibold', fontSize:20}}>Task</Text>
                    <Text status='info' style={{fontFamily:'inter-semibold', fontSize:20}}>Status</Text>
                </View> */}

                    <FlatList style={{ width: '100%', marginVertical: 5, }}
                        data={selectedSort == 'All' ? taskArray : taskArray.filter(item => item.status === selectedSort)}
                        refreshing={false}
                        onRefresh={() => {

                            setLoading(true)
                            fetchData()
                            // setAssetArray([])
                            // setSelectedItem(null)
                            // setItemSelect({})
                            // setLoading(true)
                            // fetchData()
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



                                            {/* <Text status="danger" style={{ color: '#FFFFFF', fontSize: 16 }}>Delete</Text>  */}
                                        </TouchableOpacity>
                                    </SafeAreaView>
                                )
                        }}
                        ListEmptyComponent={() => renderEmptyAsset()} />
                    <View style={{ width: '80%', alignSelf: 'center' }}>

                        <Button appearance='filled' onPress={() => {
                            setTask('')
                            setSelectedPeople('None')
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
                                        const filteredPeople = [...peopleState.value.data.filter((item) => item.designation !== 'Owner')];
                                        const selectedPerson = filteredPeople[index-1];
                                        setUserID(selectedPerson._id);
                                        setSelectedPeople(selectedPerson.name);
                                        
                                    }}
                                >
                                    {peopleState.value.data
                                        .filter((item) => item.designation !== 'Owner')
                                        .map((person, index) => (
                                            <SelectItem key={index} title={person.name} />
                                        ))}
                                </Select>
                                <Button onPress={() => {
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

export default AssignTaskScreen