import React from 'react';
import { SvgProps } from 'react-native-svg';

interface TabIconWrapperProps extends SvgProps {
    IconComponent: React.FC<SvgProps & { focused: boolean }>;
    focused?: boolean;
}

export const TabIconWrapper: React.FC<TabIconWrapperProps> = ({ IconComponent, focused=true }) => {
    const iconSize = 35; // Размер иконок

    return <IconComponent width={iconSize} height={iconSize} focused={focused} />;
};

