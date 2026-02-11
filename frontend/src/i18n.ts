import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "hero.title": "Promoting Transparency, Combating Corruption, Empowering Communities",
      "hero.description":
        "Report corruption and any other issues that would require government intervention directly to the authorities. Join thousands of citizens making Africa more transparent and accountable.",
      "nav.features": "Features",
      "nav.howItWorks": "How It Works",
      "nav.impact": "Impact",
      login: "Login",
      getStarted: "Get Started",
      trustedBy: "Trusted by 10,000+ Citizens",
      secureAnonymous: "Secure & Anonymous",
      realTimeTracking: "Real-time Tracking",
      communityDriven: "Community Driven",
      activeCitizens: "Active Citizens",
      reportsSubmitted: "Reports Submitted",
      issuesResolved: "Issues Resolved",
      simpleProcess: "Simple, Transparent Process",
      createAccount: "Create Account",
      submitReport: "Submit Report",
      trackProgress: "Track Progress",
      seeChange: "See Change",
      twoWays: "Two Ways to Make a Difference",
      redFlagReports: "Red-Flag Reports",
      interventionRequests: "Intervention Requests",
      redFlagDesc:
        "Report incidents of corruption, bribery, embezzlement, and other forms of misconduct by public officials.",
      interventionDesc:
        "Report infrastructure problems like broken roads, non-functional streetlights, understocked hospitals, or damaged public facilities.",
      anonymousReporting: "Anonymous reporting option",
      uploadEvidence: "Upload evidence (photos, videos)",
      trackStatus: "Track investigation status",
      preciseMapping: "Precise location mapping",
      visualDoc: "Visual documentation",
      resolutionUpdates: "Resolution updates",
      "process.step1.desc": "Create an account securely",
      "process.step2.desc": "Submit your report with evidence",
      "process.step3.desc": "Track progress in real time",
      "process.step4.desc": "Get notified when action is taken",
    },
  },

  sw: {
    translation: {
      "hero.title": "Ipe Sauti Yako Nguvu, Endesha Mabadiliko Katika Jamii Yako",
      "hero.description":
        "Ripoti rushwa na masuala mengine yanayohitaji kuingilia kati kwa serikali moja kwa moja kwa mamlaka husika.",
      login: "Ingia",
      getStarted: "Anza",
      "process.step1.desc": "Unda akaunti salama",
      "process.step2.desc": "Wasilisha ripoti yako pamoja na ushahidi",
      "process.step3.desc": "Fuatilia maendeleo kwa wakati halisi",
      "process.step4.desc": "Pata taarifa hatua inapochukuliwa",
    },
  },

  lg: {
    translation: {
      "hero.title": "Twala Eddoboozi Lyo, Leta Enkyukakyuka Mu Kitundu Kyo",
      "hero.description":
        "Langa obulyake n’ebizibu ebirala ebyetaaga okuddukanyizibwa gavumenti.",
      login: "Yingira",
      getStarted: "Tandika",
    },
  },

  rn: {
    translation: {
      "hero.title":
        "Ha Amajwi Yawe Amandla, Hindura Umuryango Wawe",
      "hero.description":
        "Menyesha ruswa n'ibindi bibazo bisaba kwitabwaho na leta.",
      login: "Injira",
      getStarted: "Tangira",
    },
  },

  xog: {
    translation: {
      "hero.title": "Wa Eddoboozi Lyo Amaanyi, Leta Enkyukakyuka",
      "hero.description":
        "Langa obubbi n’ebizibu ebirala ebyetaaga obuyambi bwa gavumenti.",
      login: "Yingira",
      getStarted: "Tandika",
    },
  },

  ar: {
    translation: {
      "hero.title": "امنح صوتك القوة واصنع التغيير في مجتمعك",
      "hero.description":
        "أبلغ عن الفساد وأي قضايا أخرى تتطلب تدخل الحكومة مباشرة.",
      login: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
    },
  },

  pt: {
    translation: {
      "hero.title":
        "Dê Poder à Sua Voz e Promova Mudanças na Sua Comunidade",
      "hero.description":
        "Reporte corrupção e outros problemas que exigem intervenção governamental.",
      login: "Entrar",
      getStarted: "Começar",
    },
  },

  zu: {
    translation: {
      "hero.title":
        "Nikeza Amandla Izwi Lakho, Yenza Ushintsho Emphakathini Wakho",
      "hero.description":
        "Bika inkohlakalo nanoma yiziphi ezinye izinkinga ezidinga ukungenelela kukahulumeni ngqo kuziphathimandla.",
      "nav.features": "Izici",
      "nav.howItWorks": "Kusebenza Kanjani",
      "nav.impact": "Umthelela",
      login: "Ngena",
      getStarted: "Qala",
      trustedBy: "Kuthembekile ngabantu abangaphezu kuka-10,000",
      secureAnonymous: "Kuphephile Futhi Akubonakali",
      realTimeTracking: "Ukuthungatha Ngesikhathi Sangempela",
      communityDriven: "Iqhutshwa Umphakathi",
      activeCitizens: "Izakhamizi Ezisebenzayo",
      reportsSubmitted: "Imibiko Ethunyelwe",
      issuesResolved: "Izinkinga Ezixazululiwe",
      simpleProcess: "Inqubo Elula Futhi Esobala",
      createAccount: "Dala I-Akhawunti",
      submitReport: "Thumela Umbiko",
      trackProgress: "Landela Inqubekela Phambili",
      seeChange: "Bona Ushintsho",
      twoWays: "Izindlela Ezimbili Zokwenza Umehluko",
      redFlagReports: "Imibiko Yefulegi Elibomvu",
      interventionRequests: "Izicelo Zokungenelela",
      redFlagDesc:
        "Bika izehlakalo zenkohlakalo, ukufumbathisa, ukweba imali, nezinye izindlela zokungaziphathi kahle.",
      interventionDesc:
        "Bika izinkinga zengqalasizinda njengemigwaqo ephukile noma izakhiwo zomphakathi ezilimele.",
      anonymousReporting: "Inketho yokubika ngokungaziwa",
      uploadEvidence: "Layisha ubufakazi",
      trackStatus: "Landela isimo sophenyo",
      preciseMapping: "Ukudweba imephu ngokunembile",
      visualDoc: "Imibhalo ebonakalayo",
      resolutionUpdates: "Izibuyekezo zokuxazulula",
      "process.step1.desc":
        "Bhalisa nge-imeyili yakho futhi udale i-akhawunti ephephile",
      "process.step2.desc":
        "Chaza inkinga bese ulayisha ubufakazi",
      "process.step3.desc":
        "Qapha isimo sombiko wakho kusukela ekuqaleni kuya ekuxazululweni",
      "process.step4.desc":
        "Thola isaziso lapho iziphathimandla zithatha isinyathelo",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
