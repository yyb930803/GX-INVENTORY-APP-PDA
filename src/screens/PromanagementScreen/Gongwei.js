import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, Modal, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import ApiObject from '../../support/Api';
import Icon from 'react-native-vector-icons/AntDesign';
import Button from '../../components/Button';
import CStyles from '../../styles/CommonStyles';
import { PROGRAM_NAME } from '../../constants';
import { BackHandler } from 'react-native';
import Layout from '../../components/Layout';

const Gongwei = (props) => {
    const { projectItem } = useSelector((state) => state.base);
    const [data, setData] = useState([]);
    const [isEditVisible, setisEditVisible] = useState(false)
    const [isDeleteVisible, setisDeleteVisible] = useState(false)
    const [isAddVisible, setisAddVisible] = useState(false)
    const [selectedUpdate, setSelectedUpdate] = useState([]);
    const [addstart, setAddstart] = useState('')
    const [deletestart, setDeletestart] = useState('')
    const [addend, setAddend] = useState('')
    const [deleteEnd, setDeleteEnd] = useState('')
    const [editvalue, setEditvalue] = useState('')
    const [addvalue, setAddvalue] = useState('')

    useEffect(() => {
        fetchData();

        const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
        return () => {
            backHandlerListener.remove();
        };
    }, []);

    const handleCalculate = (val) => {
        const value = parseFloat(val);
        if (isNaN(value)) {
            Alert.alert(
                PROGRAM_NAME,
                '请输入有效的数值.',
                [{ text: '是(ok)', onPress: () => { } }],
                { cancelable: false },
            );
        }
    };

    const fetchData = async () => {
        const result = await ApiObject.getGongweiList({
            id: projectItem.id,
        })
        setData(result)
    };

    const BackBtnPress = async () => {
        props.navigation.navigate('PromanageMain')
    };

    const handleUpdate = async () => {
        if (editvalue == "") {
            Alert.alert(
                PROGRAM_NAME,
                '请输入一区号码.',
                [{ text: '是(ok)', onPress: () => { } }],
                { cancelable: false },
            );
        }
        else {
            await ApiObject.updateGongwei({
                id: projectItem.id,
                pianqu: editvalue,
                start_gongwei: selectedUpdate.startgongwei,
                end_gongwei: selectedUpdate.endgongwei
            })
            fetchData();
            setisEditVisible(false)
        }
    }

    const handleAdd = async () => {
        if (addstart == "" || addend == "") {
            Alert.alert(
                PROGRAM_NAME,
                '请输入工作.',
                [{ text: '是(ok)', onPress: () => { } }],
                { cancelable: false },
            );
        }
        else {
            await ApiObject.addGongwei({
                id: projectItem.id,
                pianqu: addvalue,
                start_gongwei: addstart,
                end_gongwei: addend
            })
            fetchData();
            setisAddVisible(false)
        }
    }

    const handleDelete = async () => {
        if (deletestart == "" || deleteEnd == "") {
            Alert.alert(
                PROGRAM_NAME,
                '请输入工作.',
                [{ text: '是(ok)', onPress: () => { } }],
                { cancelable: false },
            );
        }
        else {
            await ApiObject.deleteGongwei({
                id: projectItem.id,
                start_gongwei: deletestart,
                end_gongwei: deleteEnd
            })
            fetchData();
            setisDeleteVisible(false)
        }
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={index} style={{ flexDirection: 'row', textAlign: 'center', paddingHorizontal: 10 }}>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {item.pianqu}
                </Text>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {item.startgongwei}~{item.endgongwei}
                </Text>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {parseInt(item.endgongwei) - parseInt(item.startgongwei) + 1}
                </Text>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    <TouchableOpacity onPress={() => { setisEditVisible(true), setSelectedUpdate(item), setEditvalue(item.pianqu) }} style={{ width: '15%' }}>
                        <View style={styles.editBtn}>
                            <Text style={styles.btnText}>修改</Text>
                        </View>
                    </TouchableOpacity>
                </Text>
            </View>
        );
    };

    return (
        <Layout {...props} title={'项目管理'}>
            <View style={{ flex: 1 }}>
                <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, color: 'black', fontWeight: "bold" }}>工位设定</Text>
                </View>

                <View style={styles.container}>
                    <Text style={[styles.head, { flex: 1 }]}>片区号码</Text>
                    <Text style={[styles.head, { flex: 1 }]}>工位号码</Text>
                    <Text style={[styles.head, { flex: 1 }]}>工位数</Text>
                    <Text style={[styles.head, { flex: 1 }]}>改变</Text>
                </View>
                <FlatList
                    vertical={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    data={data}
                    renderItem={renderItem}
                    onEndReachedThreshold={0.5}
                    keyExtractor={(item, index) => index + `${item.id}`}
                    removeClippedSubviews={false}
                />

                <View style={styles.buttonWraper}>
                    <Button
                        ButtonTitle={'追加'}
                        BtnPress={() => setisAddVisible(true)}
                        type={'yellowBtn'}
                        BTnWidth={120}
                    />
                    <Button
                        ButtonTitle={'删除'}
                        BtnPress={() => setisDeleteVisible(true)}
                        type={'blueBtn'}
                        BTnWidth={120}
                    />
                </View>
            </View>
            <Modal visible={isEditVisible} transparent={true}>
                <View style={CStyles.modalContainer}>
                    <View style={CStyles.modalContent}>
                        <View style={CStyles.modalheader}>
                            <Text style={{ fontSize: 18, color: '#000000', fontWeight: "bold" }}>提示</Text>
                            <TouchableOpacity onPress={() => setisEditVisible(false)}>
                                <Icon name="close" size={25} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingVertical: 20 }}>
                            <Text style={{ fontSize: 14, color: '#000000', paddingLeft: 7 }}>片区号码</Text>
                            <View style={{ height: 35 }}>
                                <TextInput
                                    value={editvalue}
                                    autoFocus={true}
                                    selectTextOnFocus={true}
                                    style={{
                                        ...CStyles.InputStyle,
                                        backgroundColor: '#F2F2F2',
                                        color: '#000000',
                                    }}
                                    onChangeText={(val) => setEditvalue(val)}
                                    multiline={false}
                                    showSoftInputOnFocus={false}
                                />
                            </View>
                        </View>
                        <Button
                            ButtonTitle={'改变'}
                            BtnPress={() => handleUpdate()}
                            type={'yellowBtn'}
                            BTnWidth={'100%'}
                        />
                    </View>
                </View>
            </Modal>
            <Modal visible={isAddVisible} transparent={true}>
                <View style={CStyles.modalContainer}>
                    <View style={CStyles.modalContent}>
                        <View style={CStyles.modalheader}>
                            <Text style={{ alignSelf: 'center', fontSize: 18, color: '#000000', fontWeight: "bold" }}>提示</Text>
                            <TouchableOpacity onPress={() => setisAddVisible(false)}>
                                <Icon name="close" size={25} style={{ color: 'black' }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingVertical: 20 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 14, color: '#000000', paddingHorizontal: 7 }}>片区号码</Text>
                                    <View style={{ height: 35 }}>
                                        <TextInput
                                            value={addvalue}
                                            autoFocus={true}
                                            selectTextOnFocus={true}
                                            style={{
                                                ...CStyles.InputStyle,
                                                backgroundColor: '#F2F2F2',
                                                color: '#000000',
                                            }}
                                            multiline={false}
                                            onChangeText={(val) => setAddvalue(val)}
                                            showSoftInputOnFocus={false}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 14, color: '#000000', paddingHorizontal: 7 }}>工位:从</Text>
                                    <View style={{ height: 35 }}>
                                        <TextInput
                                            value={addstart}
                                            autoFocus={true}
                                            selectTextOnFocus={true}
                                            style={{
                                                ...CStyles.InputStyle,
                                                backgroundColor: '#F2F2F2',
                                                color: '#000000',
                                            }}
                                            multiline={false}
                                            keyboardType="numeric"
                                            onChangeText={(val) => { setAddstart(val), handleCalculate(val) }}
                                            showSoftInputOnFocus={false}
                                        />
                                    </View>
                                </View>
                                <View style={{ width: '50%' }}>
                                    <Text style={{ fontSize: 14, color: '#000000', paddingHorizontal: 7 }}>工位:至</Text>
                                    <View style={{ height: 35 }}>
                                        <TextInput
                                            value={addend}
                                            autoFocus={true}
                                            selectTextOnFocus={true}
                                            style={{
                                                ...CStyles.InputStyle,
                                                backgroundColor: '#F2F2F2',
                                                color: '#000000',
                                            }}
                                            onChangeText={(val) => { setAddend(val), handleCalculate(val) }}
                                            multiline={false}
                                            showSoftInputOnFocus={false}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <Button
                            ButtonTitle={'追加'}
                            BtnPress={() => handleAdd()}
                            type={'yellowBtn'}
                            BTnWidth={'100%'}
                        />
                    </View>
                </View>
            </Modal>
            <Modal visible={isDeleteVisible} transparent={true}>
                <View style={CStyles.modalContainer}>
                    <View style={CStyles.modalContent}>
                        <View style={CStyles.modalheader}>
                            <Text style={{ fontSize: 18, color: '#000000', fontWeight: "bold" }}>提示</Text>
                            <TouchableOpacity onPress={() => setisDeleteVisible(false)}>
                                <Icon name="close" size={25} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
                            <View style={{ width: '50%' }}>
                                <Text style={{ fontSize: 14, color: '#000000', paddingHorizontal: 7 }}>工位:从</Text>
                                <View style={{ height: 35 }}>
                                    <TextInput
                                        value={deletestart}
                                        autoFocus={true}
                                        selectTextOnFocus={true}
                                        style={{
                                            ...CStyles.InputStyle,
                                            backgroundColor: '#F2F2F2',
                                            color: '#000000',
                                        }}
                                        onChangeText={(val) => { setDeletestart(val), handleCalculate(val) }}
                                        multiline={false}
                                        showSoftInputOnFocus={false}
                                    />
                                </View>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={{ fontSize: 14, color: '#000000', paddingHorizontal: 7 }}>工位:至</Text>
                                <View style={{ height: 35 }}>
                                    <TextInput
                                        value={deleteEnd}
                                        autoFocus={true}
                                        placeholder={''}
                                        selectTextOnFocus={true}
                                        style={{
                                            ...CStyles.InputStyle,
                                            backgroundColor: '#F2F2F2',
                                            color: '#000000',
                                        }}
                                        onChangeText={(val) => { setDeleteEnd(val), handleCalculate(val) }}
                                        multiline={false}
                                        showSoftInputOnFocus={false}
                                    />
                                </View>
                            </View>
                        </View>
                        <Button
                            ButtonTitle={'删除'}
                            BtnPress={() => handleDelete()}
                            type={'yellowBtn'}
                            BTnWidth={'100%'}
                        />
                    </View>
                </View>
            </Modal>
        </Layout>
    );
}

const styles = StyleSheet.create({
    buttonWraper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        alignSelf: 'center',
        marginVertical: 10
    },
    head: {
        height: 30,
        textAlignVertical: 'center',
        borderWidth: 1,
        borderColor: '#9f9f9f',
        backgroundColor: '#f1f8ff',
        fontSize: 10,
        textAlign: 'center'
    },
    container: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    title: {
        flex: 2,
        borderWidth: 1,
        borderColor: '#9f9f9f',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#6f6f6f',
        paddingVertical: 2,
        backgroundColor: 'white',
        paddingVertical: 5
    },
    editBtn: {
        backgroundColor: '#012964',
        borderRadius: 4,
    },
    btnText: {
        padding: 2,
        textAlign: 'center',
        color: '#fff',
        fontSize: 10,
    },
});

export default Gongwei;
