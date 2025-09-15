import React, {useEffect, useState} from 'react';
import {Image, Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import {getUrl} from "../../settings/utils.ts";
import {FileData} from "../../redux/slises/probeWorkSlice.ts";


type ImageTaskComponentProps = {
    file: FileData;
}

export const ImageTaskComponent = ({file}: ImageTaskComponentProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };

        fetchUrl();
    }, []);

    const openImage = () => {
        setIsModalVisible(true);
    };
    const closeImage = () => {
        setIsModalVisible(false);
    };

    return (
        <View
            style={{marginBottom: 10}}
            key={file.file_path}
        >
            {/* Обычное изображение, при клике на которое открывается модальное окно */}
            <TouchableOpacity onPress={openImage}>
                <Image
                    source={{uri: `${url}${file.file_path}`}}
                    style={{width: '100%', height: 150, resizeMode: 'contain'}}
                />
            </TouchableOpacity>

            {/* Модальное окно для просмотра изображения */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                onRequestClose={closeImage}  // Закрытие по нажатию назад на Android
            >
                <View style={styles.modalBackground}>
                    <TouchableOpacity style={styles.modalContent} onPress={closeImage}>
                        <Image
                            source={{uri: `${url}${file.file_path}`}}
                            style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                        />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Темный фон для модального окна
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
