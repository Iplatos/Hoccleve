import React from 'react';
import {Text, View} from "react-native";

export const RequestsScreen = () => {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>
                У Вас нет доступа!
            </Text>
        </View>
    );
};

