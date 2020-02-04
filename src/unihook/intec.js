const axios = require('axios').default;
const cheerio = require('cheerio');

const tough = require('tough-cookie');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;

const InvalidFieldError = require('../constants/errors/InvalidFieldError');

axiosCookieJarSupport(axios);

const BASE_URL = 'https://procesos.intec.edu.do';
const SCHEDULE_ROUTE = '/Reporte/MostrarEnPantalla';
const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const getPeriodNum = (nowDate) => {
    const evalMonth = nowDate.getUTCMonth() === 0 ? 12 : nowDate.getUTCMonth();
    const evalPeriod = Math.ceil(evalMonth / 3);
    const getYear = nowDate.getFullYear();
    const evalYear = evalPeriod === 4 ? getYear - 1 : getYear;

    return {
        period: evalPeriod,
        year: evalYear,
    };
};

const formatTitle = (str) => {
    const alwaysUp = ['i', 'ii', 'iii', 'iv'];
    const alwaysLow = ['de', 'del'];
    return str
        .toLowerCase()
        .split(' ')
        .map((s) => {
            if (alwaysUp.includes(s)) {
                return s.toUpperCase();
            }

            if (alwaysLow.includes(s)) {
                return s;
            }

            return s.charAt(0).toUpperCase() + s.substring(1);
        })
        .join(' ');
};

const parseSchedule = (html) => {
    const $ = cheerio.load(html);
    const classes = [];

    $('table.print-table tbody tr').each((_idx, el) => {
        const row = $(el);

        // ignore rows that dont contain schedule info
        if (row.children().length === 12) {
            const schedule = {};

            row.children(':nth-child(n+6):nth-child(-n+11)').each((i, dayEl) => {
                const split = $(dayEl).text().split('/');
                if (split.length === 2) {
                    schedule[DAY_NAMES[i]] = {
                        from: parseInt(split[0], 10),
                        to: parseInt(split[1], 10),
                    };
                }
            });

            const sectionInfo = {
                code: row.children().first().text().replace(/ +(?= )/g, ''),
                section: row.children(':nth-child(2)').text().replace(/ +(?= )/g, ''),
                room: row.children(':nth-child(12)').text().replace(/ +(?= )/g, ''),
                name: formatTitle(row.children(':nth-child(3)').text()),
                professor: formatTitle(row.children(':nth-child(4)').text().replace(/ +(?= )/g, '')),
                schedule,
            };

            classes.push(sectionInfo);
        }
    });


    return classes;
};

const computeDiscrim = (periodInfo) => `${periodInfo.period}/${periodInfo.year}`;

const scrapeSchedule = async (username, password) => {
    const cookieJar = new tough.CookieJar();

    const intec = axios.create({
        jar: cookieJar,
        baseURL: BASE_URL,
        withCredentials: true,
    });

    const res = await intec.post('/', {
        txtID: username,
        txtUserPass: password,
    });

    if (res.request.path === '/Main/Inicio') {
        const periodInfo = getPeriodNum(new Date());
        const discriminator = computeDiscrim(periodInfo);

        const scheduleRes = await intec.post(SCHEDULE_ROUTE, {
            indiceReporte: '3',
            parametros: {
                Ano: periodInfo.year.toString(),
                Termino: periodInfo.period.toString(),
            },
        });

        const schedule = parseSchedule(scheduleRes.data);

        return { schedule, discriminator };
    }

    throw new InvalidFieldError('Credenciales invalidas');
};

module.exports = {
    parseSchedule,
    scrapeSchedule,
    getPeriodNum,
};
