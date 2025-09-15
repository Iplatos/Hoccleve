import React, {useEffect, useState} from 'react';
import {Alert, Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {getUrl} from "../../settings/utils.ts";

type LessonMaterialsProps = {
    materials: any[] | undefined
}

export const LessonMaterials = ({materials}: LessonMaterialsProps) => {
    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };

        fetchUrl();
    }, []);

    const openLink = (url: string) => {

        if (url) {
            Linking.openURL(url).catch(err => Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${url}`));
        }
    };


    return (
        <View style={styles.container}>
            {materials?.map(item => {
                return (
                    <TouchableOpacity
                        style={styles.materialContainer}
                        key={item.id}
                        onPress={() => {
                            if (item.storage_type === 0) {
                                openLink(item.link)
                            } else {
                                openLink(`${url}/${item.link}`)
                            }
                        }}>
                        <Text style={styles.text}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    materialContainer: {
        backgroundColor: '#f1e6f6',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 7
    },
    text: {
        //   fontSize: 18,
    },
});


