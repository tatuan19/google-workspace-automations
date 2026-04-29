/**
 * Sync all-day holidays from the "Holidays in Japan" calendar into the user's
 * primary calendar as Out of Office events.
 *
 * Requirements:
 * - Enable the Advanced Google service "Calendar API" in Apps Script.
 * - Ensure the source holiday calendar is visible to the account running this script.
 *
 * Behavior:
 * - Reads all-day events from the source holiday calendar within the configured window.
 * - Creates matching full-day timed Out of Office events on the primary calendar.
 * - Configures auto-decline for conflicting invitations without sending updates.
 * - Skips holidays that already have a managed Out of Office event.
 *
 * Suggested usage:
 * - Run once manually to authorize.
 * - Add a time-driven trigger to keep upcoming holidays synced.
 */

const HOLIDAY_OOO_CONFIG = {
  sourceCalendarId: 'en.japanese#holiday@group.v.calendar.google.com',
  sourceCalendarName: 'Holidays in Japan',
  targetCalendarId: 'primary',
  syncStartOffsetDays: 0,
  syncHorizonDays: 365,
  timeZone: Session.getScriptTimeZone(),
  managedBy: 'google-workspace-automations/sync-holiday-calendar-out-of-office',
  outOfOfficeTitlePrefix: 'Holiday: ',
};

function syncHolidayCalendarOutOfOffice() {
  const config = HOLIDAY_OOO_CONFIG;
  const windowStart = startOfDay_(shiftDays_(new Date(), config.syncStartOffsetDays), config.timeZone);
  const windowEnd = startOfDay_(shiftDays_(windowStart, config.syncHorizonDays + 1), config.timeZone);

  assertSourceCalendarAccessible_(config);

  const holidays = listAllDayHolidayEvents_(config, windowStart, windowEnd);
  const existingEventsByKey = listManagedOutOfOfficeEvents_(config, windowStart, windowEnd);

  const created = [];
  const skipped = [];

  holidays.forEach(function(holiday) {
    const key = holiday.dateKey;
    if (existingEventsByKey[key]) {
      skipped.push(key);
      return;
    }

    const inserted = Calendar.Events.insert(
      buildOutOfOfficeEventResource_(config, holiday),
      config.targetCalendarId,
      {
        sendUpdates: 'none',
      }
    );

    created.push({
      date: key,
      id: inserted.id,
      summary: inserted.summary,
    });
  });

  Logger.log(
    JSON.stringify(
      {
        sourceCalendarId: config.sourceCalendarId,
        targetCalendarId: config.targetCalendarId,
        scannedHolidayCount: holidays.length,
        createdCount: created.length,
        skippedCount: skipped.length,
        created: created,
      },
      null,
      2
    )
  );
}

function assertSourceCalendarAccessible_(config) {
  const calendar = CalendarApp.getCalendarById(config.sourceCalendarId);
  if (!calendar) {
    throw new Error(
      'Source calendar is not accessible: ' +
        config.sourceCalendarId +
        ' (' +
        config.sourceCalendarName +
        ').'
    );
  }
}

function listAllDayHolidayEvents_(config, windowStart, windowEnd) {
  const response = Calendar.Events.list(config.sourceCalendarId, {
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: windowStart.toISOString(),
    timeMax: windowEnd.toISOString(),
  });

  return (response.items || [])
    .filter(function(event) {
      return Boolean(event.start && event.start.date && event.end && event.end.date);
    })
    .map(function(event) {
      return {
        id: event.id,
        summary: event.summary || 'Holiday',
        description: event.description || '',
        dateKey: event.start.date,
        startDate: event.start.date,
        endDate: event.end.date,
      };
    });
}

function listManagedOutOfOfficeEvents_(config, windowStart, windowEnd) {
  const response = Calendar.Events.list(config.targetCalendarId, {
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: windowStart.toISOString(),
    timeMax: windowEnd.toISOString(),
    privateExtendedProperty: 'managedBy=' + config.managedBy,
  });

  return (response.items || []).reduce(function(acc, event) {
    const dateKey = getManagedEventDateKey_(event, config.timeZone);
    if (dateKey) {
      acc[dateKey] = event;
    }
    return acc;
  }, {});
}

function getManagedEventDateKey_(event, timeZone) {
  const privateProps =
    event.extendedProperties && event.extendedProperties.private
      ? event.extendedProperties.private
      : {};

  if (privateProps.sourceDate) {
    return privateProps.sourceDate;
  }

  if (event.start && event.start.date) {
    return event.start.date;
  }

  if (event.start && event.start.dateTime) {
    return Utilities.formatDate(new Date(event.start.dateTime), timeZone, 'yyyy-MM-dd');
  }

  return null;
}

function buildOutOfOfficeEventResource_(config, holiday) {
  const eventWindow = buildTimedOutOfOfficeWindow_(holiday, config.timeZone);

  return {
    summary: config.outOfOfficeTitlePrefix + holiday.summary,
    description: buildManagedDescription_(holiday),
    start: {
      dateTime: eventWindow.startDateTime,
      timeZone: config.timeZone,
    },
    end: {
      dateTime: eventWindow.endDateTime,
      timeZone: config.timeZone,
    },
    eventType: 'outOfOffice',
    transparency: 'opaque',
    visibility: 'private',
    extendedProperties: {
      private: {
        managedBy: config.managedBy,
        sourceCalendarId: config.sourceCalendarId,
        sourceEventId: holiday.id,
        sourceDate: holiday.dateKey,
      },
    },
    outOfOfficeProperties: {
      autoDeclineMode: 'declineAllConflictingInvitations',
      declineMessage: '',
    },
  };
}

function buildManagedDescription_(holiday) {
  return [
    'Managed by google-workspace-automations.',
    'Source: Holidays in Japan calendar.',
    'Source event ID: ' + holiday.id,
  ].join('\n');
}

function buildTimedOutOfOfficeWindow_(holiday, timeZone) {
  return {
    startDateTime: toIsoDateTimeAtStartOfDay_(holiday.startDate, timeZone),
    endDateTime: toIsoDateTimeAtStartOfDay_(holiday.endDate, timeZone),
  };
}

function shiftDays_(date, days) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfDay_(date, timeZone) {
  const ymd = Utilities.formatDate(date, timeZone, 'yyyy-MM-dd');
  return new Date(ymd + 'T00:00:00');
}

function toIsoDateTimeAtStartOfDay_(dateString, timeZone) {
  const date = new Date(dateString + 'T00:00:00');
  return Utilities.formatDate(date, timeZone, "yyyy-MM-dd'T'00:00:00");
}
