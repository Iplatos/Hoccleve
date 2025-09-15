import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity} from "react-native";
import {FileUploaderComponent} from "../components/FileUploaderComponent/FileUploaderComponent.tsx";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {createSupportRequest} from "../redux/slises/supportSlice.ts";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../constants/Routes.ts";
import {Colors} from "../constants/Colors.ts";


export const SupportScreen = () => {
    const dispatch = useAppDispatch()
    const navigation = useNavigation()

    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]); // Теперь выбранные файлы хранятся здесь
    const {loading} = useAppSelector(state => state.support)
    // Обработчик отправки данных
    const disabled = description.length < 5 && selectedFiles.length === 0

    const handleSubmit = async () => {

        try {
            await dispatch(createSupportRequest({
                message: description,
                support_type: 'site-problems',
                files: selectedFiles,
            })).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Успешно',
                text2: 'Запрос отправлен!',
                position: 'bottom',
                bottomOffset: 50,
            });
            setDescription('')
            setSelectedFiles([])
            // @ts-ignore
            navigation.navigate(ROUTES.MAIN);

        } catch (error) {

            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                // @ts-ignore
                text2: error?.error,
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Проблемы с приложением?</Text>
                <Text style={styles.subtitle}>
                    Если что-то не работает - напиши нам об этом, мы сделаем все возможное, чтобы это исправить!
                </Text>

                <TextInput
                    style={styles.inputDescription}
                    placeholder="Опишите проблему"
                    placeholderTextColor={Colors.textGray}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <FileUploaderComponent
                    disabled={false}
                    onFilesSelected={setSelectedFiles}
                />

                <TouchableOpacity
                    disabled={disabled}
                    style={[GlobalStyle.btnOpenFile, {opacity: disabled ? 0.5 : 1}]}
                    onPress={handleSubmit}>
                    {
                        loading
                            ? <ActivityIndicator/>
                            : <Text style={styles.submitButtonText}>Отправить</Text>
                    }

                </TouchableOpacity>
            </ScrollView>
            {/*<Toast config={toastConfig}/>*/}
        </>

    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 15,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    inputDescription: {
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        textAlignVertical: 'top',
        fontSize: 14,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    // submitButton: {
    //     backgroundColor: '#fcbf49',
    //     borderRadius: 8,
    //     paddingVertical: 15,
    //     alignItems: 'center',
    //     shadowColor: '#000',
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //     elevation: 2,
    // },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

