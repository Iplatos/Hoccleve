import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants';

export const Notifications = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bgColor,
      }}>
      <Text>Notification!</Text>
    </View>
  );
};


const styles = StyleSheet.create({});
