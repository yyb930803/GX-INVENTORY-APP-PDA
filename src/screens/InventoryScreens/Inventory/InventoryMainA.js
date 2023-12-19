import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, View, Text, Alert, TextInput, NativeModules, BackHandler, ScrollView } from 'react-native';
import uuid from 'react-native-uuid';
import Button from '../../../components/Button';
import Layout from '../../../components/Layout';
import QRcodeScanScreen from '../../../components/QRcodeScanScreen';
import FooterBar1 from '../../../components/FooterBar1';
import InvEndModal from '../../../components/InvEndModal';
import CStyles from '../../../styles/CommonStyles';
import { PROGRAM_NAME, SCAN_INPUT, HAND_INPUT } from '../../../constants';
import { setColumnPos, setSkuCount } from '../../../reducers/BaseReducer';
import { DB, tbName, pipeiSKU } from '../../../hooks/dbHooks';
import SoundObject from '../../../utils/sound';

const InventoryMainA = (props) => {
  const dispatch = useDispatch();
  const { ScanModule } = NativeModules;
  const { user, project, gongweiPos, rowPos, columnPos, skuCount, useZudang } = useSelector(state => state.base);
  const { scandataTb } = tbName(user.id);

  const [scanScreen, setScanScreen] = useState(false);

  const [commoditySku, setCommoditySku] = useState('');
  const [pihao, setPihao] = useState('');
  const [codeInputMethod, setCodeInputMethod] = useState(HAND_INPUT);

  const [pipeiItem, setPipeiItem] = useState(null);
  const [sumCount, setSumCount] = useState(0);

  const [endModalOpen, setEndModalOpen] = useState(false);

  const [keyShow, setKeyShow] = useState(false);

  const skuRef = useRef(null);
  const countRef = useRef(null);

  const BackBtnPress = async () => {
    setEndModalOpen(true);
  };

  useEffect(() => {
    const focusListener = props.navigation.addListener('didFocus', () => {
      ScanModule.unlock();
      callGetGongweiData();
      giveFocus();
    });

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      focusListener.remove();
      backHandlerListener.remove();
    };
  }, [props.navigation]);

  const giveFocus = () => {
    setTimeout(() => {
      skuRef.current.focus();
    }, 500);
  }

  const callGetGongweiData = () => {
    DB.transaction(tx => {
      tx.executeSql(`SELECT SUM("count") as sumCount FROM ${scandataTb} WHERE gongwei_id = ? AND row = ?`,
        [gongweiPos.id, rowPos],
        (tx, results) => {
          setSumCount(results.rows.item(0).sumCount ?? 0);
        }
      )
    });
  };

  const screenNavigate = (id) => {
    setCommoditySku('');
    setKeyShow(false);
    if (id == 1) {
      if (project.quantity_min == project.quantity_max) {
        props.navigation.navigate('InventoryMainA');
      } else {
        props.navigation.navigate('InventoryMain');
      }
    } else if (id == 2) {
      props.navigation.navigate('InventoryLayer');
    } else if (id == 3) {
      props.navigation.navigate('InventoryEditData');
    }
  }

  const pipei = async (sku = commoditySku) => {
    if (sku !== '') {
      let result = await pipeiSKU(sku, user.id);
      if (result !== null) {
        insertRowConfirm(sku, result);
        setPipeiItem(result);
      } else {
        setPipeiItem(null);
        if (useZudang == 0) {
          SoundObject.playSound('alert');
          Alert.alert(
            PROGRAM_NAME,
            '条形码不存在',
            [
              { text: '是(Y)', onPress: () => insertRowConfirm(sku, null) },
              { text: '不(N)', onPress: () => { setCommoditySku(''); skuRef.current.focus(); ScanModule.unlock(); } },
            ],
            { cancelable: false },
          );
        } else {
          insertRowConfirm(sku, null);
        }
      }
    }
  }

  const insertRowConfirm = (sku = commoditySku, pipeiItemVal = pipeiItem) => {
    insertRow(sku, pipeiItemVal);
    maxSkuCountCheck();
  }

  const insertRow = (sku, pipeiItemVal) => {
    var date = new Date();
    var scantime =
      [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
      ' ' +
      [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

    DB.transaction((txn) => {
      txn.executeSql(
        `INSERT INTO ${scandataTb} (
          "commodity_sku", 
          "pihao", 
          "codeinput_method", 
          "count", 
          "column", 
          "row", 
          "delete_flag",
          "record_id",
          "scan_time",
          "gongwei_id",
          "commodity_price",
          "upload",
          "commodity_name"
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          sku,
          pihao,
          codeInputMethod,
          project.quantity_min,
          columnPos,
          rowPos,
          0,
          uuid.v4(),
          scantime,
          gongweiPos.id,
          pipeiItemVal?.commodity_price,
          "new",
          pipeiItemVal?.commodity_name
        ],
        () => {
          SoundObject.playSound('scan');
          setCommoditySku('');
          setCodeInputMethod(HAND_INPUT);
          setPihao('');
          dispatch(setColumnPos(Number(columnPos) + 1));
          dispatch(setSkuCount(Number(skuCount) + 1));
          skuRef.current.focus();
          ScanModule.unlock();
        },
      );
    });
    callGetGongweiData();
  };

  const maxSkuCountCheck = () => {
    if (Number(skuCount) == Number(project.max_sku)) {
      ScanModule.lock();
      SoundObject.playSound('alert');
      Alert.alert(
        PROGRAM_NAME,
        '您已经对' + skuCount + '个SKU进行了盘点。 您想继续吗？',
        [{ text: 'OK', onPress: () => ScanModule.unlock() }],
        { cancelable: false },
      );
    }
  };

  const skuScanOKFunc = (val) => {
    setCommoditySku(val);
    setCodeInputMethod(SCAN_INPUT);
    setScanScreen(false);
    SoundObject.playSound('scan');
    pipei(val);
  }

  const skuScanCancelFunc = () => {
    skuRef.current.focus();
    setScanScreen(false);
  }

  const skuHandFunc = (val) => {
    setCommoditySku(val);
    setCodeInputMethod(HAND_INPUT);
  }

  return (
    <>
      {scanScreen && <QRcodeScanScreen skuScanOK={skuScanOKFunc} skuScanCancel={skuScanCancelFunc} />}
      <Layout {...props} title={'盘点工作'}>
        <ScrollView KeyboardShouldPersistTaps="always" disableScrollViewPanResponder={true}>
          <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 10 }}>
            <Text style={CStyles.TextStyle}>SKU:</Text>
            <TextInput
              ref={skuRef}
              value={commoditySku}
              autoFocus={true}
              onBlur={() => pipei()}
              onChangeText={skuHandFunc}
              selectTextOnFocus={true}
              style={CStyles.InputStyle}
              multiline={false}
              showSoftInputOnFocus={keyShow}
              onPressIn={() => setKeyShow(!keyShow)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key == 'Enter') {
                  setCodeInputMethod(SCAN_INPUT);
                }
              }}
            />
            <Button
              disabled={false}
              ButtonTitle={'匹配'}
              BtnPress={pipei}
              type={'blueBtn'}
              BTnWidth={100}
            />
          </View>
          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <Button
              disabled={false}
              ButtonTitle={'扫描'}
              BtnPress={() => setScanScreen(true)}
              type={'yellowBtn'}
              BTnWidth={300}
            />
          </View>
          <View style={{ justifyContent: 'center', flexDirection: 'row', padding: 10 }}>
            <Text style={CStyles.TextStyle}>数量:</Text>
            <TextInput
              ref={countRef}
              value={project.quantity_min.toString()}
              keyboardType={'numeric'}
              autoFocus={false}
              style={CStyles.InputStyle}
              showSoftInputOnFocus={false}
              editable={false}
            />
            <Button
              disabled={true}
              ButtonTitle={'计算机'}
              type={'yellowBtn'}
              BTnWidth={100}
            />
          </View>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Button
              disabled={true}
              ButtonTitle={'记录数据'}
              BtnPress={() => insertRowConfirm()}
              type={'yellowBtn'}
              BTnWidth={300}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>SKU</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.commodity_sku}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>商品号码</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.commodity_code}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>商品名称</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.commodity_name}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>价搭</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem ? (parseFloat(pipeiItem.commodity_price).toFixed(2).toString()) + '元' : ''}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>类别No</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.major_code}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>类别名</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.a_category_name}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>规格</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.size_code}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>单位</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.unit}</Text>
            </View>

            <View style={{ justifyContent: 'center', marginTop: 20 }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 25,
                }}
              >
                <Text style={{ fontSize: 14 }}>
                  区域: {gongweiPos.pianqu}
                </Text>
                <Text style={{ fontSize: 14 }}>
                  工位: {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")}
                </Text>
                <Text style={{ fontSize: 14 }}>
                  当前层: {rowPos}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: 20,
                  paddingHorizontal: 25,
                }}
              >
                <Text style={{ flex: 1, fontSize: 12 }}>
                  当前层汇总：
                </Text>
                <Text style={{ flex: 1, fontSize: 12 }}>
                  {columnPos} 条
                </Text>
                <Text style={{ flex: 1, fontSize: 12 }}>
                  {sumCount} 件
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <FooterBar1 screenNavigate={screenNavigate} activeBtn={1} />

        {endModalOpen && (
          <InvEndModal setEndModalOpen={setEndModalOpen} navigation={props.navigation} nextPage='AreaValue' />
        )}
      </Layout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10
  },

  cell: {
    height: 25,
    lineHeight: 25,
    borderWidth: 1,
    borderColor: '#9f9f9f',
    backgroundColor: '#f1f8ff',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default InventoryMainA;
