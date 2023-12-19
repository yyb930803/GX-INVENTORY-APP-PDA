import React, { useState, useEffect } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';
import ApiObject from '../../support/Api';
import Layout from '../../components/Layout';
import { BackHandler } from 'react-native';
import CStyles from '../../styles/CommonStyles';

const Main = (props) => {
  const { projectItem } = useSelector((state) => state.base);

  useEffect(() => {
    fetchData();

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  const [isVisible, setisVisible] = useState(false)

  const fetchData = () => {

  };

  const BackBtnPress = async () => {
    props.navigation.navigate('PromanageDashboard')
  };

  const endProject = async () => {
    await ApiObject.endProject({
      id: projectItem.id
    })
    setisVisible(false)
    props.navigation.navigate('PromanageDashboard')
  }

  return (
    <Layout {...props} title={'项目管理'}>
      <View style={styles.allcontent}>
        <Modal visible={isVisible} transparent={true}>
          <View style={CStyles.modalContainer}>
            <View style={CStyles.modalContent}>
              <View style={CStyles.modalheader}>
                <Text style={{ fontSize: 18, color: '#282828', fontWeight: "bold" }}>提示</Text>
                <TouchableOpacity onPress={() => setisVisible(false)}>
                  <Icon name="close" size={25} />
                </TouchableOpacity>
              </View>

              <View style={CStyles.modalMain}>
                <View style={{ paddingVertical: 20 }}>
                  <Text style={{ fontSize: 18, color: '#282828' }}>你想停止这个项目吗?</Text>
                </View>
              </View>

              <View style={CStyles.modalBottom}>
                <Button ButtonTitle={'是(Y)'} BtnPress={() => { endProject() }} type={'yellowBtn'} BTnWidth={120}/>
                <Button ButtonTitle={'否(N)'} BtnPress={() => setisVisible(false)} type={'blueBtn'} BTnWidth={120}/>
              </View>
            </View>
          </View>
        </Modal>

        <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>

        <ScrollView>
          <View style={styles.main}>
            <Button
              ButtonTitle={'项目信息'}
              BtnPress={() => props.navigation.navigate('PromanageCard')}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
          <View style={styles.main}>
            <Button
              ButtonTitle={'QR号码'}
              BtnPress={() => props.navigation.navigate('PromanageQrcode')}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
          <View style={styles.main}>
            <Button
              ButtonTitle={'导入主档'}
              BtnPress={() => props.navigation.navigate('PromanagePromaster')}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
          <View style={styles.main}>
            <Button
              ButtonTitle={'工位设定'}
              BtnPress={() => props.navigation.navigate('PromanageGongwei')}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
          <View style={styles.main}>
            <Button
              ButtonTitle={'提交报告'}
              BtnPress={() => props.navigation.navigate('PromanageReport')}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
          <View style={styles.main}>
            <Button
              ButtonTitle={'停止'}
              BtnPress={() => setisVisible(true)}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
          <View style={styles.main}>
            <Button
              ButtonTitle={'人员状态'}
              BtnPress={() => props.navigation.navigate('PromanagePersonal')}
              type={'yellowBtn'}
              BTnWidth={280}
            />
          </View>
        </ScrollView>
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
  main: {
    position: 'relative',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10
  },
});

export default Main;
