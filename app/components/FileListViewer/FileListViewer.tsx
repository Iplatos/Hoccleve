import React, {useEffect, useState} from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {getUrl} from "../../settings/utils.ts";

type FileItem = {
    name: string;
    path: string;
    size: number;
    type: string;
    extension: string;
};

type Props = {
    files: FileItem[];
};

export const FileListViewer = ({ files }: Props) => {

    const [url, setUrlState] = useState<string | null>(null);
  //  console.log(url)
    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };

        fetchUrl();
    }, []);

    const handleOpenFile = (path: string) => {
        if (path) {
            Linking.openURL(`${url}${path}`).catch(err =>
                console.error("Не удалось открыть файл:", err)
            );
        }
    };

    const renderItem = ({ item }: { item: FileItem }) => (
        <TouchableOpacity style={styles.fileItem} onPress={() => handleOpenFile(item.path)}>
            <Ionicons name="document-text-outline" size={20} color="#007AFF" />
            <Text style={styles.fileName} numberOfLines={1}>{item.name || 'Файл'}</Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <FlatList
                data={files}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    fileName: {
        marginLeft: 8,
        color: '#007AFF',
        fontSize: 14,
        flex: 1,
    },
});

