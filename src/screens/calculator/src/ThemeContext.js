import React, { useState, createContext, useEffect } from "react";
import { Appearance } from 'react-native';

export const ThemeContext = createContext();

export const ThemeContextProvider = props => {
    const colorScheme = Appearance.getColorScheme();
    const [styles, setStyles] = useState({});
    const [colors, setColors] = useState({});
    const [isLoading, setLoading] = useState(true);

    const lightThemeColors = {
        bg: '#f9f9f9',
        buttonBg: '#f1f3f4',
        previewBg: 'transparent',
        equalsBg: '#4285f4',
        clearBg: '#eb6161',
        numberBg: '#ffffff',
        displayBg: '#ffffff',
        buttonTextColor: '#000000',
        numberButtonTextColor: '#000000',
        clearButtonTextColor: '#ffffff',
        equalsButtonTextColor: '#ffffff',
        previewTextColor: '#000000',
        expressionTextColor: '#000000',
        borderColor: '#f9f9f9',
        borderRadius: 5,
        spacing: 2,
        fontSize: 16,
        exprFontSize: 30
    }

    const darkThemeColors = {
        bg: '#21252d',
        buttonBg: '#292d36',
        previewBg: 'transparent',
        equalsBg: '#4285f4',
        clearBg: '#eb6161',
        numberBg: '#393e4a',
        displayBg: '#21252d',
        buttonTextColor: '#ffffff',
        numberButtonTextColor: '#ffffff',
        clearButtonTextColor: '#ffffff',
        equalsButtonTextColor: '#ffffff',
        previewTextColor: '#c3c9d5',
        expressionTextColor: '#ffffff',
        borderColor: '#21252d',
        borderRadius: 5,
        spacing: 2,
        fontSize: 16,
        exprFontSize: 30
    }

    useEffect(() => {
        if(Object.keys(colors).length === 0) return;
        if(styles !== {}) generateStyles();
    }, [colors])

    useEffect(() => {
        if(Object.keys(styles).length === 0) return;
        setValue({...value, styles: styles});
        setLoading(false);
    }, [styles])

    useEffect(() => {
        setValue({...value, isLoading: isLoading});
    }, [isLoading])

    let init = false;
    const customizeTheme = ({theme, customize}) => {
        if(init) return;
        init = true;
        let themeType = theme || colorScheme;
        const _defaultColors = themeType === "light" ? lightThemeColors : darkThemeColors;
        let merged = {..._defaultColors, ...customize};
        setColors(merged);
    }

    const generateStyles = () => {
        const { bg, buttonBg, previewBg, equalsBg, clearBg, numberBg, displayBg, buttonTextColor, numberButtonTextColor, clearButtonTextColor, equalsButtonTextColor, previewTextColor, expressionTextColor, borderColor, borderRadius, spacing, fontSize, exprFontSize } = colors;

        const btn = {
            borderWidth: spacing,
            borderColor: borderColor,
            borderRadius: borderRadius,
            backgroundColor: buttonBg,
            color: buttonTextColor,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize,
            fontWeight: "normal"
        }

        const _styles = {
            container: {
                backgroundColor: bg,
                flex: 1
            },
            tooltipContainer: {
                flex: 1, flexDirection: "row", background: buttonBg, alignItems: "center"
            },
            tooltip: {
                color: buttonTextColor, flex: 8, fontSize: fontSize * 0.8, paddingLeft: 5, opacity: 0.5
            },
            row: {
                display: "flex",
                flexDirection: "row",
                flex: 1
            },
            button: btn,
            display: {
                backgroundColor: displayBg,
                padding: 5,
                flex: 1.5,
                flexShrink: 0,
                justifyContent: "center",
                minHeight: exprFontSize * 2.3,
            },
            expression: {
                flex: 1,
                backgroundColor: "transparent",
                color: expressionTextColor,
                display: "flex",
                textAlign: "right",
                alignItems: "flex-end",
                fontSize: exprFontSize,
                lineHeight: exprFontSize,
                fontWeight: "bold",
                marginTop: "auto"
            },
            result: {
                backgroundColor: previewBg,
                color: previewTextColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                lineHeight: exprFontSize * 0.5,
                fontSize: exprFontSize * 0.5,
                marginTop: 5
            },
            buttonEquals: {
                ...btn,
                backgroundColor: equalsBg,
                color: equalsButtonTextColor,
                fontWeight: "bold"
            },
            buttonClear: {
                ...btn,
                backgroundColor: clearBg,
                color: clearButtonTextColor
            },
            buttonNumber: {
                ...btn,
                backgroundColor: numberBg,
                color: numberButtonTextColor
            }
        };

        setStyles(_styles);
    }

    const [value, setValue] = useState({
        styles: styles,
        colors: colors,
        customizeTheme: customizeTheme,
        isLoading: isLoading
    })

    return (
        <ThemeContext.Provider value={value}>
            {props.children}
        </ThemeContext.Provider>
    );
}