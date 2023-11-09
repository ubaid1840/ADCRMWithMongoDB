import { View, TouchableOpacity, Image, Platform } from "react-native"
import Constants from "expo-constants";
import { ApplicationProvider, Layout, Text, Button, Input, Card, useTheme } from '@ui-kitten/components';
import { useContext, useState } from "react";
import * as eva from '@eva-design/eva'
import { PeopleContext } from "../store/context/PeopleContext";
import moment from 'moment'
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import app from "../config/firebase";
import axios from "axios";



const TaskDetailManagerScreen = (props) => {

    const db = getFirestore(app)
    const [data, setData] = useState(props.route.params.data)
    const theme = useTheme()
    const [loading, setLoading] = useState(false)

    const { state: peopleState } = useContext(PeopleContext)

    const handleUpdateStatus = async (val) => {
        const id = data._id
        const newTask = {
            'status': val,   
        }
        try {
            await axios.put(`https://fragile-hospital-gown-cow.cyclic.app/tasks/${id}`, newTask)
            .then((response)=>{
                console.log(response.data)
                fetchData()
            })

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const fetchData = async () => {
        const id = data._id
        try {
            await axios.get(`https://fragile-hospital-gown-cow.cyclic.app/tasks/${id}`)
            .then((response) => {
                setData(response.data)
                setLoading(false)
            })
        } catch (error) {
            console.log(error)
            setData(props.route.params.data)
            setLoading(false)
        }
      

    }

    return (
        <Layout style={{ flex: 1, alignItems: 'center', paddingVertical: 10, }} >
            <View style={{ width: '100%', height: 50, backgroundColor: '#232f3f', flexDirection: 'row', marginTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0, alignItems: 'center' }}>
                <View style={{ position: 'absolute', left: 10 }}>
                    <TouchableOpacity onPress={() => {
                        props.navigation.goBack()
                    }}>
                        <Image style={{ height: 30, width: 30 }} source={require('../../assets/backarrow_icon.png')} tintColor='#FFFFFF'></Image>
                    </TouchableOpacity>
                </View>
            </View>

            <Card theme={{ ...eva.light }} status="primary" style={{ marginTop: 40, width: '95%', backgroundColor: theme.light }}>
                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={{ maxWidth: '48%' }}>Task number</Text>
                    <Text style={{ maxWidth: '48%' }}>{data.id}</Text>
                </View> */}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={{ maxWidth: '48%' }}>Status</Text>
                    {loading
                        ?
                        <ActivityIndicator />
                        :
                        <Text style={{ maxWidth: '48%' }}>{data.status}</Text>
                    }

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={{ maxWidth: '48%' }}>Assigned Date</Text>
                    {data.TimeStamp
                        ?
                        <Text style={{ maxWidth: '48%' }}>{moment(new Date(data.TimeStamp)).format('DD-MMMM-YYYY')}</Text>
                        : null
                    }

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={{ maxWidth: '48%' }}>Assigned To</Text>
                    <Text style={{ maxWidth: '48%' }}>{peopleState.value.data.find((item) => item._id === data.assignedTo)?.name || 'Unknown person'}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                    <Text style={{ maxWidth: '48%' }}>Assignee email</Text>
                    <Text style={{ maxWidth: '48%' }}>{peopleState.value.data.find((item) => item._id === data.assignedTo)?.email || 'Unknown email'}</Text>
                </View>
            </Card>

            <Card status='danger' appearance="outline" style={{ width: '95%', marginTop: 30 }}>
                <Text >Assigned Task</Text>
                <Text style={{ marginTop: 10 }}>{data.taskName}</Text>
            </Card>


            <View style={{ flex: 1, justifyContent: 'flex-end', width: '90%' }}>
                {data.status != 'Completed'
                    ?
                    <Button onPress={() => {
                        setLoading(true)
                        handleUpdateStatus('Completed')
                    }}>Mark as Completed</Button>
                    :
                    <Button status="danger" onPress={() => {
                        setLoading(true)
                        handleUpdateStatus('Pending')
                    }}>Mark as Pending</Button>
                }
            </View>



        </Layout>
    )
}

export default TaskDetailManagerScreen