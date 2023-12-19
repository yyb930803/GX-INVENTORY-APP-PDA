import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const FooterBar4 = (props) => {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#012964', paddingBottom: 0, height: 40 }}>
      <TouchableOpacity onPress={() => { props.screenInventory() }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#F8B502', fontSize: 17 }}>货架号设置</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => { props.screenQuantity() }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#F8B502', fontSize: 17 }}>数量设置</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default FooterBar4;
