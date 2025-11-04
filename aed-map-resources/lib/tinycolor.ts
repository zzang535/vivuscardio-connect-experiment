type DarkenColorParams = {
    color: string;
    percent: number;
};

// Darken a hex color by a given percentage
export function darkenColor({ color, percent }: DarkenColorParams): string {
    // Remove '#' if present
    const hex = color.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate darkened values
    const factor = 1 - percent / 100;
    const newR = Math.max(0, Math.floor(r * factor));
    const newG = Math.max(0, Math.floor(g * factor));
    const newB = Math.max(0, Math.floor(b * factor));

    // Convert back to hex
    const toHex = (value: number) => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
