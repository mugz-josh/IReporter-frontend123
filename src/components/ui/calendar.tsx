import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "./styles/components.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className = "", classNames = {}, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`calendar ${className}`}
      classNames={{
        months: "calendar-months",
        month: "calendar-month",
        caption: "calendar-caption",
        caption_label: "calendar-caption-label",
        nav: "calendar-nav",
        nav_button: "calendar-nav-button",
        nav_button_previous: "calendar-nav-prev",
        nav_button_next: "calendar-nav-next",
        table: "calendar-table",
        head_row: "calendar-head-row",
        head_cell: "calendar-head-cell",
        row: "calendar-row",
        cell: "calendar-cell",
        day: "calendar-day",
        day_range_end: "day-range-end",
        day_selected: "day-selected",
        day_today: "day-today",
        day_outside: "day-outside",
        day_disabled: "day-disabled",
        day_range_middle: "day-range-middle",
        day_hidden: "day-hidden",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="icon" />,
        IconRight: ({ ..._props }) => <ChevronRight className="icon" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
