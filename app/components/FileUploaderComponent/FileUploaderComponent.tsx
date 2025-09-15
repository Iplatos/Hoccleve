import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useFileUpload} from "../../redux/hooks.ts";
import {FontAwesome} from "@expo/vector-icons";

type FileUploaderProps = {
    disabled: boolean;
    onFilesSelected: (files: any[]) => void; // колбэк для передачи файлов
};

export const FileUploaderComponent = ({disabled, onFilesSelected}: FileUploaderProps) => {
    const {selectedFiles, removeFile, handleFileUpload} = useFileUpload();

    const handleFileUploada = async () => {
        try {
            await handleFileUpload(); // Загружаем файлы
        } catch (error) {
            console.error('Ошибка при загрузке файлов:', error);
        }
    };

    // Используем useEffect, чтобы вызывать onFilesSelected только после того, как файлы обновлены
    useEffect(() => {
        if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles); // передаем выбранные файлы через колбэк
        }
    }, [selectedFiles, onFilesSelected]);


    return (
        <View style={{marginBottom: 20}}>
            {/* Кнопка для загрузки файлов */}
            {/*<TouchableOpacity*/}
            {/*    style={[styles.uploadButton, { opacity: disabled ? 0.5 : 1 }]}*/}
            {/*    disabled={disabled}*/}
            {/*    onPress={handleFileUploada}*/}
            {/*>*/}
            {/*    <Text>Загрузить файлы</Text>*/}
            {/*    <Text>+</Text>*/}
            {/*</TouchableOpacity>*/}
            <TouchableOpacity
                style={[styles.fileInput, {opacity: disabled ? 0.5 : 1}]}
                disabled={disabled}
                onPress={handleFileUploada}>
                <Text style={styles.fileInputText}>
                    Выберите файл
                </Text>
                <FontAwesome name="upload" size={20} color="#888"/>
            </TouchableOpacity>

            {/* Список выбранных файлов */}
            {selectedFiles.length > 0 && (
                <ScrollView style={styles.fileList}>
                    {selectedFiles.map((file, index) => (
                        <View key={`${file.name}${index}`} style={styles.fileItem}>
                            <Text style={styles.fileName}>{file.name}</Text>
                            {/* Кнопка удаления файла */}
                            <TouchableOpacity onPress={() => removeFile(file)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    fileInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    fileInputText: {
        color: '#888',
        fontSize: 14,
    },
    uploadButton: {
        flex: 1,
        backgroundColor: '#e5d3b4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    fileList: {
        marginTop: 16,
        maxHeight: 150,
    },
    fileName: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },

    removeButton: {
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    removeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
