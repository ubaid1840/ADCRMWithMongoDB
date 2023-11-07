import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions, Alert } from "react-native"
import styles from "../styles/styles";
import { useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Popover, Select, SelectItem } from '@ui-kitten/components';
import { collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, setDoc, where } from "firebase/firestore";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import axios from 'axios'



const columns = [
    'name',
    'designation',
    'company',
    'email',
    'Action'
]

const designationList = [
    'Manager',
    'Admin',
    'Sales'
]
// 






const PeopleScreen = (props) => {

    const db = getFirestore(app)


    const height = Dimensions.get('screen').height
    const width = Dimensions.get('screen').width

    const [loading, setLoading] = useState(false)
    const [searchPeople, setSearchPeople] = useState('')

    const [modalVisible, setModalVisible] = useState(false)

    const [email, setEmail] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(false)

    const [arrayIndex, setArrayIndex] = useState(-1)
    const [user, setUser] = useState([])
    const [id, setID] = useState('1')
    const [designation, setDesignation] = useState('None')

    const [name, setname] = useState('')

    const [isAddButtonActive, setIsAddButtonActive] = useState(true)

    useEffect(() => {


        if (email.includes('@') && email.includes('.com')) {
            setIsEmailValid(true)
        }
        else {
            setIsEmailValid(false)
        }
    }, [email])

    useEffect(() => {
        if (isEmailValid && designation != 'None') {
            setIsAddButtonActive(false)
        }
        else {
            setIsAddButtonActive(true)
        }
    }, [isEmailValid, designation])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        fetchDataMongoDb()
        // await getDocs(query(collection(db, 'AllowedUsers'), where('designation', '!=', 'Owner')))
        //     .then((snapshot) => {
        //         let list = []
        //         snapshot.forEach((docs) => {
        //             list.push(docs.data())
        //         })

        //         if (list.length != 0) {
        //             setUser(list)
        //             const sortedData = [...list.sort((a, b) => parseInt(b.id) - parseInt(a.id))]
        //             setID((parseInt(sortedData[0].id) + 1).toString())
        //         }
        //         setLoading(false)
        //     })
    }

    const fetchDataMongoDb = async () => {
        let list = []
        await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/user`)
            .then((response) => {
                list = [...response.data.filter(item => item.designation != 'Owner')]
                setUser(list)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
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
                <Text style={{ color: '#FFFFFF', fontSize: 16, marginVertical: 15, fontWeight: '700' }}>No user added</Text>
            </View>
        )
    }

    const addPeopleMongoDB = async (val) => {

        const alreadyHave = val.filter(item => item.email.toLocaleLowerCase() == email.toLocaleLowerCase())

        if (alreadyHave.length != 0) {
            Alert.alert('Failed', 'User already exists')
            fetchData()
        }
        else {
            const newUser = {
                'name': name,
                'email': email.toLocaleLowerCase(),
                'dp': '',
                'company': 'Senfeng',
                'designation': designation
            }
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/user`, newUser)
                .then((response) => {
                    console.log('Done')
                    Alert.alert('Success', 'User added successfully', [
                        {
                            text: 'Close',
                            onPress: () => fetchData()
                        }
                    ])

                })
                .catch((err) => {
                    console.log(err)
                    setLoading(false)
                })
        }
    }

    const handleAddPeople = async (val) => {

        const alreadyHave = val.filter(item => item.email.toLocaleLowerCase() == email.toLocaleLowerCase())


        if (alreadyHave.length != 0) {
            Alert.alert('Failed', 'User already exists')
            fetchData()
        }
        else {
            await setDoc(doc(db, 'AllowedUsers', email.toLocaleLowerCase()), {
                'name': name,
                'email': email.toLocaleLowerCase(),
                'dp': '',
                'company': 'Senfeng',
                'id': id,
                'designation': designation
            })
            Alert.alert('Success', 'User added successfully', [
                {
                    text: 'Close',
                    onPress: () => fetchData()
                }
            ])

        }
    }

    const handleDeletePeople = async (val) => {
        // await deleteDoc(doc(db, 'AllowedUsers', val.email))
        // fetchData()

       
        const userID = val._id
        const deleteUserUrl = `https://fragile-hospital-gown-cow.cyclic.app/${userID}`
        await axios.delete(deleteUserUrl)
            .then((response) => {
                console.log('Deleted')
                console.log(response.data)
               fetchData()

            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }

    return (
        <Layout style={[styles.mainLayout, { paddingTop: 10 }]}>
            <View style={{ width: '90%', alignSelf: 'center' }}>
                <Input
                    placeholder='Search people'
                    value={searchPeople}
                    onChangeText={setSearchPeople}
                    size='large'></Input>
            </View>

            <View style={{ flex: 1, width: '100%' }}>

                <FlatList style={{ width: '100%', marginVertical: 20, }}
                    data={user}
                    keyExtractor={item => item.email}
                    refreshing={false}
                    onRefresh={() => {
                        // setAssetArray([])
                        // setSelectedItem(null)
                        // setItemSelect({})
                        // setLoading(true)
                        // fetchData()
                        setLoading(true)
                        setUser([])
                        fetchData()

                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {

                        if (searchPeople === "" || item.name.toLowerCase().includes(searchPeople.toLowerCase()))
                            return (
                                <SafeAreaView style={{ width: '100%', alignItems: 'center' }}>
                                    <TouchableOpacity style={[{ width: '80%', paddingVertical: 5, borderColor: '#FFFFFF', justifyContent: 'space-between', marginVertical: 10, flexDirection: 'row', alignItems: 'center' }]}
                                        onPress={() => {
                                            setArrayIndex(index)
                                        }} >
                                        <Text style={{ fontSize: 16 }}>{item.name.toLocaleUpperCase()}</Text>
                                        {/* <Text status="danger" style={{ color: '#FFFFFF', fontSize: 16 }}>Delete</Text>  */}
                                        <Button onPress={() => {
                                            Alert.alert('Confirm', 'Are you sure you want to delete?', [
                                                {
                                                    text: 'No',
                                                    style: 'cancel',
                                                },
                                                {
                                                    text: 'Yes',
                                                    onPress: () => {
                                                        setLoading(true)
                                                        setUser([])
                                                        handleDeletePeople(item)
                                                    }
                                                }
                                            ])
                                        }} status="danger"  >Delete</Button>
                                    </TouchableOpacity>
                                </SafeAreaView>
                            )
                    }}
                    ListEmptyComponent={() => renderEmptyAsset()} />
                <View style={{ width: '80%', alignSelf: 'center' }}>

                    <Button appearance='filled' onPress={() => {
                        setname('')
                        setDesignation('None')
                        setEmail('')
                        setModalVisible(true)
                    }}>Add People</Button>
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
                                style={[{ width: '100%', }]}
                                size="large"
                                label="Enter Name"
                                value={name}
                                onChangeText={setname}
                            />

                            <Input
                                style={[{ width: '100%', marginTop: 20 }]}
                                label="Enter email"
                                value={email}

                                onChangeText={setEmail}
                                size="large"
                                caption={() => {
                                    return (
                                        !isEmailValid
                                            ?
                                            <Text style={{ color: 'red', fontSize: 12, marginTop: 5, marginLeft: 5 }}>Enter valid email</Text>
                                            : null
                                    )
                                }}>
                            </Input>
                            <Select size="large" style={{ width: '100%', marginTop: 20 }} label='Assign designation'
                                //   selectedIndex={selectedIndex}
                                value={designation}
                                onSelect={(index) => {
                                    setDesignation(designationList[index - 1])
                                }}
                            >
                                {designationList.map((item, index) => {
                                    return (
                                        <SelectItem key={index} title={item} />
                                    )
                                })}
                            </Select>
                            <Button onPress={() => {
                                setModalVisible(false)
                                setLoading(true)
                                const temp = [...user]
                                setUser([])
                                // handleAddPeople(temp)
                                addPeopleMongoDB(temp)
                            }}
                                disabled={isAddButtonActive} status='primary' style={{ marginTop: 40, width: 200, marginBottom: 10 }}>Add</Button>
                        </View>
                    </Card>
                </View>
            </Modal>
        </Layout>
    )
}

export default PeopleScreen