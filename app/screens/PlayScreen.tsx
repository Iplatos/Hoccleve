import React from 'react';
import {Text, View} from "react-native";
import {Colors} from "../constants/Colors.ts";

export const PlayScreen = () => {
    return (
        <View  style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
        }}>
            <Text>PlayScreen</Text>
        </View>
    );
};

