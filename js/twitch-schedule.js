(function () {
    const scheduleEl = document.getElementById('twitch-schedule');
    const sourceTimeZone = 'America/Mexico_City';
    const streamDayMexico = 2; // Tuesday (0 = Sunday)
    const startHourMexico = 21;
    const startMinuteMexico = 0;
    const endHourMexico = 22;
    const endMinuteMexico = 30;

    if (!scheduleEl) {
        return;
    }

    function getParts(date, timeZone, includeWeekday) {
        const options = {
            timeZone: timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        if (includeWeekday) {
            options.weekday = 'short';
        }

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        const map = {};

        parts.forEach(function (part) {
            if (part.type !== 'literal') {
                map[part.type] = part.value;
            }
        });

        return map;
    }

    function getOffsetMinutes(date, timeZone) {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZone,
            timeZoneName: 'shortOffset'
        });
        const parts = formatter.formatToParts(date);
        const zonePart = parts.find(function (part) {
            return part.type === 'timeZoneName';
        });

        if (!zonePart) {
            return 0;
        }

        const match = zonePart.value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
        if (!match) {
            return 0;
        }

        const sign = match[1] === '-' ? -1 : 1;
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3] || '0', 10);

        return sign * (hours * 60 + minutes);
    }

    function zonedDateTimeToUtcMs(year, month, day, hour, minute, timeZone) {
        const localLikeUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
        let candidateMs = localLikeUtcMs;

        for (let i = 0; i < 2; i += 1) {
            const offset = getOffsetMinutes(new Date(candidateMs), timeZone);
            candidateMs = localLikeUtcMs - (offset * 60 * 1000);
        }

        return candidateMs;
    }

    function getMexicoWeekdayIndex(weekdayShort) {
        const map = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6
        };

        return map[weekdayShort] || 0;
    }

    function getNextScheduleUtcRange() {
        const now = new Date();
        const mexicoNowParts = getParts(now, sourceTimeZone, true);
        const mexicoWeekday = getMexicoWeekdayIndex(mexicoNowParts.weekday);
        const mexicoHour = parseInt(mexicoNowParts.hour, 10);
        const mexicoMinute = parseInt(mexicoNowParts.minute, 10);
        let daysUntil = (streamDayMexico - mexicoWeekday + 7) % 7;

        if (
            daysUntil === 0 &&
            (mexicoHour > endHourMexico || (mexicoHour === endHourMexico && mexicoMinute >= endMinuteMexico))
        ) {
            daysUntil = 7;
        }

        const mexicoYear = parseInt(mexicoNowParts.year, 10);
        const mexicoMonth = parseInt(mexicoNowParts.month, 10);
        const mexicoDay = parseInt(mexicoNowParts.day, 10);

        const targetDateUtc = new Date(Date.UTC(mexicoYear, mexicoMonth - 1, mexicoDay + daysUntil));
        const targetYear = targetDateUtc.getUTCFullYear();
        const targetMonth = targetDateUtc.getUTCMonth() + 1;
        const targetDay = targetDateUtc.getUTCDate();

        const startMs = zonedDateTimeToUtcMs(
            targetYear,
            targetMonth,
            targetDay,
            startHourMexico,
            startMinuteMexico,
            sourceTimeZone
        );

        const endMs = zonedDateTimeToUtcMs(
            targetYear,
            targetMonth,
            targetDay,
            endHourMexico,
            endMinuteMexico,
            sourceTimeZone
        );

        return {
            start: new Date(startMs),
            end: new Date(endMs)
        };
    }

    function formatUserTime(date) {
        return new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit'
        }).format(date);
    }

    function renderSchedule() {
        const range = getNextScheduleUtcRange();
        const startLabel = formatUserTime(range.start);
        const endLabel = formatUserTime(range.end);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'tu huso horario';
        const mxSchedule = 'martes 9:00 pm - 10:30 pm';

        scheduleEl.classList.remove('loading');
        scheduleEl.setAttribute(
            'data-tooltip',
            `La hora se ajusto a tu huso horario (${userTimeZone}). La hora de la transmision es ${mxSchedule} (MX).`
        );
        scheduleEl.innerHTML =
            '<span class="twitch-schedule-meta">Streams<br>todos los martes</span>' +
            `<span class="twitch-schedule-time">${startLabel} - ${endLabel}</span>`;
    }

    try {
        renderSchedule();
    } catch (error) {
        scheduleEl.classList.remove('loading');
        scheduleEl.setAttribute(
            'data-tooltip',
            'La hora se ajusto a tu huso horario. La hora de la transmision es martes 9:00 pm - 10:30 pm (MX).'
        );
        scheduleEl.innerHTML =
            '<span class="twitch-schedule-meta">Streams<br>todos los martes</span>' +
            '<span class="twitch-schedule-time">9:00 pm - 10:30 pm</span>';
    }
})();
