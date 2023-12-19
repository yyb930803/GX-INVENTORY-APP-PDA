import React, { useState, useEffect, memo } from 'react';
import { useDispatch } from 'react-redux';
import { View, Modal, Text, StyleSheet, TouchableOpacity, Alert, VirtualizedList, Dimensions, TextInput, ScrollView } from 'react-native';
import Button from '../../components/Button';
import DropBox from '../../components/DropBox';
import CStyles from '../../styles/CommonStyles';
import Icon from 'react-native-vector-icons/AntDesign';
import CalendarPicker from 'react-native-calendar-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import { Svg, Line } from 'react-native-svg';
import ApiObject from '../../support/Api';
import { subDays } from 'date-fns';
import { PROGRAM_NAME } from '../../constants';
import { setProjectItem, setqrcode, setProSelectDate } from '../../reducers/BaseReducer';
import Layout from '../../components/Layout';
import { BackHandler } from 'react-native';

const DashboardScreen = (props) => {
  const [element, setElement] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [ListOpen, setListOpen] = useState(false);
  const [listValue, setlistValue] = useState(0);
  const [List, setList] = useState([]);
  const [isVisible, setIsVisible] = useState(false)

  const [calendarType, setCalendarType] = useState();

  const [data, setData] = useState([]);
  const [firstdata, setfirstData] = useState([]);

  const [settingList, setSettingList] = useState([]);
  const [settingAllList, setSettingAllList] = useState([]);
  const [settingListOpen, setSettingListOpen] = useState(false);
  const [settingId, setSettingId] = useState(0);

  const [schdulerList, setSchdulerList] = useState([]);
  const [schdulerListOpen, setSchdulerListOpen] = useState(false);
  const [schduleid, setSchduleid] = useState(0);

  const [leaderList, setLeaderList] = useState([]);
  const [leaderListOpen, setLeaderListOpen] = useState(false);
  const [leaderid, setLeaderid] = useState('');

  const [brand, setBrand] = useState('');
  const [storename, setStorename] = useState('');
  const [storeid, setStoreid] = useState('');
  const [storelinkname, setStorelinkname] = useState('');
  const [storelinkphone, setStorelinkphone] = useState('');
  const [storemanager, setStoremanager] = useState('')
  const [clientId, setClientId] = useState('');
  const [clientstoreleader, setClientstoreleader] = useState('');
  const [storeaddress, setStoreaddress] = useState('');
  const [estimated, setEstimated] = useState('');

  const [preferstarttime, setPreferstarttime] = useState('');
  const [preferendtime, setPreferendtime] = useState('');
  const [prostarttime, setProstarttime] = useState('');
  const [proendtime, setProendtime] = useState('');
  const [adress, setAdress] = useState('');
  const [adressList, setAdressList] = useState([]);
  const [adressListOpen, setAdressListOpen] = useState(false);

  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);

  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    fetchData();
    getList();

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  useEffect(() => {
    if (settingAllList?.length > 0) {
      if (settingId == 0) {
        setClientId('');
      } else {
        setClientId(settingAllList.filter((item) => item.id == settingId)[0].client_id.toString())
      }
    }
  }, [settingId]);

  useEffect(() => {
    getSchedulerList();
    getLeaderList();
  }, [clientId]);

  useEffect(() => {
    fetchDatalater();
  }, [selectedDate]);

  useEffect(() => {
    let dataT = firstdata;

    if (listValue !== 0) {
      dataT = dataT.filter((item) => item.state_id === listValue);
    }

    if (element !== "") {
      dataT = dataT.filter((item) =>
        (item.client_name != null && item.client_name.includes(element)) ||
        (item.store_name != null && item.store_name.includes(element)) ||
        (item.leader_name != null && item.leader_name.includes(element))
      )
    }

    setData(dataT);
  }, [listValue, firstdata, element]);

  const BackBtnPress = () => {
    return true;
  };

  const fetchData = async () => {
    getAddressList();

    let currentDate = new Date();
    currentDate = subDays(currentDate, 30);
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString();
    const day = currentDate.getDate().toString();
    setSelectedDate(`${year}:${month}:${day}`)

    var AllList = await ApiObject.getSettingList();
    setSettingAllList(AllList);

    let list = [];
    for (let i = 0; i < AllList.length; i++) {
      let temp = {};
      temp.label = AllList[i].client_name.replace(" ", "") + "_" + AllList[i].inventory_type;
      temp.value = AllList[i].id;
      list.push(temp);
    }
    setSettingList(list)

    setSettingId(list[0].value)
  };

  const getList = async () => {
    setList([
      {
        'label': '全部',
        'value': 0
      },
      {
        'label': '排班',
        'value': 1
      },
      {
        'label': '进行',
        'value': 3
      },
      {
        'label': '完成',
        'value': 4
      },
    ])
  }

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

  const getSchedulerList = async () => {
    var schdluerAlllist = await ApiObject.getSchedulerList({
      client_id: clientId
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
  }

  const getLeaderList = async () => {
    var leaderAlllist = await ApiObject.getLeaderList({
      client_id: clientId
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
  }

  const fetchDatalater = async () => {
    try {
      var data = await ApiObject.getProjectList({
        starttime: selectedDate
      });
      setfirstData(data.sort(compareItemsByCreatedAt))
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const compareItemsByCreatedAt = (itemA, itemB) => {
    const dateA = moment(itemA.created_at);
    const dateB = moment(itemB.created_at);
    return dateB.diff(dateA);
  };

  const handleNumericInput = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setEstimated(numericText);
  };

  const handlePhoneNumberChange = (text) => {
    setStorelinkphone(text);
    const phonePattern = /^[0-9]{10}$/;
    setIsValid(phonePattern.test(text));
  };

  const handleDateSelect = async (date) => {
    const { year, month, day } = date
      ? extractYearAndMonth(date)
      : { year: null, month: null, day: null };

    setSelectedDate(`${year}:${month}:${day}`)

    setCalendarVisible(false);
  };

  const extractYearAndMonth = (date) => {
    const year = moment(date).format('YYYY');
    const month = moment(date).format('MM');
    const day = moment(date).format('DD');
    return { year, month, day };
  };

  const handleDatetimeSelect = async (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    switch (calendarType) {
      case 1:
        setPreferstarttime(`${year}:${month}:${day} ${hour}:${minute}`)
        break;
      case 2:
        setPreferendtime(`${year}:${month}:${day} ${hour}:${minute}`)
        break;
      case 3:
        setProstarttime(`${year}:${month}:${day} ${hour}:${minute}`)
        break;
      case 4:
        setProendtime(`${year}:${month}:${day} ${hour}:${minute}`)
        break;
      default:
        break;
    }
  }

  const addProject = async () => {
    if (storename == '' || preferendtime == '' || preferstarttime == '' || storeaddress == "" || isValid == true) {
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
      } else if (isValid) {
        Alert.alert(
          PROGRAM_NAME,
          '请输入正确的电话号码格式.',
          [{ text: '是(ok)', onPress: () => { } }],
          { cancelable: false },
        );
      }
    } else {
      const result = await ApiObject.addProject({
        setting_id: settingId,
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

        working_area: '',
        visiter_name: '',
        first_visit_date: '',
        second_visit_date: '',
        first_visit_estimated: '',
        second_visit_estimated: '',
        method_type: '',
        user_ids: '',
      })
      if (result == '') {
        setIsVisible(false);
        fetchDatalater();
      }
    }
  }

  const _renderitem = ({item}) => <MemoRenderItem item={item} navigation={props.navigation} />;

  return (
    <Layout {...props} title={'项目管理'}>
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        onConfirm={(dateTime) => {
          handleDatetimeSelect(dateTime)
          setDateTimePickerVisibility(false);
        }}
        onCancel={() => setDateTimePickerVisibility(false)}
      />

      <View style={styles.searchbarContent}>
        <TextInput
          value={element}
          autoFocus={true}
          onChangeText={setElement}
          selectTextOnFocus={true}
          style={CStyles.InputStyle}
          multiline={false}
          showSoftInputOnFocus={true}
        />
        <View style={{ marginHorizontal: 7 }}>
          <Button
            ButtonTitle={'ADD'}
            BtnPress={() => setIsVisible(true)}
            type={'yellowBtn'}
            BTnWidth={50}
          />
        </View>
      </View>
      <View style={styles.calendarContent}>
        <TouchableOpacity
          style={{ ...CStyles.InputStyle, backgroundColor: '#ffffff', color: '#000000', paddingLeft: 20, alignItems: 'flex-start' }}
          onPress={() => { setCalendarVisible(true) }}
        >
          <TextInput
            value={selectedDate}
            autoFocus={true}
            editable={false}
            selectTextOnFocus={true}
            style={{ backgroundColor: '#ffffff', color: '#000000', fontSize: 10, padding: 0 }}
            multiline={false}
            showSoftInputOnFocus={false}
          />
        </TouchableOpacity>
        <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', width: '50%' }}>
          <DropBox
            zIndex={10}
            zIndexInverse={10}
            open={ListOpen}
            setOpen={setListOpen}
            value={listValue}
            setValue={setlistValue}
            items={List}
            setItems={setList}
            searchable={true}
            listMode='MODAL'
          />
        </View>
      </View>
      <VirtualizedList
        data={data}
        renderItem={_renderitem}
        keyExtractor={(item) => item.id.toString()}
        onEndReachedThreshold={0.5}
        getItemCount={() => data.length}
        getItem={(data, index) => data[index]}
      />

      <Modal visible={isCalendarVisible} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <CalendarPicker onDateChange={handleDateSelect} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setCalendarVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isVisible} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#282828', fontSize: 18 }}>项目追加</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Icon name="close" size={25} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>客户名称*庳存类型</Text>
                <View style={{paddingHorizontal: 2}}>
                  <DropBox
                    zIndex={3000}
                    zIndexInverse={1000}
                    open={settingListOpen}
                    setOpen={setSettingListOpen}
                    value={settingId}
                    setValue={setSettingId}
                    items={settingList}
                    setItems={setSettingList}
                    searchable={true}
                    listMode='MODAL'
                    style={{ fontSize: 12, color: 'red' }}
                  />
                </View>
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>客户编码</Text>
                <TextInput
                  value={clientId}
                  autoFocus={true}
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
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>品牌</Text>
                <TextInput
                  value={brand}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setBrand}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>门店名称*</Text>
                <TextInput
                  value={storename}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setStorename}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>门店编码</Text>
                <TextInput
                  value={storeid}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setStoreid}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>门店联系人</Text>
                <TextInput
                  value={storelinkname}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setStorelinkname}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>门店联系电话</Text>
                <TextInput
                  value={storelinkphone}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="numeric"
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>门店经理</Text>
                <TextInput
                  value={storemanager}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setStoremanager}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>客户现场代表</Text>
                <TextInput
                  value={clientstoreleader}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setClientstoreleader}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>门店地址*</Text>
                <TextInput
                  value={storeaddress}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={setStoreaddress}
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>参考库存</Text>
                <TextInput
                  value={estimated}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  style={CStyles.InputStyle}
                  multiline={false}
                  onChangeText={handleNumericInput}
                  keyboardType="numeric"
                  showSoftInputOnFocus={true}
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>排班人</Text>
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
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>领队</Text>
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
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>省</Text>
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

              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>建议起始日期*</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 5 }}>
                  <TouchableOpacity onPress={() => { setDateTimePickerVisibility(true), setCalendarType(1) }}>
                    <Icon name="calendar" size={25} style={{ color: '#000000' }} />
                  </TouchableOpacity>
                  <TextInput
                    value={preferstarttime}
                    autoFocus={true}
                    selectTextOnFocus={true}
                    style={{
                      ...CStyles.InputStyle,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: 11,
                      paddingLeft: 20
                    }}
                    editable={false}
                    multiline={false}
                    showSoftInputOnFocus={false}
                  />
                </View>
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>建议结束日期*</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 5 }}>
                  <TouchableOpacity onPress={() => { setDateTimePickerVisibility(true), setCalendarType(2) }}>
                    <Icon name="calendar" size={25} style={{ color: '#000000' }} />
                  </TouchableOpacity>
                  <TextInput
                    value={preferendtime}
                    autoFocus={true}
                    selectTextOnFocus={true}
                    style={{
                      ...CStyles.InputStyle,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: 11,
                      paddingLeft: 20
                    }}
                    editable={false}
                    multiline={false}
                    showSoftInputOnFocus={false}
                  />
                </View>
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>盘点起始日期</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 5 }}>
                  <TouchableOpacity onPress={() => { setDateTimePickerVisibility(true), setCalendarType(3) }}>
                    <Icon name="calendar" size={25} style={{ color: '#000000' }} />
                  </TouchableOpacity>
                  <TextInput
                    value={prostarttime}
                    autoFocus={true}
                    selectTextOnFocus={true}
                    style={{
                      ...CStyles.InputStyle,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: 11,
                      paddingLeft: 20
                    }}
                    editable={false}
                    multiline={false}
                    showSoftInputOnFocus={false}
                  />
                </View>
              </View>
              <View style={{marginTop: 5}}>
                <Text style={styles.modalText}>盘点结束日期</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 5 }}>
                  <TouchableOpacity onPress={() => { setDateTimePickerVisibility(true), setCalendarType(4) }}>
                    <Icon name="calendar" size={25} style={{ color: '#000000' }} />
                  </TouchableOpacity>
                  <TextInput
                    value={proendtime}
                    autoFocus={true}
                    selectTextOnFocus={true}
                    style={{
                      ...CStyles.InputStyle,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: 11,
                      paddingLeft: 20
                    }}
                    editable={false}
                    multiline={false}
                    showSoftInputOnFocus={false}
                  />
                </View>
              </View>
            </ScrollView>
            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'center' }}>
              <Button
                ButtonTitle={'追加'}
                BtnPress={() => addProject()}
                type={'yellowBtn'}
                BTnWidth={240}
              />
            </View>
          </View>
        </View>
      </Modal >
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: '#FFFFFF',
    paddingRight: 30,
    paddingVertical: 5,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    flexDirection: 'row',
    borderLeftWidth: 5,
  },
  searchbarContent: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  calendarContent: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%'
  },
  scrollContentTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    alignItems: 'center',
    width: '100%',
    paddingLeft: 30
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
    color: '#000000'
  },
  modalText: {
    fontSize: 12,
    color: '#282828',
    paddingLeft: 10
  }
});

export default DashboardScreen;

const renderItem = ({ item, navigation }) => {
  const dispatch = useDispatch();
  let result = 'red';
  switch (item.state_id) {
    case 1:
      result = 'blue';
      break;
    case 3:
      result = 'green';
      break;
    case 4:
      result = 'black';
      break;
    case 5:
      result = 'red';
      break;
    default:
      result = 'red';
      break;
  }

  const handleDetail = async () => {
    await dispatch(setProjectItem(item));
    // await dispatch(setqrcode(item?.qrcode));
    // await dispatch(setProSelectDate(selectedDate));
    if (item.state_id == 3) {
      navigation.navigate('PromanageMain')
    } else {
      navigation.navigate('PromanageCard')
    }
  }

  return (
    <TouchableOpacity onPress={() => handleDetail()} style={{ ...styles.scrollContent, borderLeftColor: result }}>
      <View style={{ width: '90%' }}>
        <View style={{ ...styles.scrollContentTop, paddingLeft: 5 }}>
          <Text style={styles.itemText}>{item.client_name}</Text>
          <Text style={styles.itemText}>{item.store_name}</Text>
          <Text style={styles.itemText}>{item.leader_name}</Text>
        </View>
        <Svg height="1" width={Dimensions.get('window').width * 0.9 * 0.9}>
          <Line x1="0" y1="0" x2={Dimensions.get('window').width * 0.9 * 0.9} y2="0" stroke="black" />
        </Svg>
        <View style={styles.scrollContentTop}>
          <Text style={styles.itemText}>华北 - 河北</Text>
          {
            item.start_time != null ?
              <Text style={styles.itemText}>{item.start_time}</Text> :
              <Text style={styles.itemText}>{item.pro_starttime}</Text>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MemoRenderItem = memo(renderItem);
