const convertWeekNumberToLetter = (day) => {
    const days = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    ];
    return days[day];
};

const extractDateFromYYYYMMDD = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const date = new Date(year, month - 1, day);
    return date;
};

module.exports = {
    convertWeekNumberToLetter,
    extractDateFromYYYYMMDD,
};
