import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import Layout from '../../components/Layout';
import { BackHandler } from 'react-native';

const QrScreen = (props) => {
    const { qrcode, projectItem } = useSelector((state) => state.base);

    useEffect(() => {
        const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
        return () => {
            backHandlerListener.remove();
        };
    }, []);

    const BackBtnPress = () => {
        props.navigation.navigate('PromanageMain')
    }

    return (
        <Layout {...props} title={'项目'}>
            <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>
            <View style={styles.container}>
                <QRCode value={qrcode} size={250} />
            </View>
            <Text style={{ alignSelf: 'center', fontSize: 20, color: 'black' }}>{qrcode}</Text>
        </Layout>
    )
}

const styles = StyleSheet.create({
    allcontent: {
        position: 'relative',
        backgroundColor: '#F2F2F2',
        flexDirection: 'column'
    },
    container: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#DEEBFD',
        borderWidth: 2,
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 5,
        padding: 10
    },
});

export default QrScreen;
