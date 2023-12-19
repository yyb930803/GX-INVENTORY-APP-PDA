import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity, Image, ScrollView, NativeModules, BackHandler, DeviceEventEmitter } from 'react-native';
import uuid from 'react-native-uuid';
import Button from '../../../components/Button';
import CalculatorScreen from '../../../components/CalculatorScreen';
import QRcodeScanScreen from '../../../components/QRcodeScanScreen';
import CStyles from '../../../styles/CommonStyles';
import FooterBar2 from '../../../components/FooterBar2';
import { PROGRAM_NAME, SCAN_INPUT, HAND_INPUT } from '../../../constants';
import { setScreenLoading } from '../../../reducers/BaseReducer';
import { DB, tbName, pipeiSKU } from '../../../hooks/dbHooks';
import SoundObject from '../../../utils/sound';
import ApiObject from '../../../support/Api';
import RevEndModal from '../../../components/RevEndModal';
import DropBox from '../../../components/DropBox';
import Layout from '../../../components/Layout';

const checked = require('../../../assets/images/checked.png');
const unchecked = require('../../../assets/images/unchecked.png');

const InventoryReviewAdd = (props) => {
  const dispatch = useDispatch();
  const { ScanModule } = NativeModules;
  const { user, project, gongweiPos, useZudang } = useSelector(state => state.base);
  const { inventoryReviewTb } = tbName(user.id);

  const [scanScreen, setScanScreen] = useState(false);
  const [calScreen, setCalScreen] = useState(false);

  const [count, setCount] = useState('');
  const [commoditySku, setCommoditySku] = useState('');
  const [pihao, setPihao] = useState('');
  const [codeInputMethod, setCodeInputMethod] = useState(HAND_INPUT);

  const [row, setRow] = useState('');
  const [column, setColumn] = useState(1);

  const [pipeiItem, setPipeiItem] = useState(null);

  const [quantityClose, setQuantityClose] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [skuInputFocus, setSkuInputFocus] = useState(false);
  const [countInputFocus, setCountInputFocus] = useState(false);
  const [rowInputFocus, setRowInputFocus] = useState(false);

  const [ownIssues, setOwnIssues] = useState(0);
  const [mistake, setMistake] = useState('');
  const [mistakeList, setMistakeList] = useState([]);
  const [mistakeListOpen, setMistakeListOpen] = useState(false);

  const [pipeiStatus, setPipeiStatus] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const [endModalOpen, setEndModalOpen] = useState(false);

  const [keyShow, setKeyShow] = useState(false);

  const [focusPos, setFocusPos] = useState('');

  const skuRef = useRef(null);
  const countRef = useRef(null);
  const rowRef = useRef(null);

  useEffect(() => {
    dispatch(setScreenLoading(true));

    if (project.quantity_min == project.quantity_max) {
      setCount(project.quantity_min);
    }
    getMistakesList();

    dispatch(setScreenLoading(false));

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  useEffect(() => {
    if (skuInputFocus) {
      ScanModule.unlock();
      setFocusPos('sku');
    }
  }, [skuInputFocus]);

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
        `SELECT MAX("column") as countColumn FROM ${inventoryReviewTb} WHERE "row" = ?`,
        [row],
        (tx, results) => {
          let column = results.rows.item(0).countColumn;

          if (column == null) {
            column = 1;
          } else {
            column = Number(column) + 1;
          }
          setColumn(column);
        },
      );
    });
  }, [row]);

  useEffect(() => {
    if (pipeiStatus && commoditySku !== '' && Number(count) !== 0 && count !== '' && Number(row) !== 0 && row !== '') {
      setConfirm(true);
    } else {
      setConfirm(false);
    }
  }, [commoditySku, count, row, pipeiStatus]);

  useEffect(() => {
    const handleKeyUp = (eventData) => {
      if (eventData.keyCode === 66) {
        switch (focusPos) {
          case 'sku':
            countRef.current.focus();
            break;
          case 'count':
            rowRef.current.focus();
            break;
          case 'row':
            if (confirm) {
              setAddOpen(true);
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

  const getMistakesList = async () => {
    var result = await ApiObject.getMistakesCausesList({ qrcode: project.qrcode });
    if (result !== null) {
      let list = [];
      for (let i = 0; i < result.length; i++) {
        let temp = {};
        const element = result[i];
        temp.value = element.id;
        temp.label = element.name;
        list.push(temp);
      }
      setMistakeList(list);
    }
  };

  const countChanged = () => {
    if (Number(count) !== 0 && count !== '' && (Number(count) > project.quantity_max || Number(count) < project.quantity_min)) {
      if (quantityClose) {
        SoundObject.playSound('alert');
        Alert.alert(
          PROGRAM_NAME,
          '输入的数量超出设置范围。 是否要输入超出设置范围的数量？',
          [
            { text: '是(Y)', onPress: () => setQuantityClose(false) },
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
        setPipeiItem(result);
        setPipeiStatus(true)
        if (project.quantity_min == project.quantity_max) {
          rowRef.current.focus();
        }
      } else {
        setPipeiItem(null);
        if (useZudang == 0) {
          SoundObject.playSound('alert');
          Alert.alert(
            PROGRAM_NAME,
            '条形码不存在',
            [
              {
                text: '是(Y)',
                onPress: () => {
                  setPipeiStatus(true);
                  if (project.quantity_min == project.quantity_max) {
                    rowRef.current.focus();
                  }
                },
              },
              { text: '不(N)', onPress: () => skuRef.current.focus() },
            ],
            { cancelable: false },
          );
        } else {
          setPipeiStatus(true)
          if (project.quantity_min == project.quantity_max) {
            rowRef.current.focus();
          }
        }
      }
    }
  }

  const screenNavigate = (id) => {
    setKeyShow(false);
    if (id == 1) {
      props.navigation.navigate('InventoryReviewEditList');
    } else if (id == 2) {
      props.navigation.navigate('InventoryReviewAdd');
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
        `INSERT INTO ${inventoryReviewTb} ( 
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
          "mistakes_id",
          "mistakes_type",
          "delete_flag",
          "record_id",
          "commodity_name"
          ) VALUES (?,?,?,?,?,?,?,"new",?,?,?,?,?,?,?)`,
        [
          commoditySku,
          pipeiItem?.commodity_price ?? 0,
          pihao,
          codeInputMethod,
          count,
          column,
          row,
          scantime,
          gongweiPos.id,
          mistake,
          ownIssues,
          0,
          uuid.v4(),
          pipeiItem?.commodity_name ?? '',
        ],
        (tx, results) => {
          SoundObject.playSound('scan');
          skuRef.current.focus();
          setOwnIssues(0);
          setMistake('');
          setCommoditySku('');
          setPihao('');
          setRow('');
          setCodeInputMethod(HAND_INPUT);
          setAddOpen(false);
        },
      );
    });
  };

  const BackBtnPress = async () => {
    setEndModalOpen(true);
  };

  const modalMistakePart = () => (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 10,
        }}>
        <TouchableOpacity
          onPress={() => setOwnIssues(0)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
          }}>
          <Image
            source={ownIssues == 0 ? checked : unchecked}
            style={{
              width: 20,
              height: 20,
              marginRight: 10,
            }}
          />
          <Text style={{ fontSize: 12, color: "black" }}>自己责任</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOwnIssues(1)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
          }}>
          <Image
            source={ownIssues == 1 ? checked : unchecked}
            style={{
              width: 20,
              height: 20,
              marginRight: 10,
            }}
          />
          <Text style={{ fontSize: 12, color: 'black' }}>店铺责任</Text>
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, flexDirection: 'row' }}>
        <Text style={{ ...CStyles.TextStyle, textAlign: 'right' }}>错误原因:</Text>
        <DropBox
          zIndex={10}
          zIndexInverse={10}
          open={mistakeListOpen}
          setOpen={setMistakeListOpen}
          value={mistake}
          setValue={setMistake}
          items={mistakeList}
          setItems={setMistakeList}
          searchable={true}
          listMode='MODAL'
        />
      </View>
    </>
  );

  return (
    <>
      {calScreen && <CalculatorScreen closeCal={countCalFunc} cancel={() => setCalScreen(false)} />}
      {scanScreen && <QRcodeScanScreen skuScanOK={skuScanOKFunc} skuScanCancel={skuScanCancelFunc} />}
      <Layout {...props} title={'盘点复查'} >
        <ScrollView style={{ flex: 1 }} KeyboardShouldPersistTaps="always" disableScrollViewPanResponder={true}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 12, color: 'black' }}>区域: {gongweiPos.pianqu} / </Text>
            <Text style={{ fontSize: 12, color: 'black' }}>工位: {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")}</Text>
          </View>

          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
            <Text style={{ ...CStyles.TextStyle, width: 25, textAlign: 'right' }}>SKU:</Text>
            <TextInput
              ref={skuRef}
              value={commoditySku}
              autoFocus={true}
              onBlur={() => setSkuInputFocus(false)}
              onFocus={() => setSkuInputFocus(true)}
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
              />
            </View>
          )} */}
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
              onKeyPress={() => { }}
              style={CStyles.InputStyle}
              showSoftInputOnFocus={false}
            />
            <Text style={{ ...CStyles.TextStyle, width: 100, textAlign: 'left' }}>/ 列:  {column}</Text>
          </View>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Button
              disabled={!confirm}
              ButtonTitle={'记录数据'}
              BtnPress={() => setAddOpen(true)}
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
              <Text style={{ ...styles.cell, flex: 1 }}>规格</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.size_code}</Text>
            </View>
            <View style={styles.container}>
              <Text style={{ ...styles.cell, flex: 1 }}>单位</Text>
              <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.unit}</Text>
            </View>
          </View>
        </ScrollView>

        <FooterBar2 screenNavigate={screenNavigate} activeBtn={2} />

        {addOpen && (
          <View style={CStyles.ModalContainer}>
            <View style={CStyles.ModalBack} />
            <View style={{ ...CStyles.ModalBoxBack }}>
              {modalMistakePart()}

              <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
                <Button
                  ButtonTitle={'返回'}
                  BtnPress={() => setAddOpen(false)}
                  type={'blueBtn'}
                  BTnWidth={120}
                />
                <Button
                  ButtonTitle={'增加'}
                  BtnPress={() => insertRow()}
                  type={'YellowBtn'}
                  BTnWidth={120}
                />
              </View>
            </View>
          </View>
        )}

        {endModalOpen && (
          <RevEndModal setEndModalOpen={setEndModalOpen} navigation={props.navigation} nextPage='InventoryReview' />
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

export default InventoryReviewAdd;
