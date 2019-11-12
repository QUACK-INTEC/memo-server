const axios = require('axios').default;
const cheerio = require('cheerio');

const tough = require('tough-cookie');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;

axiosCookieJarSupport(axios);

const BASE_URL = 'https://procesos.intec.edu.do';
const DISCRIM_ROUTE = 'OfertaAcademica/Index';
const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const parseSchedule = (html) => {
    const $ = cheerio.load(html);
    const classes = [];

    $('#tblActuales tbody tr').each((_idx, el) => {
        const row = $(el);

        const schedule = {};

        row.children(':nth-child(n+5):nth-child(-n+10)').each((i, dayEl) => {
            const split = $(dayEl).text().split('/');
            if (split.length === 2) {
                schedule[DAY_NAMES[i]] = {
                    from: parseInt(split[0], 10),
                    to: parseInt(split[1], 10),
                };
            }
        });

        const sectionInfo = {
            code: row.children().first().text(),
            section: row.children(':nth-child(3)').text(),
            room: row.children(':nth-child(4)').text(),
            name: row.children(':nth-child(2)').text(),
            professor: row.children(':nth-child(12)').text().replace(/ +(?= )/g, ''),
            schedule,
        };

        classes.push(sectionInfo);
    });


    return classes;
};

const parseDiscrim = (html) => {
    const $ = cheerio.load(html);
    const DISCRIM_STRIP_PREFIX = 'Oferta Académica para el trimestre ';
    return $('.content-header .section-title').text().substring(DISCRIM_STRIP_PREFIX.length);
};

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
        const discrimRes = await intec.get(DISCRIM_ROUTE);
        const discriminator = parseDiscrim(discrimRes.data);

        const schedule = parseSchedule(res.data);

        return { schedule, discriminator };
    }

    throw new Error('Invalid credentials');
};

module.exports = {
    parseSchedule,
    parseDiscrim,
    scrapeSchedule,
};