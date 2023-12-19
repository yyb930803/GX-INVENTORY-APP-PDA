import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    DrawerLayoutAndroid,
    Text,
    StyleSheet,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    DeviceEventEmitter,
} from 'react-native';
import Header from './Header';
import InvEndModal from './InvEndModal';
import RevEndModal from './RevEndModal';
import DiffEndModal from './DiffEndModal';
import ApiObject from '../support/Api';
import { setAccessToken, setUser } from '../reducers/BaseReducer';
import { PROGRAM_NAME } from '../constants';
import SoundObject from '../utils/sound';

const Layout = (props) => {
    const drawer = useRef(null);
    const dispatch = useDispatch();
    const [invEndModalOpen, setInvEndModalOpen] = useState(false);
    const [revEndModalOpen, setRevEndModalOpen] = useState(false);
    const [diffEndModalOpen, setDiffEndModalOpen] = useState(false);
    const [nextPage, setNextPage] = useState('Inventory');

    useEffect(() => {
        const deviceEventEmitterListener = DeviceEventEmitter.addListener('onKeyUp', (eventData) => SoundObject.playKeySound(eventData.keyCode));
        return () => {
            deviceEventEmitterListener.remove();
        }
    }, []);

    const signOutCheck = () => {
        Alert.alert(
            PROGRAM_NAME,
            '你真的退出了吗？',
            [
                { text: '是(Y)', onPress: () => signOut() },
                { text: '否(N)', onPress: () => { } },
            ],
            { cancelable: true },
        );
    };

    const signOut = async () => {
        await ApiObject.logoutAction();
        dispatch(setUser({}));
        dispatch(setAccessToken(''));
        props.navigation.navigate('Login');
    };

    const goNext = (page) => {
        if (['InventoryMainA', 'InventoryMain', 'InventoryLayer', 'InventoryEditData'].includes(props.navigation.state.routeName)) {
            drawer.current.closeDrawer();
            setNextPage(page);
            setInvEndModalOpen(true);
        } else if (['InventoryReviewEditList', 'InventoryReviewAdd'].includes(props.navigation.state.routeName)) {
            drawer.current.closeDrawer();
            setNextPage(page);
            setRevEndModalOpen(true);
        } else if (['DifferenceSurveyEdit', 'DifferenceSurveyAdd', 'DifferenceSurveyDelete'].includes(props.navigation.state.routeName)) {
            drawer.current.closeDrawer();
            setNextPage(page);
            setDiffEndModalOpen(true);
        } else {
            props.navigation.navigate(page);
            drawer.current.closeDrawer();
        }
    }

    const navigationView = () => (
        <ScrollView disableScrollViewPanResponder={true}>
            <View style={styles.headercontent}>
                <Image style={styles.drawavatar} source={require('../assets/images/icon.png')} />
                <Text style={{ fontSize: 20, color: '#012964' }}>GongXing 盘点</Text>
            </View>
            <View style={{ margin: 30, width: 100, display: 'flex', }}>
                <TouchableOpacity style={styles.section}
                    onPress={() => goNext('PromanageDashboard')}
                >
                    <Image style={styles.drawIcon} source={require('../assets/images/project-icon.png')} />
                    <Text style={styles.contentText}>项目管理</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}>
                    <Image style={styles.drawIcon} source={require('../assets/images/members-icon.png')} />
                    <Text style={styles.contentText}>雇员管理</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}>
                    <Image style={styles.drawIcon} source={require('../assets/images/raphael_customer.png')} />
                    <Text style={styles.contentText}>客户管理</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}>
                    <Image style={styles.drawIcon} source={require('../assets/images/mdi_user-multiple-check-outline.png')} />
                    <Text style={styles.contentText}>考勤</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}
                    onPress={() => goNext('Inventory')}
                >
                    <Image style={styles.drawIcon} source={require('../assets/images/uil_layers.png')} />
                    <Text style={styles.contentText}>进行中项目</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}
                    onPress={() => goNext('UserInfo')}
                >
                    <Image style={styles.drawIcon} source={require('../assets/images/Group.png')} />
                    <Text style={styles.contentText}>个人信息</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}
                    onPress={() => goNext('SystemInfo')}
                >
                    <Image style={styles.drawIcon} source={require('../assets/images/ant-design_setting-outlined.png')} />
                    <Text style={styles.contentText}>设置</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.section}
                    onPress={() => signOutCheck()}
                >
                    <Image style={styles.drawIcon} source={require('../assets/images/logout.png')} />
                    <Text style={styles.contentText}>登出</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <DrawerLayoutAndroid
            ref={drawer}
            drawerWidth={250}
            drawerPosition='left'
            renderNavigationView={navigationView}
        >
            <Header {...props} drawer={drawer} />
            {props.children}

            {invEndModalOpen && (
                <InvEndModal setEndModalOpen={setInvEndModalOpen} navigation={props.navigation} nextPage={nextPage} />
            )}
            {revEndModalOpen && (
                <RevEndModal setEndModalOpen={setRevEndModalOpen} navigation={props.navigation} nextPage={nextPage} />
            )}
            {diffEndModalOpen && (
                <DiffEndModal setEndModalOpen={setDiffEndModalOpen} navigation={props.navigation} nextPage={nextPage} />
            )}
        </DrawerLayoutAndroid>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headercontent: {
        width: '90%',
        borderBottomWidth: 1,
        borderBottomColor: '#878787',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    drawavatar: {
        width: 70,
        height: 70,
        borderRadius: 17.5,
    },
    drawIcon: {
        marginRight: 10,
        width: 30
    },
    section: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    contentText: {
        fontSize: 18,
        color: '#000000'
    },
});

export default Layout;
