import React from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SERVER_URL } from '../constants';

const Header = (props) => {
  const { user, project } = useSelector(state => state.base);

  const renderAvatarImage = () => {
    if (user?.picture != '' && user?.picture != null) {
      return (
        <Image style={styles.avatar} source={{ uri: SERVER_URL + user.picture }} />
      );
    } else {
      return (
        <Image style={styles.avatar} source={require('../assets/images/male.jpg')} />
      );
    }
  }

  return (
    <View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          padding: 5,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.drawer?.current.openDrawer();
          }}
        >
          <Image
            style={styles.menuIcon}
            source={require('../assets/images/menuIcon.png')}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            color: '#000',
            fontWeight: 'bold',
          }}
        >
          {props.title}
        </Text>
        {renderAvatarImage()}
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: '#012964',
          padding: 3,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {project.client_name ? project.client_name + '/' + project.store_name + '/' + project.start_time : '---没有进行中---'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  menuIcon: {
    width: 38,
    height: 38,
  },
});

export default Header;
