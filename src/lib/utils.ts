export const AcronymFunction = (username: string, maxLength: number = 2): string => {
    const words = username.split(' ');
    const acronym = words.map(word => word.charAt(0).toUpperCase()).join('');
    return acronym.slice(0, maxLength);
};