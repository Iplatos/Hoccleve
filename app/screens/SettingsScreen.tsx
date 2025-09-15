import React from 'react';
import {View, Text, Button} from 'react-native';

export const SettingsScreen = ({navigation}) => {
    return (
        <View>
            <Text>Settings Screen</Text>
            <Button title="Open Drawer" onPress={() => navigation.openDrawer()} />

        </View>
    );
};
