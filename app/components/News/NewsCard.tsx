import React from 'react';
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RFValue} from "react-native-responsive-fontsize";
import {Colors} from "../../constants/Colors.ts";
import {fetchComments, fetchNew, News, toggleLike} from "../../redux/slises/newsSlice.ts";
import {extractTextFromJson} from "../../settings/utils.ts";
import HeartIcon from "../../assets/img/Heart.tsx";
import MessageIcon from "../../assets/img/MessageIcon.tsx";
import {useAppDispatch} from "../../redux/hooks.ts";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";


interface NewsCardProps {
    news: News;
}

export const NewsCard: React.FC<NewsCardProps> = ({news}) => {
    const navigation = useNavigation()
    const dispatch = useAppDispatch()
    const title = extractTextFromJson(news.title);
    const text = extractTextFromJson(news.text);
    const imageSource = `data:image/${news.image_type};base64,${news.image}`;
    const handleLikePress = () => {
        dispatch(toggleLike(news.id));

    };
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {

                dispatch(fetchNew(news.id))
                dispatch(fetchComments({
                    newsId: news.id,
                    first: 0,
                    last: 5,
                }));

                // @ts-ignore
                navigation.navigate(ROUTES.NEWS);
            }}
            style={styles.card}>
            <Image
                source={{uri: imageSource}}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.textContainer}>
                <Text numberOfLines={2} style={styles.title}>{title}</Text>
                <Text numberOfLines={3} style={styles.subtitle}>{text}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.date}>{news.date}</Text>
                <View style={styles.iconsBlock}>
                    <TouchableOpacity style={styles.block} onPress={handleLikePress}>
                        <HeartIcon color={news.likedByMe ? 'red' : undefined}/>
                        <Text style={styles.icon}>{news.likes}</Text>
                    </TouchableOpacity>
                    <View style={styles.block}>
                        <MessageIcon/>
                        <View style={styles.commentBlock}>
                            <Text style={styles.iconComment}>{news.comments}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 12,
        padding: 11,
        borderWidth: 1,
        borderColor: Colors.background
    },
    textContainer: {
        flex: 1,
        marginTop: 10,
    },
    title: {
        color: Colors.textBlack,
        fontSize: RFValue(16, 680),
        fontWeight: 'bold',
        marginBottom: 5,

    },
    subtitle: {
        color: Colors.textGray,
        fontSize: RFValue(12, 680),
        marginBottom: 10,
    },
    date: {
        color: Colors.textGray,
        fontSize: RFValue(10, 680),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commentBlock: {
        backgroundColor: Colors.backgroundPurple,
       // padding: 3,
        height: 20,
        width: 20,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -5,
        right: -7
    },
    block: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2
    },
    iconsBlock: {
        flexDirection: 'row',
        gap: 20
    },
    icon: {

        fontSize: RFValue(12, 680),
    },
    iconComment: {
        textAlign: 'center',
        fontSize: 10,
        lineHeight: 10,
        color: Colors.white
    },
    button: {
        backgroundColor: '#9164cc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: RFValue(16, 680),
        fontWeight: 'bold',
    },
    image: {
        width: '100%',
        height: 135,
        borderRadius: 12,
    },
});

