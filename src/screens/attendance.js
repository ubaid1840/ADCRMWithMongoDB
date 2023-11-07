import { View, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Image, TextInput, Dimensions } from "react-native"
import styles from "../styles/styles";
import { useContext, useEffect, useState } from "react";
import { Layout, Text, Button, Input, Modal, Icon, Card, Popover } from '@ui-kitten/components';
import { PeopleContext } from "../store/context/PeopleContext";

const AttendanceScreen = (props) => {

    const height = Dimensions.get('screen').height
    const width = Dimensions.get('screen').width

    const [loading, setLoading] = useState(false)
    const [searchPeople, setSearchPeople] = useState('')

    const [modalVisible, setModalVisible] = useState(false)

    const [email, setEmail] = useState('')
    const [isEmailValid, setIsEmailValid] = useState(false)

    const [arrayIndex, setArrayIndex] = useState(0)

    const [selectedData, setSelectedData] = useState('')

    const {state : peopleState} = useContext(PeopleContext)

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


    return (
        <Layout style={styles.mainLayout}>
        <View style={{ width: '90%', alignSelf: 'center', marginTop:10 }}>
            <Input
                placeholder='Search people'
                value={searchPeople}
                onChangeText={setSearchPeople}
                size="large"></Input>
        </View>

        <View style={{ flex: 1, width: '100%' }}>

            <FlatList style={{ width: '100%', marginVertical: 20, }}
                data={peopleState.value.data}
                refreshing={false}
                onRefresh={() => {
                    // setAssetArray([])
                    // setSelectedItem(null)
                    // setItemSelect({})
                    // setLoading(true)
                    // fetchData()
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {

                    const isActive = index === arrayIndex

                    if (searchPeople === "" || item.name.toLowerCase().includes(searchPeople.toLowerCase()))
                        return (
                            <SafeAreaView style={{ width: '100%', alignItems: 'center' }}>
                                <TouchableOpacity style={[{ width: '80%', paddingVertical: 5, borderColor: '#FFFFFF', justifyContent: 'space-between', marginVertical: 10, alignItems: 'center', paddingVertical:10 }, {borderWidth: isActive ? 1 : 0}]}
                                    onPress={() => {
                                        setArrayIndex(index)
                                        setSelectedData(item)
                                    }} >
                                    <Text style={{  fontSize: 20 }}>{item.name.toLocaleUpperCase()}</Text>
                                </TouchableOpacity>
                            </SafeAreaView>
                        )
                }}
                ListEmptyComponent={() => renderEmptyAsset()} />

                <Button 
                style={{width:'80%', alignSelf:'center'}}
                onPress={()=> props.navigation.navigate('attendancerecord', {data: selectedData})}
                >Open record</Button>

        </View>
    </Layout>
    )
}

export default AttendanceScreen