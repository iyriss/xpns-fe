function displayDate(date: string) {
    if (!date) {
        return null;
    }

    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: '2-digit',
        timeZone: 'UTC',
    };
    return new Intl.DateTimeFormat('en-CA', options).format(new Date(date));
}

export { displayDate };