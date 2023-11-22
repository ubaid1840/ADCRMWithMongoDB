
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../store/context/AuthContext";
import axios from "axios";

const sorting = [
    'Completed',
    'Pending',
    'All'
]

const TaskListHistoryEmployeeScreen = (props) => {

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
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);
    const { state: authState } = useContext(AuthContext)


    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            setTask('')
            setSelectedPeople('None')
            setSearchTask('')
            setLoading(true)
            fetchData()
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [props.navigation])

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
        await getDocs(collection(db, 'Tasks'))
        .then((snapshot)=>{
            snapshot.forEach((docs)=>{
                list.push({...docs.data(), 'id' : docs.id })
            })
        })

        list.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime())
        const updatedList = list.filter(item => item.assignedTo === authState.value.data.email)
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
            let list = []
            await getDocs(query(collection(db, 'Tasks'), orderBy('id', 'desc')))
                .then((snapshot) => {
                    snapshot.forEach((docs) => {
                        list.push(docs.data())
                    })
                })
            let id = '1'
            if (list.length != 0) {
                id = (parseInt(list[0].id) + 1).toString()
            }

            setDoc(doc(db, 'Tasks', id), {
                'id': id.toString(),
                'taskName': task,
                'assignedTo': userID,
                'TimeStamp': serverTimestamp(),
                'status': 'Pending'
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
            <Layout style={styles.mainLayout}>
                <View style={{ width: '100%', alignSelf: 'center', marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
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
                                        <TouchableOpacity style={[{ width: '100%', paddingHorizontal: 20, paddingVertical: 20, borderColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 2, backgroundColor: '#151A3060' }]}
                                            onPress={() => props.navigation.navigate('taskdetailemployee', { data: item })}>

                                            <Text style={{ color: '#FFFFFF', fontSize: 13, maxWidth: '65%', fontFamily: 'inter-regular' }}>{item.taskName}</Text>
                                            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'inter-medium' }}>{item.status}</Text>
                                            {/* <Text status="danger" style={{ color: '#FFFFFF', fontSize: 16 }}>Delete</Text>  */}
                                        </TouchableOpacity>
                                    </SafeAreaView>
                                )
                        }}
                        ListEmptyComponent={() => renderEmptyAsset()} />
                </View>
            </Layout>

            {dataLoading ? CustomActivityIndicator() : null}
        </>
    )
}

export default TaskListHistoryEmployeeScreen