import { ActivityIndicator, ScrollView } from "react-native"
import { View, SafeAreaView } from "react-native"
import { ApplicationProvider, Layout, Text } from '@ui-kitten/components';
import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../store/context/AuthContext";
import { PeopleContext } from "../store/context/PeopleContext";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import styles from "../styles/styles";
import app from "../config/firebase";
import axios from "axios";


const DashboardScreen = (props) => {

    const db = getFirestore(app)

    const { state: authState, setAuth } = useContext(AuthContext)
    const { state: peopleState } = useContext(PeopleContext)

    const [loading, setLoading] = useState(true)
    const [taskArray, setTaskArray] = useState([])
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
                setTaskArray([])
                setLoading(true)
            };
        }, [isFocusedFirstTime])
    );

    const fetchData = async () => {
        fetchDataMongoDb()
        // let list = []

        // await getDocs(collection(db, 'Tasks'))
        //     .then((snapshot) => {
        //         snapshot.forEach((docs) => {
        //             list.push(docs.data())
        //         })
        //     })

        // setOpenTask([...list.filter(item => item.status !== 'Completed')])
        // setClosedTask([...list.filter(item => item.status === 'Completed')])
        // setTaskArray(list)
        // setLoading(false)
    }

    const fetchDataMongoDb = async () => {
        let list = []
        await axios.get(`https://fragile-hospital-gown-cow.cyclic.app/tasks`)
        .then((response)=>{
            list = [...response.data]
            setOpenTask([...list.filter(item => item.status !== 'Completed')])
            setClosedTask([...list.filter(item => item.status === 'Completed')])
            setTaskArray(list)
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
                <Text style={{ fontSize: 50 }}>{peopleState.value.data.length}</Text>
                <Text style={{ fontSize: 14 }}>Employees at work</Text>
                <Text style={{ fontSize:50, marginTop:40}}>{openTask.length}</Text>
                <Text style={{ fontSize: 14 }}>Tasks open</Text>
                <Text style={{ fontSize: 50, marginTop: 40 }}>{closedTask.length}</Text>
                <Text style={{ fontSize: 14 }}>Tasks closed</Text>
            </ScrollView>

            {loading ? CustomActivityIndicator() : null}
        </Layout>
    )
}

export default DashboardScreen