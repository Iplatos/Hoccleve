import React from 'react';
import {StyleSheet, Text, View} from "react-native";
import {Colors} from "../../constants/Colors.ts";
import {getTextColor} from "../../settings/utils.ts";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {ElapsedTimeTimer} from "../ElapsedTimeTimer/ElapsedTimeTimer.tsx";

type TaskHeaderProps = {
    resultText: string,
    index: number,
    result: ResultType;
    complexity?: number
    taskId: number,
    taskStarted?: string
}

export const TaskHeader = (
    {
        resultText,
        result,
        index,
        taskId,
        complexity,
        taskStarted
    }: TaskHeaderProps) => {

    return (
        <View style={styles.container}>
            <Text style={{color: Colors.colorGray}}>Задача {index}</Text>
            {
                taskStarted &&  <ElapsedTimeTimer startTime={taskStarted}/>
            }

            <Text style={
                {color: getTextColor(result[taskId]?.message ? result[taskId]?.message : resultText)}
            }>
                {result[taskId]?.message ? result[taskId]?.message : resultText}
            </Text>

            {/*{*/}
            {/*    complexity &&*/}
            {/*    <View style={styles.complexityBlock}>*/}
            {/*        <Text>Сложность: {complexity}</Text>*/}
            {/*    </View>*/}
            {/*}*/}
        </View>
    );
};

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between',
        marginBottom: 15
    },
    complexityBlock: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: Colors.white,
        borderRadius: 20
    }

})
