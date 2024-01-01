
import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions } from "react-native"
import styles from "../styles/styles";
import { cloneElement, useCallback, useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Select, SelectItem, IndexPath, Datepicker } from '@ui-kitten/components';
import { addDoc, collection, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { PeopleContext } from "../store/context/PeopleContext";
import app from "../config/firebase";
import { ActivityIndicator } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../store/context/AuthContext";
import axios from "axios";
import moment from "moment";
import universalStyles from "../styles/universalStyles";

import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";


const columns = [
  'Note',
  'Amount',
  'Date',
  'Time Stamp',
  'Action'
]

const months = [
  'All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
]

const currentYear = new Date().getFullYear();

const pastYears = Array.from({ length: 10 }, (_, index) => currentYear - index);

const customOrder = { 'Customer Relationship Manager': 1, 'Manager': 2, 'Sales': 3, 'Engineer': 4 };

const nameMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];


const ReimbursementEmployeeScreen = (props) => {
  const db = getFirestore(app)
  const storage = getStorage(app)
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
  const [selectedMonth, setSelectedMonth] = useState('All')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUri, setFileUri] = useState(null)
  const [date, setDate] = useState(new Date())
  const [amount, setAmount] = useState('')


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
    await getDocs(query(collection(db, 'Reimbursement'), where('submittedBy', '==', authState.value.data.email)))
      .then((snapshot) => {
        snapshot.forEach((docs) => {
          list.push({ ...docs.data(), 'id': docs.id })
        })
      })

    list.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime())
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
      const storageRef = ref(storage, 'Reimbursement/' + authState.value.data.email + new Date().getTime());
      const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

      uploadTask.on('state_changed',
        (snapshot) => {

          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;


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
              handleAddTask(downloadURL)
            }

          });
        }
      );
    } catch (error) {
      console.log(error)
      // FailedToast({ text: 'Try again' })
      setLoading(false)
    }

  }

  const handleAddTask = async (img) => {

    try {
      await addDoc(collection(db, 'Reimbursement'), {
        'title': title,
        'description': description,
        'amount': amount,
        'TimeStamp': date.getTime(),
        'dateCreated': new Date().getTime(),
        'submittedBy': authState.value.data.email,
        'image': img
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

  const pickDocument = async () => {

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await manipulateAsync(result.assets[0].uri, [{ resize: { width: 600 } }])
      setFileUri(manipResult.uri)
    }
    if (result.canceled) {
    }
  };

  const RenderData = ({ item, index }) => {
    const [openDetail, setOpenDetail] = useState(false)

    return (
      <SafeAreaView key={index} style={{ width: '100%', alignItems: 'center' }}>
        <TouchableOpacity style={[{ width: '100%', paddingHorizontal: 20, paddingVertical: 20, borderColor: '#FFFFFF', marginVertical: 2, backgroundColor: '#151A3060' }]}
          // onPress={() => props.navigation.navigate('taskdetailemployee', { data: item })}
          onPress={() => setOpenDetail(!openDetail)}
        >
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, maxWidth: '65%', fontFamily: 'inter-regular' }}>{item.title}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'inter-medium' }}>{moment(new Date(item?.TimeStamp)).format("DD MMM YYYY")}</Text>
              <Text style={{ color: '#B8B8B8', fontSize: 11, maxWidth: '65%', fontFamily: 'inter-regular' }}>{item.amount}</Text>
            </View>
          </View>
          {openDetail ?
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, width: '100%', fontFamily: 'inter-regular', marginVertical: 10 }}>{item.description}</Text>
              <Image style={{ width: 300, height: 300, }} resizeMode="contain" source={{ uri: item.image }}></Image>
            </View>
            : null}



          {/* <Text status="danger" style={{ color: '#FFFFFF', fontSize: 16 }}>Delete</Text>  */}
        </TouchableOpacity>
      </SafeAreaView>
    )

  }

  const clearAll = () => {
    setTitle('')
    setAmount('')
    setFileUri(null)
    setDate(new Date())
    setDescription('')
  }

  return (
    <>
      <Layout style={styles.mainLayout}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Select

            style={{ width: 150 }}
            size="large"
            label='Select Month'
            value={selectedMonth}
            onSelect={(index) => {
              setSelectedMonth(months[index - 1])
            }}
          >
            {months

              .map((item, index) => (
                <SelectItem key={index} title={item} />
              ))}
          </Select>

          <Select
            size="large"
            style={{ width: 150 }}

            label='Select Year'
            value={selectedYear}
            onSelect={(index) => {
              setSelectedYear(pastYears[index - 1])
            }}
          >
            {pastYears
              .map((item, index) => (
                <SelectItem key={index} title={item} />
              ))}
          </Select>
        </View>

        <View style={{ flex: 1, width: '100%' }}>

          {/* <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', marginTop:10, paddingHorizontal:20,}}>
            <Text  status='info' style={{fontFamily:'inter-semibold', fontSize:20}}>Task</Text>
            <Text status='info' style={{fontFamily:'inter-semibold', fontSize:20}}>Status</Text>
        </View> */}

          <FlatList style={{ flex: 1, width: '100%', marginVertical: 5, }}
            data={selectedMonth != 'All' ? taskArray.filter((item) => moment(new Date(item?.TimeStamp)).format("M").toString() == selectedMonth && moment(new Date(item?.TimeStamp)).format("YYYY").toString() == selectedYear.toString()) : taskArray.filter((item)=> moment(new Date(item?.TimeStamp)).format("YYYY").toString() == selectedYear.toString())}
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
              return (
                <RenderData
                  item={item}
                  index={index} />
              )
            }}
            ListEmptyComponent={() => renderEmptyAsset()} />
          <View style={{ width: '80%', maxWidth: 300, alignSelf: 'center' }}>

            <Button appearance='filled' onPress={() => {
              clearAll()
              setSelectedPeople('None')
              setModalVisible(true)
            }}>Add Expense</Button>
          </View>
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          onBackdropPress={() => setModalVisible(false)}
          backdropStyle={{ backgroundColor: '#6B6B6B6A' }}>
          <Card style={{ width: Dimensions.get('screen').width - 50, }}>
            <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 20, width: '100%', }}
              onPress={() => setModalVisible(false)}>
              <Image style={{ width: 20, height: 20, }} source={require('../../assets/cross_icon.png')} tintColor='red'></Image>
            </TouchableOpacity>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>

              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                size="medium"
              >
              </Input>

              <Input
                style={{ marginVertical: 10 }}
                label="Description"
                value={description}
                onChangeText={setDescription}
                size="medium"
              >
              </Input>

              {fileUri
                ?
                <TouchableOpacity onPress={() => {
                  // setLoading(true)
                  pickDocument()
                }}>
                  <Image style={{ height: 100, width: 100, }} source={{ uri: fileUri }} />
                </TouchableOpacity>
                :
                <TouchableOpacity style={{ height: 100, width: 100, borderWidth: 1, justifyContent: 'center', alignItems: 'center', }} onPress={() => {
                  // setLoading(true)
                  pickDocument()
                }}>

                  <Image style={{ height: 20, width: 20 }}
                    source={require('../../assets/add_photo_icon.png')}
                    tintColor='#67E9DA'></Image>
                  <Text style={{ color: '#30E0CB' }}>Add Photo</Text>

                </TouchableOpacity>
              }

              <Input
                style={{ marginVertical: 10 }}
                label="Amount"
                value={amount}
                onChangeText={(txt) => setAmount(txt.replace(/[^0-9]/g, ''))}
                size="medium"
              >
              </Input>

              <Datepicker
                style={{ width: '100%', }}
                boundingMonth={false}
                date={date}
                min={new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())}
                max={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                onSelect={nextDate => {
                  setDate(nextDate)
                }}
                label='Date'
                accessoryRight={() => {
                  return (
                    <Image style={{ width: 20, height: 20 }} tintColor='grey' source={require('../../assets/calendar_icon.png')}></Image>
                  )
                }}
              />

              <Button
                disabled={!title || !description || amount == '0' || !amount || !fileUri}
                onPress={() => {
                  setModalVisible(false)
                  setTaskArray([])
                  setLoading(true)
                  uploadImage(fileUri)
                }} appearance="filled" status='primary' style={{ marginTop: 40, width: 200, marginBottom: 10 }}>Add</Button>
            </View>


          </Card>

        </Modal>

      </Layout>

      {dataLoading ? CustomActivityIndicator() : null}
    </>
  )
}

export default ReimbursementEmployeeScreen

