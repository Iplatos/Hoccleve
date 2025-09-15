import React, {useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useRoute} from "@react-navigation/native";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {formatCommentDate} from "../settings/utils.ts";
import {createComment, fetchComments, fetchNew} from "../redux/slises/newsSlice.ts";
import {Colors} from "../constants/Colors.ts";

export const NewsScreen = () => {
    const dispatch = useAppDispatch();
    const [comment, setComment] = useState('');
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const {
        currentNews: news,
        comments,
        commentsPage,
        hasMoreComments,
        isLoadingComments,
    } = useAppSelector((state) => state.news);

    const handleAddComment = () => {
        if (comment.trim() && news?.id) {
            dispatch(createComment({newsId: news.id, comment})).then(() => {
                dispatch(fetchNew(news.id));
                setComment('');
            });
        }
    };

    const title = parseJsonText(news?.title || '{}');
    const text = parseJsonText(news?.text || '{}');

    const loadMoreComments = () => {
        if (news && hasMoreComments && !isLoadingComments) {
            dispatch(fetchComments({
                newsId: news.id,
                first: comments.length,
                last: comments.length + 5,
            }));
        }
    };

    return (
        <FlatList
            data={comments}
            onEndReached={loadMoreComments}
            onEndReachedThreshold={0.3}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ListHeaderComponent={
                <>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.date}>Дата: {news?.date}</Text>
                    {news?.image && (
                        <Image
                            source={{uri: `data:image/png;base64,${news.image}`}}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={styles.text}>{text}</Text>

                    <View style={styles.likesContainer}>
                        <Text style={styles.likesText}>Лайков: {news?.likes || 0}</Text>
                    </View>

                    <View style={styles.commentBlock}>
                        <Text style={styles.title}>Комментарии</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={Colors.textGray}
                            placeholder="Введите комментарий"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddComment}>
                                <Text style={styles.buttonText}>Добавить комментарий</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText}>
                                    Комментариев: {news?.comments || 0}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            }
            contentContainerStyle={styles.container}
            renderItem={({item}) => (
                <View style={styles.commentCard}>
                    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10}}>
                        <Text style={styles.commentTitle}>{item.name}</Text>
                        <Text style={styles.commentDate}>{formatCommentDate(item.date)}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.comment}</Text>
                </View>
            )}
            ListFooterComponent={
                isLoadingComments ? (
                    <View style={{ padding: 20 }}>
                        <ActivityIndicator size="small" color="#888" />
                    </View>
                ) : null
            }
        />
    );
}

// Стили для компонента
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    date: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 200,
        objectFit: 'cover',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        marginBottom: 20,
    },
    likesContainer: {
        marginBottom: 10,
    },
    likesText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentBlock: {
        backgroundColor: '#f1e6f6',
        borderRadius: 8,
        padding: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    buttonsContainer: {
        flexDirection: 'column',
        gap: 10,
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: '#FFC93E',
        padding: 15,
        borderRadius: 8,
    },
    button: {
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: '600',
    },
    commentCard: {
        marginTop: 10,
        backgroundColor: '#f1e6f6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    commentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentDate: {
        fontSize: 14,
        color: '#888',
    },
    commentText: {
        fontSize: 16,
    },
});


// Пример функции для извлечения текста из JSON
const parseJsonText = (json: string) => {
    try {
        const parsed = JSON.parse(json);
        return parsed?.content?.[0]?.content?.[0]?.text || '';
    } catch (error) {
        console.error('Ошибка парсинга JSON', error);
        return '';
    }
};

