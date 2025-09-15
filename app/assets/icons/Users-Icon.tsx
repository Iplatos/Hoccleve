import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function UsersIcon({focused, width = 24, height = 24, ...props}: ArrowLeftIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="users" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M7 13a4 4 0 100-8 4 4 0 000 8zm0-6a2 2 0 110 4 2 2 0 010-4zm5 10v2a1 1 0 01-2 0v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 11-2 0v-2a3 3 0 013-3h4a3 3 0 013 3zm5-6a4 4 0 100-8 4 4 0 000 8zm0-6a2 2 0 110 4 2 2 0 010-4zm5 10v2a1 1 0 01-2 0v-2a1 1 0 00-1-1h-4a1 1 0 00-.49.13 1 1 0 00-.4.41 1 1 0 11-1.77-.93 3.06 3.06 0 011.19-1.23A3 3 0 0115 12h4a3 3 0 013 3z"/>
        </Svg>
    );
}











