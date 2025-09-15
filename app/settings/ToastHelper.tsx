import {
    BaseToast,
    BaseToastProps,
    ToastConfig,
} from 'react-native-toast-message';

export const toastProps: BaseToastProps = {
    text1Style: {
        fontSize: 18,
    },
    text2Style: {
        fontSize: 14,
    },
    text2NumberOfLines: 0,
    style: {
        height: 'auto',
        paddingVertical: 10,
        paddingHorizontal: 0,
        zIndex: 500
    },
};

export const toastConfig: ToastConfig = {
    success: props => (
        <BaseToast
            {...props}
            {...toastProps}
            style={[
                toastProps.style,
                {
                    borderLeftColor: '#69C779',
                },
            ]}
        />
    ),
    error: (props: BaseToastProps) => (
        <BaseToast
            {...props}
            {...toastProps}
            style={[
                toastProps.style,
                {

                    borderLeftColor: '#FE6301',
                },
            ]}
        />
    ),
    info: props => (
        <BaseToast
            {...props}
            {...toastProps}
            style={[
                toastProps.style,
                {
                    zIndex: 500,
                    borderLeftColor: '#FFC107',
                },
            ]}
        />
    ),
};



