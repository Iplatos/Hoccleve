import React from 'react';
import {StyleSheet, TouchableOpacity, View} from "react-native";
import ArrowLeftIcon from "../../assets/icons/Arrow-left.tsx";
import ArrowRightIcon from "../../assets/icons/Arrow-right.tsx";
import {Colors} from "../../constants/Colors.ts";

type ArrowsComponentProps = {
    handlePrev: () => void,
    handleNext: () => void,
}
export const ArrowsComponent = ({handleNext, handlePrev}: ArrowsComponentProps) => {
    return (
        <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
                <ArrowLeftIcon/>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
                <ArrowRightIcon/>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    arrowContainer: {
        flexDirection: 'row',
        gap: 10
    },
    arrowButton: {
        width: 35,
        height: 35,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
