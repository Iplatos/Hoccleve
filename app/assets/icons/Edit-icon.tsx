import React from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect, SvgProps} from "react-native-svg";

interface Props extends SvgProps {
    width?: number;
    height?: number;
}

export const EditIcon = ({width = 15, height = 15, ...props}: Props) => {
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 12 12" fill="none">
            <G clipPath="url(#clip0_2353_6322)">
                <Path d="M1.81506 7.40622L4.46826 9.83694L9.74876 4.99375L7.09555 2.56302L1.81506 7.40622Z"
                      fill="#2D3134"></Path>
                <Path
                    d="M11.7804 2.15969L10.1896 0.701416C10.044 0.567977 9.85358 0.500881 9.66303 0.5H9.65511C9.46453 0.500881 9.27434 0.567977 9.12914 0.701416L8.06714 1.67361L10.7199 4.10394L11.7804 3.13175C11.926 2.99831 11.9992 2.82396 12.0002 2.6493V2.64204C11.9992 2.46745 11.926 2.29311 11.7804 2.15969Z"
                    fill="#2D3134"></Path>
                <Path d="M0 11.5L3.447 10.7706L0.794273 8.34027L0 11.5Z" fill="#2D3134"></Path>
            </G>
            <Defs>
                <ClipPath id="clip0_2353_6322">
                    <Rect width="12" height="11" fill="white" transform="translate(0 0.5)"></Rect>
                </ClipPath>
            </Defs>
        </Svg>
    );
};

