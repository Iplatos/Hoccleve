import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function CheckedIcon({focused, width = 20, height = 20, ...props}: ArrowLeftIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
            <Path d="M5 14L8.23309 16.4248C8.66178 16.7463 9.26772 16.6728 9.60705 16.2581L18 6" stroke="#fff"
                  stroke-width="2" stroke-linecap="round"/>
        </Svg>

    );
}











