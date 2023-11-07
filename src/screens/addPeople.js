import { View, TouchableOpacity, Image, Platform  } from "react-native"
import Constants from "expo-constants";
import { ApplicationProvider, Layout, Text, Button, Input } from '@ui-kitten/components';
import { useState } from "react";


const AddPeopleScreen = (props) => {

    const [email, setEmail] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(null)


    return (
        <Layout style={{flex: 1, paddingVertical: 10, }}>
            <View style={{ width: '100%', height: 50, backgroundColor: '#232f3f', flexDirection: 'row', marginTop: Platform.OS == 'android' ? Constants.statusBarHeight : 0, alignItems:'center' }}>
                <View style={{ position: 'absolute', left: 10 }}>
                    <TouchableOpacity onPress={() => {
                        props.navigation.goBack()
                    }}>
                        <Image style={{ height: 30, width: 30 }} source={require('../../assets/backarrow_icon.png')} tintColor='#FFFFFF'></Image>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{alignSelf:'center', marginTop:30, width:'80%'}}>
                <Input
                placeholder="Enter Email"
                label='Enter email'
                value={email}
                onChangeText={setEmail}
                size="large">
                </Input>
            </View>
            <View style={{alignSelf:'center', marginTop:30, width:'80%'}}>
                <Button>Add</Button>
            </View>
        </Layout>
    )
}

export default AddPeopleScreen