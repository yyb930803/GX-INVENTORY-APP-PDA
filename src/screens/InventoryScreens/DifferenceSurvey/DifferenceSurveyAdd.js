import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, View, Text, Alert, TextInput, ScrollView, NativeModules, BackHandler, DeviceEventEmitter } from 'react-native';
import uuid from 'react-native-uuid';
import Button from '../../../components/Button';
import CalculatorScreen from '../../../components/CalculatorScreen';
import QRcodeScanScreen from '../../../components/QRcodeScanScreen';
import CStyles from '../../../styles/CommonStyles';
import FooterBar3 from '../../../components/FooterBar3';
import { PROGRAM_NAME, SCAN_INPUT, HAND_INPUT } from '../../../constants';
import { DB, tbName, pipeiSKU } from '../../../hooks/dbHooks';
import SoundObject from '../../../utils/sound';
import DiffEndModal from '../../../components/DiffEndModal';
import Layout from '../../../components/Layout';

const DifferenceSurveyAdd = (props) => {
  const { ScanModule } = NativeModules;
  const { user, project, diffCommodity } = useSelector(state => state.base);
  const { differenceSurveyTb, gongweiMasterTb } = tbName(user.id);

  const [scanScreen, setScanScreen] = useState(false);
  const [calScreen, setCalScreen] = useState(false);

  const [count, setCount] = useState('');
  const [commoditySku, setCommoditySku] = useState('');
  const [pihao, setPihao] = useState('');
  const [codeInputMethod, setCodeInputMethod] = useState(HAND_INPUT);

  const [pianqu, setPianqu] = useState('');
  const [gongwei, setGongwei] = useState('');
  const [row, setRow] = useState('');
  const [column, setColumn] = useState('');

  const [gongweiId, setGongweiId] = useState(0);
  const [pipeiItem, setPipeiItem] = useState(null);

  const [quantityClose, setQuantityClose] = useState(true);

  const [skuInputFocus, setSkuInputFocus] = useState(false);
  const [countInputFocus, setCountInputFocus] = useState(false);
  const [rowInputFocus, setRowInputFocus] = useState(false);
  const [gongweiInputFocus, setGongweiInputFocus] = useState(false);
  const [columnInputFocus, setColumnInputFocus] = useState(false);

  const [pipeiStatus, setPipeiStatus] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const [endModalOpen, setEndModalOpen] = useState(false);

  const [keyShow, setKeyShow] = useState(false);

  const [focusPos, setFocusPos] = useState('');

  const skuRef = useRef(null);
  const countRef = useRef(null);
  const rowRef = useRef(null);
  const gongweiRef = useRef(null);
  const columnRef = useRef(null);

  useEffect(() => {
    const focusListener = props.navigation.addListener('didFocus', () => {
      giveFocus();
      if (project.quantity_min == project.quantity_max) {
        setCount(project.quantity_min);
      }
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

  useEffect(() => {
    countChanged();
  }, [count]);
  
  useEffect(() => {
    if (countInputFocus && !pipeiStatus) {
      pipei();
    }
    if (countInputFocus) {
      setFocusPos('count');
    }
  }, [countInputFocus]);

  useEffect(() => {
    if (rowInputFocus && !pipeiStatus) {
      pipei();
    }
    if (rowInputFocus) {
      setFocusPos('row');
    }
  }, [rowInputFocus]);

  useEffect(() => {
    if (gongweiInputFocus && !pipeiStatus) {
      pipei();
    }
    if (gongweiInputFocus) {
      ScanModule.unlock();
      setFocusPos('gongwei');
    }
  }, [gongweiInputFocus]);

  useEffect(() => {
    if (columnInputFocus && !pipeiStatus) {
      pipei();
    }
    if (columnInputFocus) {
      setFocusPos('column');
    }
  }, [columnInputFocus]);

  useEffect(() => {
    if (skuInputFocus) {
      ScanModule.unlock();
      setFocusPos('sku');
    }
  }, [skuInputFocus]);

  useEffect(() => {
    setPipeiStatus(false);
  }, [commoditySku]);

  useEffect(() => {
    if (commoditySku !== '') {
      setPipeiStatus(true);
    }
  }, [pipeiItem]);

  useEffect(() => {
    DB.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${gongweiMasterTb} WHERE "gongwei" = ?`,
        [Number(gongwei)],
        (tx, results) => {
          if (results.rows.length === 0) {
            setPianqu('');
            setGongweiId(0);
          } else {
            setPianqu(results.rows.item(0).pianqu);
            setGongweiId(results.rows.item(0).id);
          }
        },
      );
    });
  }, [gongwei]);

  useEffect(() => {
    if (pipeiStatus && commoditySku !== '' && Number(count) !== 0 && count !== '' && Number(row) !== 0 && row !== '' && gongwei !== '' && pianqu !== '' && column !== '') {
      setConfirm(true);
    } else {
      setConfirm(false);
    }
  }, [commoditySku, count, row, pipeiStatus, gongwei, pianqu, column]);

  useEffect(() => {
    if (commoditySku.indexOf('\n') !== -1) {
      setCommoditySku(commoditySku.replace(/\n/g, ""));
      countRef.current.focus();
    }
  }, [commoditySku]);

  useEffect(() => {
    const handleKeyUp = (eventData) => {
      if (eventData.keyCode === 66) {
        switch (focusPos) {
          case 'sku':
            countRef.current.focus();
            break;
          case 'count':
            gongweiRef.current.focus();
            break;
          case 'gongwei':
            rowRef.current.focus();
            break;
          case 'row':
            columnRef.current.focus();
            break;
          case 'column':
            if (confirm) {
              insertRow();
            }
            break;
        
          default:
            break;
        }
      }
    };

    const deviceEventEmitterListener = DeviceEventEmitter.addListener('onKeyUp', handleKeyUp);
    return () => {
      deviceEventEmitterListener.remove();
    }
  }, [focusPos, confirm]);

  const countChanged = () => {
    if (Number(count) !== 0 && count !== '' && (Number(count) > project.quantity_max || Number(count) < project.quantity_min)) {
      if (quantityClose) {
        SoundObject.playSound('alert');
        Alert.alert(
          PROGRAM_NAME,
          '输入的数量超出设置范围。 是否要输入超出设置范围的数量？',
          [
            {
              text: '是(Y)',
              onPress: () => setQuantityClose(false),
            },
            {
              text: '不(N)',
              onPress: () => {
                setCount('');
                countRef.current.focus();
              },
            },
          ],
          { cancelable: false },
        );
      }
    }
  };

  const countCalFunc = (val) => {
    setCount(val);
    setCalScreen(false);
  }

  const countInputChange = (e) => {
    var inp = e.nativeEvent.key;
    SoundObject.playSound(inp);
  };

  const skuScanOKFunc = (val) => {
    setCommoditySku(val);
    setCodeInputMethod(SCAN_INPUT);
    countRef.current.focus();
    setScanScreen(false);
  }

  const skuScanCancelFunc = () => {
    skuRef.current.focus();
    setScanScreen(false);
  }

  const skuHandFunc = (val) => {
    setCommoditySku(val);
    setCodeInputMethod(HAND_INPUT);
  }

  const pipei = async () => {
    if (commoditySku == '') {
      SoundObject.playSound('alert');
      Alert.alert(
        PROGRAM_NAME,
        '请正确输入SKU和数量置信息。',
        [{ text: '是(OK)', onPress: () => skuRef.current.focus() }],
        { cancelable: false },
      );
    } else {
      let result = await pipeiSKU(commoditySku, user.id);
      if (result !== null) {
        if (result.commodity_code !== diffCommodity.commodity_code) {
          SoundObject.playSound('alert');
          Alert.alert(
            PROGRAM_NAME,
            '这不是差异调查进行中的产品',
            [{ text: '是(OK)', onPress: () => skuRef.current.focus() }],
            { cancelable: false },
          );
        } else {
          setPipeiItem(result);
          if (project.quantity_min == project.quantity_max) {
            gongweiRef.current.focus();
          }
        }
      } else {
        if (commoditySku !== diffCommodity.commodity_code) {
          SoundObject.playSound('alert');
          Alert.alert(
            PROGRAM_NAME,
            '这不是差异调查进行中的产品',
            [{ text: '是(OK)', onPress: () => skuRef.current.focus() }],
            { cancelable: false },
          );
        } else {
          setPipeiStatus(true);
          if (project.quantity_min == project.quantity_max) {
            gongweiRef.current.focus();
          }
        }
      }
    }
  }

  const screenNavigate = (id) => {
    if (id !== 1) {
      if (project.quantity_min == project.quantity_max) {
        setCount(project.quantity_min);
      }
      setCommoditySku('');
      setGongwei('');
      setRow('');
      setColumn('');
    }
    setKeyShow(false);

    if (id == 1) {
      props.navigation.navigate('DifferenceSurveyAdd');
    } else if (id == 2) {
      props.navigation.navigate('DifferenceSurveyEdit');
    } else if (id == 3) {
      props.navigation.navigate('DifferenceSurveyDelete');
    }
  };

  const insertRow = () => {

    var date = new Date();
    var scantime =
      [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
      ' ' +
      [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
    DB.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ${differenceSurveyTb} ( 
          "commodity_sku", 
          "commodity_price", 
          "pihao", 
          "codeinput_method",  
          "count", 
          "column", 
          "row",
          "upload",
          "scan_time", 
          "gongwei_id",
          "delete_flag",
          "record_id"
          ) VALUES (?,?,?,?,?,?,?,"new",?,?,?,?)`,
        [
          commoditySku,
          pipeiItem?.commodity_price ?? 0,
          pihao,
          codeInputMethod,
          count,
          column,
          row,
          scantime,
          gongweiId,
          0,
          uuid.v4()
        ],
        (tx, results) => {
          SoundObject.playSound('scan');
          setCommoditySku('');
          if (project.quantity_min == project.quantity_max) {
            setCount(project.quantity_min);
          }
          setGongwei('');
          setRow('');
          setColumn('');
          setPihao('');
          setPipeiItem({});
          setCodeInputMethod(HAND_INPUT);
          setQuantityClose(true);
        },
      );
    });
    skuRef.current.focus();
  };

  const BackBtnPress = async () => {
    setEndModalOpen(true);
  };

  return (
    <>
      {calScreen && <CalculatorScreen closeCal={countCalFunc} cancel={() => setCalScreen(false)} />}
      {scanScreen && <QRcodeScanScreen skuScanOK={skuScanOKFunc} skuScanCancel={skuScanCancelFunc} />}
      <Layout {...props} title={'差异调查'}>
        <ScrollView style={{ flex: 1 }} disableScrollViewPanResponder={true}>
          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
            <Text style={{ ...CStyles.TextStyle, width: 25, textAlign: 'right' }}>SKU:</Text>
            <TextInput
              ref={skuRef}
              value={commoditySku}
              autoFocus={true}
              onBlur={() => setSkuInputFocus(false)}
              onFocus={() => setSkuInputFocus(true)}
              onChangeText={skuHandFunc}
              placeholder={''}
              selectTextOnFocus={true}
              style={CStyles.InputStyle}
              multiline={false}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key == 'Enter') {
                  countRef.current.focus();
                  setCodeInputMethod(SCAN_INPUT);
                }
              }}
              showSoftInputOnFocus={keyShow}
              onPressIn={() => setKeyShow(!keyShow)}
            />
            <Button
              disabled={!skuInputFocus}
              ButtonTitle={'匹配'}
              BtnPress={pipei}
              type={'blueBtn'}
              BTnWidth={100}
            />
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <Button
              disabled={!skuInputFocus}
              ButtonTitle={'扫描'}
              BtnPress={() => setScanScreen(true)}
              type={'yellowBtn'}
              BTnWidth={300}
            />
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
            <Text style={{ ...CStyles.TextStyle, width: 25, textAlign: 'right' }}>数量:</Text>
            <TextInput
              ref={countRef}
              value={count.toString()}
              keyboardType={'numeric'}
              autoFocus={false}
              onBlur={() => setCountInputFocus(false)}
              onFocus={() => setCountInputFocus(true)}
              onChangeText={(val) => setCount(val.replace(/[^0-9]/g, ''))}
              onKeyPress={countInputChange}
              style={CStyles.InputStyle}
              showSoftInputOnFocus={false}
            />
            <Button
              disabled={!countInputFocus}
              ButtonTitle={'计算机'}
              BtnPress={() => setCalScreen(true)}
              type={'yellowBtn'}
              BTnWidth={100}
            />
          </View>

          {/* {project.pihao && (
            <View style={{ marginLeft: 5 }}>
              <InputText
                refName={(ref) => {
                  // pihaoRef = ref;
                }}
                inputValue={pihao}
                // autoFocus={countPihao}
                inputChange={(pihao) => {
                  setPihao(pihao);
                }}
                InputTitle={'批号'}
                InputTXTWidth={300}
                type={'Disp'}
                placeholder={''}
              />
            </View>
          )} */}

          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingBottom: 10 }}>
            <Text style={{ ...CStyles.TextStyle, width: 25, textAlign: 'right' }}>工位:</Text>
            <TextInput
              ref={gongweiRef}
              value={gongwei.toString()}
              keyboardType={'numeric'}
              autoFocus={false}
              onBlur={() => setGongweiInputFocus(false)}
              onFocus={() => setGongweiInputFocus(true)}
              onChangeText={(val) => setGongwei(val.replace(/[^0-9]/g, ''))}
              placeholder={''}
              onKeyPress={() => { }}
              style={CStyles.InputStyle}
              maxLength={15}
              showSoftInputOnFocus={false}
            />
            <Text style={{ ...CStyles.TextStyle, width: 100, textAlign: 'left' }}>/ 区域:  {pianqu}</Text>
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingBottom: 10 }}>
            <Text style={{ ...CStyles.TextStyle, width: 25, textAlign: 'right' }}>层:</Text>
            <TextInput
              ref={rowRef}
              value={row.toString()}
              keyboardType={'numeric'}
              autoFocus={false}
              onBlur={() => setRowInputFocus(false)}
              onFocus={() => setRowInputFocus(true)}
              onChangeText={(val) => setRow(val.replace(/[^0-9]/g, ''))}
              placeholder={''}
              onKeyPress={() => { }}
              style={CStyles.InputStyle}
              showSoftInputOnFocus={false}
            />
            <Text style={{ ...CStyles.TextStyle, width: 100, textAlign: 'left' }}></Text>
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingBottom: 10 }}>
            <Text style={{ ...CStyles.TextStyle, width: 25, textAlign: 'right' }}>列:</Text>
            <TextInput
              ref={columnRef}
              value={column.toString()}
              keyboardType={'numeric'}
              autoFocus={false}
              onBlur={() => setColumnInputFocus(false)}
              onFocus={() => setColumnInputFocus(true)}
              onChangeText={(val) => setColumn(val.replace(/[^0-9]/g, ''))}
              placeholder={''}
              onKeyPress={() => { }}
              style={CStyles.InputStyle}
              showSoftInputOnFocus={false}
            />
            <Text style={{ ...CStyles.TextStyle, width: 100, textAlign: 'left' }}></Text>
          </View>

          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Button
              disabled={!confirm}
              ButtonTitle={'记录数据'}
              BtnPress={() => insertRow()}
              type={'yellowBtn'}
              BTnWidth={300}
            />
          </View>

          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>商品名称</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.commodity_name}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>价搭</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.commodity_price ? (parseFloat(pipeiItem?.commodity_price).toFixed(2).toString()) + '元' : ''}</Text>
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
              <Text style={{ ...styles.cell, flex: 1 }}>颜色</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.color_code}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>尺码</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.size_code}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>单位</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.unit}</Text>
            </View>
          </View>
        </ScrollView>

        <FooterBar3 screenNavigate={screenNavigate} activeBtn={1} />

        {endModalOpen && (
          <DiffEndModal setEndModalOpen={setEndModalOpen} navigation={props.navigation} nextPage='DifferenceSurvey' />
        )}
      </Layout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },

  cell: {
    height: 25,
    lineHeight: 25,
    borderWidth: 1,
    borderColor: '#9f9f9f',
    backgroundColor: '#f1f8ff',
    fontSize: 10,
    textAlign: 'center',
    color: 'black'
  },
});

export default DifferenceSurveyAdd;
