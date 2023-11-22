
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { addDoc, collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../store/context/AuthContext";
import moment from 'moment'
import { TaskContext } from "../store/context/TaskContext";
import axios from "axios";

const sorting = [
    'Completed',
    'Pending',
    'All'
]

const MyTaskManagerScreen = (props) => {

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

    const { state: taskState, setTaskList } = useContext(TaskContext)
    const { state: authState } = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            setTask('')
            setSelectedPeople('None')
            setSearchTask('')
            setLoading(true)
            fetchData()
        });

        return unsubscribe;
    }, [props.navigation])


    const fetchData = async () => {

        let list = []

        const snapshot = await getDocs(query(collection(db, 'Tasks'), where('assignedTo', '==', authState.value.data.email)))

        snapshot.forEach((docs) => {
            list.push({...docs.data(), "id" : docs.id})
        })

        const updatedList = list.filter((item) => {
            if (item.TimeStamp) {
                if (moment(new Date(item.TimeStamp)).format('DD-MMMM-YYYY').toString() == moment(new Date()).format("DD-MMMM-YYYY").toString()) {
                    return item
                }
            }
        })

        setTaskList(updatedList)
        setTaskArray(updatedList)
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
            await addDoc(collection(db, 'Tasks'),{
                'taskName': task,
                'assignedTo': authState.value.data.email,
                'status': 'Pending',
                'TimeStamp' : new Date().getTime()
            })

            fetchData()

        } catch (error) {
            console.log(error)
            setLoading(false)
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

                <View style={{ flex: 1, width: '100%' }}>

                    <FlatList style={{ width: '100%', marginVertical: 5, }}
                        data={taskArray}
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
                                        <TouchableOpacity style={[{ width: '100%', paddingHorizontal: 20, paddingVertical: 20, borderColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 2, backgroundColor: '#151A3060' }]}
                                            onPress={() => props.navigation.navigate('taskdetail', { data: item })}>

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


export default MyTaskManagerScreen