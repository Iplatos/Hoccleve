import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function AlignCenterIcon({focused, width = 24, height = 24}: GroupsIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="align_center" xmlns="http://www.w3.org/2000/svg">
            <Path
                fill={focused ? "#9828D3" : "#2B2D3E"}
                d="M3 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 3a1 1 0 000 2h10a1 1 0 000-2H7zm13 4H4a1 1 0 000 2h16a1 1 0 000-2zm-3 4H7a1 1 0 000 2h10a1 1 0 000-2z"/>
        </Svg>
    );
}











