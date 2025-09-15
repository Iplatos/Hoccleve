import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ListCheckmarksIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function ListCheckmarksIcon({focused, width = 24, height = 24, ...props}: ListCheckmarksIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="list_checkmarks" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M8 4a.9.9 0 010 1.3L5.7 7.58a1 1 0 01-.52.24h-.12a.85.85 0 01-.22 0 .53.53 0 01-.12 0 .87.87 0 01-.18-.11l-.12-.08L3.24 6.4a.91.91 0 111.28-1.28l.54.55L6.7 4A.9.9 0 018 4zm-1.3 6l-1.64 1.67-.54-.55a.91.91 0 00-1.28 1.28l1.18 1.18.12.08a.87.87 0 00.18.11h.12a.81.81 0 00.22 0h.12a1 1 0 00.52-.24L8 11.3A.92.92 0 006.7 10zm0 6l-1.64 1.67-.54-.55a.91.91 0 10-1.28 1.28l1.18 1.18.12.08a.87.87 0 00.18.11h.12a.81.81 0 00.22 0h.12a1 1 0 00.52-.24L8 17.3A.92.92 0 006.7 16zM11 7h8.5a1 1 0 100-2H11a1 1 0 100 2zm8.5 10H11a1 1 0 100 2h8.5a1 1 0 000-2zm0-6H11a1 1 0 000 2h8.5a1 1 0 000-2z"
                fill={props.color ? props.color : "grey"}
            />
        </Svg>

    );
}











