import { View, TouchableOpacity, Image, Platform, Alert, FlatList, ScrollView, Dimensions } from "react-native"
import Constants from "expo-constants";
import { ApplicationProvider, Layout, Text, Button, Input, Card, useTheme, Modal } from '@ui-kitten/components';
import { useContext, useEffect, useRef, useState } from "react";
import * as eva from '@eva-design/eva'
import { PeopleContext } from "../store/context/PeopleContext";
import moment from 'moment'
import { deleteDoc, doc, getDoc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import app from "../config/firebase";
import styles from "../styles/styles";
import axios from "axios";
import { AuthContext } from "../store/context/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import ImageView from "react-native-image-viewing";
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';


const TaskDetailScreen = (props) => {

    const db = getFirestore(app)
    const [data, setData] = useState(props.route.params.data)
    const theme = useTheme()
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const { state: authState } = useContext(AuthContext)

    const { state: peopleState } = useContext(PeopleContext)
    const [comments, setComments] = useState(props.route.params.data.comments ? props.route.params.data.comments : [])
    const flatlistRef = useRef()
    const [addComment, setAddComment] = useState("")
    const [modalVisible, setModalVisible] = useState(false)
    const [image, setImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [openImage, setOpenImage] = useState([])
    const [openImageVisible, setOpenImageVisble] = useState(false)

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'Tasks', data.id), (doc) => {
            if (doc.data()) {
                setData({ ...doc.data(), 'id': doc.id })
                if (doc.data().comments) {
                    setComments(doc.data().comments)
                }
                setLoading(false)
                setDataLoading(false)
            }
            else {
                props.navigation.goBack()
            }
        })
        return () => unsubscribe()

    }, [])

    const handleUpdateStatus = async (val) => {
        try {
            await updateDoc(doc(db, 'Tasks', data.id), {
                'status': val,
            })
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'error')
            setLoading(false)
        }
    }


    const handleUpdateCommentAndImage = async () => {
        const downloadURL = await uploadImageToFirebase(image)
        if (downloadURL) {
            const id = data._id
            const oldComments = [...comments]
            oldComments.push({
                'sendBy': authState.value.data.name,
                'msg': addComment,
                'timeStamp': new Date().getTime(),
                'image': downloadURL
            })
            const udpatedComments = {
                'comments': oldComments,
            }

            try {
                await updateDoc(doc(db, 'Tasks', data.id), {
                    'comments': udpatedComments
                })
                    .then(() => {
                        setAddComment("")
                        setImage(null)
                    })

            } catch (error) {
                console.log(error)
                setDataLoading(false)
            }
        }
        else {
            Alert.alert('Error', 'Failed to upload image')
        }
    }

    const handleUpdateComment = async () => {
        const oldComments = [...comments]
        const msg = addComment
        setAddComment('')
        oldComments.push({
            'sendBy': authState.value.data.name,
            'msg': msg,
            'timeStamp': new Date().getTime()
        })

        try {
            await updateDoc(doc(db, 'Tasks', data.id), {
                'comments': oldComments,
            })

        } catch (error) {
            console.log(error)
            setDataLoading(false)
        }
    }



    const CustomActivityIndicator = () => {
        return (
            <View style={styles.activityIndicatorStyle}>
                <ActivityIndicator color="#57D1D7" size="large" />
            </View>
        );

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
            <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 40 }}>
                <View style={{ height: 70, width: 70, borderRadius: 55, backgroundColor: '#24303E', justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={{ height: 40, width: 40 }} source={require('../../assets/profile_icon.png')} tintColor='#5B6D84'></Image>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 12, marginVertical: 15, fontWeight: '700' }}>No Comments</Text>
            </View>
        )
    }

    const uploadImageToFirebase = async (uri) => {

        return new Promise(async (resolve, reject) => {
            const blobImage = await new Promise((resole, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resole(xhr.response);
                };
                xhr.onerror = function () {
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = "blob";
                xhr.open("GET", uri, true);
                xhr.send(null);
            });

            // Create the file metadata
            /** @type {any} */
            const metadata = {
                contentType: 'image/jpeg'
            };

            //upload image to firestore
            const storage = getStorage(app)
            const storageRef = ref(storage, `CommentImages/${new Date().getTime()}`);
            const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {

                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(parseFloat(progress).toFixed(2))


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
                    switch (error.code) {
                        case 'storage/unauthorized':
                            break;
                        case 'storage/canceled':
                            break;


                        case 'storage/unknown':
                            break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // dbUpdate(downloadURL)
                        console.log(downloadURL)
                        resolve(downloadURL);
                    }).catch((error) => {
                        reject(null);
                    })
                }
            );
        })
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
                setImage(manipResult.uri)
                setImageLoading(false)
            }
            if (result.canceled) {
                setImageLoading(false)
            }

        }


    };



    const handleApproval = async () => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek == 7) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        try {
            await updateDoc(doc(db, 'Tasks', data.id), {
                'status': 'Pending',
                'TimeStamp': new Date(currentDate).getTime()
            })

        } catch (error) {
            console.log(error)
            Alert.alert('Error', "error")
            setLoading(false)
        }
    }

    const handleDeleteTask = async () => {

        try {
            await deleteDoc(doc(db, "Tasks", data.id))
                .then(() => {
                    props.navigation.goBack()
                    setDataLoading(false)
                })
        } catch (error) {
            console.log(error)
            setDataLoading(false)
            Alert.alert('Error', 'error')
        }
    }

    return (
        <Layout style={styles.mainLayout} >
            <View style={{ width: '100%', height: 50, flexDirection: 'row', marginTop: Platform.OS == 'android' ? Constants.statusBarHeight + 5 : 0, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>

                <TouchableOpacity onPress={() => {
                    props.navigation.goBack()
                }}>
                    <Image style={{ height: 30, width: 30 }} source={require('../../assets/backarrow_icon.png')} tintColor='#FFFFFF'></Image>
                </TouchableOpacity>
                {data.status == 'Awaiting approval' && data.designation == 'Owner'
                    ?
                    <Button size="small" status="danger" onPress={() => {
                        setModalVisible(true)
                    }}>Update</Button>
                    :
                    data.status == 'Awaiting approval' && data.designation != 'Owner'
                        ? null
                        :
                        <Button size="small" status="danger" onPress={() => {
                            setModalVisible(true)
                        }}>Update</Button>
                }






            </View>

            <ScrollView style={{ width: '100%', flex: 1 }}
                contentContainerStyle={{ alignItems: 'center', }}>

                <Card theme={{ ...eva.light }} status="primary" style={{ marginTop: 40, width: '100%', backgroundColor: theme.light }}>


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
                        <Text style={{ maxWidth: '48%' }}>{peopleState.value.data.find((item) => item.email === data.assignedTo)?.name || 'Unknown person'}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <Text style={{ maxWidth: '48%' }}>Assignee email</Text>
                        <Text style={{ maxWidth: '48%' }}>{peopleState.value.data.find((item) => item.email === data.assignedTo)?.email || 'Unknown email'}</Text>
                    </View>
                </Card>

                <Card status='danger' appearance="outline" style={{ width: '100%', marginTop: 30 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text >Assigned Task</Text>
                        <TouchableOpacity onPress={() => {
                            Alert.alert('Confirmation', "Are you sure you want to delete?", [
                                {
                                    text: 'No',
                                    onPress: null,

                                },
                                {
                                    text: 'Yes',
                                    onPress: () => {
                                        setDataLoading(true)
                                        handleDeleteTask()
                                    }
                                }
                            ])
                        }}>
                            <Image style={{ height: 30, width: 30, marginRight: 10 }} tintColor='red' source={require('../../assets/delete_icon.png')} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginTop: 10 }}>{data.taskName}</Text>
                </Card>
            </ScrollView>
            <Layout style={{ width: '100%', marginTop: 20, flex: 1, }} >
                <Text >Comments</Text>
                <View style={{ width: 'auto', borderColor: 'white', borderBottomWidth: 1, marginVertical: 10 }}></View>
                <FlatList
                    showsVerticalScrollIndicator
                    style={{}}
                    data={comments}
                    ref={flatlistRef}
                    onContentSizeChange={() => {
                        if (comments.length != 0) {
                            flatlistRef.current.scrollToEnd({ animated: true })
                        }
                    }}
                    onLayout={() => {
                        if (comments.length != 0) {
                            flatlistRef.current.scrollToEnd()
                        }
                    }}
                    ListEmptyComponent={() => renderEmptyAsset()}
                    renderItem={({ item, index }) => {
                        if (item.sendBy == authState.value.data.name) {
                            return (
                                <View key={index} style={{ width: '70%', marginVertical: 10, paddingHorizontal: 20, alignItems: 'flex-start', alignSelf: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'inter-semibold', fontSize: 13 }}>{item.sendBy}</Text>
                                    <Text style={{ fontFamily: 'inter-regular', fontSize: 12, marginVertical: 5, color: '#AAAAAA' }}>{new Date(item.timeStamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: '2-digit' }) + " " + new Date(item.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                                    {item.image ?
                                        <TouchableOpacity onPress={() => {
                                            const temp = []
                                            temp.push({
                                                uri: item.image
                                            })
                                            setOpenImage(temp)
                                            setOpenImageVisble(true)
                                        }}>
                                            <Image style={{ height: 150, width: 150, marginBottom: 5 }} source={{ uri: item.image }}></Image>
                                        </TouchableOpacity>
                                        :
                                        null}
                                    <Text style={{ fontFamily: 'inter-regular', fontSize: 13 }}>{item.msg}</Text>
                                </View>
                            )
                        }
                        else {
                            return (
                                <View key={index} style={{ width: '70%', marginVertical: 10, paddingHorizontal: 20, alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                                    <Text style={{ fontFamily: 'inter-semibold', fontSize: 13 }}>{item.sendBy}</Text>
                                    <Text style={{ fontFamily: 'inter-regular', fontSize: 12, marginVertical: 5, color: '#AAAAAA' }}>{new Date(item.timeStamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: '2-digit' }) + " " + new Date(item.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                                    {item.image ?
                                        <TouchableOpacity onPress={() => {
                                            const temp = []
                                            temp.push({
                                                uri: item.image
                                            })
                                            setOpenImage(temp)
                                            setOpenImageVisble(true)
                                        }}>
                                            <Image style={{ height: 150, width: 150, marginBottom: 5 }} source={{ uri: item.image }}></Image>
                                        </TouchableOpacity>
                                        :
                                        null}
                                    <Text style={{ fontFamily: 'inter-regular', fontSize: 13 }}>{item.msg}</Text>
                                </View>
                            )
                        }
                    }} />


                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding:10, marginBottom:5, }}>
                    <View style={{ flex: 1, }}>
                        <Input
                            style={{ width: '100%' }}
                            value={addComment}
                            onChangeText={setAddComment}
                            size='large'
                            accessoryRight={() => {
                                return (

                                    imageLoading
                                        ?
                                        <ActivityIndicator color="#57D1D7" size="small" />
                                        : image != null
                                            ?
                                            <>
                                                <TouchableOpacity style={{ position: 'absolute', zIndex: 1, top: 20, right: 17 }}
                                                    onPress={() => {
                                                        setImage(null)
                                                    }}>
                                                    <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
                                                </TouchableOpacity>
                                                <Image style={{ height: 40, width: 40, opacity: 0.5 }} resizeMode="contain" source={{ uri: image }} />
                                            </>
                                            :
                                            <TouchableOpacity onPress={() => {
                                                setImageLoading(true)
                                                pickImage()
                                            }}>
                                                <Image style={{ height: 25, width: 25 }} resizeMode="contain" source={require('../../assets/camera_icon.png')} tintColor='#DDDDDD' />
                                            </TouchableOpacity>
                                )
                            }}
                        ></Input>
                    </View>

                    <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => {
                        if (image == null) {
                            handleUpdateComment()
                        }

                        else {
                            setDataLoading(true)
                            handleUpdateCommentAndImage()
                        }

                    }}>
                        <Image style={{ height: 25, width: 25 }} source={require('../../assets/comment_icon.png')} />
                    </TouchableOpacity>
                </View>
            </Layout>

            {dataLoading ? CustomActivityIndicator() : null}

            <Modal
                visible={modalVisible}
                animationType="slide">
                <View style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC58', }}>
                    <Card style={{ width: '95%', }}>
                        <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 20, width: '100%', }}
                            onPress={() => setModalVisible(false)}>
                            <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
                        </TouchableOpacity>
                        {data.status == 'Awaiting approval'
                            ?
                            <View style={{ width: '90%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Button status="info" onPress={() => {
                                        setModalVisible(false)
                                        setLoading(true)
                                        handleApproval()
                                    }}>Approved</Button>

                                    <Button status="danger" onPress={() => {
                                        setModalVisible(false)
                                        setLoading(true)
                                        handleUpdateStatus('Pending')
                                    }}>Not Approved</Button>

                                </View>
                            </View>
                            :

                            <View style={{ width: '90%', justifyContent: 'center', alignItems: 'center' }}>
                                {data.status != 'Completed'
                                    ?
                                    <Button onPress={() => {
                                        setModalVisible(false)
                                        setLoading(true)
                                        handleUpdateStatus('Completed')
                                    }}>Mark as Completed</Button>
                                    :
                                    <Button status="danger" onPress={() => {
                                        setModalVisible(false)
                                        setLoading(true)
                                        handleUpdateStatus('Pending')
                                    }}>Mark as Pending</Button>
                                }
                            </View>
                        }



                    </Card>
                </View>
            </Modal>

            <ImageView
                images={openImage}
                imageIndex={0}
                visible={openImageVisible}
                onRequestClose={() => setOpenImageVisble(false)}

            />

        </Layout>
    )
}

export default TaskDetailScreen