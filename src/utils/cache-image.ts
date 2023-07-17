export const cacheImages = async (srcArray: string[]) => {
    const promises = srcArray.map((src) => {
        return new Promise<void>(function (resolve, reject) {
            const img = new Image();
            img.src = src;
            // @ts-ignore
            img.onload = resolve();
            // @ts-ignore
            img.onerror = reject();
        })
    });
    await Promise.all(promises);
};
