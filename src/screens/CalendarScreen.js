import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, ActivityIndicator
} from "react-native";
import { useFonts, LexendDeca_400Regular, LexendDeca_700Bold } from '@expo-google-fonts/lexend-deca';
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme, isLightColor } from "../context/ThemeContext";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const YEARS = Array.from({ length: 10 }, (_, i) => 2023 + i);

const EVENTS = [
    { id: 1, day: 5,  title: "Journée portes ouvertes", location: "Magasin Horizon Moto - 10h à 18h", badge: "3x points",     badgeType: "red"   },
    { id: 2, day: 12, title: "Balade printanière",       location: "Départ parking - 8h00",           badge: "Accès gratuit", badgeType: "green" },
    { id: 3, day: 12, title: "Balade printanière",       location: "Départ parking - 8h00",           badge: "Accès gratuit", badgeType: "green" },
    { id: 4, day: 12, title: "Balade printanière",       location: "Départ parking - 8h00",           badge: "Accès gratuit", badgeType: "green" },
];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function CalendarScreen() {
    const today = new Date();
    const [month, setMonth]     = useState(today.getMonth());
    const [year, setYear]       = useState(today.getFullYear());
    const [selected, setSelected] = useState(today.getDate());

    const theme   = useTheme();
    const isLight = isLightColor(theme.primary);
    const styles  = makeStyles(theme, isLight);

    const [fontsLoaded] = useFonts({ LexendDeca_400Regular, LexendDeca_700Bold });

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay    = getFirstDayOfMonth(year, month);
    const cells       = Array(firstDay).fill(null).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );

    const eventDays = new Set(EVENTS.map(e => e.day));

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
        setSelected(null);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
        setSelected(null);
    };

    const filteredEvents = selected ? EVENTS.filter(e => e.day === selected) : EVENTS;

    // Couleur icône nav btn selon luminosité du thème
    const navIconColor = isLight ? "#111111" : "white";

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Image source={require("../../assets/logo.png")} style={styles.logo} />
                <Text style={styles.headerSpan}>Programme fidélité</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Title */}
                <View style={styles.titleBlock}>
                    <Text style={styles.titleSub}>EVENEMENTS</Text>
                    <Text style={styles.titleMain}>MON CALENDRIER</Text>
                </View>

                {/* Calendar card */}
                <View style={styles.calendarCard}>

                    {/* Month/Year navigation */}
                    <View style={styles.calNavRow}>
                        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                            <ChevronLeft color={navIconColor} size={20} />
                        </TouchableOpacity>

                        <View style={styles.pickerBox}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                                {MONTHS.map((m, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => { setMonth(i); setSelected(null); }}
                                        style={[styles.pickerItem, month === i && styles.pickerItemActive]}
                                    >
                                        <Text style={[styles.pickerText, month === i && styles.pickerTextActive]}>{m}</Text>
                                        <ChevronRight color={month === i ? (isLight ? "#111111" : "white") : "#888"} size={12} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.pickerBox}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                                {YEARS.map((y) => (
                                    <TouchableOpacity
                                        key={y}
                                        onPress={() => { setYear(y); setSelected(null); }}
                                        style={[styles.pickerItem, year === y && styles.pickerItemActive]}
                                    >
                                        <Text style={[styles.pickerText, year === y && styles.pickerTextActive]}>{y}</Text>
                                        <ChevronRight color={year === y ? (isLight ? "#111111" : "white") : "#888"} size={12} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                            <ChevronRight color={navIconColor} size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Days header */}
                    <View style={styles.daysHeader}>
                        {DAYS.map(d => (
                            <Text key={d} style={styles.dayLabel}>{d}</Text>
                        ))}
                    </View>

                    {/* Grid */}
                    <View style={styles.grid}>
                        {cells.map((day, i) => {
                            const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const isSelected = day === selected;
                            const hasEvent   = eventDays.has(day);

                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.cell}
                                    onPress={() => day && setSelected(day === selected ? null : day)}
                                    disabled={!day}
                                >
                                    <View style={[
                                        styles.dayCircle,
                                        isSelected && { backgroundColor: theme.primary },
                                        isToday && !isSelected && styles.dayCircleToday,
                                    ]}>
                                        <Text style={[
                                            styles.dayText,
                                            isSelected && { color: isLight ? "#111111" : "white" },
                                            isToday && !isSelected && styles.dayTextToday,
                                            !day && { color: "transparent" },
                                        ]}>
                                            {day ?? "·"}
                                        </Text>
                                    </View>
                                    {hasEvent && day && !isSelected && (
                                        <View style={styles.eventDot} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                </View>

                {/* Events section */}
                <Text style={styles.sectionTitle}>
                    {selected ? `ÉVÉNEMENTS LE ${selected}` : "EVENEMENT CE MOIS"}
                </Text>

                {filteredEvents.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>Aucun événement ce jour</Text>
                    </View>
                ) : (
                    filteredEvents.map((event) => (
                        <View
                            key={event.id}
                            style={[
                                styles.eventItem,
                                event.badgeType === "red" && { borderColor: theme.primary },
                            ]}
                        >
                            <View style={[
                                styles.eventDateBox,
                                event.badgeType === "red" && { backgroundColor: theme.primary },
                            ]}>
                                <Text style={[
                                    styles.eventDateText,
                                    { color: event.badgeType === "red" && isLight ? "#111111" : "white" }
                                ]}>
                                    {String(event.day).padStart(2, "0")}
                                </Text>
                            </View>

                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventLocation}>{event.location}</Text>
                                <View style={[
                                    styles.badge,
                                    event.badgeType === "red"   && { backgroundColor: theme.secondary, borderWidth: 1, borderColor: theme.primary },
                                    event.badgeType === "green" && styles.badgeGreen,
                                ]}>
                                    <Text style={[
                                        styles.badgeText,
                                        event.badgeType === "red"   && { color: theme.primary },
                                        event.badgeType === "green" && styles.badgeTextGreen,
                                    ]}>
                                        {event.badge}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}

            </ScrollView>
        </View>
    );
}

function makeStyles(theme, isLight) {
    return StyleSheet.create({
        loadingContainer: {
            flex: 1, backgroundColor: "#111111",
            justifyContent: "center", alignItems: "center",
        },
        container: {
            flex: 1, backgroundColor: "#111111",
            paddingTop: 50, paddingHorizontal: 16,
        },
        header: {
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "center", marginBottom: 16,
        },
        logo: { width: 140, height: 45, resizeMode: "contain" },
        headerSpan: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 13 },

        scrollContent: { gap: 16, paddingBottom: 120 },

        titleBlock: { gap: 2 },
        titleSub:  { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 12, letterSpacing: 1 },
        titleMain: { color: theme.primary, fontFamily: "LexendDeca_700Bold", fontSize: 30, letterSpacing: 0.5 }, // ✅ thème

        calendarCard: { backgroundColor: "#F5F5F5", borderRadius: 20, padding: 16, gap: 12 },

        calNavRow: { flexDirection: "row", alignItems: "center", gap: 6 },
        navBtn: { padding: 4, backgroundColor: theme.primary, borderRadius: 8 }, // ✅ thème
        pickerBox: { flex: 1 },
        pickerItem: {
            flexDirection: "row", alignItems: "center", gap: 2,
            paddingHorizontal: 8, paddingVertical: 5,
            backgroundColor: "#E0E0E0", borderRadius: 8,
        },
        pickerItemActive: { backgroundColor: theme.primary }, // ✅ thème
        pickerText:       { color: "#444", fontFamily: "LexendDeca_400Regular", fontSize: 13 },
        pickerTextActive: { color: isLight ? "#111111" : "white" }, // ✅ adaptatif

        daysHeader: { flexDirection: "row", justifyContent: "space-around" },
        dayLabel:   { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 12, width: 36, textAlign: "center" },

        grid: { flexDirection: "row", flexWrap: "wrap" },
        cell: { width: "14.28%", alignItems: "center", paddingVertical: 3 },
        dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
        dayCircleToday: { backgroundColor: "#2A2A2A" },
        dayText:        { color: "#1A1A1A", fontFamily: "LexendDeca_400Regular", fontSize: 13 },
        dayTextToday:   { color: "white" },
        eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.primary, marginTop: 2 }, // ✅ thème

        sectionTitle: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 12, letterSpacing: 1 },

        eventItem: {
            backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#2A2A2A",
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
            flexDirection: "row", alignItems: "flex-start", gap: 14,
        },
        eventDateBox: {
            width: 42, height: 42, backgroundColor: "#2A2A2A",
            borderRadius: 10, justifyContent: "center", alignItems: "center",
        },
        eventDateText: { fontFamily: "LexendDeca_700Bold", fontSize: 16 },

        eventInfo: { flex: 1, gap: 4 },
        eventTitle:    { color: "white", fontFamily: "LexendDeca_700Bold", fontSize: 14 },
        eventLocation: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 12 },

        badge:          { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
        badgeGreen:     { backgroundColor: "#0A2A0A", borderWidth: 1, borderColor: "#2ECC71" },
        badgeText:      { fontFamily: "LexendDeca_400Regular", fontSize: 12 },
        badgeTextGreen: { color: "#2ECC71" },

        emptyBox:  { backgroundColor: "#1A1A1A", borderRadius: 14, paddingVertical: 30, alignItems: "center" },
        emptyText: { color: "#888888", fontFamily: "LexendDeca_400Regular", fontSize: 14 },
    });
}