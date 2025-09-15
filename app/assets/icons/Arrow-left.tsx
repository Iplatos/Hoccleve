import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function ArrowLeftIcon({focused, width = 20, height = 20, ...props}: ArrowLeftIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path fillRule="evenodd" clipRule="evenodd"
                  d="M7.89143 10.442C7.64736 10.1979 7.64736 9.80216 7.89143 9.55808L12.0581 5.39141C12.3022 5.14734 12.6979 5.14734 12.942 5.39141C13.1861 5.63549 13.1861 6.03122 12.942 6.2753L9.21726 10L12.942 13.7247C13.1861 13.9688 13.1861 14.3646 12.942 14.6086C12.6979 14.8527 12.3022 14.8527 12.0581 14.6086L7.89143 10.442Z"
                  fill="#2B2D3E"/>
        </Svg>

    );
}











