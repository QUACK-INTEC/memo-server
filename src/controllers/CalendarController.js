
const CalendarService = require('../services/CalendarService');
const { serializeSimplePost, serializeSection } = require('../utils/serializers');

const getEventsByDate = async (req, res) => {
    const { date } = req.params;
    const { section, isPublic } = req.query;
    const events = await CalendarService.findEventsByDate(date, req.user.id, section, isPublic);
    const classes = await CalendarService.findSectionsForToday(date, req.user.id);
    res.json({
        success: true,
        events: events.map(serializeSimplePost),
        classes: classes.map((c) => ({
            ...serializeSection(c),
            schedule: c.schedule,
        })),
    });
};


module.exports = {
    getEventsByDate,
};
