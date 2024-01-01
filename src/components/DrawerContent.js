// DrawerContent.js


import { Drawer, DrawerItem, Text, IndexPath, useStyleSheet, StyleService, useTheme, Modal, DrawerGroup, Avatar, Layout } from '@ui-kitten/components';
import { Image } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { memo } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../store/context/AuthContext';
import { useEffect, useState } from 'react';
// import { router } from 'expo-router';

const DrawerContent = ({ selectedPage, pressLogout, openModal, selectedOption, navigation, state  }) => {


  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(parseFloat(selectedOption)));
  const customStyle = useStyleSheet(themedStyles);
  const { state: authState } = useContext(AuthContext)
  const [inventoryAllowed, setInventoryAllowed] = useState(false)

  // useEffect(() => {
  //   if (authState.value.data.inventoryAssigned) {
  //     setInventoryAllowed(true)
  //   }
  // }, [])


  const Header = (props) => {



    const theme = useTheme()
    return (
      <Layout style={{ width: 'auto', alignItems: 'center', paddingVertical: 10 }}>
        <Image style={{ width: 200, height: 50 }} resizeMode='contain' source={require('../../assets/senfeng_logo_header.png')} tintColor={theme['color-primary-500']}></Image>
      </Layout>)

  }

  if (authState.value.data.designation === 'Owner') {
    return (
      <Drawer
      
        style={{ flex: 1, marginBottom: 40, }}
        selectedIndex={selectedIndex}
        onSelect={index => {
          setSelectedIndex(index)
          // navigation.navigate(state.routeNames[index.row])
        }}
        appearance='noDivider'
        // header={Header}
      >
        <DrawerGroup
          title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >{authState.value.data.name}</Text>}
          accessoryLeft={evaProps => <Avatar style={{ marginHorizontal: 15 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('../../assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : 'white'}></Avatar>}>
          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Profile</Text>}
            onPress={() => {
              // selectedPage('Profile')
              //router.push('owner/profile')
            }}
          />

          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Logout</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} style={[evaProps.style, customStyle.myImgStyleLeft]} resizeMode='contain' source={require('../../assets/logout1_icon.png')}></Image>}
            onPress={() => {
              //  selectedPage('Finance')
              pressLogout()
            }} />

        </DrawerGroup>


        <DrawerItem style={{ marginTop: 20 }} title={(evaProps) => {
          return (
            <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Dashboard</Text>
          )
        }
        }
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/dashboard_icon.png')}></Image>}
          onPress={() => {
            // selectedPage('Dashboard')
            //router.push('owner/dashboard')
          }} />

        <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Task Management</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/task_icon.png')}></Image>}>
          <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Assign Task</Text>}

            onPress={() => {
              // selectedPage('Assign Task')
              //router.push('owner/assigntask')
            }} />
          <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Map View</Text>}

            onPress={() => {
              // selectedPage('Map View')
              //router.push('owner/mapview')
            }} />
        </DrawerGroup>

        <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Human Resource</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/hr_icon.png')}></Image>}>
          {/* <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Attendance</Text>}
            onPress={() => {
              selectedPage('Attendance')
            }} /> */}
          <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Attendance & Salary</Text>}
            onPress={() => {
              // selectedPage('Salary')
              //router.push('owner/salary')
            }} />
          <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Salary Record</Text>}
            onPress={() => {
              // selectedPage('Salary Record')
              //router.push('owner/salaryrecord')
            }} />
        </DrawerGroup>

        <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Customer</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/client_icon.png')}></Image>}>

          <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Detail</Text>}
            onPress={() => {
              // selectedPage('Customer')
              //router.push('owner/customer')
            }}
          />
          <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Feedback</Text>}
            onPress={() => {
              // selectedPage('Feedback')
              //router.push('owner/feedback')
            }} />
        </DrawerGroup>


        {/* <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Excel work</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/sale_icon.png')}></Image>}
          onPress={() => {
            selectedPage('Excel')
          }} /> */}


        {authState.value.data.branchExpensesAssigned ?

          <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Office Expense</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/salary_icon.png')}></Image>}
            onPress={() => {
              // selectedPage('Office Expense')
              //router.push('owner/officeexpenses')
            }} />
          : <></>
        }


        {authState.value.data.inventoryAssigned ?
          <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Inventory</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/inventory_icon.png')}></Image>}>

            <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Sale</Text>}
              onPress={() => {
                //router.push('owner/sale')
              }} />

            <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Parts</Text>}

              onPress={() => {
                //router.push('owner/parts')
              }} />

            {/* <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Machine</Text>}

              onPress={() => {
                selectedPage('Machine')
              }} /> */}
          </DrawerGroup>
          : <></>}

        <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >People</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/people.png')}></Image>}>
          <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Team</Text>}
            onPress={() => {
              //router.push('owner/people')
            }} />

        </DrawerGroup>


      </Drawer>
    );
  }

  else if (authState.value.data.designation == 'Manager') {
    return (
      <Drawer
        style={{ flex: 1, marginBottom: 40, }}
        selectedIndex={selectedIndex}
        onSelect={index => {
          setSelectedIndex(index)
        }}
        appearance='noDivider'
        header={Header}
      >
        <DrawerGroup
          title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >{authState.value.data.name}</Text>}
          accessoryLeft={evaProps => <Avatar style={{ marginHorizontal: 15 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('../../assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : 'white'}></Avatar>}>
          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Profile</Text>}
            onPress={() => {
              //router.push('manager/profile')
            }}
          />

          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Logout</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} style={[evaProps.style, customStyle.myImgStyleLeft]} resizeMode='contain' source={require('../../assets/logout1_icon.png')}></Image>}
            onPress={() => {
              //  selectedPage('Finance')
              pressLogout()
            }} />

        </DrawerGroup>


        <DrawerItem style={{ marginTop: 20 }} title={(evaProps) => {
          return (
            <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Dashboard</Text>
          )
        }
        }
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/dashboard_icon.png')}></Image>}
          onPress={() => {
            //router.push('manager/dashboard')
          }} />



        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Attendance</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/attendance.png')}></Image>}
          onPress={() => {
            //router.push('manager/attendancerecord')
          }} />

        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Assign Task</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/task_icon.png')}></Image>}
          onPress={() => {
            //router.push({ pathname: 'manager/assigntask', params: { options: '1' } })
          }} />


        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Feedback</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/client_icon.png')}></Image>}
          onPress={() => {
            // selectedPage('Feedback')
            //router.push('manager/feedback')
          }} />



        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Salary Record</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/finance_icon.png')}></Image>}
          onPress={() => {
            //router.push('manager/salaryrecord')
          }} />



        {authState.value.data.branchExpensesAssigned ?

          <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Office Expense</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/salary_icon.png')}></Image>}
            onPress={() => {
              //router.push('manager/officeexpenses')
            }} />
          : <></>
        }


        {authState.value.data.inventoryAssigned ?
          <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Inventory</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/inventory_icon.png')}></Image>}>

            <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Sale</Text>}
              onPress={() => {
                //router.push('manager/sale')
              }} />

            <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Parts</Text>}

              onPress={() => {
                //router.push('manager/parts')
              }} />

            {/* <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Machine</Text>}

    onPress={() => {
      selectedPage('Machine')
    }} /> */}
          </DrawerGroup>
          : <></>}

      </Drawer>
    );
  }

  else if (authState.value.data.designation == 'Customer Relationship Manager') {
    return (
      <Drawer
        style={{ flex: 1, marginBottom: 40, }}
        selectedIndex={selectedIndex}
        onSelect={index => {
          setSelectedIndex(index)
        }}
        appearance='noDivider'
        header={Header}
      >
        <DrawerGroup
          title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >{authState.value.data.name}</Text>}
          accessoryLeft={evaProps => <Avatar style={{ marginHorizontal: 15 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('../../assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : 'white'}></Avatar>}>
          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Profile</Text>}
            onPress={() => {
              //router.push('crm/profile')
            }}
          />

          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Logout</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} style={[evaProps.style, customStyle.myImgStyleLeft]} resizeMode='contain' source={require('../../assets/logout1_icon.png')}></Image>}
            onPress={() => {
              //  selectedPage('Finance')
              pressLogout()
            }} />

        </DrawerGroup>


        <DrawerItem style={{ marginTop: 20 }} title={(evaProps) => {
          return (
            <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Dashboard</Text>
          )
        }
        }
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/dashboard_icon.png')}></Image>}
          onPress={() => {
            //router.push('crm/dashboard')
          }} />


        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Feedback</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/task_icon.png')}></Image>}
          onPress={() => {
            //router.push('crm/feedback')
          }} />

        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Attendance</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/attendance.png')}></Image>} onPress={() => {
            //router.push('crm/attendancerecord')
          }} />


        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Salary Record</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/finance_icon.png')}></Image>}
          onPress={() => {
            //router.push('crm/salaryrecord')
          }} />


        {authState.value.data.branchExpensesAssigned ?

          <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Office Expense</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/salary_icon.png')}></Image>}
            onPress={() => {
              //router.push('crm/officeexpenses')
            }} />
          : <></>
        }


        {authState.value.data.inventoryAssigned ?
          <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Inventory</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/inventory_icon.png')}></Image>}>

            <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Sale</Text>}
              onPress={() => {
                //router.push('crm/sale')
              }} />

            <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Parts</Text>}

              onPress={() => {
                //router.push('crm/parts')
              }} />

            {/* <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Machine</Text>}

    onPress={() => {
      selectedPage('Machine')
    }} /> */}
          </DrawerGroup>
          : <></>}


      </Drawer>
    );
  }

  else {
    return (
      <Drawer
        style={{ flex: 1, marginBottom: 40, }}
        selectedIndex={selectedIndex}
        onSelect={index => {
          setSelectedIndex(index)
        }}
        appearance='noDivider'
        header={Header}
      >
        <DrawerGroup
          title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >{authState.value.data.name}</Text>}
          accessoryLeft={evaProps => <Avatar style={{ marginHorizontal: 15 }} source={authState.value.data.dp ? { uri: authState.value.data.dp } : require('../../assets/profile_icon.png')} tintColor={authState.value.data.dp ? null : 'white'}></Avatar>}>
          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Profile</Text>}
            onPress={() => {
              //router.push('employee/profile')
            }}
          />

          <DrawerItem
            title={(evaProps) => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle,]}>Logout</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} style={[evaProps.style, customStyle.myImgStyleLeft]} resizeMode='contain' source={require('../../assets/logout1_icon.png')}></Image>}
            onPress={() => {
              //  selectedPage('Finance')
              pressLogout()
            }} />

        </DrawerGroup>


        <DrawerItem style={{ marginTop: 20 }} title={(evaProps) => {
          return (
            <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Dashboard</Text>
          )
        }
        }
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/dashboard_icon.png')}></Image>}
          onPress={() => {
            //router.push('employee/dashboard')
          }} />


        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>My Task</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/task_icon.png')}></Image>}
          onPress={() => {
            //router.push({ pathname: 'employee/mytask', params: { options: '1' } })
          }} />

        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Attendance</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/attendance.png')}></Image>} onPress={() => {
            //router.push('employee/attendancerecord')
          }} />


        <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Salary Record</Text>}
          accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/finance_icon.png')}></Image>}
          onPress={() => {
            //router.push('employee/salaryrecord')
          }} />



        {authState.value.data.branchExpensesAssigned ?

          <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Office Expense</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/salary_icon.png')}></Image>}
            onPress={() => {
              //router.push('employee/officeexpenses')
            }} />
          : <></>
        }


        {authState.value.data.inventoryAssigned ?
          <DrawerGroup title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Inventory</Text>}
            accessoryLeft={evaProps => <Image {...evaProps} resizeMode='contain' source={require('../../assets/inventory_icon.png')}></Image>}>

            <DrawerItem title={evaProps => <Text {...evaProps} style={[evaProps.style, customStyle.myStyle]}>Sale</Text>}
              onPress={() => {
                //router.push('employee/sale')
              }} />

            <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Parts</Text>}

              onPress={() => {
                //router.push('employee/parts')
              }} />

            {/* <DrawerItem title={evaProps => <Text  {...evaProps} style={[evaProps.style, customStyle.myStyle]} >Machine</Text>}

    onPress={() => {
      selectedPage('Machine')
    }} /> */}
          </DrawerGroup>
          : <></>}


      </Drawer>
    );
  }

};

const themedStyles = StyleService.create({
  myStyle: {
    fontSize: 15,
  },
  myImgStyleLeft: {
    height: 20,
    width: 20,
  },
  myImgStyleRight: {
    height: 10,
    width: 10
  },
  drawerItemStyle: {
    paddingLeft: 45
  }
});

export default memo(DrawerContent);
