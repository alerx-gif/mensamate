"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WeeklyPlan, Meal } from '@/types/eth';
import MenuCard from './MenuCard';
import { splitByMealTime } from '@/lib/mealTime';
import styles from './WeeklyMenuGrid.module.css';

interface WeeklyMenuGridProps {
    plan: WeeklyPlan;
    /**
     * Today as YYYY-MM-DD in Zurich time, resolved on the server. Passing it in
     * rather than reading the clock on mount keeps the correct day selected in
     * the very first paint — no hydration mismatch and no visible jump.
     */
    today: string;
}

// Both the ETH and the UZH client label days in German.
const GERMAN_WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// Spelled out rather than derived via Intl: the server and the browser must
// produce byte-identical markup, and ICU data is not guaranteed to match.
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

interface DayView {
    key: string;
    short: string;
    long: string;
    dayOfMonth: string;
    dateLabel: string;
    isToday: boolean;
    meals: Meal[];
}

function parseIsoDate(iso: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

/** Monday of the week containing `date`. */
function mondayOf(date: Date): Date {
    const weekday = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - weekday + (weekday === 0 ? -6 : 1));
    return monday;
}

/**
 * The API gives each day a German name but no date, so pair the names back up
 * with real dates from the rota's week start. Days whose name we cannot place
 * still render — they just lose the date line rather than disappearing.
 */
function buildDays(plan: WeeklyPlan, today: string): DayView[] {
    const weekStart = parseIsoDate(plan.validFrom);
    const monday = weekStart ? mondayOf(weekStart) : null;

    return plan.days.map((day, index) => {
        const weekdayIndex = GERMAN_WEEKDAYS.findIndex(
            name => name.toLowerCase() === day.dayOfWeek.trim().toLowerCase()
        );

        let date: Date | null = null;
        if (monday && weekdayIndex !== -1) {
            const offsetFromMonday = weekdayIndex === 0 ? 6 : weekdayIndex - 1;
            date = new Date(monday);
            date.setDate(monday.getDate() + offsetFromMonday);
        }

        return {
            key: `${day.dayOfWeek}-${index}`,
            short: date ? WEEKDAY_SHORT[date.getDay()] : day.dayOfWeek.slice(0, 3),
            long: date ? WEEKDAY_LONG[date.getDay()] : day.dayOfWeek,
            dayOfMonth: date ? String(date.getDate()) : '',
            dateLabel: date ? `${date.getDate()} ${MONTHS[date.getMonth()]}` : '',
            isToday: date ? toIsoDate(date) === today : false,
            meals: day.meals,
        };
    });
}

export default function WeeklyMenuGrid({ plan, today }: WeeklyMenuGridProps) {
    const days = useMemo(() => buildDays(plan, today), [plan, today]);

    const todayIndex = days.findIndex(day => day.isToday);
    const [selectedIndex, setSelectedIndex] = useState(() => (todayIndex === -1 ? 0 : todayIndex));
    const tabsRef = useRef<HTMLDivElement>(null);

    // Keep the selection in range if the plan changes underneath us.
    useEffect(() => {
        setSelectedIndex(previous => Math.min(previous, Math.max(0, days.length - 1)));
    }, [days.length]);

    // Five weekdays fit a phone, but a rota that includes the weekend scrolls.
    // Keep the selected tab in view without disturbing the page's own scroll.
    useEffect(() => {
        const list = tabsRef.current;
        if (!list || list.scrollWidth <= list.clientWidth) return;

        const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[selectedIndex];
        if (!tab) return;

        list.scrollTo({
            left: Math.max(0, tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2),
            behavior: 'smooth',
        });
    }, [selectedIndex]);

    // Arrow-key navigation, as the tablist pattern expects.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const lastIndex = days.length - 1;
        let nextIndex = selectedIndex;

        if (event.key === 'ArrowRight') nextIndex = Math.min(selectedIndex + 1, lastIndex);
        else if (event.key === 'ArrowLeft') nextIndex = Math.max(selectedIndex - 1, 0);
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = lastIndex;
        else return;

        event.preventDefault();
        setSelectedIndex(nextIndex);
        tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
    };

    if (days.length === 0) return null;

    const activeDay = days[selectedIndex] ?? days[0];
    const mealCount = activeDay.meals.length;

    // Same lunch/dinner split as the daily view, so dinner lines are not
    // interleaved with lunch. Headings only appear when both are present.
    const { lunch, dinner } = splitByMealTime(activeDay.meals);
    const mealGroups = [
        { key: 'lunch', title: 'Lunch', meals: lunch },
        { key: 'dinner', title: 'Dinner', meals: dinner },
    ].filter(group => group.meals.length > 0);

    return (
        <div className={styles.container}>
            <div className={styles.dayBar}>
                <div
                    className={styles.tabs}
                    role="tablist"
                    aria-label="Day of the week"
                    ref={tabsRef}
                    onKeyDown={handleKeyDown}
                >
                    {days.map((day, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <button
                                key={day.key}
                                type="button"
                                role="tab"
                                id={`weekday-tab-${index}`}
                                aria-controls={`weekday-panel-${index}`}
                                aria-selected={isSelected}
                                tabIndex={isSelected ? 0 : -1}
                                className={`${styles.tab} ${isSelected ? styles.tabSelected : ''}`}
                                onClick={() => setSelectedIndex(index)}
                            >
                                <span className={styles.tabWeekday}>{day.short}</span>
                                <span className={styles.tabDayOfMonth}>{day.dayOfMonth}</span>
                                <span
                                    className={`${styles.tabMarker} ${day.isToday ? styles.tabMarkerToday : ''}`}
                                    aria-hidden="true"
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            <section
                id={`weekday-panel-${selectedIndex}`}
                role="tabpanel"
                aria-labelledby={`weekday-tab-${selectedIndex}`}
                className={styles.panel}
            >
                <header className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>
                        {activeDay.long}
                        {activeDay.isToday && <span className={styles.todayBadge}>Today</span>}
                    </h2>
                    <p className={styles.panelMeta}>
                        {activeDay.dateLabel && <span>{activeDay.dateLabel}</span>}
                        {activeDay.dateLabel && <span aria-hidden="true"> · </span>}
                        <span>{mealCount} {mealCount === 1 ? 'menu' : 'menus'}</span>
                    </p>
                </header>

                {mealCount === 0 ? (
                    <div className={styles.emptyDay}>
                        <div className={styles.emptyIcon}>🍽️</div>
                        <p className={styles.emptyText}>No menus on {activeDay.long}</p>
                    </div>
                ) : (
                    mealGroups.map(group => (
                        <div key={group.key} className={styles.mealGroup}>
                            {mealGroups.length > 1 && (
                                <h3 className={styles.mealGroupTitle}>{group.title}</h3>
                            )}
                            <div className={styles.grid}>
                                {group.meals.map((meal, index) => (
                                    <MenuCard
                                        key={meal.id || index}
                                        meal={meal}
                                        index={index}
                                        facilityId={plan.facilityId}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
