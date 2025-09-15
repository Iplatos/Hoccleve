import React from 'react';
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {ActivityIndicator, Text, TouchableOpacity, View} from "react-native";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";

type Props = {
    index: number;
    complexity: number;
    resultText: string;
    taskId: number;
    result: any;
    taskStarted: string;
    isLoading: boolean;
    startTaskHandler: () => void;
};

export const TimedTaskPrevComponent: React.FC<Props> = (
    {
        index,
        complexity,
        resultText,
        taskId,
        result,
        taskStarted,
        isLoading,
        startTaskHandler,
    }) => {
    return (
        <View>
            <TaskHeader
                index={index}
                complexity={complexity}
                resultText={resultText}
                taskId={taskId}
                result={result}
                taskStarted={taskStarted}
            />
            <Text style={{marginBottom: 15}}>
                Данное задание выполняется на время, когда будете готовы – нажмите на кнопку «Начать» и
                задание появится. После ответа – исчезнет
            </Text>
            <TouchableOpacity onPress={startTaskHandler} style={GlobalStyle.taskAnswerBtn}>
                {isLoading && (
                    <View style={GlobalStyle.loaderContainer}>
                        <ActivityIndicator/>
                    </View>
                )}
                <Text style={{fontSize: 14}}>Начать</Text>
            </TouchableOpacity>
        </View>
    );
};
