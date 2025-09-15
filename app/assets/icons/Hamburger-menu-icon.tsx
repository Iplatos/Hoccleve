import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface HamburgerMenuProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function HamburgerMenuIcon({focused, width = 24, height = 24, ...props}: HamburgerMenuProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="hamburger_menu" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M3 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm17 5H4a1 1 0 000 2h16a1 1 0 000-2zm0 6H4a1 1 0 000 2h16a1 1 0 000-2z"
                fill={props.color ? props.color : "grey"}/>
        </Svg>

    );
}
