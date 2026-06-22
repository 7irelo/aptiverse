// Sample SBA tasks extracted from the DBE FET SBA Exemplar Booklets
// for each subject. These are the actual exemplar tasks the booklets
// provide for teachers to use as models. Most subjects cover the
// "Term 1 subject-specific task" slot (Investigation / Project /
// Practical / Research / Performance / PAT phase) and sometimes a
// representative test.
//
// Source: the FET SBA Exemplar Booklet PDF for each subject. Per-task
// content (questions, memoranda, marking tools) lives in the PDFs;
// this file just indexes what exists so the UI can show "your subject
// has an exemplar Investigation worth 50 marks; here's the topic" and
// link to the source.
//
// Not the same as PROGRAMMES in ./sbaProgrammes.ts: that file is the
// policy-level structure of how many tasks per year and which terms.
// This file is the BANK of concrete exemplar tasks that fill the
// subject-specific slots.

import type { SbaTaskType, Grade } from "./sbaProgrammes";

export type SbaExemplar = {
  subjectId: string;
  grade: Grade;
  /** "A", "B", "C" as labelled in the booklet, or undefined for the
   *  single unlettered task in some sections. */
  letter?: string;
  type: SbaTaskType;
  /** Exact task title as the booklet states it. */
  title: string;
  /** Topic / content area covered. */
  topic?: string;
  /** Total marks as the booklet specifies. */
  marks?: number;
  /** Time allocation in minutes where stated. */
  timeMinutes?: number;
  /** Free-form notes (e.g. "submission counts 5 marks", "memorandum
   *  provided"). */
  notes?: string[];
};

export const EXEMPLARS: SbaExemplar[] = [
  // ═══════════════════════════════════════════════════════════════════
  // MATHEMATICS
  // Source: FET MST Mathematics Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════

  // Grade 10
  {
    subjectId: "math",
    grade: 10,
    letter: "A",
    type: "investigation",
    title: "Investigating Parabolas",
    topic: "Functions and graphs",
    marks: 35,
    timeMinutes: 50,
    notes: ["Investigates translations of y = x² and related transformations.", "Memorandum provided."],
  },
  {
    subjectId: "math",
    grade: 10,
    letter: "B",
    type: "investigation",
    title: "An investigation into the relation between the diagonals of a parallelogram",
    topic: "Euclidean geometry",
    marks: 45,
    notes: ["Uses ruler-and-compass measurement of diagonal sections.", "Includes conjecture-writing and tabulated measurements."],
  },
  {
    subjectId: "math",
    grade: 10,
    letter: "C",
    type: "investigation",
    title: "The influence of the value of a on the graphs of the different functions",
    topic: "Functions and graphs",
    marks: 45,
    notes: ["Covers y = ax, y = ax², y = a/x, sine and cosine.", "Requires plotting and tabulation per function family."],
  },
  {
    subjectId: "math",
    grade: 10,
    type: "project",
    title: "Daily temperature data: Johannesburg vs Cape Town",
    topic: "Data handling (statistics)",
    marks: 50,
    notes: [
      "Project completed at home; data collected from newspapers, TV, or radio.",
      "Covers mean, median, mode, range, five-number summary, box-and-whisker plots.",
      "5 marks for on-time submission.",
    ],
  },

  // Grade 11
  {
    subjectId: "math",
    grade: 11,
    letter: "A",
    type: "investigation",
    title: "Practical Investigation: Ratios",
    topic: "Algebra and number (golden ratio, paper sizes)",
    marks: 50,
    notes: [
      "Includes A-series paper size investigation (A0 → A7).",
      "Derives the 1 : √2 ratio and connects to the golden ratio (1 : 1.618...).",
    ],
  },
  {
    subjectId: "math",
    grade: 11,
    letter: "B",
    type: "investigation",
    title: "Mathematics Investigation on Euclidean Geometry",
    topic: "Euclidean geometry (circles)",
    marks: 50,
    notes: [
      "Topic: relationship between the angle at the circumference and the angle at the centre of a circle.",
      "Includes a marking tool / rubric and a due-date slot.",
    ],
  },

  // Grade 12
  {
    subjectId: "math",
    grade: 12,
    letter: "A",
    type: "investigation",
    title: "Investigation: Number Patterns",
    topic: "Sequences and series",
    marks: 100,
    notes: [
      "Investigates the relationship between the common difference d and the Difference D between (the product of first and third terms) and (the square of the middle term) of three consecutive numbers of a linear sequence.",
      "Multi-step structure with conjecture-write-prove cycle.",
    ],
  },
  {
    subjectId: "math",
    grade: 12,
    letter: "B",
    type: "investigation",
    title: "Investigation: Compound Angle Identity",
    topic: "Trigonometry (compound angles)",
    marks: 50,
    notes: [
      "Derives and tests compound-angle identities.",
      "Step-by-step structured proof.",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MATHEMATICAL LITERACY
  // Source: FET MST Mathematical Literacy Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════

  // Grade 10
  { subjectId: "math_lit", grade: 10, type: "assignment", title: "Assignment 1: Finance — simple interest and bank charges", topic: "Finance (loans, banking fees)", notes: ["Tito loan scenario at 12% simple interest, FNB deposit-fee tariffs."] },
  { subjectId: "math_lit", grade: 10, type: "assignment", title: "Assignment 2: Electricity tariffs", topic: "Finance (utility costs)", notes: ["Msukaligwa / Eskom tariff design — residential supply tiers."] },
  { subjectId: "math_lit", grade: 10, type: "assignment", title: "Assignment 3: Household budget — the Marufane family", topic: "Finance (budgeting)", marks: 25, notes: ["Categorise household expenses from salary slips, receipts and statements; build a fixed-vs-variable budget."] },
  { subjectId: "math_lit", grade: 10, type: "investigation", title: "Investigation 1: Child grant budget", topic: "Finance (social grants)", notes: ["SASSA child support grant for unemployed Madelei (16) with a 3-month-old baby."] },
  { subjectId: "math_lit", grade: 10, type: "investigation", title: "Investigation 2: Cell-phone contract", topic: "Finance (contracts, rates)", notes: ["Nokia Asha 210 24-month contract — subscription, bundles, per-minute rate."] },
  { subjectId: "math_lit", grade: 10, type: "investigation", title: "Investigation 3: Floor plan of your house", topic: "Measurement (plans, scale, tiling)", notes: ["Measure walls and rooms; draw an A4-scaled plan; design a tile layout with 2 cm joints."] },

  // Grade 11
  { subjectId: "math_lit", grade: 11, type: "assignment", title: "Assignment 1: Wages and overtime", topic: "Finance (income, time)", marks: 50, notes: ["Neat Upholstery factory: 45-hour week, weekday overtime at 1.5×, Saturday at 2×."] },
  { subjectId: "math_lit", grade: 11, type: "assignment", title: "Assignment 2: Bathroom renovation — tiles and paint", topic: "Measurement (area, quantities)", marks: 55, notes: ["School bathroom renovation; cost tiles (10% breakage allowance) and paint (6 m² per litre) from supplier quotes."] },
  { subjectId: "math_lit", grade: 11, type: "assignment", title: "Assignment 3: Maps and scale — national parks", topic: "Maps, plans and other representations", marks: 50, notes: ["Plan trips between South African national parks; grid references, compass direction, scale-based distance and speed."] },
  { subjectId: "math_lit", grade: 11, type: "investigation", title: "Investigation 1: Vetkoek fundraising for matric farewell", topic: "Finance (cost, profit, scaling)", marks: 55, notes: ["Scale a curry-mince vetkoek recipe and ingredient costs to feed 100 learners and 5 educators with partners; target R60 000."] },
  { subjectId: "math_lit", grade: 11, type: "investigation", title: "Investigation 2: Car rental — Cape Town airport", topic: "Finance (rates, formulas)", marks: 50, notes: ["Compare two rental companies' rates for George's three-site Cape Town visits from the airport."] },
  { subjectId: "math_lit", grade: 11, type: "investigation", title: "Investigation 3: Why are squash balls packaged in rectangular boxes?", topic: "Measurement (volume, surface, packaging)", marks: 65, notes: ["Compare rectangular vs cylindrical packaging of 3 squash balls; uses scissors, glue, A4 cardboard."] },

  // Grade 12
  { subjectId: "math_lit", grade: 12, type: "assignment", title: "Assignment 1: BMI and health status", topic: "Data handling (formulas, categories)", notes: ["Use the BMI-for-age percentile chart to classify family members in the Pitsi 'healthy lifestyle' cruise scenario."] },
  { subjectId: "math_lit", grade: 12, type: "assignment", title: "Assignment 2: Bus timetables and inter-city distances", topic: "Data handling (tables, measures of central tendency)", marks: 60, notes: ["Pretoria–Durban bus timetable; mean, median and range of distances from Durban to other South African towns."] },
  { subjectId: "math_lit", grade: 12, type: "assignment", title: "Assignment 3: Vehicle depreciation and investment growth", topic: "Finance (compound vs simple interest, depreciation)", marks: 70, notes: ["Mr Smith's R120 000 car at 8% p.a. depreciation alongside two R55 000 investments at Bank A (10,5% compound) and Bank B (12% simple)."] },
  { subjectId: "math_lit", grade: 12, type: "investigation", title: "Investigation 1: Photocopier purchase options", topic: "Finance (lease vs purchase, formulas)", marks: 50, notes: ["School ABC SGB asks the Grade 12 class to compare several supplier offers for a new photocopier."] },
  { subjectId: "math_lit", grade: 12, type: "investigation", title: "Investigation 2: Paving blocks for a garden", topic: "Measurement (area, perimeter, costing)", marks: 50, notes: ["Cost two sizes of square paving block (with 30%-of-width grass joints) for a garden; pick the cheaper option."] },
  { subjectId: "math_lit", grade: 12, type: "investigation", title: "Investigation 3: Car rental — three companies", topic: "Finance (rates, formulas)", marks: 50, notes: ["Advise George across three Cape Town car-hire companies (Eezy Bucs, S'bu, Joe Radio Taxi) using kilometre-based formulas."] },

  // ═══════════════════════════════════════════════════════════════════
  // PHYSICAL SCIENCES (Chemistry — Paper 2)
  // Source: FET MST Physical Sciences Chemistry Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "physci", grade: 10, type: "practical", title: "Heating and cooling curve of water", topic: "Matter and materials (phase changes)", marks: 40, notes: ["Formal experiment using ice, Bunsen burner, beaker, thermometer; records temperature against time for both heating and cooling phases."] },
  { subjectId: "physci", grade: 10, type: "practical", title: "Water purification", topic: "Matter and materials (separation methods)", notes: ["Investigates removal of impurities using filtration, distillation and related techniques."] },
  { subjectId: "physci", grade: 11, type: "practical", title: "The effects of intermolecular forces", topic: "Matter and materials (intermolecular forces)", notes: ["Compares evaporation and surface tension across substances of different polarity / molecular size."] },
  { subjectId: "physci", grade: 11, type: "practical", title: "Verification of Boyle's Law", topic: "Matter and materials (ideal gases)", notes: ["Pressure–volume measurements up to 300 kPa; tabulate, compute reciprocals and P·V products, then plot the relationship."] },
  { subjectId: "physci", grade: 12, type: "practical", title: "Acid–base titration", topic: "Chemical change (stoichiometry)", notes: ["Standardise sodium hydroxide against oxalic-acid dihydrate; prepare a 250 ml standard solution, then titrate 25 cm³ aliquots."] },
  { subjectId: "physci", grade: 12, type: "practical", title: "Esters", topic: "Organic chemistry (esterification)", notes: ["Synthesis and identification of an ester from an alcohol and carboxylic acid."] },

  // ═══════════════════════════════════════════════════════════════════
  // PHYSICAL SCIENCES (Physics — Paper 1)
  // Source: FET MST Physical Sciences Physics Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "physci", grade: 10, type: "practical", title: "Equivalent resistance in a series-parallel network", topic: "Electricity and magnetism (resistance, circuits)", marks: 50, notes: ["Build three progressively complex circuits, measure voltage and current across resistors, and derive equivalent resistance."] },
  { subjectId: "physci", grade: 11, type: "practical", title: "Newton's Second Law — Option 1", topic: "Mechanics (force, mass, acceleration)", notes: ["Worksheet experiment relating applied force to acceleration for a constant mass."] },
  { subjectId: "physci", grade: 11, type: "practical", title: "Newton's Second Law — Option 2", topic: "Mechanics (force, mass, acceleration)", notes: ["Alternative apparatus for verifying F = ma; same skills, different setup."] },
  { subjectId: "physci", grade: 11, type: "project", title: "Exemplar Grade 11 Project", topic: "Open Physics investigation (CAPS Project requirement)", notes: ["Booklet supplies a worked exemplar with guidelines for developing a project and a suggested marking guideline."] },
  { subjectId: "physci", grade: 12, type: "practical", title: "Conservation of linear momentum", topic: "Mechanics (momentum)", notes: ["Two-trolley collision experiment recorded in Term 1, marks count for Term 2 SBA."] },
  { subjectId: "physci", grade: 12, type: "practical", title: "Internal resistance of a battery", topic: "Electricity and magnetism (emf, internal resistance)", notes: ["Plot terminal-voltage vs current for a real cell; extract emf and internal resistance from the graph."] },

  // ═══════════════════════════════════════════════════════════════════
  // LIFE SCIENCES
  // Source: FET MST Life Sciences Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "lifesci", grade: 10, type: "practical", title: "Grade 10 Practical Task (Adapted from WC)", topic: "Life at molecular, cellular and tissue level (plant cell)", marks: 30, timeMinutes: 40, notes: ["Micrograph analysis: identify structures that prove the specimen is a plant cell."] },
  { subjectId: "lifesci", grade: 10, type: "assignment", title: "Grade 10 Assignment — water absorption and transpiration", topic: "Life processes in plants and animals (transpiration)", marks: 50, notes: ["Interpret tabulated absorption-vs-transpiration data; analyse a day–night transpiration graph and stomatal behaviour."] },
  { subjectId: "lifesci", grade: 10, type: "test", title: "Grade 10 Test", topic: "Life at molecular, cellular and tissue level + Cardiac cycle", marks: 50, timeMinutes: 50, notes: ["Three-section test culminating in a written explanation of the cardiac cycle and its regulation."] },
  { subjectId: "lifesci", grade: 10, type: "project", title: "Grade 10 Project — Environmental Studies (Biomes)", topic: "Environmental studies (biomes, ecosystems)", marks: 50, notes: ["Two-task project: background research on the learner's biome, plus fieldwork on human impact on the local ecosystem."] },
  { subjectId: "lifesci", grade: 10, type: "practical", title: "Grade 10 Practical Examination", topic: "Skills across grade 10 content", notes: ["End-of-year practical examination integrating planning, equipment handling, data collection and analysis."] },
  { subjectId: "lifesci", grade: 11, type: "practical", title: "Grade 11 Practical Task", topic: "Life processes / diversity (Grade 11 CAPS)", notes: ["Booklet-supplied practical with marking guideline."] },
  { subjectId: "lifesci", grade: 11, type: "assignment", title: "Grade 11 Assignment", topic: "Grade 11 CAPS content", notes: ["Structured written task; marking guideline supplied in the booklet."] },
  { subjectId: "lifesci", grade: 11, type: "test", title: "Grade 11 Test", topic: "Grade 11 CAPS content", notes: ["Controlled test with marking guideline."] },
  { subjectId: "lifesci", grade: 11, type: "project", title: "Grade 11 Project — Human Ecology / Human Impact", topic: "Human impact on the environment", marks: 60, notes: ["Research project with memorandum on human ecology / human impact on biodiversity."] },
  { subjectId: "lifesci", grade: 11, type: "practical", title: "Grade 11 Practical Examination", topic: "Skills across grade 11 content", notes: ["End-of-year practical examination."] },

  // ═══════════════════════════════════════════════════════════════════
  // AGRICULTURAL SCIENCES
  // Source: FET MST Agricultural Sciences Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "agrsci", grade: 10, type: "assignment", title: "Term 1 Assignment — agro-ecology and weather phenomena", topic: "Agro-ecology / climate", marks: 20, notes: ["Drought-driven scenario (2015/16 SA drought, La Niña forecasts); connects rainfall, biomes and land use."] },
  { subjectId: "agrsci", grade: 10, type: "practical", title: "Term 2 Practical Investigation / Assignment", topic: "Soil science / plant production", marks: 20, notes: ["Hands-on investigation with data collection and write-up."] },
  { subjectId: "agrsci", grade: 11, type: "practical", title: "Term 1 Practical Investigation", topic: "Plant and animal studies (Grade 11)", marks: 20, notes: ["Booklet-supplied practical with marking guideline."] },
  { subjectId: "agrsci", grade: 11, type: "research", title: "Term 2 Research Project — Plant Nutrition / Nitrogen Fertilisers", topic: "Plant nutrition", marks: 20, notes: ["Research-and-display project with a teacher marking guideline."] },
  { subjectId: "agrsci", grade: 12, type: "practical", title: "Grade 12 Practical Investigation 1", topic: "Plant / animal studies", marks: 20, notes: ["First of two practical investigations required at Grade 12."] },
  { subjectId: "agrsci", grade: 12, type: "practical", title: "Grade 12 Practical Investigation 2", topic: "Plant / animal studies", marks: 20, notes: ["Second of two required practical investigations."] },

  // ═══════════════════════════════════════════════════════════════════
  // GEOGRAPHY
  // Source: FET Geography Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════

  // Grade 10 — Data handling (4 exemplars)
  { subjectId: "geo", grade: 10, type: "test", title: "Data handling: The Atmosphere — structure", topic: "The Atmosphere", marks: 75, timeMinutes: 60, notes: ["Interpret a graph of the structure of the atmosphere; multiple-choice + short-answer."] },
  { subjectId: "geo", grade: 10, type: "test", title: "Data handling: The Atmosphere — composition", topic: "The Atmosphere", marks: 75, timeMinutes: 60, notes: ["Variant data-handling on atmospheric layers and temperature inversion."] },
  { subjectId: "geo", grade: 10, type: "test", title: "Data handling: The Atmosphere — Earth's energy balance", topic: "The Atmosphere", marks: 75, timeMinutes: 60, notes: ["Six structured questions across a single-paper data-handling set."] },
  { subjectId: "geo", grade: 10, type: "test", title: "Data handling: Climate of Bloemfontein", topic: "Climate (temperature, rainfall)", marks: 70, notes: ["Bar graph of annual rainfall + interpretation of temperature/rainfall table."] },

  // Grade 10 — Research / Essay (5 exemplars)
  { subjectId: "geo", grade: 10, type: "essay", title: "Geographical essay: earthquakes / volcanoes", topic: "Geomorphology (earthquakes, volcanoes)", marks: 100, notes: ["Two-to-three-page A4 essay with intro / body / conclusion; marks for language and structure."] },
  { subjectId: "geo", grade: 10, type: "research", title: "Research project: environmental issue in my community", topic: "Environmental geography", marks: 100, notes: ["Choose between global warming and local pollution; min. 4 pages plus interviews."] },
  { subjectId: "geo", grade: 10, type: "essay", title: "Essay: earthquakes and insurance — Orkney 2014", topic: "Geomorphology (earthquakes)", marks: 100, notes: ["Background article on insurer responses to the 2014 Orkney earthquake; structured essay."] },
  { subjectId: "geo", grade: 10, type: "essay", title: "Geographical essay (Exemplar 4)", topic: "Geomorphology", marks: 75 },
  { subjectId: "geo", grade: 10, type: "research", title: "Research project (Exemplar 5)", topic: "Geomorphology / environment", marks: 50 },

  // Grade 11 — Data handling (4 exemplars)
  { subjectId: "geo", grade: 11, type: "test", title: "Data handling: global air circulation and pressure belts", topic: "The atmosphere (climate and weather)", marks: 75, timeMinutes: 60 },
  { subjectId: "geo", grade: 11, type: "test", title: "Data handling: oceans in climate control + synoptic weather maps", topic: "Climate and weather", marks: 75, timeMinutes: 60 },
  { subjectId: "geo", grade: 11, type: "test", title: "Data handling: Earth's energy balance", topic: "The Atmosphere (energy budget)", marks: 75, timeMinutes: 60 },
  { subjectId: "geo", grade: 11, type: "test", title: "Data handling: Sun angles and energy", topic: "The Atmosphere (insolation)", marks: 75, timeMinutes: 60 },

  // Grade 11 — Research task (2 exemplars)
  { subjectId: "geo", grade: 11, type: "research", title: "Research project: non-conventional energy resources", topic: "Resources and sustainability (energy)", marks: 50, notes: ["Solar vs wind in South Africa; 5 typed pages or 7 written, 6 sources (max 4 internet)."] },
  { subjectId: "geo", grade: 11, type: "research", title: "Research project: impact of development on local environments (EIA / SIA)", topic: "Development geography", marks: 50, notes: ["Investigate 5–10 years of economic development within a 5 km radius of the learner's area."] },

  // ═══════════════════════════════════════════════════════════════════
  // HISTORY
  // Source: FET History Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════

  // Grade 10 — Source-based tasks
  { subjectId: "hist", grade: 10, type: "case_study", title: "Source-based: impact of the 1913 Natives Land Act on black South Africans", topic: "South African history (segregation and dispossession)", notes: ["Sources A–D including Sol Plaatjie's writing; questions on tenants, evictions, dispossession."] },
  { subjectId: "hist", grade: 10, type: "case_study", title: "Source-based: slavery as practised by the Portuguese", topic: "World history (transatlantic slave trade)" },
  { subjectId: "hist", grade: 10, type: "case_study", title: "Source-based: the Mfecane as a period of great change", topic: "Southern African history (Mfecane / Difaqane)" },
  { subjectId: "hist", grade: 10, type: "case_study", title: "Source-based: conditions in France that made revolution possible by 1789", topic: "World history (French Revolution)" },

  // Grade 11 — Source-based tasks
  { subjectId: "hist", grade: 11, type: "case_study", title: "Grade 11 Source-based Exemplar 1", topic: "Grade 11 content (responses to industrialisation / colonialism)" },
  { subjectId: "hist", grade: 11, type: "case_study", title: "Source-based: to what extent was the New Deal successful in restoring the USA?", topic: "20th-century world history (Great Depression, New Deal)" },
  { subjectId: "hist", grade: 11, type: "case_study", title: "Grade 11 Source-based Exemplar 3", topic: "Grade 11 CAPS content" },
  { subjectId: "hist", grade: 11, type: "case_study", title: "Source-based: how Africans and Afrikaners expressed their nationalism", topic: "South African history (rival nationalisms)" },

  // Grade 11 — Research assignments
  { subjectId: "hist", grade: 11, type: "research", title: "Research assignment: Apartheid policy and its effects on ordinary South Africans", topic: "South African history (Apartheid)", marks: 50, notes: ["Choose ONE of three sub-topics (laws + impact, anti-pass campaign / Sharpeville, Soweto / Bantu Education)."] },
  { subjectId: "hist", grade: 11, type: "research", title: "Research assignment: did the New Deal strengthen or weaken USA capitalism?", topic: "20th-century world history", marks: 50, notes: ["Essay format with cover, intro, body, conclusion, bibliography; no pictures/cartoons."] },
  { subjectId: "hist", grade: 11, type: "research", title: "Research assignment: Nazi policy and the genocide of Jews in the 1930s–40s", topic: "World history (Holocaust)", marks: 50, notes: ["Critically analyse a historiographical claim about Nazi policy."] },
  { subjectId: "hist", grade: 11, type: "research", title: "Research assignment: Suez Crisis and the Six-Day War", topic: "World history (Middle East, decolonisation)", marks: 50, notes: ["Bilingual (Afrikaans + English) brief; min. 8 written pages, structured submission stages."] },

  // ═══════════════════════════════════════════════════════════════════
  // RELIGION STUDIES
  // Source: FET Religion Studies Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "religion", grade: 10, type: "case_study", title: "Grade 10 Source-based task: Variety of Religions", topic: "Variety of Religions (interaction of religions)", marks: 100, notes: ["Sub-topics: tolerance, respect, dialogue, conflict, fundamentalism, pluralism, propaganda, indoctrination, syncretism."] },
  { subjectId: "religion", grade: 10, type: "project", title: "Grade 10 Project: Common features of religion", topic: "Common features of religion", marks: 100, notes: ["Aspects of understanding religion + basic facts about religions; learner-side self-discovery."] },
  { subjectId: "religion", grade: 11, type: "case_study", title: "Grade 11 Source-based task: Theories about Religion", topic: "Theories of religion + morality and ethics", marks: 100, notes: ["Concept of theory in a religious context; understanding myth."] },
  { subjectId: "religion", grade: 11, type: "project", title: "Grade 11 Project: Religion and the state", topic: "Topical issues in society", marks: 100, notes: ["Theocratic state, secularism and cooperation, critical analysis of state-religion relationships."] },
  { subjectId: "religion", grade: 12, type: "project", title: "Grade 12 Project: How can religion help address Xenophobia?", topic: "Topical issues in society — Xenophobia", marks: 100, notes: ["Strategy-development project: identify problem, draw on religious sources, outline practical solution steps."] },

  // ═══════════════════════════════════════════════════════════════════
  // ACCOUNTING
  // Source: FET Accounting Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "acc", grade: 10, type: "presentation", title: "Research and presentation: an informal business and its bookkeeping", topic: "Informal vs formal business; bookkeeping basics", notes: ["Individual work; choose between oral and written presentation. Phase 1 interview + questionnaire, Phase 2 draft, Phase 3 final hand-in."] },
  { subjectId: "acc", grade: 10, type: "project", title: "Grade 10 Project", topic: "Accounting concepts / financial documents (CAPS Grade 10)", notes: ["Booklet supplies a project exemplar with marking rubric."] },
  { subjectId: "acc", grade: 10, type: "case_study", title: "Grade 10 Case Study — Income Statement analysis", topic: "Financial reporting (income statement)", notes: ["Includes a two-year comparative income statement with profitability ratios."] },
  { subjectId: "acc", grade: 11, type: "report", title: "Grade 11 Written Report: Fixed Assets and disposal", topic: "Fixed assets (register, acquisition, disposal, internal controls)", marks: 50, timeMinutes: 60, notes: ["Rubric covers definition, asset register, acquisition decision, internal control measures."] },
  { subjectId: "acc", grade: 11, type: "project", title: "Grade 11 Project", topic: "Accounting concepts / financial reporting (CAPS Grade 11)", notes: ["Booklet supplies a project exemplar."] },
  { subjectId: "acc", grade: 11, type: "presentation", title: "Grade 11 Presentation", topic: "Accounting concepts (CAPS Grade 11)" },
  { subjectId: "acc", grade: 12, type: "report", title: "Grade 12 Written Report", topic: "Companies / financial reporting (CAPS Grade 12)" },
  { subjectId: "acc", grade: 12, type: "project", title: "Grade 12 Project", topic: "Companies / financial reporting (CAPS Grade 12)" },
  { subjectId: "acc", grade: 12, type: "case_study", title: "Grade 12 Case Study", topic: "Companies / financial reporting (CAPS Grade 12)" },

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS STUDIES
  // Source: FET Business Studies Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "bus", grade: 10, type: "assignment", title: "Term 1 Task 01 Assignment: Business Environments and Operations", topic: "Business Environments and Operations", marks: 50, notes: ["Anne Wall Cosmetics scenario covering vision, mission, business sectors, organogram, Consumer Protection Act."] },
  { subjectId: "bus", grade: 10, type: "presentation", title: "Term 2 Task 02 Presentation: Business Roles", topic: "Business Roles", marks: 50 },
  { subjectId: "bus", grade: 10, type: "project", title: "Term 3 Task 03 Project: Business Ventures", topic: "Business Ventures", marks: 50, notes: ["Includes a business-plan rubric."] },
  { subjectId: "bus", grade: 11, type: "assignment", title: "Term 1 Task 01 Assignment: Business Environments", topic: "Business Environments", marks: 50, notes: ["Includes 'The Best Bank' Traveller Exchange travel-card scenario."] },
  { subjectId: "bus", grade: 11, type: "presentation", title: "Term 2 Task 02 Presentation: Change, Stress and Crisis Management", topic: "Business Roles (change management)", marks: 50, notes: ["Identify a business undergoing change and present findings; rubric covers written + oral parts."] },
  { subjectId: "bus", grade: 11, type: "project", title: "Term 3 Task 03 Project: The Marketing Function", topic: "Business Operations (marketing)", marks: 50 },
  { subjectId: "bus", grade: 12, type: "assignment", title: "Term 1 Task 01 Assignment: Business Environments", topic: "Business Environments", marks: 50 },
  { subjectId: "bus", grade: 12, type: "presentation", title: "Term 2 Task 02 Presentation: Corporate Social Responsibility and Investment", topic: "Business Roles (CSR / CSI)", marks: 50, notes: ["Apply CSR/CSI concepts to collected media resources."] },
  { subjectId: "bus", grade: 12, type: "project", title: "Term 3 Task 03 Project: Business Ventures", topic: "Business Ventures", marks: 50 },

  // ═══════════════════════════════════════════════════════════════════
  // ECONOMICS
  // Source: FET Economics Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "eco", grade: 10, type: "assignment", title: "Term 1 Assignment: Basic Concepts and the Basic Economic Problem", topic: "Basic Concepts; Basic Economic Problem (scarcity, choice, opportunity cost)" },
  { subjectId: "eco", grade: 10, type: "case_study", title: "Case Study: South African economic growth and development — historical view", topic: "Macroeconomics — economic growth and development", marks: 50, notes: ["Currency history scenario; structured questions across previous SA currencies."] },
  { subjectId: "eco", grade: 10, type: "project", title: "Project: Dynamics of Perfect Markets", topic: "Microeconomics — market structures", notes: ["Project rubric covers structure, content and presentation criteria."] },
  { subjectId: "eco", grade: 11, type: "assignment", title: "Grade 11 Term 1 Assignment", topic: "Macroeconomics (Grade 11 CAPS)", marks: 50 },
  { subjectId: "eco", grade: 11, type: "case_study", title: "Case Study: Economic Pursuits — growth, development and poverty", topic: "Macroeconomics — economic pursuits", notes: ["Includes a second case study on productive resources."] },
  { subjectId: "eco", grade: 11, type: "project", title: "Project: Costs and Revenue (Dynamics of)", topic: "Microeconomics — costs and revenue" },
  { subjectId: "eco", grade: 12, type: "assignment", title: "Term 1 Assignment: Circular flow, Business cycles, Economic growth and development", topic: "Macroeconomics — circular flow and growth", notes: ["Requires a copy of the SARB Quarterly Bulletin."] },
  { subjectId: "eco", grade: 12, type: "case_study", title: "Case Study: Indicators", topic: "Macroeconomics — indicators (GDP, unemployment, inflation)" },
  { subjectId: "eco", grade: 12, type: "project", title: "Project: Market Failures — Cost-Benefit Analysis (New Rest scenario)", topic: "Microeconomics — market failures", notes: ["Compare a school project vs a clinic project for the New Rest community using social costs / benefits and the CBR."] },

  // ═══════════════════════════════════════════════════════════════════
  // ENGLISH HOME LANGUAGE
  // Source: FET English HL Grades 10-12.pdf
  // CAPS programme: Task 1 (Oral: Listening), 2 (Essay), 3 (Transactional),
  // 4 (Language test), 5 (Prepared Reading), 6 (Prepared Speech),
  // 7 (Unprepared Speech), plus mid-year/trial exams.
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "eng_hl", grade: 10, type: "oral", title: "Task 1: Oral — Listening Comprehension ('Bolt totally envisages Wayde's world')", topic: "Listening for comprehension", marks: 15, notes: ["~218-word adapted Sport24 article on Wayde van Niekerk; passage read twice, then questions."] },
  { subjectId: "eng_hl", grade: 10, type: "essay", title: "Task 2: Writing — Essay (narrative / descriptive / argumentative)", topic: "Essay writing (300–350 words)" },
  { subjectId: "eng_hl", grade: 10, type: "report", title: "Task 3: Writing — Longer transactional text", topic: "Transactional writing (letters, CV, report, etc.; 180–200 words)" },
  { subjectId: "eng_hl", grade: 11, type: "test", title: "Task 4: Test — Language in Context", topic: "Comprehension (15), Summary (10), Language structures (10)" },
  { subjectId: "eng_hl", grade: 11, type: "oral", title: "Task 5: Oral — Prepared Reading", topic: "Reading aloud (3–4 minutes prepared)" },
  { subjectId: "eng_hl", grade: 11, type: "essay", title: "Task 2: Writing — Reflective / discursive / argumentative essay", topic: "Essay writing (350–400 words)" },
  { subjectId: "eng_hl", grade: 12, type: "oral", title: "Task 6: Oral — Prepared Speech", topic: "Prepared speech (4–5 minutes)" },
  { subjectId: "eng_hl", grade: 12, type: "essay", title: "Task 2: Writing — Essay (Grade 12, 400+ words)", topic: "Essay writing" },
  { subjectId: "eng_hl", grade: 12, type: "oral", title: "Task 1: Oral — Listening Comprehension (Grade 12)", topic: "Listening for comprehension (≈400-word passage)" },

  // ═══════════════════════════════════════════════════════════════════
  // ENGLISH FIRST ADDITIONAL LANGUAGE
  // Source: FET English FAL Grades 10-12.pdf
  // CAPS programme: Tasks 1, 2, 3, 5, 6, 8 and 9 are booklet-exemplified.
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "eng_fal", grade: 10, type: "oral", title: "Task 1: Oral — Listening Comprehension", topic: "Listening for comprehension", marks: 10 },
  { subjectId: "eng_fal", grade: 10, type: "essay", title: "Task 2: Writing — Essay", topic: "Essay writing (200–250 words)", marks: 50 },
  { subjectId: "eng_fal", grade: 10, type: "report", title: "Task 3: Writing — Longer Transactional Text", topic: "Transactional writing (120–150 words)" },
  { subjectId: "eng_fal", grade: 11, type: "oral", title: "Task 5: Oral — Prepared Reading Aloud", topic: "Reading aloud", marks: 20 },
  { subjectId: "eng_fal", grade: 11, type: "oral", title: "Task 6: Oral — Prepared Speech", topic: "Prepared speech", marks: 20 },
  { subjectId: "eng_fal", grade: 11, type: "essay", title: "Task 2: Writing — Essay (Grade 11)", topic: "Essay writing", marks: 50 },
  { subjectId: "eng_fal", grade: 12, type: "oral", title: "Task 8: Oral — Prepared Speech (Grade 12)", topic: "Prepared speech", marks: 20 },
  { subjectId: "eng_fal", grade: 12, type: "report", title: "Task 9: Writing — Shorter Transactional Text", topic: "Shorter transactional writing (80–100 words)" },
  { subjectId: "eng_fal", grade: 12, type: "report", title: "Task 3: Writing — Longer Transactional Text (Grade 12)", topic: "Transactional writing (180–200 words)" },

  // ═══════════════════════════════════════════════════════════════════
  // AFRIKAANS HUISTAAL (Home Language)
  // Source: FET Afrikaans HL Graad 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "afr_hl", grade: 10, type: "oral", title: "Taak 1 — Voorbeeld 1: Luisterbegrip ('Chris Vorster verlaat 7de Laan')", topic: "Mondeling: luister en praat", marks: 15, notes: ["215-word artikel verwerk uit Huisgenoot (15 Januarie 2015) oor 7de Laan se Chris Vorster."] },
  { subjectId: "afr_hl", grade: 10, type: "essay", title: "Taak 2 — Skryf: Opstel", topic: "Opstelskryfwerk (Graad 10)" },
  { subjectId: "afr_hl", grade: 10, type: "report", title: "Taak 3 — Skryf: Langer transaksionele teks", topic: "Transaksionele skryfwerk" },
  { subjectId: "afr_hl", grade: 11, type: "oral", title: "Taak 5 — Voorbeeld 1: Luisterbegrip ('Roland Schoeman')", topic: "Mondeling: luister en praat", marks: 15, notes: ["306-woordartikel verwerk uit Sarie (Julie 2014) oor swemmer Roland Schoeman."] },
  { subjectId: "afr_hl", grade: 11, type: "oral", title: "Taak 6 — Mondeling: Voorbereide hardoplees", topic: "Voorbereide hardoplees" },
  { subjectId: "afr_hl", grade: 11, type: "essay", title: "Taak 2 — Skryf: Opstel (Graad 11)", topic: "Opstelskryfwerk (Graad 11)" },
  { subjectId: "afr_hl", grade: 12, type: "oral", title: "Taak 7 — Voorbeeld 1: Luisterbegrip ('Tuis — weer Lolla die rabbedoe')", topic: "Mondeling: luister en praat", marks: 15, notes: ["Artikel oor Rolene Strauss se terugkeer na Volksrust as Mej. Wêreld."] },
  { subjectId: "afr_hl", grade: 12, type: "oral", title: "Taak 8 — Mondeling: Voorbereide toespraak", topic: "Voorbereide toespraak" },
  { subjectId: "afr_hl", grade: 12, type: "essay", title: "Taak 9 — Skryf: Opstel (Graad 12)", topic: "Opstelskryfwerk (Graad 12)" },

  // ═══════════════════════════════════════════════════════════════════
  // AFRIKAANS EERSTE ADDISIONELE TAAL (FAL)
  // Source: FET AFRIKAANS FAL Graad 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "afr_fal", grade: 10, type: "oral", title: "Taak 1 — Voorbeeld 1: Luisterbegrip", topic: "Mondeling: luister en praat", marks: 15 },
  { subjectId: "afr_fal", grade: 10, type: "essay", title: "Taak 2 — Skryf: Opstel", topic: "Opstelskryfwerk" },
  { subjectId: "afr_fal", grade: 11, type: "oral", title: "Taak 5 — Mondeling: Voorbereide hardoplees", topic: "Voorbereide hardoplees" },
  { subjectId: "afr_fal", grade: 11, type: "report", title: "Taak 3 — Skryf: Langer transaksionele teks", topic: "Transaksionele skryfwerk" },
  { subjectId: "afr_fal", grade: 12, type: "oral", title: "Taak 8 — Mondeling: Voorbereide toespraak", topic: "Voorbereide toespraak" },
  { subjectId: "afr_fal", grade: 12, type: "essay", title: "Taak 2 — Skryf: Opstel (Graad 12)", topic: "Opstelskryfwerk (Graad 12)" },

  // ═══════════════════════════════════════════════════════════════════
  // AFRIKAANS TWEEDE ADDISIONELE TAAL (SAL)
  // Source: FET Afrikaans SAL Graad 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "afr_sal", grade: 10, type: "oral", title: "Taak 1 — Voorbeeld 1: Luisterbegrip", topic: "Mondeling: luister en praat" },
  { subjectId: "afr_sal", grade: 10, type: "oral", title: "Taak 5 — Mondeling: Voorbereide hardoplees", topic: "Voorbereide hardoplees" },
  { subjectId: "afr_sal", grade: 11, type: "oral", title: "Taak 5 — Mondeling: Voorbereide hardoplees (Graad 11)", topic: "Voorbereide hardoplees" },
  { subjectId: "afr_sal", grade: 11, type: "oral", title: "Taak 8 — Mondeling: Voorbereide toespraak", topic: "Voorbereide toespraak" },
  { subjectId: "afr_sal", grade: 12, type: "oral", title: "Taak 8 — Mondeling: Voorbereide toespraak (Graad 12)", topic: "Voorbereide toespraak" },
  { subjectId: "afr_sal", grade: 12, type: "essay", title: "Taak 2 — Skryf: Kort opstel", topic: "Opstelskryfwerk (kort, SAL)" },

  // ═══════════════════════════════════════════════════════════════════
  // isiZULU HL
  // Source: FET ISIZULU HL Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "zul_hl", grade: 10, type: "oral", title: "Ithaskhi yoku-1: Ukulalela ngokuqondisisa", topic: "Listening comprehension (Home Language)" },
  { subjectId: "zul_hl", grade: 10, type: "essay", title: "Ithaskhi yesi-2: Ukubhalwa kwendaba", topic: "Essay writing (isiZulu HL)" },
  { subjectId: "zul_hl", grade: 11, type: "report", title: "Ithaskhi yesi-3: Amathekisthi adlulisa imiyalezo", topic: "Transactional writing" },
  { subjectId: "zul_hl", grade: 11, type: "oral", title: "Ithaskhi yesi-6: Inkulumo elungiselelwe", topic: "Prepared speech" },
  { subjectId: "zul_hl", grade: 12, type: "essay", title: "Ithaskhi yesi-2: Ukubhalwa kwendaba (Ibanga le-12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "zul_hl", grade: 12, type: "oral", title: "Ithaskhi yesi-7: Inkulumo engalungiselelwe", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // isiXHOSA HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "xho_hl", grade: 10, type: "oral", title: "Umsebenzi 1: Ukuphulaphula nokuqonda", topic: "Listening comprehension (isiXhosa HL)" },
  { subjectId: "xho_hl", grade: 10, type: "essay", title: "Umsebenzi 2: Ukubhala isincoko", topic: "Essay writing" },
  { subjectId: "xho_hl", grade: 11, type: "report", title: "Umsebenzi 3: Imibhalo edlulisa imiyalezo", topic: "Transactional writing" },
  { subjectId: "xho_hl", grade: 11, type: "oral", title: "Umsebenzi 6: Intetho elungisiweyo", topic: "Prepared speech" },
  { subjectId: "xho_hl", grade: 12, type: "essay", title: "Umsebenzi 2: Ukubhala isincoko (Ibakala le-12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "xho_hl", grade: 12, type: "oral", title: "Umsebenzi 7: Intetho engalungiselelwanga", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // isiNDEBELE HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "nbl_hl", grade: 10, type: "oral", title: "Umsebenzi 1: Ukulalela nokuzwisisa", topic: "Listening comprehension (isiNdebele HL)" },
  { subjectId: "nbl_hl", grade: 10, type: "essay", title: "Umsebenzi 2: Ukutlola isihloko", topic: "Essay writing" },
  { subjectId: "nbl_hl", grade: 11, type: "report", title: "Umsebenzi 3: Imitlolo eqakathekileko", topic: "Transactional writing" },
  { subjectId: "nbl_hl", grade: 11, type: "oral", title: "Umsebenzi 6: Inkulumo elungiselelweko", topic: "Prepared speech" },
  { subjectId: "nbl_hl", grade: 12, type: "essay", title: "Umsebenzi 2: Ukutlola isihloko (Ibanga 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "nbl_hl", grade: 12, type: "oral", title: "Umsebenzi 7: Inkulumo engakalungiselelwa", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // SEPEDI HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "sep_hl", grade: 10, type: "oral", title: "Mošomo 1: Go theeletša ka kwešišo", topic: "Listening comprehension (Sepedi HL)" },
  { subjectId: "sep_hl", grade: 10, type: "essay", title: "Mošomo 2: Go ngwala taodišo", topic: "Essay writing" },
  { subjectId: "sep_hl", grade: 11, type: "report", title: "Mošomo 3: Mengwalo ya tirišano", topic: "Transactional writing" },
  { subjectId: "sep_hl", grade: 11, type: "oral", title: "Mošomo 6: Polelo e itokišeditšwego", topic: "Prepared speech" },
  { subjectId: "sep_hl", grade: 12, type: "essay", title: "Mošomo 2: Go ngwala taodišo (Mphato 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "sep_hl", grade: 12, type: "oral", title: "Mošomo 7: Polelo e sa itokišeletšwego", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // SESOTHO HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "sot_hl", grade: 10, type: "oral", title: "Mosebetsi 1: Ho mamela ka kutloisiso", topic: "Listening comprehension (Sesotho HL)" },
  { subjectId: "sot_hl", grade: 10, type: "essay", title: "Mosebetsi 2: Ho ngola moqoqo", topic: "Essay writing" },
  { subjectId: "sot_hl", grade: 11, type: "report", title: "Mosebetsi 3: Mengolo ya tšebelisano", topic: "Transactional writing" },
  { subjectId: "sot_hl", grade: 11, type: "oral", title: "Mosebetsi 6: Puo e lokisitsoeng", topic: "Prepared speech" },
  { subjectId: "sot_hl", grade: 12, type: "essay", title: "Mosebetsi 2: Ho ngola moqoqo (Sehlopha 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "sot_hl", grade: 12, type: "oral", title: "Mosebetsi 7: Puo e sa lokisetsoang", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // SETSWANA HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "tsn_hl", grade: 10, type: "oral", title: "Tirô 1: Go reetsa ka tlhaloganyo", topic: "Listening comprehension (Setswana HL)" },
  { subjectId: "tsn_hl", grade: 10, type: "essay", title: "Tirô 2: Go kwala tlhamo", topic: "Essay writing" },
  { subjectId: "tsn_hl", grade: 11, type: "report", title: "Tirô 3: Mekwalo ya tirisano", topic: "Transactional writing" },
  { subjectId: "tsn_hl", grade: 11, type: "oral", title: "Tirô 6: Puo e e baakantsweng", topic: "Prepared speech" },
  { subjectId: "tsn_hl", grade: 12, type: "essay", title: "Tirô 2: Go kwala tlhamo (Mophato 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "tsn_hl", grade: 12, type: "oral", title: "Tirô 7: Puo e e sa baakanngwang", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // siSWATI HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "ssw_hl", grade: 10, type: "oral", title: "Umsebenti 1: Kulalela ngekucondzisisa", topic: "Listening comprehension (siSwati HL)" },
  { subjectId: "ssw_hl", grade: 10, type: "essay", title: "Umsebenti 2: Kubhala umbhalo", topic: "Essay writing" },
  { subjectId: "ssw_hl", grade: 11, type: "report", title: "Umsebenti 3: Imibhalo yekusebentisana", topic: "Transactional writing" },
  { subjectId: "ssw_hl", grade: 11, type: "oral", title: "Umsebenti 6: Inkhulumo lelungiseliwe", topic: "Prepared speech" },
  { subjectId: "ssw_hl", grade: 12, type: "essay", title: "Umsebenti 2: Kubhala umbhalo (Libanga 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "ssw_hl", grade: 12, type: "oral", title: "Umsebenti 7: Inkhulumo lengakalungiselelwa", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // TSHIVENDA HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "ven_hl", grade: 10, type: "oral", title: "Mushumo 1: U thetshelesa nga vhupfiwa", topic: "Listening comprehension (Tshivenḓa HL)" },
  { subjectId: "ven_hl", grade: 10, type: "essay", title: "Mushumo 2: U ṅwala thoho", topic: "Essay writing" },
  { subjectId: "ven_hl", grade: 11, type: "report", title: "Mushumo 3: Maṅwalwa a vhushumisani", topic: "Transactional writing" },
  { subjectId: "ven_hl", grade: 11, type: "oral", title: "Mushumo 6: Luambo lwo lugiselwaho", topic: "Prepared speech" },
  { subjectId: "ven_hl", grade: 12, type: "essay", title: "Mushumo 2: U ṅwala thoho (Gireidi 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "ven_hl", grade: 12, type: "oral", title: "Mushumo 7: Luambo lu songo lugiselwaho", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // XITSONGA HL
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "tso_hl", grade: 10, type: "oral", title: "Ntirho 1: Ku yingisela hi ku twisisa", topic: "Listening comprehension (Xitsonga HL)" },
  { subjectId: "tso_hl", grade: 10, type: "essay", title: "Ntirho 2: Ku tsala xitsariwa", topic: "Essay writing" },
  { subjectId: "tso_hl", grade: 11, type: "report", title: "Ntirho 3: Matsalwa ya vutirhisani", topic: "Transactional writing" },
  { subjectId: "tso_hl", grade: 11, type: "oral", title: "Ntirho 6: Vulavulo lebyi lulamisiweke", topic: "Prepared speech" },
  { subjectId: "tso_hl", grade: 12, type: "essay", title: "Ntirho 2: Ku tsala xitsariwa (Gireyidi 12)", topic: "Essay writing (Grade 12)" },
  { subjectId: "tso_hl", grade: 12, type: "oral", title: "Ntirho 7: Vulavulo lebyi nga lulamisiwangiki", topic: "Unprepared speech" },

  // ═══════════════════════════════════════════════════════════════════
  // DANCE STUDIES
  // Source: FET Dance Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "dance", grade: 10, type: "research", title: "Research task — groups or individuals", topic: "Dance history / theory", notes: ["Open format: written, PowerPoint, short film or any other innovative presentation."] },
  { subjectId: "dance", grade: 10, type: "pat", title: "PAT 1", topic: "Performance Assessment Task (practical performance)" },
  { subjectId: "dance", grade: 10, type: "pat", title: "PAT 2", topic: "Performance Assessment Task (practical performance)" },
  { subjectId: "dance", grade: 11, type: "research", title: "Research task — groups or individuals", topic: "Dance history / theory" },
  { subjectId: "dance", grade: 11, type: "pat", title: "PAT 1", topic: "Performance Assessment Task (practical performance)" },
  { subjectId: "dance", grade: 12, type: "test", title: "Revision Task for Paper 1 — NSC Written Paper", topic: "Dance theory / history (written paper revision)" },

  // ═══════════════════════════════════════════════════════════════════
  // DRAMATIC ARTS
  // Source: FET Drama Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "drama", grade: 10, type: "pat", title: "PAT 1 — Written paragraphs + Monologue performance", topic: "Drama theory + practical performance", marks: 50, notes: ["Written section (paragraphs): 25 marks; Performance section (monologue): 25 marks."] },
  { subjectId: "drama", grade: 11, type: "pat", title: "PAT 2 — Lesson plans + Assessment", topic: "Performance Assessment Task (theatre making / performance)" },
  { subjectId: "drama", grade: 12, type: "pat", title: "PAT 2 — Lesson plans + Assessment", topic: "Performance Assessment Task (theatre making / performance)" },

  // ═══════════════════════════════════════════════════════════════════
  // MUSIC
  // Source: FET Music Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "music", grade: 10, type: "test", title: "Music Literacy: Harmony (figured bass + four-part harmonisation)", topic: "Music theory (Western art music harmony)", marks: 12, notes: ["Figure chords with Roman numerals, complete a four-part harmonisation, identify an anticipation."] },
  { subjectId: "music", grade: 10, type: "test", title: "Music Literacy: Jazz Harmony", topic: "Music theory (jazz harmony)" },
  { subjectId: "music", grade: 10, type: "performance", title: "Grade 10 Performance / Assessment", topic: "Performance + theory assessment" },
  { subjectId: "music", grade: 11, type: "performance", title: "Grade 11 Assessment", topic: "Performance + theory assessment" },
  { subjectId: "music", grade: 12, type: "performance", title: "Grade 12 Assessment", topic: "Performance + theory assessment" },

  // ═══════════════════════════════════════════════════════════════════
  // VISUAL ARTS
  // Source: FET Visual Arts Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "visual_arts", grade: 10, type: "pat", title: "PAT — Who Am I?", topic: "Self-portrait / identity exploration", notes: ["Process of exploring elements and principles of art, techniques and media; reflective practice."] },
  { subjectId: "visual_arts", grade: 10, type: "pat", title: "PAT — Sticks & Stones", topic: "Object / material exploration" },
  { subjectId: "visual_arts", grade: 11, type: "pat", title: "PAT — Room", topic: "Interior / space exploration in visual arts" },
  { subjectId: "visual_arts", grade: 11, type: "pat", title: "PAT — Street...", topic: "Urban / community-themed visual work" },
  { subjectId: "visual_arts", grade: 12, type: "pat", title: "PAT — Box", topic: "Object / container as conceptual prompt" },
  { subjectId: "visual_arts", grade: 12, type: "pat", title: "PAT — Clothing", topic: "Body, identity and material culture" },

  // ═══════════════════════════════════════════════════════════════════
  // DESIGN
  // Source: FET Design Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "design", grade: 10, type: "pat", title: "Fashion Design", topic: "Fashion design process and product" },
  { subjectId: "design", grade: 10, type: "pat", title: "Visual Communication PAT", topic: "Visual communication design (graphic / layout)" },
  { subjectId: "design", grade: 11, type: "pat", title: "Textiles and Fashion", topic: "Textile and fashion design" },
  { subjectId: "design", grade: 11, type: "pat", title: "PAT — Raising awareness for water conservation", topic: "Social-issue design brief (water conservation)" },
  { subjectId: "design", grade: 12, type: "pat", title: "PAT 1 — 'With these hands... It is in your hands'", topic: "Hands-themed design brief; product / craft / communication", notes: ["Teacher to show inspirational visual stimuli of designs inspired by hands."] },

  // ═══════════════════════════════════════════════════════════════════
  // LIFE ORIENTATION
  // Source: FET Life Orientation Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "lo", grade: 10, type: "test", title: "Grade 10 Written Task: Development of the self in society", topic: "Self-development, careers, gender, diversity, fitness", marks: 80 },
  { subjectId: "lo", grade: 10, type: "project", title: "Grade 10 Project: Social and Environmental Responsibility", topic: "Poverty, Ubuntu, civic contribution", notes: ["Focus on social issues that impact communities and how to address them through participation."] },
  { subjectId: "lo", grade: 10, type: "pet", title: "PET — Physical Education Task", topic: "Physical Education (cardio, strength, endurance, flexibility)", marks: 20 },
  { subjectId: "lo", grade: 11, type: "test", title: "Grade 11 Written Task: Risky behaviour and adolescent alcohol abuse", topic: "Healthy lifestyle choices, risk behaviour", marks: 80, notes: ["Investigates impact of alcohol, accidents and risky behaviour on adolescent well-being."] },
  { subjectId: "lo", grade: 11, type: "research", title: "Grade 11 Research", topic: "Democracy / Human Rights" },
  { subjectId: "lo", grade: 11, type: "pet", title: "PET — Physical Education Task", topic: "Physical Education", marks: 20 },
  { subjectId: "lo", grade: 12, type: "test", title: "Grade 12 Written Task: Development of the self in society", topic: "Careers, life-skills for transition, positive relationships", marks: 80 },
  { subjectId: "lo", grade: 12, type: "project", title: "Grade 12 Project: Human Rights and Democracy", topic: "Human rights violations / discrimination in the community", notes: ["Investigate a real human-rights violation locally and propose how it could be addressed."] },
  { subjectId: "lo", grade: 12, type: "pet", title: "PET — Physical Education Task (Grade 12)", topic: "Physical Education", marks: 20 },

  // ═══════════════════════════════════════════════════════════════════
  // TOURISM
  // Source: FET Tourism Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "tourism", grade: 10, type: "test", title: "Task 1: Term 1 Test", topic: "Tourism CAPS Term 1 content" },
  { subjectId: "tourism", grade: 10, type: "project", title: "Task 2: Term 1 Project", topic: "Tourism research project (industry, destinations, sustainable practices)" },
  { subjectId: "tourism", grade: 10, type: "test", title: "Task 3: Term 2 Test", topic: "Tourism CAPS Term 2 content" },
  { subjectId: "tourism", grade: 10, type: "exam", title: "Task 4: June Examination", topic: "Tourism mid-year examination", marks: 100 },
  { subjectId: "tourism", grade: 11, type: "project", title: "Task 2: Term 1 Project", topic: "Tourism research project" },
  { subjectId: "tourism", grade: 11, type: "exam", title: "Task 4: June Examination", topic: "Tourism mid-year examination", marks: 150 },
  { subjectId: "tourism", grade: 12, type: "project", title: "Task 2: Term 1 Project", topic: "Tourism research project (Grade 12)" },
  { subjectId: "tourism", grade: 12, type: "exam", title: "Task 4: June Examination", topic: "Tourism mid-year examination", marks: 200 },
  { subjectId: "tourism", grade: 12, type: "exam", title: "Task 6: Trial Examination", topic: "Tourism trial examination", marks: 200 },

  // ═══════════════════════════════════════════════════════════════════
  // HOSPITALITY STUDIES
  // Source: FET Hospitality Studies Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "hosp", grade: 10, type: "test", title: "Task 1: Term 1 Test", topic: "Hospitality theory (Term 1)" },
  { subjectId: "hosp", grade: 10, type: "practical", title: "Task 2: Practical lessons (Term 1)", topic: "Hospitality practical lessons" },
  { subjectId: "hosp", grade: 10, type: "exam", title: "Task 3: Mid-year Examination", topic: "Hospitality mid-year examination" },
  { subjectId: "hosp", grade: 10, type: "pat", title: "PAT 1 + PAT 2 (combined)", topic: "Practical Assessment Task — kitchen / service", marks: 100, notes: ["PAT 1 = 50, PAT 2 = 50, combined 100; assessed across the year."] },
  { subjectId: "hosp", grade: 11, type: "test", title: "Task 1: Term 1 Test", topic: "Hospitality theory (Term 1)" },
  { subjectId: "hosp", grade: 11, type: "practical", title: "Task 2: Practical lessons (Term 1)", topic: "Hospitality practical lessons" },
  { subjectId: "hosp", grade: 11, type: "pat", title: "PAT 1 + PAT 2 (Grade 11)", topic: "Practical Assessment Task", marks: 100 },
  { subjectId: "hosp", grade: 12, type: "test", title: "Task 1: Term 1 Test", topic: "Hospitality theory (Grade 12)" },
  { subjectId: "hosp", grade: 12, type: "project", title: "Task 2: Term 1 Project", topic: "Hospitality research project" },
  { subjectId: "hosp", grade: 12, type: "exam", title: "Task 5: Mid-year Examination", topic: "Hospitality mid-year examination" },
  { subjectId: "hosp", grade: 12, type: "pat", title: "PAT 1 + PAT 2 (Grade 12)", topic: "Practical Assessment Task", marks: 200, notes: ["PAT 1 + PAT 2 of 100 each = 200, ÷ 2 = 100 weighted."] },

  // ═══════════════════════════════════════════════════════════════════
  // CONSUMER STUDIES
  // Source: FET Consumer Studies Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "consumer", grade: 10, type: "test", title: "Task 1: Term 1 Test", topic: "Consumer Studies Term 1 content" },
  { subjectId: "consumer", grade: 10, type: "practical", title: "Task 2: Practical lessons (Term 1)", topic: "Practical lessons (CAPS minimum 12 per year for Grades 10–11)" },
  { subjectId: "consumer", grade: 10, type: "exam", title: "Task 3: Mid-year Examination", topic: "Consumer Studies mid-year examination" },
  { subjectId: "consumer", grade: 10, type: "pat", title: "PAT 1 + PAT 2", topic: "Practical Assessment Task (production / consumer skills)", marks: 100, notes: ["Two PATs of 50 marks each combined to 100; submitted in Term 4."] },
  { subjectId: "consumer", grade: 11, type: "test", title: "Task 1: Term 1 Test", topic: "Consumer Studies Term 1 content" },
  { subjectId: "consumer", grade: 11, type: "practical", title: "Task 2: Practical lessons (Term 1)", topic: "Practical lessons" },
  { subjectId: "consumer", grade: 11, type: "pat", title: "PAT 1 + PAT 2 (Grade 11)", topic: "Practical Assessment Task", marks: 100 },
  { subjectId: "consumer", grade: 12, type: "test", title: "Task 1: Term 1 Test", topic: "Consumer Studies Grade 12 content" },
  { subjectId: "consumer", grade: 12, type: "project", title: "Task 2: Term 1 Project", topic: "Consumer Studies research project (Grade 12)" },
  { subjectId: "consumer", grade: 12, type: "exam", title: "Task 5: Mid-year Examination", topic: "Consumer Studies mid-year examination" },
  { subjectId: "consumer", grade: 12, type: "pat", title: "PAT 1 + PAT 2 (Grade 12)", topic: "Practical Assessment Task (Grade 12, 6 practical lessons / yr)", marks: 200, notes: ["Two PATs of 100 each, summed to 200 and weighted to 100."] },

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTER APPLICATIONS TECHNOLOGY (CAT)
  // Source: FET MST Computer Application Technology Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "cat", grade: 10, type: "practical", title: "Grade 10 Term 1 Practical Test", topic: "Office applications (word processing, spreadsheets)" },
  { subjectId: "cat", grade: 10, type: "test", title: "Grade 10 Term 1 Theory Test", topic: "System technologies, computer concepts" },
  { subjectId: "cat", grade: 10, type: "test", title: "Grade 10 Term 2 Theory Test", topic: "Hardware, network, internet technologies" },
  { subjectId: "cat", grade: 10, type: "practical", title: "Grade 10 Term 3 Practical Test", topic: "Office applications integration" },
  { subjectId: "cat", grade: 11, type: "practical", title: "Grade 11 Term 1 Practical Test", topic: "Database, spreadsheet and document integration" },
  { subjectId: "cat", grade: 11, type: "test", title: "Grade 11 Term 1 Theory Test", topic: "Networks, internet, social implications" },
  { subjectId: "cat", grade: 11, type: "practical", title: "Grade 11 Term 3 Practical Test", topic: "Integrated office applications" },
  { subjectId: "cat", grade: 11, type: "test", title: "Grade 11 Term 3 Theory Test", topic: "System technologies, social implications" },
  { subjectId: "cat", grade: 12, type: "practical", title: "Grade 12 Term 1 Practical Test", topic: "Office applications, HTML / web-page basics" },
  { subjectId: "cat", grade: 12, type: "test", title: "Grade 12 Term 2 Theory Test", topic: "Technologies, social implications, programming logic" },
  { subjectId: "cat", grade: 12, type: "practical", title: "Grade 12 Term 3 Practical Test", topic: "Integrated office applications + databases" },

  // ═══════════════════════════════════════════════════════════════════
  // INFORMATION TECHNOLOGY (IT)
  // Source: FET MST Information Technology Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "it", grade: 10, type: "practical", title: "Grade 10 Term 1 Practical Test", topic: "Programming fundamentals (Delphi / Java)" },
  { subjectId: "it", grade: 10, type: "practical", title: "Grade 10 Term 2 Practical Test", topic: "Conditional logic + iteration" },
  { subjectId: "it", grade: 10, type: "practical", title: "Grade 10 Term 3 Practical Test", topic: "Arrays / GUI components" },
  { subjectId: "it", grade: 11, type: "practical", title: "Grade 11 Term 1 Practical Test", topic: "Object-oriented programming / file handling" },
  { subjectId: "it", grade: 11, type: "exam", title: "Grade 11 Term 2 — June Examination (Practical Paper)", topic: "Integrated programming, database" },
  { subjectId: "it", grade: 11, type: "practical", title: "Grade 11 Term 3 Practical Test", topic: "Database programming + integration" },

  // ═══════════════════════════════════════════════════════════════════
  // ENGINEERING GRAPHICS AND DESIGN (EGD)
  // Source: FET MST Engineering Graphics and Design Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "egd", grade: 10, type: "practical", title: "Course Drawings (CDs) — Grade 10", topic: "Mechanical / civil drawing (CDs)", notes: ["Booklet provides exemplar EGD tasks for teachers to set their own SBA; CAPS requires 3–5 Daily Developmental Exercises (DDEs) a week alongside CDs."] },
  { subjectId: "egd", grade: 10, type: "test", title: "Grade 10 Tests and Examinations", topic: "Drawing theory and applied solid geometry / mechanical drawing" },
  { subjectId: "egd", grade: 11, type: "practical", title: "Course Drawings (CDs) — Grade 11", topic: "Mechanical / civil drawing (Grade 11 content)" },
  { subjectId: "egd", grade: 11, type: "test", title: "Grade 11 Tests and Examinations", topic: "Drawing theory and applied solid geometry / mechanical drawing" },
  { subjectId: "egd", grade: 12, type: "practical", title: "Course Drawings (CDs) — Grade 12", topic: "Mechanical / civil drawing (Grade 12 content)" },
  { subjectId: "egd", grade: 12, type: "pat", title: "Practical Assessment Task (third NSC paper)", topic: "Substantive drawing project counted as 25% of the final NSC mark", notes: ["PAT is the third EGD NSC paper; not part of the SBA mark but a compulsory formal-assessment component."] },

  // ═══════════════════════════════════════════════════════════════════
  // CIVIL TECHNOLOGY
  // Source: FET MST Civil Technology Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "civil_tech", grade: 10, type: "test", title: "Grade 10 Term 1 Task", topic: "Safety, tools, materials (Civil Services / Construction / Woodworking)", notes: ["Section A Generics: identify tools and uses; match materials to properties (concrete, plywood, copper)."] },
  { subjectId: "civil_tech", grade: 11, type: "test", title: "Grade 11 Term 2 Task", topic: "Safety, OHS regulations on a building site" },
  { subjectId: "civil_tech", grade: 11, type: "test", title: "Grade 11 Term 3 Task — Civil Services", topic: "Civil Services (drawing one-brick T-junction stretcher bond)", marks: 50, timeMinutes: 60 },

  // ═══════════════════════════════════════════════════════════════════
  // ELECTRICAL TECHNOLOGY
  // Source: FET MST Electrical Technology Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "elec_tech", grade: 10, type: "test", title: "Grade 10 Term 1 Test", topic: "Electrical principles, safety, components", marks: 50 },
  { subjectId: "elec_tech", grade: 10, type: "exam", title: "Grade 10 Term 2 Mid-Year Examination", topic: "Electrical Technology mid-year content", timeMinutes: 150 },
  { subjectId: "elec_tech", grade: 11, type: "test", title: "Grade 11 Term 1 Test", topic: "Electrical principles (Grade 11)", timeMinutes: 60 },
  { subjectId: "elec_tech", grade: 11, type: "test", title: "Grade 11 Term 3 Test", topic: "Specialisation specific content (Electronics / Power / Digital)", timeMinutes: 60 },
  { subjectId: "elec_tech", grade: 12, type: "pat", title: "Practical Assessment Task (PAT)", topic: "Externally set, internally moderated PAT (25%)", notes: ["Compulsory; counts toward 25% of the final NSC/promotional mark."] },

  // ═══════════════════════════════════════════════════════════════════
  // MECHANICAL TECHNOLOGY
  // Source: FET MST Mechanical Technology Grades 10-12.pdf
  // ═══════════════════════════════════════════════════════════════════
  { subjectId: "mech_tech", grade: 10, type: "test", title: "Grade 10 Term 1 Test", topic: "Workshop safety, materials, tools, joining methods", marks: 100 },
  { subjectId: "mech_tech", grade: 11, type: "exam", title: "Grade 11 Mid-Year Examination", topic: "Mechanical Technology mid-year content", timeMinutes: 150 },
  { subjectId: "mech_tech", grade: 11, type: "test", title: "Grade 11 Term Test", topic: "Specialisation specific content (Welding & Metalwork / Fitting & Machining / Automotive)" },
  { subjectId: "mech_tech", grade: 12, type: "pat", title: "Practical Assessment Task (PAT)", topic: "Externally set, internally moderated PAT (25%)", notes: ["Counts toward 25% of the final NSC/promotional mark; Mechanical Technology comprises 50% (150 marks) of the learner's total mark."] },
];
