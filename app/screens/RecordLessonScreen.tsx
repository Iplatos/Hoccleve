import React, {useRef} from 'react';
import {Text, View} from "react-native";
import LottieView from "lottie-react-native";


export const RecordLessonScreen = () => {
    const animation = useRef<LottieView>(null);

    return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20
        }}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 300,
                    height: 300,
                }}
                source={require('../assets/inDevelopment.json')}
            />
            <Text style={{
                fontSize: 20,
                textAlign: "center",
                marginBottom: 20,
            }}>
                Страница в разработке
            </Text>
        </View>
    );
};

