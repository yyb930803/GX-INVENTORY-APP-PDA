import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, Dimensions } from 'react-native';
import CStyles from '../styles/CommonStyles';
import Button from './Button';
import { setScreenLoading, setRowPos, setColumnPos, setGongweiPos, setSkuCount } from '../reducers/BaseReducer';
import { DB, tbName, getInvNewGongweiData } from '../hooks/dbHooks';
import ApiObject from '../support/Api';
import { INV_TYPE, PROGRAM_NAME } from '../constants';

const InvEndModal = (props) => {
    const dispatch = useDispatch();
    const { user, project, gongweiPos } = useSelector(state => state.base);
    const { scandataTb } = tbName(user.id);

    const getUploadData = async () => {
        dispatch(setScreenLoading(true));
        await uploadScanData();
    };

    const uploadScanData = async () => {
        const data = await getInvNewGongweiData(user.id, gongweiPos.id);
        if (data.length > 0) {
            const result = await ApiObject.uploadScanData({ data: data, work_type: INV_TYPE, qrcode: project.qrcode });

            if (result !== null) {
                DB.transaction(tx => {
                    tx.executeSql(
                        `UPDATE ${scandataTb} SET upload = "uploaded" WHERE gongwei_id=?`,
                        [gongweiPos.id],
                        async (tx, results) => {
                            await positionOut();
                        })
                });
            } else {
                await positionOut();
            }
        } else {
            await positionOut();
        }
    };

    const positionOut = async () => {
        await ApiObject.gongweiEndUpdate({ qrcode: project.qrcode });
        dispatch(setGongweiPos({}));
        dispatch(setRowPos(1));
        dispatch(setColumnPos(1));
        dispatch(setSkuCount(0));
        dispatch(setScreenLoading(false));
        props.navigation.navigate(props.nextPage);
    };

    return (
        <View style={CStyles.ModalContainer}>
            <View style={CStyles.ModalBack} />
            <View style={{ ...CStyles.ModalBoxBack, width: Dimensions.get('window').width * 0.9 }}>
                <Text style={{ fontSize: 18, color: "black" }}>{PROGRAM_NAME}</Text>

                <View style={{ alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', fontSize: 16, marginVertical: 30, color: "black" }}>
                        您要结束当前工位的盘点吗？
                    </Text>
                </View>
                <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                    <Button
                        ButtonTitle={'是(Y)'}
                        BtnPress={() => getUploadData()}
                        type={'YellowBtn'}
                        BTnWidth={Dimensions.get('window').width * 0.35}
                    />
                    <Button
                        ButtonTitle={'否(N)'}
                        BtnPress={() => props.setEndModalOpen(false)}
                        type={'blueBtn'}
                        BTnWidth={Dimensions.get('window').width * 0.35}
                    />
                </View>
            </View>
        </View>
    );
}

export default InvEndModal;
