import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, VirtualizedList } from 'react-native';
import Button from '../../../components/Button';
import CStyles from '../../../styles/CommonStyles';
import FooterBar1 from '../../../components/FooterBar1';
import { setColumnPos, setRowPos } from '../../../reducers/BaseReducer';
import { DB, tbName } from '../../../hooks/dbHooks';
import InvEndModal from '../../../components/InvEndModal';
import Layout from '../../../components/Layout';
import { BackHandler } from 'react-native';

const InventoryLayer = (props) => {
    const dispatch = useDispatch();
    const { user, project, gongweiPos, rowPos } = useSelector(state => state.base);
    const { scandataTb } = tbName(user.id);

    const [rowCount, setRowCount] = useState('');
    const [columnCount, setColumnCount] = useState('');
    const [sumCount, setSumCount] = useState('');
    const [pandianAmount, setPandianAmount] = useState('');
    const [tableData, setTableData] = useState([]);
    const [endModalOpen, setEndModalOpen] = useState(false);

    useEffect(() => {
        DB.transaction(tx => {
            tx.executeSql(`SELECT MAX("row") as row, COUNT("column") as countColumn, SUM("count") as sumCount, SUM(commodity_price*"count") as pandianAmount FROM ${scandataTb} WHERE gongwei_id = ?`,
                [gongweiPos.id],
                (tx, results) => {
                    if (results.rows.item(0).row != null) {
                        setRowCount(results.rows.item(0).row);
                        setColumnCount(results.rows.item(0).countColumn);
                        setSumCount(results.rows.item(0).sumCount);
                        setPandianAmount(results.rows.item(0).pandianAmount);
                    }
                }
            )

            tx.executeSql(`SELECT row, COUNT("column") as countcolumn, SUM("count") as sumCount, SUM(commodity_price*"count") as pandianAmount FROM ${scandataTb} WHERE gongwei_id = ? GROUP BY "row"`,
                [gongweiPos.id],
                (tx, results) => {
                    let item = [];
                    let tableDataArray = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        item.push(results.rows.item(i).row);
                        item.push(results.rows.item(i).countcolumn);
                        item.push(results.rows.item(i).sumCount);
                        item.push(results.rows.item(i).pandianAmount ?? 0);
                        tableDataArray.push(item);
                        item = [];
                    }
                    setTableData(tableDataArray);
                }
            )
        });

        const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
        return () => {
            backHandlerListener.remove();
        };
    }, []);

    const BackBtnPress = async () => {
        setEndModalOpen(true);
    };

    const screenNavigate = (id) => {
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

    const toInventoryMain = async () => {
        dispatch(setRowPos(Number(rowPos) + 1));
        dispatch(setColumnPos(1));
        if (project.quantity_min == project.quantity_max) {
            props.navigation.navigate('InventoryMainA');
        } else {
            props.navigation.navigate('InventoryMain');
        }
    }

    const _renderitem = ({item}) => <MemoRenderItem item={item} />;

    return (
        <Layout {...props} title={'盘点工作'}>
            <View style={{ flex: 1 }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                    <Text style={{ ...CStyles.InventoryTxt, fontSize: 14 }}>{gongweiPos.pianqu}片区   {gongweiPos.gongwei?.toString().padStart(project.gongwei_max, "0")}工位</Text>
                </View>

                <View style={{ ...styles.container }}>
                    <Text style={[styles.head, { flex: 1 }]}>层</Text>
                    <Text style={[styles.head, { flex: 1 }]}>条数</Text>
                    <Text style={[styles.head, { flex: 1 }]}>件数</Text>
                    <Text style={[styles.head, { flex: 1 }]}>金额</Text>
                </View>
                <VirtualizedList
                    vertical={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={tableData}
                    renderItem={_renderitem}
                    keyExtractor={(item, index) => index + `${item.id}`}
                    removeClippedSubviews={false}
                    getItemCount={() => tableData.length}
                    getItem={(data, index) => data[index]}
                />

                <View style={{ marginHorizontal: 20, marginTop: 0 }}>
                    <Text style={CStyles.TxTStyle}>合计:</Text>
                </View>

                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', paddingLeft: 80 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "black" }}>{rowCount}</Text>
                    <Text style={{ flex: 1, fontSize: 14, color: "black" }}>{columnCount}</Text>
                    <Text style={{ flex: 1, fontSize: 14, color: "black" }}>{sumCount}</Text>
                    <Text style={{ flex: 1, fontSize: 14, color: "black" }}>{pandianAmount ?? 0}</Text>
                </View>

                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginVertical: 10, }}>
                    <Button ButtonTitle={"升层"} BtnPress={() => toInventoryMain()} type={"yellowBtn"} BTnWidth={300} />
                </View>
            </View>

            <FooterBar1 screenNavigate={screenNavigate} activeBtn={2} />

            {endModalOpen && (
                <InvEndModal setEndModalOpen={setEndModalOpen} navigation={props.navigation} nextPage='AreaValue' />
            )}
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        flexDirection: 'row',
        paddingHorizontal: 10,
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
    
    text: { margin: 3 },
    
    title: {
        flex: 2,
        borderWidth: 1,
        borderColor: '#9f9f9f',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#6f6f6f',
        paddingVertical: 2,
        backgroundColor: 'white'
    },
});

export default InventoryLayer;

const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', textAlign: 'center', paddingHorizontal: 10 }}>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
            {item[0]}
        </Text>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
            {item[1]}
        </Text>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
            {item[2]}
        </Text>
        <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
            {item[3]}
        </Text>
    </View>
);

const MemoRenderItem = memo(renderItem);
