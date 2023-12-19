import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Modal, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, TextInput, ScrollView, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import ApiObject from '../../support/Api';
import Layout from '../../components/Layout';
import DropBox from '../../components/DropBox';
import Button from '../../components/Button';
import CStyles from '../../styles/CommonStyles';
import { PROGRAM_NAME } from '../../constants';
import { setProjectItem } from '../../reducers/BaseReducer';

const InforEdit = (props) => {
  const dispatch = useDispatch();

  const { projectItem, proselectedDate } = useSelector((state) => state.base);

  const [isVisible, setisVisible] = useState(false)
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [calendarType, setCalendarType] = useState();
  const [settingvalue, setsettingvalue] = useState('')

  const [schdulerList, setSchdulerList] = useState([]);
  const [schdulerListOpen, setSchdulerListOpen] = useState(false);
  const [schduleid, setSchduleid] = useState(0);

  const [leaderList, setLeaderList] = useState([]);
  const [leaderListOpen, setLeaderListOpen] = useState(false);
  const [leaderid, setLeaderid] = useState(projectItem?.leader_id);

  const [brand, setBrand] = useState(projectItem?.brand);
  const [storename, setStorename] = useState(projectItem?.store_name);
  const [storeid, setStoreid] = useState(projectItem?.store_id);
  const [storelinkname, setStorelinkname] = useState(projectItem?.store_link_name);
  const [storelinkphone, setStorelinkphone] = useState(projectItem?.store_link_phone);
  const [storemanager, setStoremanager] = useState(projectItem?.store_manager)
  const [clientId, setClientId] = useState('');
  const [clientstoreleader, setClientstoreleader] = useState(projectItem?.client_store_leader);
  const [storeaddress, setStoreaddress] = useState(projectItem?.store_address);
  const [estimated, setEstimated] = useState(projectItem?.estimated);

  const [preferstarttime, setPreferstarttime] = useState(projectItem?.prefer_starttime);
  const [preferendtime, setPreferendtime] = useState(projectItem?.prefer_endtime);
  const [prostarttime, setProstarttime] = useState(projectItem?.pro_starttime);
  const [proendtime, setProendtime] = useState(projectItem?.pro_endtime);
  const [adress, setAdress] = useState(projectItem?.adress);
  const [adressList, setAdressList] = useState([]);
  const [adressListOpen, setAdressListOpen] = useState(false);

  const handleNumericInput = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setEstimated(numericText);
  };

  const handlePhoneNumberChange = (text) => {
    setStorelinkphone(text);
  };

  const extractYearAndMonth = (date) => {
    const year = moment(date).format('YYYY');
    const month = moment(date).format('MM');
    const day = moment(date).format('DD');
    return { year, month, day };
  };

  const handleDateSelect = async (date) => {
    const { year, month, day } = date ? extractYearAndMonth(date) : { year: null, month: null, day: null };

    switch (calendarType) {
      case 1:
        setPreferstarttime(`${year}:${month}:${day}`)
        break;
      case 2:
        setPreferendtime(`${year}:${month}:${day}`)
        break;
      case 3:
        setProstarttime(`${year}:${month}:${day}`)
        break;
      case 4:
        setProendtime(`${year}:${month}:${day}`)
        break;
      default:
        break;
    }

    setCalendarVisible(false);
  };

  useEffect(() => {
    fetchData();

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  const getAddressList = async () => {
    var results = await ApiObject.getAddressList();
    if (results) {
      var tempArray = [];
      for (let i = 0; i < results.length; i++) {
        const element = results[i];
        var tempObject = {};
        tempObject.label = element.city_name;
        tempObject.value = element.id;
        tempArray.push(tempObject);
      }
      setAdressList(tempArray);
    }
  };

  const fetchData = async () => {
    getAddressList();

    var AllList = await ApiObject.getSettingList();
    var client_id;

    for (let i = 0; i < AllList.length; i++) {
      if (AllList[i].id == projectItem.setting_id) {
        client_id = AllList[i].client_id;
        setClientId(AllList[i].client_id.toString())
        setsettingvalue(AllList[i].client_name.replace(" ", "") + "_" + AllList[i].inventory_type)
      }
    }

    var schdluerAlllist = await ApiObject.getSchedulerList({
      client_id: client_id.toString()
    });

    let schedulerlist = [];

    for (let i = 0; i < schdluerAlllist.length; i++) {
      let temp = {};
      temp.label = schdluerAlllist[i].name;
      temp.value = schdluerAlllist[i].id;
      schedulerlist.push(temp);
    }

    setSchdulerList(schedulerlist)
    setSchduleid(schedulerlist[0].value)

    var leaderAlllist = await ApiObject.getLeaderList({
      client_id: client_id
    });

    let leaderlist = [];

    for (let i = 0; i < leaderAlllist.length; i++) {
      let temp = {};
      temp.label = leaderAlllist[i].name;
      temp.value = leaderAlllist[i].id;
      leaderlist.push(temp);
    }

    setLeaderList(leaderlist)
    setLeaderid(leaderlist[0].value)
  };

  const BackBtnPress = async () => {
    props.navigation.navigate('PromanageCard')
  };

  const updateProject = async () => {
    if (storename == '' || preferendtime == '' || preferstarttime == '' || storeaddress == "") {
      if (storename == "") {
        Alert.alert(
          PROGRAM_NAME,
          '请正确输入门店名称.',
          [{ text: '是(ok)', onPress: () => { } }],
          { cancelable: false },
        );
      } else if (preferendtime == '') {
        Alert.alert(
          PROGRAM_NAME,
          '请正确输入建议结束日期.',
          [{ text: '是(ok)', onPress: () => { } }],
          { cancelable: false },
        );
      } else if (preferstarttime == '') {
        Alert.alert(
          PROGRAM_NAME,
          '请正确输入建议起始日期.',
          [{ text: '是(ok)', onPress: () => { } }],
          { cancelable: false },
        );
      } else if (storeaddress == '') {
        Alert.alert(
          PROGRAM_NAME,
          '请正确输入门店地址.',
          [{ text: '是(ok)', onPress: () => { } }],
          { cancelable: false },
        );
      }
    } else {
      const result = await ApiObject.updateProject({
        setting_id: projectItem.setting_id,
        brand: brand,
        store_name: storename,
        store_id: storeid,
        store_link_name: storelinkname,
        store_link_phone: storelinkphone,
        store_manager: storemanager,
        client_store_leader: clientstoreleader,
        store_address: storeaddress,
        estimated: estimated,
        scheduler_id: schduleid,
        leader_id: leaderid,
        prefer_starttime: preferstarttime,
        prefer_endtime: preferendtime,
        pro_starttime: prostarttime,
        pro_endtime: proendtime,
        adress: '',
        id: projectItem.id,
        working_area: '',
        visiter_name: '',
        first_visit_date: '',
        second_visit_date: '',
        first_visit_estimated: '',
        second_visit_estimated: '',
        method_type: '',
        user_ids: '',
      });

      if (result == '') {
        setisVisible(false);

        var data = await ApiObject.getProjectList({
          starttime: proselectedDate
        });

        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          if (element.id == projectItem.id) {
            await dispatch(setProjectItem(element));
          }
        }

        setisVisible(false);
        BackBtnPress()
      }
    }
  }

  return (
    <Layout {...props} title={'项目管理'}>
      <Modal visible={isVisible} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <View style={CStyles.modalheader}>
              <Text style={styles.modalText}>提示</Text>
              <TouchableOpacity onPress={() => setisVisible(false)}>
                <Icon name="close" size={20} style={{ color: '#282828' }} />
              </TouchableOpacity>
            </View>
            <View style={CStyles.modalMain}>
              <View style={{ paddingVertical: 20 }}>
                <Text style={styles.modalText}>您会保留输入的用户信息吗?</Text>
              </View>
            </View>
            <View style={CStyles.modalBottom}>
              <Button
                ButtonTitle={'是(Y)'}
                BtnPress={() => { updateProject() }}
                type={'yellowBtn'}
                BTnWidth={120}
              />
              <Button
                ButtonTitle={'否(N)'}
                BtnPress={() => setisVisible(false)}
                type={'blueBtn'}
                BTnWidth={120}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isCalendarVisible} animationType="slide" transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <CalendarPicker onDateChange={handleDateSelect} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>

      <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '95%' }}>
            <Text style={styles.itemText}>客户名称*庳存类型</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={settingvalue}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={{
                  ...CStyles.InputStyle,
                  backgroundColor: '#F2F2F2',
                  color: '#000000'
                }}
                editable={false}
                multiline={false}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>客户编码</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={clientId}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={{
                  ...CStyles.InputStyle,
                  backgroundColor: '#F2F2F2',
                  color: '#000000'
                }}
                editable={false}
                multiline={false}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>品牌</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={brand}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setBrand}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>门店名称*</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={storename}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setStorename}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>门店编码</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={storeid}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setStoreid}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>门店联系人</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={storelinkname}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setStorelinkname}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>门店联系电话</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={storelinkphone}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={handlePhoneNumberChange}
                keyboardType="numeric"
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>门店经理</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={storemanager}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setStoremanager}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>客户现场代表</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={clientstoreleader}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setClientstoreleader}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>门店地址*</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={storeaddress}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={setStoreaddress}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>参考库存</Text>
            <View style={{ width: '100%' }}>
              <TextInput
                value={estimated}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={CStyles.InputStyle}
                multiline={false}
                onChangeText={handleNumericInput}
                keyboardType="numeric"
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>排班人</Text>
            <View style={{ width: '100%' }}>
              <DropBox
                zIndex={3000}
                zIndexInverse={1000}
                open={schdulerListOpen}
                setOpen={setSchdulerListOpen}
                value={schduleid}
                setValue={setSchduleid}
                items={schdulerList}
                setItems={setSchdulerList}
                searchable={true}
                listMode='MODAL'
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>领队</Text>
            <View style={{ width: '100%' }}>
              <DropBox
                zIndex={3000}
                zIndexInverse={1000}
                open={leaderListOpen}
                setOpen={setLeaderListOpen}
                value={leaderid}
                setValue={setLeaderid}
                items={leaderList}
                setItems={setLeaderList}
                searchable={true}
                listMode='MODAL'
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>建议起始日期*</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 7 }}>
              <TouchableOpacity onPress={() => { setCalendarVisible(true), setCalendarType(1) }}>
                <Icon name="calendar" size={25} style={{ color: '#282828' }} />
              </TouchableOpacity>
              <TextInput
                value={preferstarttime}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={{
                  ...CStyles.InputStyle,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  paddingLeft: 10
                }}
                editable={false}
                multiline={false}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>建议结束日期*</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 7 }}>
              <TouchableOpacity onPress={() => { setCalendarVisible(true), setCalendarType(2) }}>
                <Icon name="calendar" size={25} style={{ color: '#282828' }} />
              </TouchableOpacity>
              <TextInput
                value={preferendtime}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={{
                  ...CStyles.InputStyle,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  paddingLeft: 10
                }}
                editable={false}
                multiline={false}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>盘点起始日期</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 7 }}>
              <TouchableOpacity onPress={() => { setCalendarVisible(true), setCalendarType(3) }}>
                <Icon name="calendar" size={25} style={{ color: '#282828' }} />
              </TouchableOpacity>
              <TextInput
                value={prostarttime}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={{
                  ...CStyles.InputStyle,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  paddingLeft: 10
                }}
                editable={false}
                multiline={false}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.itemText}>盘点结束日期</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 7 }}>
              <TouchableOpacity onPress={() => { setCalendarVisible(true), setCalendarType(4) }}>
                <Icon name="calendar" size={25} style={{ color: '#282828' }} />
              </TouchableOpacity>
              <TextInput
                value={proendtime}
                autoFocus={true}
                placeholder={''}
                selectTextOnFocus={true}
                style={{
                  ...CStyles.InputStyle,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  paddingLeft: 10
                }}
                editable={false}
                multiline={false}
                showSoftInputOnFocus={false}
              />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
          <View style={{ width: '95%' }}>
            <Text style={styles.itemText}>省</Text>
            <View style={{ width: '100%' }}>
              <DropBox
                zIndex={3000}
                zIndexInverse={1000}
                open={adressListOpen}
                setOpen={setAdressListOpen}
                value={adress}
                setValue={setAdress}
                items={adressList}
                setItems={setAdressList}
                searchable={true}
                listMode='MODAL'
              // listMode='SCROLLVIEW'
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ alignSelf: 'center', marginVertical: 10 }}>
        <Button
          ButtonTitle={'保存'}
          BtnPress={() => setisVisible(true)}
          type={'yellowBtn'}
          BTnWidth={280}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  allcontent: {
    position: 'relative',
    height: Dimensions.get('window').height,
    backgroundColor: '#F2F2F2',
  },
  textinputContent: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: '90%',
    alignSelf: 'center'
  },
  calendarContent: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%'
  },
  scrollContentTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%'
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'blue',
  },
  itemText: {
    fontSize: 12,
    color: '#282828',
    paddingLeft: 10
  },
  modalText: {
    fontSize: 18,
    color: '#282828',
  }
});

export default InforEdit;