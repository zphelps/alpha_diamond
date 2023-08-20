import {Job} from "../types/job.ts";
import {format, set} from "date-fns";
import {daysOfWeek} from "../sections/jobs/create/select-recurrence";
import {ServiceType} from "../types/service.ts";

export const getJobRecurrenceDescription = (job: Job): string => {
    let description = '';

    if (job.service_type !== ServiceType.RECURRING) {
        description = `${format(new Date(job.timestamp), 'MMM dd, yyyy')} at ${format(new Date(job.timestamp), 'h:mm a')}`;
        return description;
    }

    if (!job.days_of_week) {
        description += `${job.services_per_week} time${job.services_per_week > 1 ? 's' : ''} a week`;
    } else {
        description += `Every ${job.days_of_week.map((day) => daysOfWeek[day - 1].label).join(', ')}`
    }

    if (!job.start_time_window && !job.end_time_window) {
        description += ' at any time';
    } else {
        description += ` at ${format(set(new Date(), 
            {hours: Number(job.start_time_window.split(':')[0]), 
                minutes: Number(job.start_time_window.split(':')[1]), seconds: 0}), 'h:mm a')}`;
    }

    return description;
}
