const axios = require('axios');

const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

const translateText = async (text, targetLang, sourceLang = 'en') => {
  try {
    const response = await axios.post(LIBRE_TRANSLATE_URL, {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

const englishTranslations = {
  "hero.title": "Empower Your Voice, Drive Change in Your Community",
  "hero.description": "Report corruption and issues requiring government intervention. Join thousands making Africa more transparent.",
  "nav.features": "Features",
  "nav.howItWorks": "How It Works",
  "nav.impact": "Impact",
  "login": "Login",
  "getStarted": "Get Started",
  "trustedBy": "Trusted by 10,000+ Citizens",
  "secureAnonymous": "Secure & Anonymous",
  "realTimeTracking": "Real-time Tracking",
  "communityDriven": "Community Driven",
  "activeCitizens": "Active Citizens",
  "reportsSubmitted": "Reports Submitted",
  "issuesResolved": "Issues Resolved",
  "simpleProcess": "Simple, Transparent Process",
  "createAccount": "Create Account",
  "submitReport": "Submit Report",
  "trackProgress": "Track Progress",
  "seeChange": "See Change",
  "twoWays": "Two Ways to Make a Difference",
  "redFlagReports": "Red-Flag Reports",
  "interventionRequests": "Intervention Requests",
  "redFlagDesc": "Report corruption, bribery, embezzlement, and misconduct by public officials.",
  "interventionDesc": "Report broken roads, faulty streetlights, understocked hospitals.",
  "anonymousReporting": "Anonymous reporting option",
  "uploadEvidence": "Upload evidence (photos, videos)",
  "trackStatus": "Track investigation status",
  "preciseMapping": "Precise location mapping",
  "visualDoc": "Visual documentation",
  "resolutionUpdates": "Resolution updates",
  "process.step1.desc": "Create an account securely",
  "process.step2.desc": "Submit your report with evidence",
  "process.step3.desc": "Track progress in real time",
  "process.step4.desc": "Get notified when action is taken",
  "hero.badge": "Trusted by 10,000+ Citizens",
  "learnMore": "Learn More",
  "stats.subtitle": "Together, we're building more transparent and accountable communities",
  "process.subtitle": "From report to resolution in four easy steps",
  "process.step1.detail": "Sign up with your email and create a secure account",
  "process.step2.detail": "Describe the issue, add location, and upload evidence",
  "process.step3.detail": "Monitor your report status from draft to resolution",
  "process.step4.detail": "Get notified when authorities take action",
  "reportTypes.subtitle": "Whether it's corruption or broken infrastructure, your voice matters",
  "testimonials.title": "What Our Users Say",
  "testimonials.subtitle": "Hear from citizens who have made a difference",
  "testimonial1.quote": "iReporter helped me report corruption in my local government. The process was secure and anonymous, and I saw real change.",
  "testimonial1.name": "Sarah Johnson",
  "testimonial1.role": "Community Activist",
  "testimonial2.quote": "Reporting infrastructure issues has never been easier. The app's location mapping and tracking features are fantastic.",
  "testimonial2.name": "Michael Chen",
  "testimonial2.role": "Local Resident",
  "testimonial3.quote": "As a journalist, iReporter has been invaluable for gathering citizen reports and holding authorities accountable.",
  "testimonial3.name": "Amina Okafor",
  "testimonial3.role": "Investigative Journalist",
  "recentSuccess": "Recent Success Stories",
  "seeChangeCommunity": "See how your reports are making a difference in communities across Africa",
  "resolved": "Resolved",
  "redFlagReport": "Red-Flag Report",
  "interventionRequest": "Intervention Request",
  "healthcareIssue": "Healthcare Issue",
  "story1.title": "Corruption in Local Government",
  "story1.desc": "A citizen reported embezzlement of public funds by local officials. The report led to a full investigation, recovery of stolen funds, and prosecution of those involved.",
  "fundsRecovered": "Funds Recovered",
  "officialsCharged": "Officials Charged",
  "daysToResolution": "Days to Resolution",
  "story2.title": "Broken Street Lights Fixed",
  "story2.desc": "Community members reported non-functional street lights affecting safety. Authorities responded within 48 hours, repairing 15 lights and improving neighborhood security.",
  "lightsRepaired": "Lights Repaired",
  "responseTime": "Response Time",
  "citizensBenefited": "Citizens Benefited",
  "story3.title": "Hospital Equipment Restored",
  "story3.desc": "Reports of malfunctioning medical equipment in a public hospital led to immediate repairs and restocking of essential supplies, improving healthcare delivery.",
  "equipmentFixed": "Equipment Fixed",
  "patientsHelped": "Patients Helped",
  "viewAllStories": "View All Success Stories",
  "trustedPartners": "Trusted Partners",
  "workingTogether": "Working together to build transparent communities",
  "getApp": "Get the App",
  "appDesc": "Download our mobile app for on-the-go reporting and tracking",
  "downloadOnThe": "Download on the",
  "appStore": "App Store",
  "getItOn": "Get it on",
  "googlePlay": "Google Play",
  "readyToMakeDifference": "Ready to Make a Difference?",
  "joinThousands": "Join thousands of citizens making Africa more transparent and accountable",
  "createAccountBtn": "Create Account",
  "loginBtn": "Login",
  "partner1": "Transparency International",
  "partner2": "Amnesty International",
  "partner3": "United Nations",
  "partner4": "African Union",
  "partner5": "World Bank",
  "partner6": "Local Governments",
  "story1.location": "Lagos, Nigeria",
  "story2.location": "Nairobi, Kenya",
  "story3.location": "Accra, Ghana"
};

const languages = ['sw', 'lg', 'rn', 'xog', 'ar', 'pt', 'zu', 'fr', 'yo', 'am', 'ha', 'luo', 'teo', 'ig', 'rw', 'sn', 'st', 'tn', 'ts', 've', 'xh', 'af', 'so', 'ti', 'om', 'ss', 'nr', 'nd'];

const generateTranslations = async () => {
  const resources = { en: { translation: englishTranslations } };

  for (const lang of languages) {
    console.log(`Translating to ${lang}...`);
    const translated = {};
    for (const [key, text] of Object.entries(englishTranslations)) {
      translated[key] = await translateText(text, lang);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    resources[lang] = { translation: translated };
  }

  console.log(JSON.stringify(resources, null, 2));
};

generateTranslations();