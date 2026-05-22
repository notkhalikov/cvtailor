import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume-schema";

// DejaVu Sans covers Latin + Cyrillic (default PDF fonts do not).
Font.register({
  family: "DejaVu",
  fonts: [
    { src: "/fonts/DejaVuSans.ttf" },
    { src: "/fonts/DejaVuSans-Bold.ttf", fontWeight: "bold" },
  ],
});
// Avoid awkward single-character line breaks in justified text.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVu",
    fontSize: 10,
    lineHeight: 1.45,
    color: "#1a1a1a",
    paddingVertical: 40,
    paddingHorizontal: 44,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  title: { fontSize: 11, color: "#444", marginTop: 2 },
  contacts: { fontSize: 9, color: "#555", marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 0.7,
    borderBottomColor: "#999",
    paddingBottom: 3,
    marginBottom: 8,
  },
  summary: { color: "#222" },
  expItem: { marginBottom: 10 },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expRole: { fontWeight: "bold" },
  expCompany: { color: "#333" },
  expPeriod: { fontSize: 9, color: "#666" },
  bulletRow: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  skills: { color: "#222" },
  eduItem: { marginBottom: 6, flexDirection: "row", justifyContent: "space-between" },
});

export function ClassicResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          {!!data.fullName && <Text style={styles.name}>{data.fullName}</Text>}
          {!!data.title && <Text style={styles.title}>{data.title}</Text>}
          {data.contacts.length > 0 && (
            <Text style={styles.contacts}>{data.contacts.join("  ·  ")}</Text>
          )}
        </View>

        {!!data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Опыт работы</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.expItem} wrap={false}>
                <View style={styles.expHeader}>
                  <Text>
                    <Text style={styles.expRole}>{exp.role}</Text>
                    {exp.company ? (
                      <Text style={styles.expCompany}>{` — ${exp.company}`}</Text>
                    ) : null}
                  </Text>
                  {!!exp.period && <Text style={styles.expPeriod}>{exp.period}</Text>}
                </View>
                {exp.bullets.map((b, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Навыки</Text>
            <Text style={styles.skills}>{data.skills.join(" · ")}</Text>
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Образование</Text>
            {data.education.map((ed, i) => (
              <View key={i} style={styles.eduItem}>
                <Text>
                  {ed.institution}
                  {ed.degree ? ` — ${ed.degree}` : ""}
                </Text>
                {!!ed.period && <Text style={styles.expPeriod}>{ed.period}</Text>}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
