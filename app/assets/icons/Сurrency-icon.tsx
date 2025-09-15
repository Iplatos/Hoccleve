import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface CurrencyIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function CurrencyIcon({focused, width = 15, height = 15, ...props}: CurrencyIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M2.143 13.858V0.141754H7.90983C9.75201 0.141754 11.2004 0.533647 12.255 1.31743C13.3229 2.08816 13.8569 3.23118 13.8569 4.74649C13.8569 6.24875 13.3229 7.39177 12.255 8.17556C11.2004 8.94628 9.75201 9.33164 7.90983 9.33164H3.58471L4.74608 8.15596V13.858H2.143ZM4.74608 8.43029L3.58471 7.2742H7.88981C8.95774 7.2742 9.77871 7.05866 10.3527 6.62758C10.9401 6.18344 11.2338 5.56294 11.2338 4.76609C11.2338 3.96924 10.9401 3.36181 10.3527 2.94379C9.77871 2.51271 8.95774 2.29716 7.88981 2.29716H3.58471L4.74608 1.04311V8.43029ZM0.140625 11.8202V10.4485H9.1513V11.8202H0.140625Z"
                fill="#AB48E0"/>
        </Svg>


)    ;
}











