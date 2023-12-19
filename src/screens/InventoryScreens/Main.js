import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Alert, Dimensions } from 'react-native';
import Button1 from '../../components/Button1';
import Layout from '../../components/Layout';
import ApiObject from '../../support/Api';
import { createTable, deleteTable, getInvNewData, getRevNewData, getDiffNewData } from '../../hooks/dbHooks';
import { PROGRAM_NAME } from '../../constants';
import { setCategoryTime, setColumnPos, setGeneralTime, setGongweiPos, setInventoryTime, setPiangongTime, setProject, setRowPos, setScreenLoading, setSkuCount } from '../../reducers/BaseReducer';
import { BackHandler } from 'react-native';

const Main = (props) => {
  const dispatch = useDispatch();
  const { user, project } = useSelector((state) => state.base);
  const BackBtnPress = () => {
    return true;
  };

  useEffect(() => {
    createTable(user.id);

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  const toNextScene = async (nextScene) => {
    if (project.qrcode) {
      props.navigation.navigate(nextScene);
    } else {
      Alert.alert(
        PROGRAM_NAME,
        '尚未选择任何项目。首先，请选择一个要加入的项目。',
        [{ text: '是(Y)', onPress: () => { } }],
        { cancelable: true },
      );
    }
  };

  const toProjectScan = async () => {
    if (project.qrcode) {
      Alert.alert(
        PROGRAM_NAME,
        '您没有退出当前项目 无法加入新的项目！',
        [{ text: '是(Y)', onPress: () => { } }],
        { cancelable: false },
      );
    } else {
      props.navigation.navigate('ProjectMainScreen');
    }
  };

  const endWork = async () => {
    if (project.qrcode) {
      Alert.alert(
        PROGRAM_NAME,
        '结束盘点的同时将清空所有基础商品数据，您是否还要结束当前项目？',
        [
          {
            text: '确定',
            onPress: async () => {
              dispatch(setScreenLoading(true));

              const invNewRows = await getInvNewData(user.id);
              const revNewRows = await getRevNewData(user.id);
              const diffNewRows = await getDiffNewData(user.id);

              await ApiObject.uploadScanData({ data: invNewRows, work_type: 1, qrcode: project.qrcode });
              await ApiObject.uploadScanData({ data: revNewRows, work_type: 2, qrcode: project.qrcode });
              await ApiObject.uploadScanData({ data: diffNewRows, work_type: 3, qrcode: project.qrcode });

              dispatch(setProject({}));
              dispatch(setGongweiPos({}));
              dispatch(setRowPos(1));
              dispatch(setColumnPos(1));
              dispatch(setGeneralTime(null));
              dispatch(setInventoryTime(null));
              dispatch(setCategoryTime(null));
              dispatch(setPiangongTime(null));
              dispatch(setSkuCount(0));

              deleteTable(user.id);

              dispatch(setScreenLoading(false));
            }
          },
          { text: '取消', onPress: () => { } },
        ],
        { cancelable: true },
      );
    } else {
      Alert.alert(
        PROGRAM_NAME,
        '尚未选择任何项目。首先，请选择一个要加入的项目。',
        [{ text: '是(Y)', onPress: () => { } }],
        { cancelable: true },
      );
    }
  }

  return (
    <Layout {...props} title={'盘点工作'}>
      <View style={{ flex: 1, alignItems: 'center', marginTop: 10 }}>
        <Button1
          ButtonTitle={'登录项目'}
          BtnPress={() => toProjectScan()}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
        <Button1
          ButtonTitle={'下载主档'}
          BtnPress={() => toNextScene('MasterFile')}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
        <Button1
          ButtonTitle={'进入盘点'}
          BtnPress={() => toNextScene('AreaValue')}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
        <Button1
          ButtonTitle={'盘点复查'}
          BtnPress={() => toNextScene('InventoryReview')}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
        <Button1
          ButtonTitle={'差异调查'}
          BtnPress={() => toNextScene('DifferenceSurvey')}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
        <Button1
          ButtonTitle={'剩余数据'}
          BtnPress={() => toNextScene('RestDataUpload')}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
        <Button1
          ButtonTitle={'工作结束'}
          BtnPress={() => endWork()}
          BTnWidth={Dimensions.get('window').width * 0.9}
        />
      </View>
    </Layout>
  );
}

export default Main;
