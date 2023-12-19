import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Modal, Text, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Button from '../../components/Button';
import Layout from '../../components/Layout';
import ApiObject from '../../support/Api';
import { setqrcode } from '../../reducers/BaseReducer';
import CStyles from '../../styles/CommonStyles';

const CardDetail = (props) => {
  const dispatch = useDispatch();
  const { projectItem } = useSelector((state) => state.base);
  const [isVisible, setisVisible] = useState(false)

  useEffect(() => {
    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  const updateProject = async () => {
    setisVisible(false);
    const result = await ApiObject.startProject({
      setting_id: projectItem?.client_id.toString(),
      id: projectItem.id,
    })
    await dispatch(setqrcode(result.toString()));
    props.navigation.navigate('PromanageMain')
  }

  const BackBtnPress = async () => {
    if (projectItem?.state_id == 1) {
      props.navigation.navigate('PromanageDashboard')
    } else {
      props.navigation.navigate('PromanageMain')
    }
  };

  return (
    <Layout {...props} title={'项目管理'}>
      <Modal visible={isVisible} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <View style={CStyles.modalheader}>
              <Text style={{ fontSize: 18, color: '#282828', fontWeight: "bold" }}>提示</Text>
              <TouchableOpacity onPress={() => setisVisible(false)}>
                <Icon name="close" size={25} color={'black'} />
              </TouchableOpacity>
            </View>
            <View style={CStyles.modalMain}>
              <Text style={{ fontSize: 18, color: '#282828', marginVertical: 20 }}>你想开始这个项目吗?</Text>
            </View>
            <View style={CStyles.modalBottom}>
              <Button ButtonTitle={'是(Y)'} BtnPress={() => updateProject()} type={'yellowBtn'} BTnWidth={120} />
              <Button ButtonTitle={'否(N)'} BtnPress={() => setisVisible(false)} type={'blueBtn'} BTnWidth={120} />
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 10 }}>
        <TouchableOpacity onPress={() => props.navigation.navigate('PromanageInforEdit')}>
          <Icon name="edit" size={25} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>客户名称: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.id}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>客户名称: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.client_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>客户编码: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.client_id}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>庳存类型: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.inventory_type}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>门店名称: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.store_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>门店编码: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.store_id}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>品牌: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.brand}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>门店联系人: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.store_link_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>门店联系电话: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.store_link_phone}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>门店经理: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.store_manager}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>客户现场代表: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.client_store_leader}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>客户门店地址: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.store_address}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>参考库存: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.estimated}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>排班人: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.scheduler_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>领队: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.leader_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>建议起始日期: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.prefer_starttime}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>建议结束日期: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.prefer_endtime}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2 }}>
          <Text style={{ color: 'black' }}>盘点起始日期: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.pro_starttime}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 2, marginBottom: 20 }}>
          <Text style={{ color: 'black' }}>盘点结束日期: </Text>
          <Text style={{ color: 'blue' }}>{projectItem?.pro_endtime}</Text>
        </View>
      </ScrollView>
      {projectItem?.state_id == 1 && (
        <View style={{ justifyContent: 'center', flexDirection: 'row', paddingVertical: 10 }}>
          <Button ButtonTitle={'开始'} BtnPress={() => setisVisible(true)} type={'yellowBtn'} BTnWidth={280} />
        </View>
      )}
    </Layout>
  );
}

export default CardDetail;
