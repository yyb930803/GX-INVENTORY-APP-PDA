import React, { useState, useEffect, memo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, VirtualizedList, Image, StyleSheet, TouchableOpacity, Alert, Dimensions, TextInput, Modal, ScrollView, DeviceEventEmitter } from 'react-native';
import ApiObject from '../../../support/Api';
import Button from '../../../components/Button';
import FooterBar2 from '../../../components/FooterBar2';
import DropBox from '../../../components/DropBox';
import CStyles from '../../../styles/CommonStyles';
import { PROGRAM_NAME } from '../../../constants';
import { DB, tbName, pipeiSKU } from '../../../hooks/dbHooks';
import SoundObject from '../../../utils/sound';
import { setScreenLoading } from '../../../reducers/BaseReducer';
import RevEndModal from '../../../components/RevEndModal';
import { BackHandler } from 'react-native';
import Layout from '../../../components/Layout';

const checked = require('../../../assets/images/checked.png');
const unchecked = require('../../../assets/images/unchecked.png');

const InventoryReviewEditList = (props) => {
  const { user, project, gongweiPos } = useSelector((state) => state.base);
  const { inventoryReviewTb } = tbName(user.id);

  const [row, setRow] = useState(0);
  const [rowList, setRowList] = useState([]);
  const [rowListOpen, setRowListOpen] = useState(false);
  const [rowDeleteOpen, setRowDeleteOpen] = useState(false);
  const [rowRestoreOpen, setRowRestoreOpen] = useState(false);
  const [flatListData, setFlatListData] = useState([]);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [ownIssues, setOwnIssues] = useState(0);
  const [mistake, setMistake] = useState('');

  useEffect(() => {
    const focusListener = props.navigation.addListener('didFocus', () => {
      getFlatListData();
      getRowListData();
    });

    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      focusListener.remove();
      backHandlerListener.remove();
    };
  }, [props.navigation]);

  const BackBtnPress = async () => {
    setEndModalOpen(true);
  };

  useEffect(() => {
    getFlatListData();
  }, [row]);

  const getFlatListData = async () => {
    DB.transaction((tx) => {
      tx.executeSql(
        row == 0 ? `SELECT * FROM ${inventoryReviewTb} WHERE gongwei_id = ? ORDER BY row ASC, column ASC` : `SELECT * FROM ${inventoryReviewTb} WHERE "row" = ? AND gongwei_id = ? ORDER BY row ASC, column ASC`,
        row == 0 ? [gongweiPos.id] : [row, gongweiPos.id],
        async (tx, results) => {
          var list = [];
          for (let i = 0; i < results.rows.length; i++) {
            let item = {};
            item.row = results.rows.item(i).row;
            item.column = results.rows.item(i).column;
            item.commodity_sku = results.rows.item(i).commodity_sku;
            item.commodity_name = results.rows.item(i).commodity_name;
            item.count = results.rows.item(i).count;
            item.delete_flag = results.rows.item(i).delete_flag;
            item.record_id = results.rows.item(i).record_id;
            item.size = results.rows.item(i).size;
            item.color = results.rows.item(i).color;
            list.push(item);
          }
          setFlatListData(list);
        },
      );
    });
  };

  const getRowListData = async () => {
    DB.transaction(async tx => {
      tx.executeSql(`SELECT "row" FROM ${inventoryReviewTb} WHERE gongwei_id = ? GROUP BY  "row"`,
        [gongweiPos.id],
        async (tx, results) => {
          let list = [];
          list.push({ label: "全部", value: 0 });
          for (let i = 0; i < results.rows.length; i++) {
            let temp = {};
            temp.label = results.rows.item(i).row;
            temp.value = results.rows.item(i).row;
            list.push(temp);
          }
          setRowList(list);
        }
      )
    });
  }

  const screenNavigate = (id) => {
    if (id == 1) {
      props.navigation.navigate('InventoryReviewEditList');
    } else if (id == 2) {
      props.navigation.navigate('InventoryReviewAdd');
    }
  };

  const deleteRow = () => {
    if (flatListData.length == 0) {
      Alert.alert(
        PROGRAM_NAME,
        '没有数据。',
        [{ text: '是(OK)', onPress: () => { } }],
        { cancelable: false },
      );
    } else {
      var date = new Date();
      var scantime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

      if (row == 0) {
        DB.transaction((tx) => {
          tx.executeSql(
            `UPDATE ${inventoryReviewTb} SET delete_flag = 1, scan_time = ?, upload = ?, mistakes_id = ?, mistakes_type = ? WHERE gongwei_id =?`,
            [scantime, "new", mistake, ownIssues, gongweiPos.id],
            (tx, results) => {
              getFlatListData();
              setRowDeleteOpen(false);
            },
          );
        });
      } else {
        DB.transaction((tx) => {
          tx.executeSql(
            `UPDATE ${inventoryReviewTb} SET delete_flag = 1, scan_time = ?, upload = ?, mistakes_id = ?, mistakes_type = ? WHERE row = ? AND gongwei_id =?`,
            [scantime, "new", mistake, ownIssues, row, gongweiPos.id],
            (tx, results) => {
              getFlatListData();
              setRowDeleteOpen(false);
            },
          );
        });
      }
    }
  };

  const recoverRow = () => {
    if (flatListData.length == 0) {
      Alert.alert(
        PROGRAM_NAME,
        '没有数据。',
        [{ text: '是(OK)', onPress: () => { } }],
        { cancelable: false },
      );
    } else {
      var date = new Date();
      var scantime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

      if (row == 0) {
        DB.transaction((tx) => {
          tx.executeSql(
            `UPDATE ${inventoryReviewTb} SET delete_flag = 0 , scan_time = ?, upload = ?, mistakes_id = ?, mistakes_type = ? WHERE gongwei_id=?`,
            [scantime, "new", mistake, ownIssues, gongweiPos.id],
            (tx, results) => {
              getFlatListData();
              setRowRestoreOpen(false);
            },
          );
        });
      } else {
        DB.transaction((tx) => {
          tx.executeSql(
            `UPDATE ${inventoryReviewTb} SET delete_flag = 0 , scan_time = ?, upload = ?, mistakes_id = ?, mistakes_type = ? WHERE row = ? AND gongwei_id=?`,
            [scantime, "new", mistake, ownIssues, row, gongweiPos.id],
            (tx, results) => {
              getFlatListData();
              setRowRestoreOpen(false);
            },
          );
        });
      }
    }
  };

  const _renderitem = ({ item }) => <MemoRenderItem item={item} />;

  return (
    <Layout {...props} title={'盘点复查'}>
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
          <Text style={{ fontSize: 12 }}>区域: {gongweiPos.pianqu} / </Text>
          <Text style={{ fontSize: 12 }}>工位: {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")}</Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 10, flexDirection: 'row' }}>
          <Text style={{ ...CStyles.TextStyle, textAlign: 'right' }}>层:</Text>
          <DropBox
            zIndex={10}
            zIndexInverse={10}
            open={rowListOpen}
            setOpen={setRowListOpen}
            value={row}
            setValue={setRow}
            items={rowList}
            setItems={setRowList}
            searchable={true}
            listMode='MODAL'
          />
        </View>

        <View style={styles.container}>
          <Text style={[styles.head, { flex: 1 }]}>层/列</Text>
          <Text style={[styles.head, { flex: 4 }]}>SKU/名称</Text>
          <Text style={[styles.head, { flex: 1 }]}>颜色</Text>
          <Text style={[styles.head, { flex: 1 }]}>尺码</Text>
          <Text style={[styles.head, { flex: 1 }]}>数量</Text>
          <Text style={[styles.head, { flex: 2.5 }]}>操作</Text>
        </View>
        <VirtualizedList
          vertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          data={flatListData}
          renderItem={_renderitem}
          keyExtractor={(item, index) => index + `${item.id}`}
          removeClippedSubviews={false}
          getItemCount={() => flatListData.length}
          getItem={(data, index) => data[index]}
          disableScrollViewPanResponder={true}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginVertical: 10,
          }}
        >
          <Button
            ButtonTitle={'恢复层'}
            BtnPress={() => setRowRestoreOpen(true)}
            type={'yellowBtn'}
            BTnWidth={Dimensions.get('window').width * 0.4}
          />
          <Button
            ButtonTitle={'删除层'}
            BtnPress={() => setRowDeleteOpen(true)}
            type={'blueBtn'}
            BTnWidth={Dimensions.get('window').width * 0.4}
          />
        </View>
      </View>

      <FooterBar2 screenNavigate={screenNavigate} activeBtn={1} />

      <Modal visible={rowDeleteOpen} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <Text style={styles.itemArea}>区域: {gongweiPos.pianqu} / </Text>
              <Text style={styles.itemArea}>工位: {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")} / </Text>
              <Text style={styles.itemArea}>层: {row}</Text>
            </View>

            <ModalMistakePart ownIssues={ownIssues} setOwnIssues={setOwnIssues} mistake={mistake} setMistake={setMistake} />

            <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
              <Button
                ButtonTitle={'返回'}
                BtnPress={() => setRowDeleteOpen(false)}
                type={'blueBtn'}
                BTnWidth={120}
              />
              <Button
                ButtonTitle={'删除'}
                BtnPress={() => deleteRow()}
                type={'YellowBtn'}
                BTnWidth={120}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={rowRestoreOpen} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
              <Text style={styles.itemArea}>区域: {gongweiPos.pianqu} / </Text>
              <Text style={styles.itemArea}>工位: {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")} / </Text>
              <Text style={styles.itemArea}>层: {row}</Text>
            </View>

            <ModalMistakePart ownIssues={ownIssues} setOwnIssues={setOwnIssues} mistake={mistake} setMistake={setMistake} />

            <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
              <Button
                ButtonTitle={'返回'}
                BtnPress={() => setRowRestoreOpen(false)}
                type={'blueBtn'}
                BTnWidth={120}
              />
              <Button
                ButtonTitle={'恢复'}
                BtnPress={() => recoverRow()}
                type={'YellowBtn'}
                BTnWidth={120}
              />
            </View>
          </View>
        </View>
      </Modal>

      {endModalOpen && (
        <RevEndModal setEndModalOpen={setEndModalOpen} navigation={props.navigation} nextPage='InventoryReview' />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  head: {
    padding: 2,
    paddingTop: 8,
    height: 30,
    borderWidth: 1,
    borderColor: '#9f9f9f',
    backgroundColor: '#f1f8ff',
    fontSize: 10,
    textAlign: 'center',
    color: "black"
  },
  title: {
    padding: 2,
    borderWidth: 1,
    borderColor: '#9f9f9f',
    textAlign: 'center',
    fontSize: 10,
    backgroundColor: '#fff',
    color: "black"
  },
  deleteBtn: {
    backgroundColor: '#f8022e',
    borderRadius: 2,
  },
  editBtn: {
    backgroundColor: '#012964',
    borderRadius: 4,
  },
  restoreBtn: {
    backgroundColor: '#F8B502',
    borderRadius: 2,
  },
  btnText: {
    padding: 2,
    textAlign: 'center',
    color: '#fff',
    fontSize: 10,
  },
  itemArea: {
    fontSize: 14,
    textAlign: 'center',
    color: "black"
  },
  cell: {
    height: 25,
    lineHeight: 25,
    borderWidth: 1,
    borderColor: '#9f9f9f',
    backgroundColor: '#f1f8ff',
    fontSize: 10,
    textAlign: 'center',
    color: "black"
  },
});

export default InventoryReviewEditList;

const renderItem = ({ item }) => {
  const { user, project, gongweiPos } = useSelector((state) => state.base);
  const { inventoryReviewTb } = tbName(user.id);

  const [record, setRecord] = useState(item);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [pipeiItem, setPipeiItem] = useState(null);
  const [newCount, setNewCount] = useState('');
  const [ownIssues, setOwnIssues] = useState(0);
  const [mistake, setMistake] = useState('');
  const newCountRef = useRef(null);

  useEffect(() => {
    setRecord(item);
  }, [item]);

  useEffect(() => {
    if (editOpen && pipeiItem === null) {
      pipeiFunc();
    }
  }, [editOpen]);

  useEffect(() => {
    if (deleteOpen && pipeiItem === null) {
      pipeiFunc();
    }
  }, [deleteOpen]);

  useEffect(() => {
    if (restoreOpen && pipeiItem === null) {
      pipeiFunc();
    }
  }, [restoreOpen]);

  useEffect(() => {
    const handleKeyUp = (eventData) => {
      if ([192, 193, 194].includes(eventData.scanCode)) {
      } else if (eventData.scanCode === 28) {
        if (editOpen) {
          editLayerConfirm();
        }
      }
    };

    const deviceEventEmitterListener = DeviceEventEmitter.addListener('onKeyUp', handleKeyUp);
    return () => {
      deviceEventEmitterListener.remove();
    }
  }, [editOpen, newCount]);

  const pipeiFunc = async () => {
    if (record) {
      setPipeiItem(await pipeiSKU(record.commodity_sku, user.id));
    }
  }

  const editLayerConfirm = () => {
    if (newCount == "") {
      SoundObject.playSound('alert');

      Alert.alert(
        PROGRAM_NAME,
        '请正确输入修改数量位置信息。',
        [{ text: '是(OK)', onPress: () => { newCountRef.current.focus(); } }],
        { cancelable: false },
      );
    } else if (Number(newCount) > project.quantity_max || Number(newCount) < project.quantity_min) {
      SoundObject.playSound('alert');

      Alert.alert(
        PROGRAM_NAME,
        '输入的数量超出设置范围。 是否要输入超出设置范围的数量？',
        [
          { text: '是(Y)', onPress: () => editLayer() },
          { text: '不(N)', onPress: () => { setNewCount(''); newCountRef.current.focus(); } },
        ],
        { cancelable: false },
      );
    } else {
      editLayer();
    }
  }

  const editLayer = () => {
    var date = new Date();
    var scantime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

    DB.transaction(tx => {
      tx.executeSql(
        `UPDATE ${inventoryReviewTb} SET count = ? , delete_flag = 0, upload = "new", scan_time = ?, mistakes_id = ?, mistakes_type = ? where record_id = ?`,
        [Number(newCount), scantime, mistake, ownIssues, record.record_id],
        (tx, results) => {
          setEditOpen(false);
          setNewCount('');
          setMistake('');
          setOwnIssues('');
          setRecord((preData) => ({ ...preData, count: newCount, delete_flag: 0 }));
        }
      )
    });
  }

  const deleteLayer = () => {
    var date = new Date();
    var scantime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

    DB.transaction(tx => {
      tx.executeSql(
        `UPDATE ${inventoryReviewTb} SET delete_flag = 1, upload = "new", scan_time = ?, mistakes_id = ?, mistakes_type = ? where record_id = ?`,
        [scantime, mistake, ownIssues, record.record_id],
        (tx, results) => {
          setDeleteOpen(false);
          setMistake('');
          setOwnIssues('');
          setRecord((preData) => ({ ...preData, delete_flag: 1 }));
        }
      )
    });
  }

  const restoreLayer = () => {
    var date = new Date();
    var scantime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

    DB.transaction(tx => {
      tx.executeSql(
        `UPDATE ${inventoryReviewTb} SET delete_flag = 0, upload = "new", scan_time = ?, mistakes_id = ?, mistakes_type = ? WHERE record_id = ?`,
        [scantime, mistake, ownIssues, record.record_id],
        (tx, results) => {
          setRestoreOpen(false);
          setMistake('');
          setOwnIssues('');
          setRecord((preData) => ({ ...preData, delete_flag: 0 }));
        }
      )
    });
  }

  const modalInfoPart = () => (
    <>
      <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
        <Text style={styles.itemArea}>区域: {gongweiPos.pianqu} / </Text>
        <Text style={styles.itemArea}>工位: {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")} / </Text>
        <Text style={styles.itemArea}>层: {record.row} / </Text>
        <Text style={styles.itemArea}>列: {record.column} </Text>
      </View>

      <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginVertical: 10 }}>
        <Text style={{ fontSize: 14, color: 'black' }}>
          SKU: {record.commodity_sku}
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={{ ...styles.cell, flex: 1 }}>商品名称</Text>
        <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem?.commodity_name}</Text>
      </View>
      <View style={styles.container}>
        <Text style={{ ...styles.cell, flex: 1 }}>价搭</Text>
        <Text style={{ ...styles.cell, flex: 3 }}>{pipeiItem ? (parseFloat(pipeiItem?.commodity_price).toFixed(2).toString()) + '元' : ''}</Text>
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
    </>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
          {record.row}/{record.column}
        </Text>
        <Text style={[styles.title, { flex: 4, textAlignVertical: 'center' }]}>
          {record.commodity_sku}{"\n"}{record.commodity_name != null && record.commodity_name != "" ? record.commodity_name : "不在档"}
        </Text>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
          {record.color}
        </Text>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
          {record.size}
        </Text>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
          {record.count}
        </Text>
        <View style={[styles.title, { flex: 2.5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }]}>
          <TouchableOpacity
            onPress={() => setEditOpen(true)}
            style={{ paddingRight: 10 }}
          >
            <View style={styles.editBtn}>
              <Text style={styles.btnText}>修改</Text>
            </View>
          </TouchableOpacity>
          {record.delete_flag == 1 ? (
            <TouchableOpacity
              onPress={() => setRestoreOpen(true)}
            >
              <View style={styles.restoreBtn}>
                <Text style={styles.btnText}>恢复</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setDeleteOpen(true)}
            >
              <View style={styles.deleteBtn}>
                <Text style={styles.btnText}>删除</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={editOpen} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <ScrollView>
              {modalInfoPart()}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 12 }}>
                  原数量: {record.count} 个
                </Text>
                <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row', paddingVertical: 5 }}>
                  <Text style={{ ...CStyles.TextStyle, width: 60, textAlign: 'right' }}>修改数量:</Text>
                  <TextInput
                    ref={newCountRef}
                    keyboardType={'numeric'}
                    autoFocus={true}
                    value={newCount.toString()}
                    onChangeText={(val) => setNewCount(val.replace(/[^0-9]/g, ''))}
                    style={CStyles.InputStyle}
                    showSoftInputOnFocus={false}
                  />
                  <Text style={{ ...CStyles.TextStyle, textAlign: 'right' }}> 个</Text>
                </View>
              </View>

              <ModalMistakePart ownIssues={ownIssues} setOwnIssues={setOwnIssues} mistake={mistake} setMistake={setMistake} />
            </ScrollView>

            <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
              <Button
                ButtonTitle={'返回'}
                BtnPress={() => setEditOpen(false)}
                type={'blueBtn'}
                BTnWidth={120}
              />
              <Button
                ButtonTitle={'确定'}
                BtnPress={() => editLayerConfirm()}
                type={'YellowBtn'}
                BTnWidth={120}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteOpen} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <ScrollView>
              {modalInfoPart()}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 12 }}>
                  原数量: {record.count} 个
                </Text>
              </View>

              <ModalMistakePart ownIssues={ownIssues} setOwnIssues={setOwnIssues} mistake={mistake} setMistake={setMistake} />
            </ScrollView>

            <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
              <Button
                ButtonTitle={'返回'}
                BtnPress={() => setDeleteOpen(false)}
                type={'blueBtn'}
                BTnWidth={120}
              />
              <Button
                ButtonTitle={'删除'}
                BtnPress={() => deleteLayer()}
                type={'YellowBtn'}
                BTnWidth={120}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={restoreOpen} transparent={true}>
        <View style={CStyles.modalContainer}>
          <View style={CStyles.modalContent}>
            <ScrollView>
              {modalInfoPart()}

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 12 }}>
                  原数量: {record.count} 个
                </Text>
              </View>

              <ModalMistakePart ownIssues={ownIssues} setOwnIssues={setOwnIssues} mistake={mistake} setMistake={setMistake} />
            </ScrollView>
            <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', marginTop: 10 }}>
              <Button
                ButtonTitle={'返回'}
                BtnPress={() => setRestoreOpen(false)}
                type={'blueBtn'}
                BTnWidth={120}
              />
              <Button
                ButtonTitle={'恢复'}
                BtnPress={() => restoreLayer()}
                type={'YellowBtn'}
                BTnWidth={120}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
};

const MemoRenderItem = memo(renderItem);

const ModalMistakePart = ({ ownIssues, setOwnIssues, mistake, setMistake }) => {
  const { project } = useSelector((state) => state.base);
  const [mistakeList, setMistakeList] = useState([]);
  const [mistakeListOpen, setMistakeListOpen] = useState(false);

  useEffect(() => {
    getMistakesList();
  }, []);

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

  return (
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
          <Text style={{ fontSize: 12 }}>店铺责任</Text>
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
  )
};
