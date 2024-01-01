
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions, Alert } from "react-native"
import styles from "../styles/styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath, Datepicker } from '@ui-kitten/components';
import { addDoc, collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../store/context/AuthContext";
import ImageView from "react-native-image-viewing";
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";






const sorting = [
    'Completed',
    'Pending',
    'Awaiting approval',
    'All'
]



const BranchExpensesScreen = (props) => {

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
    const { state: authState } = useContext(AuthContext)
    const [isFocusedFirstTime, setIsFocusedFirstTime] = useState(true);
    const [openImage, setOpenImage] = useState([])
    const [openImageVisible, setOpenImageVisble] = useState(false)
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const [date, setDate] = useState(new Date())
    const [fileUri, setFileUri] = useState(null)
    const [fileuploading, setFileuploading] = useState(0)
    const [uploadingStatus, setUploadingStatus] = useState(false)



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
        const snapshot = await getDocs(query(collection(db, 'BranchExpenses'), orderBy('dateCreated', 'asc')))

        snapshot.forEach((docs) => {
            list.push({ ...docs.data(), "id": docs.id })
        })

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
                'TimeStamp': new Date().getTime()
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

    const pickImage = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()

        if (cameraPermission.status == 'granted') {

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const manipResult = await manipulateAsync(result.assets[0].uri, [{ resize: { height: 600, width: 600 } }])
                setFileUri(manipResult.uri)
            }

        }


    };


    const uploadImage = async (resultimage) => {
        try {
            // convert image to blob image
            const blobImage = await new Promise((resole, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resole(xhr.response);
                };
                xhr.onerror = function () {
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", resultimage, true);
                xhr.send(null);
            });

            // Create the file metadata
            /** @type {any} */
            const metadata = {
                contentType: 'image/jpeg'
            };

            //upload image to firestore
            // Upload file and metadata to the object 'images/mountains.jpg'
            const storage = getStorage(app)
            const storageRef = ref(storage, 'BrachExpenses/' + new Date().getTime());
            const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {

                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setFileuploading(Math.round(progress))


                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    setLoading(false)
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;

                        // ...

                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // console.log('File available at', downloadURL)
                        if (downloadURL) {
                            addExpense(downloadURL)
                        }

                    });
                }
            );
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Try again')
            setLoading(false)
        }

    }

    const addExpense = async (downloadURL) => {

        try {
            await addDoc(collection(db, 'BranchExpenses'), {
                amount: amount,
                date: date.getTime(),
                note: note,
                dateCreated: new Date().getTime(),
                image: downloadURL
            })
                .then(() => {
                    // SuccessToast({text:'Item added'})
                    fetchData()
                })

        } catch (error) {
            Alert.alert('Error', 'Try again')
            setLoading(false)
        }

    }

    return (
        <>
            <Layout style={styles.mainLayout}>
                <View style={{ width: '100%', alignSelf: 'center', marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Input
                        style={{ width: '50%' }}
                        value={searchTask}
                        onChangeText={setSearchTask}
                        size='large'
                        label='Search Bill'></Input>



                </View>

                <View style={{ flex: 1, width: '100%' }}>

                    <FlatList style={{ width: '100%', marginVertical: 5, }}
                        data={selectedSort == 'All' ? taskArray : taskArray.filter(item => item.status === selectedSort)}
                        refreshing={false}
                        onRefresh={() => {
                            setLoading(true)
                            fetchData()
                        }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {

                            if (searchTask === "" || item.note.toLowerCase().includes(searchTask.toLowerCase()))
                                return (
                                    <SafeAreaView key={index} style={{ width: '100%', alignItems: 'center' }}>
                                        <TouchableOpacity style={[{ width: '100%', paddingHorizontal: 20, paddingVertical: 20, borderColor: '#FFFFFF', marginVertical: 2, backgroundColor: '#151A3060' }]}
                                            onPress={() => {
                                                const temp = []
                                                temp.push({
                                                    uri: item.image
                                                })
                                                setOpenImage(temp)
                                                setOpenImageVisble(true)
                                            }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                                <View style={{ flexDirection: 'column', flex: 1 }}>
                                                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'inter-medium' }}>{item.note}</Text>

                                                    {item.date
                                                        ?
                                                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'inter-regular' }}>{moment(new Date(item.date)).format('DD-MMM-YYYY')}</Text>
                                                        : null}
                                                </View>
                                                <View style={{ flexDirection: 'column', flex: 1, alignItems: 'flex-end' }}>
                                                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'inter-medium' }}>{(parseFloat(item.amount) || 0)}</Text>
                                                    {item.dateCreated
                                                        ?
                                                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'inter-regular' }}>{moment(new Date(item.dateCreated)).format('DD-MMM-YYYY')}</Text>
                                                        : null}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </SafeAreaView>
                                )
                        }}
                        ListEmptyComponent={() => renderEmptyAsset()} />
                    <View style={{ width: '80%', alignSelf: 'center' }}>

                        <Button appearance='filled' onPress={() => {
                            setAmount('')
                            setNote('')
                            setFileUri(null)
                            setDate(new Date())
                            setModalVisible(true)
                        }}>Add Expense</Button>
                    </View>

                </View>


                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onBackdropPress={() => setModalVisible(false)}
                    backdropStyle={{ backgroundColor: '#6B6B6B6A' }}>

                    <Card disabled style={{ width: 300, }}>
                        <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 20, width: '100%', }}
                            onPress={() => setModalVisible(false)}>
                            <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
                        </TouchableOpacity>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                            <Input
                                style={[{ width: '100%', marginVertical: 10 }]}
                                size="large"
                                label={() => {
                                    return (
                                        <Text style={{ marginBottom: 10 }}>Enter Amount</Text>
                                    )
                                }}
                                value={amount}
                                onChangeText={(txt) => setAmount(txt.replace(/[^0-9]/g, ''))}
                            />

                            <Input
                                style={[{ width: '100%', marginVertical: 10 }]}
                                size="large"
                                label={() => {
                                    return (
                                        <Text style={{ marginBottom: 10 }}>Enter Note</Text>
                                    )
                                }}
                                value={note}
                                onChangeText={setNote}

                            />

                            <Datepicker
                                style={{ marginVertical: 10, width: '100%', marginBottom: 20 }}
                                date={date}
                                max={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                                onSelect={nextDate => {
                                    setDate(nextDate)
                                }}
                                label={() => {
                                    return (
                                        <Text style={styles.labelStyle}>Select Date</Text>
                                    )
                                }}
                                accessoryRight={() => {
                                    return (
                                        <Image style={{ width: 20, height: 20 }} tintColor='grey' source={require('../../assets/calendar_icon.png')}></Image>
                                    )
                                }}
                            />

                            {fileUri
                                ?
                                <TouchableOpacity onPress={() => {
                                    // setLoading(true)
                                    pickImage()
                                }}>
                                    <Image style={{ height: 100, width: 100, }} source={{ uri: fileUri }} />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={{ height: 100, width: 100, borderWidth: 1, justifyContent: 'center', alignItems: 'center', }} onPress={() => {
                                    // setLoading(true)
                                    pickImage()
                                }}>

                                    <Image style={{ height: 20, width: 20 }}
                                        source={require('../../assets/add_photo_icon.png')}
                                        tintColor='#67E9DA'></Image>
                                    <Text style={{ color: '#30E0CB' }}>Add Photo</Text>

                                </TouchableOpacity>
                            }


                            <Button onPress={() => {
                                setModalVisible(false)
                                setLoading(true)
                                setTaskArray([])
                                uploadImage(fileUri)
                            }}
                                disabled={amount.trim() == '' || fileUri == null ? true : false} status='primary' style={{ marginTop: 20, width: 200, marginBottom: 10 }}>
                                {evaProps => <Text style={[evaProps.style, { fontFamily: 'inter-regular', fontWeight: 'normal' }]}>Add</Text>}
                            </Button>
                        </View>
                    </Card>

                </Modal>
                <ImageView
                    images={openImage}
                    imageIndex={0}
                    visible={openImageVisible}
                    onRequestClose={() => setOpenImageVisble(false)}
                />
            </Layout>

            {dataLoading ? CustomActivityIndicator() : null}
        </>
    )
}

export default BranchExpensesScreen