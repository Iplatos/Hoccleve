import React from 'react';
import {Text, View} from "react-native";
import {COLORS} from "../../constants";

export const WalletScreen = () => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.bgColor,
            }}>
            <Text>Wallet Screen</Text>
        </View>

    );
};

