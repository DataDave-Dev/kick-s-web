export const AcronymFunction = (username: string, maxLength: number = 3): string => {
    const words = username.split(' ');
    const acronym = words.map(word => word.charAt(0).toUpperCase()).join('');
    return acronym.slice(0, maxLength);
};