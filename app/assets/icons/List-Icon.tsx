import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function ListIcon({focused, width = 24, height = 24, ...props}: ArrowLeftIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M16 12a1 1 0 01-1 1H9a1 1 0 010-2h6a1 1 0 011 1zm-4 3H9a1 1 0 000 2h3a1 1 0 000-2zm9-10v14a3 3 0 01-3 3H6a3 3 0 01-3-3V5a3 3 0 013-3h12a3 3 0 013 3zm-7 1a1 1 0 001-1V4H9v1a1 1 0 001 1h4zm5-1a1 1 0 00-1-1h-1v1a3 3 0 01-3 3h-4a3 3 0 01-3-3V4H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V5z"/>
        </Svg>

    );
}











