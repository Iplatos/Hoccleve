import {useDispatch, useSelector} from 'react-redux';
import type {TypedUseSelectorHook} from 'react-redux';
import type {RootState, AppDispatch} from './store/store';
import {useState} from "react";
import * as DocumentPicker from 'expo-document-picker';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useFileUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: true,
            });

            if (result.assets) {
                const files = result.assets.map((file) => ({
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/octet-stream',
                }));
                setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
            }
        } catch (error) {
            console.error('Ошибка при выборе файла:', error);
        }
    };

    const removeFile = (fileToRemove: { uri: string; name: string; type: string }) => {
        setSelectedFiles(prevFiles =>
            prevFiles.filter(file => file.name !== fileToRemove.name)
        );
    };

    return {
        selectedFiles,
        handleFileUpload,
        setSelectedFiles,
        removeFile
    };
};
