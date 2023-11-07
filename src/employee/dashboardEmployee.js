import { ActivityIndicator, ScrollView } from "react-native"
import { View, SafeAreaView } from "react-native"
import { ApplicationProvider, Layout, Text } from '@ui-kitten/components';
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../store/context/AuthContext";
import { PeopleContext } from "../store/context/PeopleContext";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import styles from "../styles/styles";
import app from "../config/firebase";
import moment from "moment";
import { TaskContext } from "../store/context/TaskContext";
import axios from "axios";


const DashboardEmployeeScreen = (props) => {

    const db = getFirestore(app)

    const { state: authState, setAuth } = useContext(AuthContext)
    const { state: peopleState } = useContext(PeopleContext)
    const {state : taskState, setTaskList} = useContext(TaskContext)

    const [loading, setLoading] = useState(true)
    const [openTask, setOpenTask] = useState([])
    const [closedTask, setClosedTask] = useState([])

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
                setLoading(true)
            };
        }, [isFocusedFirstTime])
    );


    const fetchData = async () => {

        let list = []
        await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/tasks`)
        .then((response)=>{
            list = [...response.data]
            list.sort((a, b) => b.TimeStamp - a.TimeStamp)
            const list1 = [...list.filter(item => item.assignedTo === authState.value.data._id)]

            const updatedList = list1.filter((item) => {
                if (item.TimeStamp) {
                    if (moment(new Date(item.TimeStamp)).format('DD-MMMM-YYYY').toString() == moment(new Date()).format("DD-MMMM-YYYY").toString()) {
                        return item
                    }
                }
            })
            setTaskList(updatedList)
            setOpenTask([...list1.filter(item => item.status != 'Completed')])
            setClosedTask([...list1.filter(item => item.status == 'Completed')])
            setLoading(false)
        })
    }


    

    const CustomActivityIndicator = () => {
        return (
            <View style={styles.activityIndicatorStyle}>
                <ActivityIndicator color="#57D1D7" size="large" />
            </View>
        );
    };

    return (
        <Layout style={{ flex: 1, }}>
            <ScrollView style={{ flex: 1, }}
                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Text style={{ fontSize:50,}}>{openTask.length}</Text>
                <Text style={{ fontSize: 14 }}>Tasks Open</Text>
                <Text style={{ fontSize: 50, marginTop: 40 }}>{closedTask.length}</Text>
                <Text style={{ fontSize: 14 }}>Tasks closed</Text>
            </ScrollView>
            {loading ? CustomActivityIndicator() : null}
        </Layout>
    )
}

export default DashboardEmployeeScreen