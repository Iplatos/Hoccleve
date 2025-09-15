import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function UserRoundIcon({focused, width = 24, height = 24, ...props}: ArrowLeftIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="user_round" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M12 6a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zm0-10a10 10 0 100 20 10 10 0 000-20zM8 18.92V18a1 1 0 011-1h6a1 1 0 011 1v.92a7.95 7.95 0 01-8 0zm9.93-1.57A3 3 0 0015 15H9a3 3 0 00-2.93 2.35 8 8 0 1111.86 0z"/>
        </Svg>
    );
}











