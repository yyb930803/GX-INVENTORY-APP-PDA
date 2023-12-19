import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Alert, VirtualizedList, Dimensions, TextInput, BackHandler, NativeModules, DeviceEventEmitter } from 'react-native';
import ApiObject from '../../../support/Api';
import Layout from '../../../components/Layout';
import Button from '../../../components/Button';
import DropBox from '../../../components/DropBox';
import FooterBar4 from '../../../components/FooterBar4';
import QRcodeScanScreen from '../../../components/QRcodeScanScreen';
import CStyles from '../../../styles/CommonStyles';
import { INV_TYPE, PROGRAM_NAME } from '../../../constants';
import { DB, tbName, getPianquList } from '../../../hooks/dbHooks';
import SoundObject from '../../../utils/sound';
import { setRowPos, setScreenLoading, setColumnPos, setGongweiPos } from '../../../reducers/BaseReducer';

const AreaValue = (props) => {
  const dispatch = useDispatch();
  const { ScanModule } = NativeModules;
  const { user, project } = useSelector((state) => state.base);
  const { scandataTb, gongweiMasterTb } = tbName(user.id);

  const [flatListData, setFlatListData] = useState([]);
  const [pianqushow, setPianqushow] = useState(false);
  const [openScan, setOpenScan] = useState(false);
  const [gongwei, setGongwei] = useState('');
  const [pianqu, setPianqu] = useState('');
  const [pianquList, setPianquList] = useState([]);
  const [pianquListOpen, setPianquListOpen] = useState(false);

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
          dispatch(setScreenLoading(true));
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

  const toNextStep = useCallback(async (gongwi = gongwei) => {
    if (gongwi !== '') {
      const results = await Promise.all([
        new Promise((resolve, reject) => {
          DB.transaction((tx) => {
            tx.executeSql(
              `SELECT * FROM ${gongweiMasterTb} WHERE gongwei = ?`,
              [Number(gongwi)],
              (tx, results) => {
                resolve(results);
              },
              (error) => {
                reject(error);
              }
            );
          });
        }),
        getPianquList(user.id)
      ]);

      const gongweiResults = results[0];
      const listresult = results[1];

      if (gongweiResults.rows.length > 0) {
        gongWeiWorkCheck(gongweiResults.rows.item(0));
      } else {
        SoundObject.playSound('alert');
        Alert.alert(
          PROGRAM_NAME,
          '此工位不存在。 你想继续吗？',
          [
            {
              text: '是(Y)',
              onPress: async () => {
                if (listresult.length > 0) {
                  setPianquList(listresult);
                } else {
                  let list = [
                    { label: '卖场', value: '卖场' },
                    { label: '库房', value: '库房' }
                  ];
                  setPianquList(list);
                }
                setPianqushow(true);
              }
            },
            { text: '否(N)', onPress: () => { setGongwei(''); gongweiRef.current.focus(); } }
          ],
          { cancelable: false }
        );
      }
    } else {
      SoundObject.playSound('alert');
      Alert.alert(
        PROGRAM_NAME,
        '请正确输入工位位置信息。',
        [{ text: '是(ok)', onPress: () => { gongweiRef.current.focus() } }],
        { cancelable: false }
      );
    }

    dispatch(setScreenLoading(false));
  }, [dispatch, gongwei, gongweiMasterTb, getPianquList, setGongwei, setPianquList, setPianqushow, user.id, project]);

  const gongWeiWorkCheck = async (gongweiItem) => {
    var result = await ApiObject.gongweiCheck({ qrcode: project.qrcode, position: gongweiItem.gongwei, work_type: INV_TYPE, force: false });

    if (result !== null) {
      if (result == 'reApiForce') {
        result = await ApiObject.gongweiCheck({ qrcode: project.qrcode, position: gongweiItem.gongwei, work_type: INV_TYPE, force: true });
        if (result !== null) {
          gotoInventoryMain(gongweiItem);
        }
      } else {
        gotoInventoryMain(gongweiItem);
      }
    } else {
      setGongwei('');
      gongweiRef.current.focus();
    }
  };

  const gotoInventoryMain = async (gongweiItem) => {
    const result = await new Promise((resolve, reject) => {
      DB.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${scandataTb} WHERE gongwei_id = ?`,
          [gongweiItem.id],
          (tx, results) => {
            if (results.rows.length === 0) {
              resolve({ row: '1', column: '1' });
            } else {
              const lastRow = results.rows.item(results.rows.length - 1).row.toString();
              const lastColumn = (results.rows.item(results.rows.length - 1).column + 1).toString();
              resolve({ row: lastRow, column: lastColumn });
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    });

    dispatch(setRowPos(result.row));
    dispatch(setColumnPos(result.column));


    dispatch(setGongweiPos(gongweiItem));
    if (project.quantity_min == project.quantity_max) {
      props.navigation.navigate('InventoryMainA');
    } else {
      props.navigation.navigate('InventoryMain');
    }
  }

  const newGongweiAdd = async () => {
    dispatch(setScreenLoading(true));

    if (pianqu == "") {
      Alert.alert(
        PROGRAM_NAME,
        '请选择一个',
        [{ text: '是(OK)', onPress: () => { } }],
        { cancelable: false },
      );
    } else {
      var result = await ApiObject.newGongweiAdd({ qrcode: project.qrcode, pianqu: pianqu, gongwei: Number(gongwei.toString().slice(0, 16)) });
      if (result !== null) {
        DB.transaction((txn) => {
          txn.executeSql(
            `INSERT INTO ${gongweiMasterTb} ("id", "pianqu", "gongwei") VALUES (?,?,?)`,
            [
              result,
              pianqu,
              Number(gongwei.toString().slice(0, 16))
            ],
            async (txn, results) => {
              gongWeiWorkCheck({ id: result, pianqu: pianqu, gongwei: Number(gongwei.toString().slice(0, 16)) });
              setPianqushow(false);
            },
          );
        });
      }
    }

    dispatch(setScreenLoading(false));
  };

  const getAllScanData = async () => {
    const results = await new Promise((resolve, reject) => {
      DB.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${scandataTb} LEFT JOIN ${gongweiMasterTb} ON ${scandataTb}.gongwei_id = ${gongweiMasterTb}.id`,
          [],
          (tx, results) => {
            resolve(results);
          },
          (error) => {
            reject(error);
          }
        );
      });
    });

    if (results.rows.length === 0) {
      Alert.alert(
        PROGRAM_NAME,
        '没有数据。',
        [{ text: '是(ok)', onPress: () => { } }],
        { cancelable: false },
      );
    } else {
      var tableDataArray = [];
      for (let i = 0; i < results.rows.length; i++) {
        var item = [];

        item.push(results.rows.item(i).pianqu);
        item.push(results.rows.item(i).gongwei.toString().padStart(project.gongwei_max, "0"));
        item.push(results.rows.item(i).commodity_sku);
        item.push(results.rows.item(i).count);
        item.push(results.rows.item(i).commodity_name);
        item.push(results.rows.item(i).row);
        item.push(results.rows.item(i).column);
        item.push(results.rows.item(i).color);
        item.push(results.rows.item(i).size);

        tableDataArray.push(item);
      }

      setFlatListData(tableDataArray);
    }
  }

  const gongweiInputChange = (e) => {
    dispatch(setScreenLoading(true));
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

  const _renderitem = ({ item }) => <MemoRenderItem item={item} />;

  return (
    <>
      {openScan && <QRcodeScanScreen skuScanOK={(val) => {
        setGongwei(val);
        setOpenScan(false);
        dispatch(setScreenLoading(true));
        toNextStep(val);
      }} skuScanCancel={() => setOpenScan(false)} />}
      <Layout {...props} title={'盘点'}>
        <View style={{ flex: 1 }}>
          <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 10 }}>
            <Text style={CStyles.TextStyle}>工位:</Text>
            <TextInput
              ref={gongweiRef}
              value={gongwei}
              autoFocus={true}
              keyboardType={"numeric"}
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
              marginTop: 0,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <Button
              ButtonTitle={'下一步'}
              BtnPress={() => { dispatch(setScreenLoading(true)), toNextStep() }}
              type={'blueBtn'}
              BTnWidth={Dimensions.get('window').width * 0.9}
            />
          </View>

          <View
            style={{
              marginTop: 10,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <Button
              ButtonTitle={'综合数据'}
              BtnPress={() => getAllScanData()}
              type={'blueBtn'}
              BTnWidth={Dimensions.get('window').width * 0.9}
            />
          </View>

          {flatListData.length !== 0 && (
            <>
              <View style={styles.container}>
                <Text style={[styles.head, { flex: 3 }]}>片区/工位/层/列</Text>
                <Text style={[styles.head, { flex: 3 }]}>sku</Text>
                <Text style={[styles.head, { flex: 2 }]}>姓名</Text>
                <Text style={[styles.head, { flex: 1 }]}>颜色</Text>
                <Text style={[styles.head, { flex: 1 }]}>尺码</Text>
                <Text style={[styles.head, { flex: 1 }]}>数量</Text>
              </View>

              <VirtualizedList
                vertical={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={true}
                data={flatListData}
                renderItem={_renderitem}
                keyExtractor={(item, index) => index + `${item.id}`}
                removeClippedSubviews={false}
                getItemCount={() => flatListData.length}
                getItem={(data, index) => data[index]}
              />
            </>
          )}
        </View>

        <FooterBar4
          screenInventory={() => props.navigation.navigate('InventoryInit')}
          screenQuantity={() => props.navigation.navigate('QuantityInit')}
        />

        {pianqushow && (
          <View style={CStyles.ModalContainer}>
            <View style={CStyles.ModalBack} />
            <View style={CStyles.ModalBoxBack}>
              <View>
                <Text style={{ fontSize: 14 }}>{PROGRAM_NAME}</Text>
              </View>

              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Text style={{ textAlign: 'left', fontSize: 12 }}>
                  有多个片区入货架的区域。请选择一个。
                </Text>
              </View>

              <View style={{ justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 3 }}>
                <Text style={{ ...CStyles.TextStyle, textAlign: 'right' }}>片区:</Text>
                <DropBox
                  zIndex={2000}
                  zIndexInverse={2000}
                  open={pianquListOpen}
                  setOpen={setPianquListOpen}
                  value={pianqu}
                  setValue={setPianqu}
                  items={pianquList}
                  setItems={setPianquList}
                  searchable={true}
                  listMode='MODAL'
                />
              </View>

              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginTop: 20,
                }}
              >
                <Button
                  ButtonTitle={'确定'}
                  BtnPress={() => newGongweiAdd()}
                  type={'YellowBtn'}
                  BTnWidth={120}
                />
                <Button
                  ButtonTitle={'返回'}
                  BtnPress={() => setPianqushow(false)}
                  type={'blueBtn'}
                  BTnWidth={120}
                />
              </View>
            </View>
          </View>
        )}
      </Layout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    flexDirection: 'row',
  },

  sumdata: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#9f9f9f',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: "black"
  },

  head: {
    height: 30,
    textAlignVertical: 'center',
    borderWidth: 1,
    borderColor: '#9f9f9f',
    marginTop: 10,
    backgroundColor: '#f1f8ff',
    fontSize: 10,
    textAlign: 'center'
  },
});

export default AreaValue;

const renderItem = ({ item }) => (
  <View style={{ flexDirection: 'row', textAlign: 'center' }}>
    <Text style={[styles.sumdata, { flex: 3 }]}>{item[0]}/{item[1]}/{item[5]}/{item[6]}</Text>
    <Text style={[styles.sumdata, { flex: 3 }]}>{item[2]}</Text>
    <Text style={[styles.sumdata, { flex: 2 }]}>{item[4]}</Text>
    <Text style={[styles.sumdata, { flex: 1 }]}>{item[7]}</Text>
    <Text style={[styles.sumdata, { flex: 1 }]}>{item[8]}</Text>
    <Text style={[styles.sumdata, { flex: 1 }]}>{item[3]}</Text>
  </View>
);

const MemoRenderItem = memo(renderItem);
