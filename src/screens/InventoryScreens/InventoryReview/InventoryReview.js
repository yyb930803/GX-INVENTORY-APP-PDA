import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, Alert, Dimensions, TextInput, BackHandler, NativeModules, DeviceEventEmitter } from 'react-native';
import ApiObject from '../../../support/Api';
import CStyles from '../../../styles/CommonStyles';
import Button from '../../../components/Button';
import QRcodeScanScreen from '../../../components/QRcodeScanScreen';
import { REV_TYPE, PROGRAM_NAME } from '../../../constants';
import { DB, tbName } from '../../../hooks/dbHooks';
import SoundObject from '../../../utils/sound';
import { setScreenLoading, setGongweiPos } from '../../../reducers/BaseReducer';
import Layout from '../../../components/Layout';

const InventoryReview = (props) => {
  const dispatch = useDispatch();
  const { ScanModule } = NativeModules;
  const { user, project } = useSelector((state) => state.base);
  const { gongweiMasterTb, inventoryReviewTb } = tbName(user.id);

  const [openScan, setOpenScan] = useState(false);
  const [gongwei, setGongwei] = useState('');

  const gongweiRef = useRef(null);

  useEffect(() => {
    const focusListener = props.navigation.addListener('didFocus', () => {
      ScanModule.unlock();
      giveFocus();
    });

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      focusListener.remove();
      backHandlerListener.remove();
    };
  }, [props.navigation]);

  useEffect(() => {
    const handleKeyUp = (eventData) => {
      if ([192, 193, 194].includes(eventData.scanCode)) {
      } else if (eventData.scanCode === 28) {
        if (props.navigation.isFocused()) {
          toNextStep();
        }
      }
    };

    const deviceEventEmitterListener = DeviceEventEmitter.addListener('onKeyUp', handleKeyUp);
    return () => {
      deviceEventEmitterListener.remove();
    }
  }, [gongwei]);

  const giveFocus = () => {
    setTimeout(() => {
      gongweiRef.current.focus();
    }, 500);
  }

  const toNextStep = async (gongwi = gongwei) => {
    dispatch(setScreenLoading(true));

    if (gongwi != '') {
      DB.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${gongweiMasterTb} WHERE gongwei = ?`,
          [Number(gongwi)],
          (tx, results) => {
            if (results.rows.length > 0) {
              gongWeiWorkCheck(results.rows.item(0));
            } else {
              dispatch(setScreenLoading(false));
              SoundObject.playSound('alert');
              Alert.alert(
                PROGRAM_NAME,
                '此工位不存在。',
                [{ text: '是(Y)', onPress: () => { setGongwei(''); gongweiRef.current.focus(); } }],
                { cancelable: false },
              );
            }
          },
        );
      });
    } else {
      dispatch(setScreenLoading(false));
      SoundObject.playSound('alert');
      Alert.alert(
        PROGRAM_NAME,
        '请正确输入工位位置信息。',
        [{ text: '是(ok)', onPress: () => { gongweiRef.current.focus(); } }],
        { cancelable: false },
      );
    }
  };

  const gongWeiWorkCheck = async (gongweiItem) => {
    var result = await ApiObject.gongweiCheck({ qrcode: project.qrcode, position: gongweiItem.gongwei, work_type: REV_TYPE, force: false });

    if (result !== null) {
      if (result == 'reApiForce') {
        result = await ApiObject.gongweiCheck({ qrcode: project.qrcode, position: gongweiItem.gongwei, work_type: REV_TYPE, force: true });
        if (result !== null) {
          await gotoInventoryMain(gongweiItem);
        }
      } else {
        await gotoInventoryMain(gongweiItem);
      }
    } else {
      setGongwei('');
      gongweiRef.current.focus();
    }

    dispatch(setScreenLoading(false));
  };

  const gotoInventoryMain = async (gongweiItem) => {
    dispatch(setGongweiPos(gongweiItem));
    await getGongweiData(gongweiItem);
  }

  const getGongweiData = async (gongweiItem) => {
    var data = await ApiObject.gongweiScandata({ qrcode: project.qrcode, gongwei_id: gongweiItem.id });

    if (data !== null) {
      DB.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM ${inventoryReviewTb}`,
          [],
          (tx, results) => { },
        );
      });

      if (data.length > 0) {
        DB.transaction((tx) => {
          for (let i = 0; i < data.length; i++) {
            tx.executeSql(
              `SELECT * FROM ${inventoryReviewTb} WHERE record_id=?`,
              [data[i].record_id],
              (tx, results) => {
                if (results.rows.length == 0) {
                  tx.executeSql(
                    `
                      INSERT INTO ${inventoryReviewTb} ("record_id", "commodity_sku", "commodity_price", "codeinput_method", "pihao", "count",  "gongwei_id", "column", "row", "scan_time", "mistakes_id", "mistakes_type","delete_flag","commodity_name","upload") 
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,"uploaded")
                    `,
                    [
                      data[i].record_id,
                      data[i].commodity_sku,
                      data[i].commodity_price,
                      data[i].codeinput_method,
                      data[i].pihao,
                      data[i].count,
                      data[i].gongwei_id,
                      data[i].column,
                      data[i].row,
                      data[i].scan_time,
                      data[i].mistakes_id,
                      data[i].mistakes_type,
                      data[i].delete_flag,
                      data[i].commodity_name
                    ],
                    async (tx, results) => {
                      if (i == data.length - 1) {
                        props.navigation.navigate('InventoryReviewEditList');
                      }
                    },
                  );
                } else {
                  tx.executeSql(
                    `
                      UPDATE ${inventoryReviewTb} SET record_id = ?, commodity_sku = ? , commodity_price = ?, codeinput_method = ?, pihao = ?, count = ?, mistakes_id = ?, mistakes_type = ?, delete_flag = ?, commodity_name = ? 
                      WHERE gongwei_id = ? AND column = ? AND row = ?
                    `,
                    [
                      data[i].record_id,
                      data[i].commodity_sku,
                      data[i].commodity_price,
                      data[i].codeinput_method,
                      data[i].pihao,
                      data[i].count,
                      data[i].mistakes_id,
                      data[i].mistakes_type,
                      data[i].delete_flag,
                      data[i].commodity_name,
                      data[i].gongwei_id,
                      data[i].column,
                      data[i].row,
                    ],
                    async (txn, resultns) => {
                      if (i == data.length - 1) {
                        props.navigation.navigate('InventoryReviewEditList');
                      }
                    },
                  );
                }
              },
            );
          }
        });
      } else {
        props.navigation.navigate('InventoryReviewEditList');
      }
    }
  };

  const gongweiInputChange = (e) => {
    toNextStep();
  };

  const soundplaycontrol = async (value) => {
    if (gongwei.length < value.length && value[value.length - 2] == value[value.length - 1]) {
      SoundObject.playSound('alert');
    }
    setGongwei(value.replace(/[^0-9]/g, ''));
  };

  const BackBtnPress = () => {
    props.navigation.navigate('Inventory');
  };

  return (
    <>
      {openScan && <QRcodeScanScreen skuScanOK={(val) => {
        setGongwei(val);
        setOpenScan(false);
        toNextStep(val);
      }} skuScanCancel={() => setOpenScan(false)} />}
      <Layout {...props} title={'盘点复查'}>
        <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
          <Text style={CStyles.TextStyle}>工位:</Text>
          <TextInput
            ref={gongweiRef}
            value={gongwei}
            autoFocus={true}
            keyboardType="numeric"
            onFocus={() => ScanModule.unlock()}
            onChangeText={soundplaycontrol}
            onKeyPress={gongweiInputChange}
            style={CStyles.InputStyle}
            maxLength={15}
            multiline={false}
            selectTextOnFocus={true}
            showSoftInputOnFocus={false}
          />
          <Button
            ButtonTitle={'扫描'}
            BtnPress={() => setOpenScan(true)}
            type={'yellowBtn'}
            BTnWidth={70}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Button
            ButtonTitle={'下一步'}
            BtnPress={() => toNextStep()}
            type={'blueBtn'}
            BTnWidth={Dimensions.get('window').width * 0.9}
          />
        </View>
      </Layout>
    </>
  );
}

export default InventoryReview;
