import React from 'react';
import {Text, View} from "react-native";
import {COLORS} from "../../constants";

export const StoreScreen = () => {
    return (
        <View  style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.bgColor,
        }}>
            <Text>StoreScreen</Text>
        </View>
    );
};

