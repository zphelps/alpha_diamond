export const enumToArray = (data: {[key: string]: string | number}): {
    key: string;
    value: string | number;
}[] =>
    Object.keys(data)
        .filter((key) => Number.isNaN(+key))
        .map((key: string) => ({
            key,
            value: data[key],
        }));
