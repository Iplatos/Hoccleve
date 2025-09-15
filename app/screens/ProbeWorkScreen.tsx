import React, {useEffect} from 'react';
import {fetchProbeWork} from "../redux/slises/probeWorkSlice.ts";
import {useAppSelector} from "../redux/hooks.ts";
import {ActivityIndicator, Text, View} from "react-native";

export const ProbeWorkScreen = () => {
    const { data, loading, error } = useAppSelector(state => state.probeWork);
   // console.log('ProbeWork', data)

    if (loading) {
        return <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><ActivityIndicator/></View>;
    }

    if (error) {
        return (
            <View>
                <Text>Error: {error}</Text>
            </View>
        );
    }


    return (
        <View>
            <Text>Пробная работа</Text>
            {/* Здесь вы можете рендерить данные из state.data */}
        </View>
    );
};

