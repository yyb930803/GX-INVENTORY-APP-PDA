import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { View, Alert, TextInput, Text } from 'react-native';
import VersionNumber from 'react-native-version-number';
import Button from '../../../components/Button';
import ApiObject from '../../../support/Api';
import { PROGRAM_NAME } from '../../../constants';
import { setProject, setScreenLoading } from '../../../reducers/BaseReducer';
import QRcodeScanScreen from '../../../components/QRcodeScanScreen';
import CStyles from '../../../styles/CommonStyles';
import Layout from '../../../components/Layout';
import { BackHandler } from 'react-native';

const ProjectMainScreen = (props) => {
  const dispatch = useDispatch();

  const [scanQrcode, setScanQrcode] = useState('');
  const [openScan, setOpenScan] = useState(false);

  const qrcodeRef = useRef(null);

  useEffect(() => {
    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  const onSuccess = () => {
    if (scanQrcode == '') {
      Alert.alert(
        PROGRAM_NAME,
        '尚未输入项目QR码。首先，请您使用扫描设备输入项目QR码。',
        [{ text: '是(OK)', onPress: () => { } }],
        { cancelable: false },
      );
    } else {
      Alert.alert(
        PROGRAM_NAME,
        '您真的要参加这个项目吗？',
        [
          { text: '是(Y)', onPress: () => toMasterFile() },
          { text: "否(N)", onPress: () => setScanQrcode('') },
        ],
        { cancelable: false },
      );
    }
  };

  const toMasterFile = async () => {
    dispatch(setScreenLoading(true));

    var projectInfo = await ApiObject.getProjectInfo({ qrcode: scanQrcode });
    if (projectInfo) {
      dispatch(setProject(projectInfo));
      props.navigation.navigate('MasterFile');
      // if (projectInfo.appName == "inventoryApp" + VersionNumber.appVersion) {
      // } else {
      //   Alert.alert(
      //     PROGRAM_NAME,
      //     '应用程序版本不匹配。 请下载该应用以继续。',
      //     [{ text: "OK", onPress: () => { } }],
      //     { cancelable: false },
      //   );
      // }
    }

    dispatch(setScreenLoading(false));
  }

  const BackBtnPress = () => {
    props.navigation.navigate('Inventory');
  }

  const skuScanOKFunc = (val) => {
    setScanQrcode(val);
    setOpenScan(false);
  }

  const skuScanCancel = () => {
    setOpenScan(false);
    qrcodeRef.current.focus();
  }

  return (
    <>
      {openScan && <QRcodeScanScreen skuScanOK={skuScanOKFunc} skuScanCancel={skuScanCancel} />}
      <Layout {...props} title={'项目'}>
        <View style={{ flex: 1, padding: 10 }}>
          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={CStyles.TextStyle}>项目QR码:</Text>
            <TextInput
              ref={qrcodeRef}
              value={scanQrcode}
              autoFocus={true}
              onChangeText={setScanQrcode}
              placeholder={''}
              style={{ ...CStyles.InputStyle, marginRight: 0 }}
              showSoftInputOnFocus={false}
            />
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingVertical: 10 }}>
            <Button
              ButtonTitle={'OK'}
              BtnPress={() => onSuccess()}
              type={'yellowBtn'}
              BTnWidth={300}
            />
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <Button
              ButtonTitle={'手机扫描仪'}
              BtnPress={() => setOpenScan(true)}
              type={'blueBtn'}
              BTnWidth={300}
            />
          </View>
        </View>
      </Layout>
    </>
  );
}

export default ProjectMainScreen;
