import { View, Text, SafeAreaView, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import { useContext, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import NameAvatar from "../components/NameAvatar";

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import app from "../config/firebase";
import { doc, getFirestore, updateDoc } from "firebase/firestore";


const ProfileScreen = (props) => {

    const db = getFirestore(app)
    const storage = getStorage(app)

    const [image, setImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)

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
            const storageRef = ref(storage, `ProfileImages/${authState.value.number}` + '.dp');
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

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageLoading(true)
            const downloadURL = await uploadImageToFirebase(result.assets[0].uri)
            if (downloadURL) {
                const updatedp = doc(db, "AllowedUsers", authState.value.number);
                setAuth(authState.value.number, authState.value.name, authState.value.designation, authState.value.employeeNumber, downloadURL)
                try {
                    await updateDoc(updatedp, {
                        dp: downloadURL
                    });
                    setImageLoading(false)
                } catch (error) {
                    console.log(error)
                    setImageLoading(false)
                }

                console.log(`Updated item`);
            } else {
                console.log(`Failed to upload image`);
            }
        }
        if (result.canceled) {
        }
    };

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            props.navigation.navigate('driverlogin')
        }).catch((error) => {
            // An error happened.
        });
    }
    // console.log(image)

    const Showdp = () => {
        if (authState) {
            if (authState.value.dp == undefined || authState.value.dp == null || authState.value.dp == '') {
                console.log('1')
                return (
                    <TouchableOpacity onPress={() => pickImage()}>
                        {authState ? <NameAvatar title={authState.value.name[0]} /> : null}
                    </TouchableOpacity>
                )
            }
            else {
                console.log('2')
                return (
                    <TouchableOpacity style={{}} onPress={() => pickImage()}>
                        <Image style={{ height: 60, width: 60, borderRadius: 30 }} source={{ uri: authState.value.dp }}></Image>
                    </TouchableOpacity>
                )
            }
        }

    }

    return (
        <SafeAreaView style={{ marginTop: Constants.statusBarHeight, backgroundColor: '#ECECEC', flex: 1, paddingVertical: 20 }}>
            <StatusBar style='light' backgroundColor='#1E3D5C' />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                    <Image style={{ height: 30, width: 30 }} source={require('../../assets/backarrow_icon.png')} tintColor='#000000'></Image>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSignOut()}>
                    <Text style={{ color: '#67E9DA', fontSize: 18, fontWeight: '700' }}>LogOut</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginTop: 20, marginHorizontal: 20 }}>
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingVertical: 5 }}>
                    {authState ? <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{authState.value.name}</Text> : null}
                    {authState ? <Text style={{ color: '#8B8B8B' }}>{authState.value.designation}</Text> : null}
                </View>
                {imageLoading
                    ?
                    <ActivityIndicator color="#57D1D7" size='medium' />
                    :
                    <Showdp />}
            </View>

            <View style={{ paddingTop: 20 }}>
                <ScrollView >
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 10, marginHorizontal: 20 }}>User Profile</Text>
                    <View style={{ borderTopColor: '#8B8B8B', borderBottomColor: '#8B8B8B', borderTopWidth: 0.5, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15 }}>Employee number</Text>
                        <Text style={{ color: '#67E9DA', fontWeight: '500', fontSize: 16 }}>E-{authState.value.employeeNumber}</Text>
                    </View>
                    <View style={{ borderTopColor: '#8B8B8B', borderBottomColor: '#8B8B8B', borderTopWidth: 0.5, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15 }}>Email</Text>
                        <Text style={{ color: '#67E9DA', fontWeight: '500', fontSize: 16 }}>N/A</Text>
                    </View>
                    <View style={{ borderTopColor: '#8B8B8B', borderBottomColor: '#8B8B8B', borderTopWidth: 0.5, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15 }}>Mobile</Text>
                        <Text style={{ color: '#67E9DA', fontWeight: '500', fontSize: 16 }}>{authState.value.number}</Text>
                    </View>
                    <View style={{ borderTopColor: '#8B8B8B', borderBottomColor: '#8B8B8B', borderTopWidth: 0.5, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15 }}>Role</Text>
                        <Text style={{ color: '#67E9DA', fontWeight: '500', fontSize: 16 }}>Driver</Text>
                    </View>
                    <View style={{ borderTopColor: '#8B8B8B', borderBottomColor: '#8B8B8B', borderTopWidth: 0.5, borderBottomWidth: 0.5, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20 }}>
                        <Text style={{ fontWeight: '600', fontSize: 15 }}>company</Text>
                        <Text style={{ color: '#67E9DA', fontWeight: '500', fontSize: 16 }}>Octa Soft</Text>
                    </View>
                </ScrollView>
            </View>

        </SafeAreaView>
    )
}

export default ProfileScreen