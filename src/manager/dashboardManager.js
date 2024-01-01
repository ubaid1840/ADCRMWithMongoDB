import { ActivityIndicator, ScrollView } from "react-native"
import { View, SafeAreaView, Image } from "react-native"
import { ApplicationProvider, Layout, Text, useTheme } from '@ui-kitten/components';
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../store/context/AuthContext";
import { PeopleContext } from "../store/context/PeopleContext";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs, getFirestore, or, query, where } from "firebase/firestore";
import styles from "../styles/styles";
import app from "../config/firebase";
import axios from "axios";


const DashboardManagerScreen = (props) => {

    const db = getFirestore(app)

    const theme = useTheme()
    const { state: authState, setAuth } = useContext(AuthContext)
    const { state: peopleState } = useContext(PeopleContext)

    const [loading, setLoading] = useState(true)
    const [taskArray, setTaskArray] = useState([])
    const [openTask, setOpenTask] = useState([])
    const [closedTask, setClosedTask] = useState([])

    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            setLoading(true)
            fetchData()
        });

        return unsubscribe;
    }, [props.navigation])


    const fetchData = async () => {
        let list = []

        try {
            await getDocs(query(collection(db, 'Tasks'), or(where('assignedTo', '==', authState.value.data.email), where('assignedBy', '==', authState.value.data.email))))
                .then((snapshot) => {
                    let list = []
                    snapshot.forEach((docs) => {
                        list.push(docs.data())
                    })
                    setOpenTask([...list.filter(item => item.status != 'Completed')])
                    setClosedTask([...list.filter(item => item.status == 'Completed')])
                    setTaskArray(list)
                    setLoading(false)
                })
        } catch (error) {
            //console.log(error)
            setTaskArray([])
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
        <Layout style={{ flex: 1, }}>
            <ScrollView style={{ flex: 1, }}
                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>

                <Layout style={[{ borderRadius: 5, width: 220, height: 100 }, { backgroundColor: theme['color-info-700'], justifyContent: 'center', padding: 20, marginHorizontal: 5 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{}}>
                            <Image style={{ height: 35, width: 35 }} resizeMode='contain' source={require('../../assets/outofstock_icon.png')} tintColor={"white"}></Image>
                        </View>
                        <View style={{ marginLeft: 20 }}>
                            <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>Team Open Task</Text>
                            <Text style={{ fontFamily: 'inter-regular', fontSize: 20, }}>{openTask.length}</Text>
                        </View>
                    </View>
                </Layout>

                <Layout style={[{ borderRadius: 5, width: 220, height: 100, marginTop:30 }, { backgroundColor: theme['color-danger-700'], justifyContent: 'center', padding: 20, marginHorizontal: 5 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{}}>
                            <Image style={{ height: 35, width: 35 }} resizeMode='contain' source={require('../../assets/outofstock_icon.png')} tintColor={"white"}></Image>
                        </View>
                        <View style={{ marginLeft: 20 }}>
                            <Text style={{ fontFamily: 'inter-regular', fontSize: 14 }}>My Open Task</Text>
                            <Text style={{ fontFamily: 'inter-regular', fontSize: 20, }}>{openTask.length}</Text>
                        </View>
                    </View>
                </Layout>

            </ScrollView>

            {loading ? CustomActivityIndicator() : null}
        </Layout>
    )
}

export default DashboardManagerScreen