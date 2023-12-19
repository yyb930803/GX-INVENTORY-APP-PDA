import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollView } from 'react-native';
import { View, Text, Dimensions } from 'react-native';
import ApiObject from '../../../support/Api';
import Button from '../../../components/Button';
import Layout from '../../../components/Layout';
import CStyles from '../../../styles/CommonStyles';
import DropBox from '../../../components/DropBox';
import { getGenMtCount, getCatMtCount, getInvMtCount, getGongMtCount, insertGenMt, insertInvMt, insertCatMt, insertGongMt } from '../../../hooks/dbHooks';
import {
  setCategoryTime, setGeneralTime, setInventoryTime, setPiangongTime, setScreenLoading, setZudang,
  setgeneralDown, setinventoryDown, setcategoryDown, setgongweiDown
} from '../../../reducers/BaseReducer';
import { BackHandler } from 'react-native';

const MasterFile = (props) => {
  const dispatch = useDispatch();
  const { user, project, generalTime, inventoryTime, categoryTime, piangongTime, useZudang, generalDown,
    inventoryDown, categoryDown, gongweiDown
  } = useSelector((state) => state.base);

  const [genMtCount, setGenMtCount] = useState(0);
  const [invMtCount, setInvMtCount] = useState(0);
  const [catMtCount, setCatMtCount] = useState(0);
  const [gongMtCount, setGongMtCount] = useState(0);

  const [row, setRow] = useState(0);
  const [rowList, setRowList] = useState([{ label: "使用", value: 0 }, { label: "不使用", value: 1 }]);
  const [rowListOpen, setRowListOpen] = useState(false);

  const [generalDiff, setGeneralDiff] = useState(!generalDown);
  const [inventoryDiff, setInventoryDiff] = useState(!inventoryDown);
  const [categoryDiff, setCategoryDiff] = useState(!categoryDown);
  const [gongweiDiff, setGongweiDiff] = useState(!gongweiDown);

  useEffect(() => {
    const fetchData = async () => {
      setInvMtCount(await getInvMtCount(user.id));
      setGenMtCount(await getGenMtCount(user.id));
      setCatMtCount(await getCatMtCount(user.id));
      setGongMtCount(await getGongMtCount(user.id));

      const data = await ApiObject.updateCheck({ qrcode: project.qrcode, general_time: generalTime, inventory_time: inventoryTime, category_time: categoryTime, piangong_time: piangongTime });
      if (data) {
        if (generalDown) setGeneralDiff(data.general);
        if (inventoryDown) setInventoryDiff(data.inventory);
        if (categoryDown) setCategoryDiff(data.category);
        if (gongweiDown) setGongweiDiff(data.piangong);
      }
    };

    fetchData();
    
    const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
    return () => {
      backHandlerListener.remove();
    };
  }, []);

  useEffect(() => {
    dispatch(setZudang(row))
  }, [row])


  useEffect(() => {
    setRow(useZudang)
  }, [])

  const genMtDown = async () => {
    dispatch(setScreenLoading(true));

    var data = await ApiObject.getGeneralList({ qrcode: project.qrcode });
    if (data && data != null && data != "" && data.length > 0) {
      await insertGenMt(user.id, data);

      var date = new Date();
      var general_time = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

      dispatch(setGeneralTime(general_time));
      setGenMtCount(data.length);
    }
    dispatch(setgeneralDown(true));
    setGeneralDiff(false);
    dispatch(setScreenLoading(false));
  }

  const catMtDown = async () => {
    dispatch(setScreenLoading(true));

    var data = await ApiObject.getCategoryList({ qrcode: project.qrcode });
    if (data && data != null && data != "" && data.length > 0) {
      await insertCatMt(user.id, data);

      var date = new Date();
      var downloadTime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

      dispatch(setCategoryTime(downloadTime));
      setCatMtCount(data.length);
    }
    setCategoryDiff(false);
    dispatch(setcategoryDown(true));
    dispatch(setScreenLoading(false));
  }

  const invMtDown = async () => {
    dispatch(setScreenLoading(true));

    var data = await ApiObject.getInventoryList({ qrcode: project.qrcode });
    if (data && data != null && data != "" && data.length > 0) {
      await insertInvMt(user.id, data);

      var date = new Date();
      var downloadTime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

      dispatch(setInventoryTime(downloadTime));
      setInvMtCount(data.length);
    }
    setInventoryDiff(false);
    dispatch(setinventoryDown(true));
    dispatch(setScreenLoading(false));
  }

  const gongMtDown = async () => {
    dispatch(setScreenLoading(true));

    var data = await ApiObject.getPianGongList({ qrcode: project.qrcode });
    if (data && data != null && data != "" && data.length > 0) {
      await insertGongMt(user.id, data);

      var date = new Date();
      var downloadTime = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');

      dispatch(setPiangongTime(downloadTime));
      setGongMtCount(data.length);
    }
    setGongweiDiff(false);
    dispatch(setgongweiDown(true));
    dispatch(setScreenLoading(false));
  }

  const BackBtnPress = () => {
    props.navigation.navigate('Inventory');
  };

  const toInventory = async () => {
    props.navigation.navigate('AreaValue');
  };

  return (
    <Layout {...props} title={'主档'}>
    <View style={{ position: 'relative', flex: 1 }}>
      <ScrollView style={{ position: 'relative', paddingTop: 5 }}>
        {project.general == 1 && (
          <View style={{ alignItems: 'center', marginTop: 5 }}>
            <Button
              ButtonTitle={'下载新版通用主档'}
              BtnPress={() => genMtDown()}
              type={'blueBtn'}
              notification={generalDiff}
              BTnWidth={Dimensions.get('window').width * 0.9}
            />
          </View>
        )}

        <View style={{ alignItems: 'center', marginTop: 5 }}>
          <Button
            ButtonTitle={'下载新版库存主档'}
            BtnPress={() => invMtDown()}
            notification={inventoryDiff}
            type={'blueBtn'}
            BTnWidth={Dimensions.get('window').width * 0.9}
          />
        </View>

        <View style={{ alignItems: 'center', marginTop: 5 }}>
          <Button
            ButtonTitle={'下载新版类别主档'}
            BtnPress={() => catMtDown()}
            notification={categoryDiff}
            type={'blueBtn'}
            BTnWidth={Dimensions.get('window').width * 0.9}
          />
        </View>

        <View style={{ alignItems: 'center', marginTop: 5 }}>
          <Button
            ButtonTitle={'下载新版区域主档'}
            BtnPress={() => gongMtDown()}
            notification={gongweiDiff}
            type={'blueBtn'}
            BTnWidth={Dimensions.get('window').width * 0.9}
          />
        </View>

        <View style={{ paddingHorizontal: 30, paddingVertical: 10 }}>
          {project.general == 1 && (
            <Text style={CStyles.TxTStyle}>
              通用主档数：{genMtCount}
            </Text>
          )}

          <Text style={CStyles.TxTStyle}>
            库存主档数：{invMtCount}
          </Text>

          <Text style={CStyles.TxTStyle}>
            类别主档数：{catMtCount}
          </Text>

          <Text style={CStyles.TxTStyle}>
            货架主档数：{gongMtCount}
          </Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, flexDirection: 'row' }}>
          <Text style={{ ...CStyles.TextStyle, textAlign: 'right' }}>选择:</Text>
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
        <View style={{ marginTop: 10, alignItems: 'center', marginBottom: 20 }}>
          <Button
            ButtonTitle={'下一步'}
            BtnPress={() => toInventory()}
            type={'yellowBtn'}
            BTnWidth={Dimensions.get('window').width * 0.9}
          />
        </View>
      </ScrollView>
    </View>
    </Layout>
  );
}

export default MasterFile;
