import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function FAQIcon({focused, width = 24, height = 24, ...props}: ArrowLeftIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="Artboard_123" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M22.24 11.46a1.489 1.489 0 00-1.08-.46H20V9a3 3 0 00-3-3h-3.17a1 1 0 01-.71-.29l-.83-.83A3 3 0 0010.17 4H5a3 3 0 00-3 3v10a3 3 0 003 3h12a3 3 0 002.64-1.57l2.84-5.21a1.57 1.57 0 00.18-.72 1.5 1.5 0 00-.42-1.04zM5 6h5.17a1 1 0 01.71.29l.83.83a3 3 0 002.12.88H17a1 1 0 011 1v2H8.58a3 3 0 00-2.64 1.57L4 16.13V7a1 1 0 011-1zm12 12H5.26l2.44-4.48a1 1 0 01.88-.52h11.74l-2.44 4.47A1 1 0 0117 18z"/>
        </Svg>
    );
}











