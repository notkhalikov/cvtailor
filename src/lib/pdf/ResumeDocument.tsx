import "@/lib/pdf/fonts";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume-schema";
import type { Design } from "@/lib/pdf/design";

type TplProps = { data: ResumeData; accent: string };

function Bullets({ items, color = "#1a1a1a" }: { items: string[]; color?: string }) {
  return (
    <>
      {items.map((b, j) => (
        <View key={j} style={{ flexDirection: "row", marginTop: 2 }}>
          <Text style={{ width: 10, color }}>•</Text>
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </>
  );
}

/* ── Classic — 1 column, ATS-safe ─────────────────────────────── */
function Classic({ data, accent }: TplProps) {
  const s = StyleSheet.create({
    page: { fontFamily: "DejaVu", fontSize: 10, lineHeight: 1.45, color: "#1a1a1a", padding: 44 },
    name: { fontSize: 18, fontWeight: "bold" },
    title: { fontSize: 11, color: "#444", marginTop: 2 },
    contacts: { fontSize: 9, color: "#555", marginTop: 4 },
    section: { marginTop: 16 },
    h: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: accent, borderBottomWidth: 0.7, borderBottomColor: accent, paddingBottom: 3, marginBottom: 8 },
    exp: { marginBottom: 10 },
    expHead: { flexDirection: "row", justifyContent: "space-between" },
    period: { fontSize: 9, color: "#666" },
    edu: { marginBottom: 6, flexDirection: "row", justifyContent: "space-between" },
  });
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          {!!data.fullName && <Text style={s.name}>{data.fullName}</Text>}
          {!!data.title && <Text style={s.title}>{data.title}</Text>}
          {data.contacts.length > 0 && <Text style={s.contacts}>{data.contacts.join("  ·  ")}</Text>}
        </View>
        {!!data.summary && (
          <View style={s.section}><Text style={s.h}>Summary</Text><Text>{data.summary}</Text></View>
        )}
        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.h}>Опыт работы</Text>
            {data.experience.map((e, i) => (
              <View key={i} style={s.exp} wrap={false}>
                <View style={s.expHead}>
                  <Text><Text style={{ fontWeight: "bold" }}>{e.role}</Text>{e.company ? ` — ${e.company}` : ""}</Text>
                  {!!e.period && <Text style={s.period}>{e.period}</Text>}
                </View>
                <Bullets items={e.bullets} color={accent} />
              </View>
            ))}
          </View>
        )}
        {data.skills.length > 0 && (
          <View style={s.section}><Text style={s.h}>Навыки</Text><Text>{data.skills.join(" · ")}</Text></View>
        )}
        {data.education.length > 0 && (
          <View style={s.section}>
            <Text style={s.h}>Образование</Text>
            {data.education.map((e, i) => (
              <View key={i} style={s.edu}><Text>{e.institution}{e.degree ? ` — ${e.degree}` : ""}</Text>{!!e.period && <Text style={s.period}>{e.period}</Text>}</View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

/* ── Sidebar — 2 columns ──────────────────────────────────────── */
function Sidebar({ data, accent }: TplProps) {
  const s = StyleSheet.create({
    page: { fontFamily: "DejaVu", fontSize: 9.5, lineHeight: 1.45, color: "#1a1a1a", flexDirection: "row" },
    side: { width: "33%", backgroundColor: "#f3f4f6", padding: 22 },
    main: { width: "67%", padding: 26 },
    name: { fontSize: 17, fontWeight: "bold", color: accent },
    title: { fontSize: 10, color: "#444", marginTop: 2 },
    sideH: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: accent, marginTop: 16, marginBottom: 5 },
    mainH: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: accent, marginBottom: 7 },
    section: { marginTop: 14 },
    item: { marginBottom: 4 },
    exp: { marginBottom: 10 },
    period: { fontSize: 9, color: "#666" },
  });
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.side}>
          {!!data.fullName && <Text style={s.name}>{data.fullName}</Text>}
          {!!data.title && <Text style={s.title}>{data.title}</Text>}
          {data.contacts.length > 0 && (
            <><Text style={s.sideH}>Контакты</Text>{data.contacts.map((c, i) => <Text key={i} style={s.item}>{c}</Text>)}</>
          )}
          {data.skills.length > 0 && (
            <><Text style={s.sideH}>Навыки</Text>{data.skills.map((c, i) => <Text key={i} style={s.item}>{c}</Text>)}</>
          )}
          {data.education.length > 0 && (
            <><Text style={s.sideH}>Образование</Text>{data.education.map((e, i) => (
              <View key={i} style={s.item}><Text>{e.institution}</Text>{!!e.degree && <Text style={{ color: "#555" }}>{e.degree}</Text>}{!!e.period && <Text style={s.period}>{e.period}</Text>}</View>
            ))}</>
          )}
        </View>
        <View style={s.main}>
          {!!data.summary && (<View><Text style={s.mainH}>Summary</Text><Text>{data.summary}</Text></View>)}
          {data.experience.length > 0 && (
            <View style={s.section}>
              <Text style={s.mainH}>Опыт работы</Text>
              {data.experience.map((e, i) => (
                <View key={i} style={s.exp} wrap={false}>
                  <Text><Text style={{ fontWeight: "bold" }}>{e.role}</Text>{e.company ? ` — ${e.company}` : ""}</Text>
                  {!!e.period && <Text style={s.period}>{e.period}</Text>}
                  <Bullets items={e.bullets} color={accent} />
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

/* ── Modern — accent header band ──────────────────────────────── */
function Modern({ data, accent }: TplProps) {
  const s = StyleSheet.create({
    page: { fontFamily: "DejaVu", fontSize: 10, lineHeight: 1.45, color: "#1a1a1a" },
    band: { backgroundColor: accent, paddingVertical: 24, paddingHorizontal: 44 },
    name: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    title: { fontSize: 11, color: "#ffffffcc", marginTop: 2 },
    contacts: { fontSize: 9, color: "#ffffffcc", marginTop: 6 },
    body: { paddingHorizontal: 44, paddingVertical: 22 },
    section: { marginTop: 16 },
    h: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5, color: accent, marginBottom: 8 },
    exp: { marginBottom: 10 },
    expHead: { flexDirection: "row", justifyContent: "space-between" },
    period: { fontSize: 9, color: "#666" },
  });
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          {!!data.fullName && <Text style={s.name}>{data.fullName}</Text>}
          {!!data.title && <Text style={s.title}>{data.title}</Text>}
          {data.contacts.length > 0 && <Text style={s.contacts}>{data.contacts.join("  ·  ")}</Text>}
        </View>
        <View style={s.body}>
          {!!data.summary && (<View><Text style={s.h}>Summary</Text><Text>{data.summary}</Text></View>)}
          {data.experience.length > 0 && (
            <View style={s.section}>
              <Text style={s.h}>Опыт работы</Text>
              {data.experience.map((e, i) => (
                <View key={i} style={s.exp} wrap={false}>
                  <View style={s.expHead}>
                    <Text><Text style={{ fontWeight: "bold" }}>{e.role}</Text>{e.company ? ` — ${e.company}` : ""}</Text>
                    {!!e.period && <Text style={s.period}>{e.period}</Text>}
                  </View>
                  <Bullets items={e.bullets} color={accent} />
                </View>
              ))}
            </View>
          )}
          {data.skills.length > 0 && (<View style={s.section}><Text style={s.h}>Навыки</Text><Text>{data.skills.join(" · ")}</Text></View>)}
          {data.education.length > 0 && (
            <View style={s.section}><Text style={s.h}>Образование</Text>{data.education.map((e, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}><Text>{e.institution}{e.degree ? ` — ${e.degree}` : ""}</Text>{!!e.period && <Text style={s.period}>{e.period}</Text>}</View>
            ))}</View>
          )}
        </View>
      </Page>
    </Document>
  );
}

/* ── Compact — dense single column ────────────────────────────── */
function Compact({ data, accent }: TplProps) {
  const s = StyleSheet.create({
    page: { fontFamily: "DejaVu", fontSize: 8.7, lineHeight: 1.32, color: "#1a1a1a", paddingVertical: 30, paddingHorizontal: 36 },
    name: { fontSize: 15, fontWeight: "bold" },
    title: { fontSize: 9.5, color: "#444" },
    contacts: { fontSize: 8, color: "#555", marginTop: 2 },
    section: { marginTop: 10 },
    h: { fontSize: 8.5, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.8, color: accent, borderBottomWidth: 0.6, borderBottomColor: "#ccc", paddingBottom: 2, marginBottom: 5 },
    exp: { marginBottom: 6 },
    expHead: { flexDirection: "row", justifyContent: "space-between" },
    period: { fontSize: 8, color: "#666" },
  });
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          {!!data.fullName && <Text style={s.name}>{data.fullName}</Text>}
          {!!data.title && <Text style={s.title}>{data.title}</Text>}
          {data.contacts.length > 0 && <Text style={s.contacts}>{data.contacts.join("  ·  ")}</Text>}
        </View>
        {!!data.summary && (<View style={s.section}><Text style={s.h}>Summary</Text><Text>{data.summary}</Text></View>)}
        {data.experience.length > 0 && (
          <View style={s.section}>
            <Text style={s.h}>Опыт</Text>
            {data.experience.map((e, i) => (
              <View key={i} style={s.exp} wrap={false}>
                <View style={s.expHead}>
                  <Text><Text style={{ fontWeight: "bold" }}>{e.role}</Text>{e.company ? ` — ${e.company}` : ""}</Text>
                  {!!e.period && <Text style={s.period}>{e.period}</Text>}
                </View>
                <Bullets items={e.bullets} color={accent} />
              </View>
            ))}
          </View>
        )}
        {data.skills.length > 0 && (<View style={s.section}><Text style={s.h}>Навыки</Text><Text>{data.skills.join(" · ")}</Text></View>)}
        {data.education.length > 0 && (
          <View style={s.section}><Text style={s.h}>Образование</Text>{data.education.map((e, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}><Text>{e.institution}{e.degree ? ` — ${e.degree}` : ""}</Text>{!!e.period && <Text style={s.period}>{e.period}</Text>}</View>
          ))}</View>
        )}
      </Page>
    </Document>
  );
}

/* ── Creative — solid accent sidebar ──────────────────────────── */
function Creative({ data, accent }: TplProps) {
  const s = StyleSheet.create({
    page: { fontFamily: "DejaVu", fontSize: 9.5, lineHeight: 1.45, color: "#1a1a1a", flexDirection: "row" },
    side: { width: "34%", backgroundColor: accent, padding: 22, color: "#fff" },
    main: { width: "66%", padding: 26 },
    name: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    title: { fontSize: 10, color: "#ffffffdd", marginTop: 3 },
    sideH: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: "#ffffffee", marginTop: 16, marginBottom: 5 },
    sideItem: { marginBottom: 4, color: "#fffffff2" },
    mainH: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: accent, marginBottom: 7 },
    section: { marginTop: 14 },
    exp: { marginBottom: 10 },
    period: { fontSize: 9, color: "#666" },
  });
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.side}>
          {!!data.fullName && <Text style={s.name}>{data.fullName}</Text>}
          {!!data.title && <Text style={s.title}>{data.title}</Text>}
          {data.contacts.length > 0 && (<><Text style={s.sideH}>Контакты</Text>{data.contacts.map((c, i) => <Text key={i} style={s.sideItem}>{c}</Text>)}</>)}
          {data.skills.length > 0 && (<><Text style={s.sideH}>Навыки</Text>{data.skills.map((c, i) => <Text key={i} style={s.sideItem}>{c}</Text>)}</>)}
          {data.education.length > 0 && (<><Text style={s.sideH}>Образование</Text>{data.education.map((e, i) => (
            <View key={i} style={s.sideItem}><Text>{e.institution}</Text>{!!e.degree && <Text>{e.degree}</Text>}{!!e.period && <Text>{e.period}</Text>}</View>
          ))}</>)}
        </View>
        <View style={s.main}>
          {!!data.summary && (<View><Text style={s.mainH}>Summary</Text><Text>{data.summary}</Text></View>)}
          {data.experience.length > 0 && (
            <View style={s.section}>
              <Text style={s.mainH}>Опыт работы</Text>
              {data.experience.map((e, i) => (
                <View key={i} style={s.exp} wrap={false}>
                  <Text><Text style={{ fontWeight: "bold" }}>{e.role}</Text>{e.company ? ` — ${e.company}` : ""}</Text>
                  {!!e.period && <Text style={s.period}>{e.period}</Text>}
                  <Bullets items={e.bullets} color={accent} />
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export function ResumeDocument({
  data,
  design,
}: {
  data: ResumeData;
  design: Design;
}) {
  const accent = design.accent;
  switch (design.template) {
    case "sidebar":
      return <Sidebar data={data} accent={accent} />;
    case "modern":
      return <Modern data={data} accent={accent} />;
    case "compact":
      return <Compact data={data} accent={accent} />;
    case "creative":
      return <Creative data={data} accent={accent} />;
    default:
      return <Classic data={data} accent={accent} />;
  }
}
