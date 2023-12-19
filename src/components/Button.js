import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CStyles from '../styles/CommonStyles';
import Icon from 'react-native-vector-icons/Ionicons';

const Button = (props) => {
  return (
    <View style={{ width: props.BTnWidth }}>
      <TouchableOpacity
        onPress={() => props.BtnPress()}
        disabled={props.disabled}
      >
        {
          props.BTnHeight ?
            <View
              opacity={props.disabled ? 0.5 : 1}
              style={{
                ...props.type == 'blueBtn' ? CStyles.BlueBtn : CStyles.YellowBtn, height: props.BTnHeight,
                flexDirection:'row'
              }}
            >
              <Text style={{ ...CStyles.BtnText, alignSelf: 'center' }}>{props.ButtonTitle}</Text>
              {props.notification && <Icon name="notifications" size={20} color="red" />}
            </View>
            :
            <View
              opacity={props.disabled ? 0.5 : 1}
              style={{
                ...props.type == 'blueBtn' ? CStyles.BlueBtn : CStyles.YellowBtn,
                flexDirection:'row'
              }}
            >
              <Text style={{ ...CStyles.BtnText, alignSelf: 'center' }}>{props.ButtonTitle}</Text>
              {props.notification && <Icon name="notifications" size={20} color="red" />}
            </View>
        }

      </TouchableOpacity>
    </View>
  );
}

export default Button;
