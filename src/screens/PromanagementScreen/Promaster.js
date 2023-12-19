import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import ApiObject from '../../support/Api';
import DocumentPicker from 'react-native-document-picker';
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/EvilIcons';
import Button from '../../components/Button';
import ProgressBar from 'react-native-progress/Bar';
import axios from 'axios';
import { PROGRAM_NAME } from '../../constants';
import Layout from '../../components/Layout';
import { BackHandler } from 'react-native';

const Promaster = (props) => {
    const { projectItem, accessToken } = useSelector((state) => state.base);
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [progress, setProgress] = useState(0);
    const screenWidth = Dimensions.get('window').width;
    const [status, setStatus] = useState(0)
    const [disabled1, setDisabled1] = useState(false)
    const [disabled2, setDisabled2] = useState(false)

    useEffect(() => {
        const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
        return () => {
            backHandlerListener.remove();
        };
    }, []);

    const handlePickFile = async (type) => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
                allowMultiple: false
            });

            if (type == 1) {
                setFile1(result[0])
            } else {
                setFile2(result[0])
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                // Error!
            }
        }
    };

    const handleUpload = async (type) => {
        setStatus(1)
        if (type == 1) {
            setDisabled1(true);
            const formData = new FormData();
            formData.append('id', projectItem.id);
            formData.append('addfile_name', file1);

            try {
                await axios.post('http://39.97.209.255:8000/api/inventorymasterimport', formData, {
                    onUploadProgress: (progressEvent) => {
                        const loaded = progressEvent.loaded;
                        const total = progressEvent.total;
                        const progress = loaded / total;
                        setProgress(progress);
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: accessToken,
                    },
                }).then(async (response) => {
                    var result = await ApiObject.uploadpostApi(response)
                    if (result == "error") {
                        setDisabled1(false);
                        setStatus(3)
                        setProgress(0)
                        setTimeout(() => {
                            setStatus(0)
                        }, 2000);
                    }
                    else {
                        setDisabled1(false);
                        setStatus(2)
                        setProgress(0)
                        setTimeout(() => {
                            setStatus(0)
                        }, 2000);
                    }
                })
            } catch (error) {
                Alert.alert(
                    PROGRAM_NAME,
                    error.message ?? 'Error!',
                    [{ text: '是(Y)', onPress: () => { } }],
                    { cancelable: false },
                );
                setDisabled1(false);
                setStatus(3)
                setProgress(0)
                setTimeout(() => {
                    setStatus(0)
                }, 2000);
            }
        } else {
            setDisabled2(true);
            const formData = new FormData();
            formData.append('id', projectItem.id);
            formData.append('addfile_name', file2);

            try {
                await axios.post('http://39.97.209.255:8000/api/generalmasterimport', formData, {
                    onUploadProgress: (progressEvent) => {
                        const loaded = progressEvent.loaded;
                        const total = progressEvent.total;
                        const progress = loaded / total;
                        setProgress(progress);
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: accessToken,
                    },
                }).then(async (response) => {
                    var result = await ApiObject.uploadpostApi(response)
                    if (result == "error") {
                        setDisabled2(false);
                        setStatus(3)
                        setProgress(0)
                        setTimeout(() => {
                            setStatus(0)
                        }, 2000);
                    } else {
                        setDisabled2(false);
                        setStatus(2)
                        setProgress(0)
                        setTimeout(() => {
                            setStatus(0)
                        }, 2000);
                    }
                })
            } catch (error) {
                Alert.alert(
                    PROGRAM_NAME,
                    error.message ?? 'Error!',
                    [{ text: '是(Y)', onPress: () => { } }],
                    { cancelable: false },
                );
                setDisabled2(false);
                setStatus(3)
                setProgress(0)
                setTimeout(() => {
                    setStatus(0)
                }, 2000);
            }
        }
    };

    const BackBtnPress = async () => {
        props.navigation.navigate('PromanageMain')
    };

    return (
        <Layout {...props} title={'项目管理'}>
            <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>
            <ScrollView>
                <View style={{ marginLeft: 20 }}>
                    <Text style={{ fontSize: 16, color: 'black', fontWeight: "bold" }}>通用主档</Text>
                </View>
                <View style={styles.mark}>
                    {file1 && <Text>选取的文件: {file1.name}</Text>}
                    {!file1 && <Text>没有选择文件</Text>}
                </View>
                <TouchableOpacity onPress={() => handlePickFile(1)}>
                    <View style={styles.uploadbutton}>
                        <Icon1 name="plus" size={45} color={"#595959"} />
                    </View>
                </TouchableOpacity>
                <View style={styles.maincontent}>
                    <Button
                        ButtonTitle={'Upload'}
                        BtnPress={() => handleUpload(1)}
                        type={'YellowBtn'}
                        BTnWidth={'100%'}
                        disabled={disabled1}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
                <View style={{ marginTop: 30, width: '100%' }}>
                    <View style={{ marginLeft: 20 }}>
                        <Text style={{ fontSize: 16, color: 'black', fontWeight: "bold" }}>库存主档</Text>
                    </View>
                    <View style={styles.mark}>
                        {file2 && <Text>选取的文件:   {file2.name}</Text>}
                        {!file2 && <Text>没有选择文件</Text>}
                    </View>
                    <TouchableOpacity onPress={() => handlePickFile(2)}>
                        <View style={styles.uploadbutton}>
                            <Icon1 name="plus" size={45} color={"#595959"} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.maincontent}>
                    <Button
                        ButtonTitle={'Upload'}
                        BtnPress={() => handleUpload(2)}
                        type={'YellowBtn'}
                        BTnWidth={'100%'}
                        disabled={disabled2}
                        style={{ alignSelf: 'center' }}
                    />
                </View>
                <View style={styles.markcontent}>
                    {
                        status == 1 ?
                            <View style={styles.uploadingcontent}>
                                <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginBottom: 5 }}>
                                    <Icon2 name="arrow-up" size={15} color={"#E19706"} />
                                    <Text style={{ color: '#E19706', fontSize: 10, marginLeft: 5 }}>Uploading</Text>
                                </View>
                                <ProgressBar progress={progress} width={screenWidth * 0.9 * 0.8} color={'#E19706'} />
                            </View> :
                            status == 2 ?
                                <View style={styles.uploadsuccess}>
                                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginBottom: 5 }}>
                                        <Icon1 name="checkcircleo" size={15} color={"#16B96B"} />
                                        <Text style={{ color: '#16B96B', fontSize: 10, marginLeft: 5 }}>Uploading successful</Text>
                                    </View>
                                </View> :
                                status == 3 ?
                                    <View style={styles.uploadfail}>
                                        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', marginBottom: 5 }}>
                                            <Icon1 name="closecircleo" size={15} color={"#B91616"} />
                                            <Text style={{ color: '#B91616', fontSize: 10, marginLeft: 5 }}>Uploading failed</Text>
                                        </View>
                                    </View> : null
                    }
                </View>
            </ScrollView>
        </Layout >
    );
}

const styles = StyleSheet.create({
    allcontent: {
        position: 'relative',
        height: Dimensions.get('window').height,
        backgroundColor: '#F2F2F2',
    },
    maincontent: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20
    },
    uploadbutton: {
        width: '90%',
        height: 60,
        backgroundColor: 'rgba(204, 204, 214, 1)',
        alignSelf: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mark: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 10
    },
    markcontent: {
        height: '30%',
        marginBottom: 20
    },
    uploadingcontent: {
        alignItems: 'center',
        width: '90%',
        height: 70,
        backgroundColor: '#FCF1CA',
        alignSelf: 'center',
        padding: 7,
        marginTop: 10,
        borderRadius: 5
    },
    uploadsuccess: {
        alignItems: 'center',
        width: '90%',
        height: 70,
        backgroundColor: 'rgba(22, 185, 87, 0.24)',
        alignSelf: 'center',
        padding: 7,
        marginTop: 10,
        borderRadius: 5
    },
    uploadfail: {
        alignItems: 'center',
        width: '90%',
        height: 200,
        backgroundColor: 'rgba(185, 22, 22, 0.24)',
        alignSelf: 'center',
        padding: 7,
        marginTop: 10,
        borderRadius: 5
    }
});

export default Promaster;
