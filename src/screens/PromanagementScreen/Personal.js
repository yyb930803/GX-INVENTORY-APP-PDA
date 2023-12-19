import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ApiObject from '../../support/Api';
import { BackHandler } from 'react-native';
import Layout from '../../components/Layout';

const Personal = (props) => {
    const { projectItem } = useSelector((state) => state.base);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
        
        const backHandlerListener = BackHandler.addEventListener('hardwareBackPress', BackBtnPress);
        return () => {
            backHandlerListener.remove();
        };
    }, []);

    const fetchData = async () => {
        const result = await ApiObject.projectmemberList({
            id: projectItem.id,
        })
        setData(result.members)
    };

    const BackBtnPress = async () => {
        props.navigation.navigate('PromanageMain')
    };

    const renderItem = ({ item, index }) => {
        return (
            <View key={index} style={{ flexDirection: 'row', textAlign: 'center', paddingHorizontal: 10 }}>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {item.name}
                </Text>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {item?.rolelist?.id}
                </Text>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {item.step}
                </Text>
                <Text style={[styles.title, { flex: 1, textAlignVertical: 'center' }]}>
                    {item.position}
                </Text>
            </View>
        );
    };

    return (
        <Layout {...props} title={'项目管理'}>
            <View style={{ flex: 1 }}>
                <Text style={{ alignSelf: 'center', marginVertical: 10 }}>{projectItem.id}</Text>
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, color: 'black', fontWeight: "bold" }}>人员状态</Text>
                </View>

                <View style={styles.container}>
                    <Text style={[styles.head, { flex: 1 }]}>名字</Text>
                    <Text style={[styles.head, { flex: 1 }]}>权限</Text>
                    <Text style={[styles.head, { flex: 1 }]}>STEP</Text>
                    <Text style={[styles.head, { flex: 1 }]}>位置</Text>
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
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
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
});

export default Personal;
