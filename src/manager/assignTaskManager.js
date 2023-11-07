
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import axios from "axios";


const sorting = [
    'Completed',
    'Pending',
    'Undefined'
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
    const [selectedPeople, setSelectedPeople] = useState('None')
    const [taskArray, setTaskArray] = useState([])
    const [userID, setUserID] = useState(0)

    const [selectedSort, setSelectedSort] = useState('Undefined')

    const { state: peopleState, setPeople } = useContext(PeopleContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);


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

        try {
            
            await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/tasks`)
            .then((response)=>{
                list = [...response.data]
                setTaskArray(list)
                setLoading(false)
            })
        } catch (error) {
            console.log(error)
            setTaskArray([])
            setLoading(false)
        }

    }

    const renderEmptyAsset = () => {
        if (loading == true) {
            return (
                <View style={{ marginTop: 50 }}>
                    <ActivityIndicator color="#57D1D7" size='Large' />
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
                'status': 'Pending'   
            }
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/tasks`,newTask)
            .then((response)=>{
                console.log(response.data)
            })
            fetchData()

        } catch (error) {
            console.log(error)
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
            <Layout style={{ flex: 1, alignItems: 'center', paddingVertical: 10, }}>
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
                        data={selectedSort == 'Undefined' ? taskArray : taskArray.filter(item => item.status === selectedSort)}
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
                                        <TouchableOpacity style={[{ width: '100%', paddingHorizontal: 20, paddingVertical: 20, borderColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 2, backgroundColor: '#151A3060' }]}
                                            onPress={() => {
                                                // console.log(item)
                                                props.navigation.navigate('taskdetailmanager', { data: item })
                                                }}>

                                            <Text style={{ color: '#FFFFFF', fontSize: 13, maxWidth: '65%', fontFamily: 'inter-regular' }}>{item.taskName}</Text>
                                            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'inter-medium' }}>{item.status}</Text>
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
                                        setUserID(peopleState.value.data[index - 1]._id)
                                        setSelectedPeople(peopleState.value.data[index - 1].name)
                                    }}
                                >
                                    {peopleState.value.data.map((item, index) => {
                                        if(item.designation != 'Owner')
                                        return (
                                            <SelectItem key={index} title={item.name} />
                                        )
                                    })}
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

export default AssignTaskManagerScreen