import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Dimensions } from 'react-native';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { PROGRAM_NAME } from '../../constants';
import { BackHandler } from 'react-native';
import Layout from '../../components/Layout';

const Report = (props) => {
    const { projectItem, accessToken } = useSelector((state) => state.base);

    const downloadFile = async (url, type, fileName) => {
        const downloadFolderPath = RNFS.DownloadDirectoryPath;

        const path = `${downloadFolderPath}/${fileName}`;

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: "Storage Permission",
                message: "App needs access to memory to download the file "
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            try {
                const response = await RNFetchBlob.fetch('POST', url, {
                    'Content-Type': 'application/json',
                    Authorization: accessToken,
                }, JSON.stringify({
                    id: projectItem.id,
                    case: type
                }));

                let base64Str = response.data;
                await RNFS.writeFile(path, base64Str, 'base64');
                Alert.alert(
                    PROGRAM_NAME,
                    '下载成功!',
                    [{ text: '是(Y)', onPress: () => { } }],
                    { cancelable: false },
                );
            } catch (error) {
                Alert.alert(
                    PROGRAM_NAME,
                    '下载失败',
                    [{ text: '是(Y)', onPress: () => { } }],
                    { cancelable: false },
                );
            }
        }
    };

    const downloadData = async (type) => {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            downloadFile('http://39.97.209.255:8000/api/reportDownload', type, uniqueSuffix + "-" + type + '.xlsx');
        } catch (error) {
            console.error("Error in downloadData: ", error);
        }
    }

    useEffect(() => {
        const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
        return () => {
            backHandlerListener.remove();
        };
    }, []);

    const BackBtnPress = async () => {
        props.navigation.navigate('PromanageMain')
    };

    return (
        <Layout {...props} title={'项目管理'}>
            <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>
            <View style={styles.main}>
                <Button
                    ButtonTitle={'盘点确认单'}
                    BtnPress={() => downloadData("inventoryReport")}
                    type={'yellowBtn'}
                    BTnWidth={300}
                />
                <TouchableOpacity style={{ zIndex: 100000000, position: 'absolute', right: 70 }}>
                    <Icon name="file-download" style={{ alignSelf: 'center' }} color={'#FFFFFF'} size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <Button
                    ButtonTitle={'单品差异确认单'}
                    BtnPress={() => downloadData("detailDiffReport")}
                    type={'yellowBtn'}
                    BTnWidth={300}
                />
                <TouchableOpacity style={{ zIndex: 100000000, position: 'absolute', right: 70 }}>
                    <Icon name="file-download" style={{ alignSelf: 'center' }} color={'#FFFFFF'} size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <Button
                    ButtonTitle={'实盘清单'}
                    BtnPress={() => downloadData("realReport")}
                    type={'yellowBtn'}
                    BTnWidth={300}
                />
                <TouchableOpacity style={{ zIndex: 100000000, position: 'absolute', right: 70 }}>
                    <Icon name="file-download" style={{ alignSelf: 'center' }} color={'#FFFFFF'} size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <Button
                    ButtonTitle={'片区报告'}
                    BtnPress={() => downloadData("areaReport")}
                    type={'yellowBtn'}
                    BTnWidth={300}
                />
                <TouchableOpacity style={{ zIndex: 100000000, position: 'absolute', right: 70 }}>
                    <Icon name="file-download" style={{ alignSelf: 'center' }} color={'#FFFFFF'} size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <Button
                    ButtonTitle={'盘点数据'}
                    BtnPress={() => downloadData("realInventoryReport")}
                    type={'yellowBtn'}
                    BTnWidth={300}
                />
                <TouchableOpacity style={{ zIndex: 100000000, position: 'absolute', right: 70 }}>
                    <Icon name="file-download" style={{ alignSelf: 'center' }} color={'#FFFFFF'} size={20} />
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                <Button
                    ButtonTitle={'不在档盘点数据'}
                    BtnPress={() => downloadData("buzaiReport")}
                    type={'yellowBtn'}
                    BTnWidth={300}
                />
                <TouchableOpacity style={{ zIndex: 100000000, position: 'absolute', right: 70 }}>
                    <Icon name="file-download" style={{ alignSelf: 'center' }} color={'#FFFFFF'} size={20} />
                </TouchableOpacity>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    main: {
        position: 'relative',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        alignSelf: 'center',
        marginVertical: 5,
    },
});

export default Report;
