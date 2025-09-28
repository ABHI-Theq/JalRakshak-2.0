"use client"
import { RainBackground } from "@/components/RainBackground";
import {
  ArrowRight,
  Droplets,
  CloudRain,
  Gauge,
  Users,
  Hammer,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const getStartedRef = useRef<HTMLDivElement>(null);
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

 const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
  ref.current?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

  return (
    <main className="relative overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_left,theme(colors.blue.200/.45),transparent_50%),radial-gradient(ellipse_at_bottom_right,theme(colors.blue.300/.3),transparent_40%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.15),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.12),transparent_45%)]" />
        <div className="absolute -top-40 -left-40 -z-10 size-[36rem] rounded-full bg-blue-300/20 blur-3xl filter dark:bg-blue-500/10" />
        <div className="absolute -bottom-40 -right-40 -z-10 size-[36rem] rounded-full bg-cyan-300/15 blur-3xl filter dark:bg-cyan-400/10" />
        <RainBackground intensity={0.4} />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:py-32">
          <div className="[animation:slide-in_800ms_cubic-bezier(.2,.8,.2,1)_both] group">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/70 px-3 py-1 text-xs font-medium text-blue-800 shadow-sm ring-1 ring-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-blue-200">
              {t("smartRainwaterHarvesting")}
            </div>
            <div className=" mt-5 flex flex-col items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-8xl hover:drop-shadow-2xl">
              <div className="flex items-center gap-3">
                <Droplets className="h-9 w-9 text-blue-500/80 dark:text-blue-300/80" />
                <span>{t("appName")}</span>
              </div>
              <span className="mb-3 text-2xl sm:text-3xl md:text-6xl font-bold">
                {t("subtitleApp")}
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold text-blue-900/90 dark:text-blue-200/90">
              {t("cleanMinimal")}
            </p>
            <p className="mt-3 mx-auto max-w-3xl text-base leading-relaxed text-blue-900/75 dark:text-blue-100/80 md:text-lg">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-blue-800/70 dark:text-blue-200/70">
              <span className="relative pl-4">
                <span className="absolute left-0 top-1.5 h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                {t("rainAlerts")}
              </span>
              <span>{t("locationInsights")}</span>
              <span>{t("communityImpact")}</span>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                <a href="https://www.jalshakti-dowr.gov.in/" target="_blank">
                  {t("governmentPolicies")}
                  <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-0.5" />
                </a>
              </Button>
              <Button
                onClick={() => scrollToSection(getStartedRef)}
                className="group bg-blue-600 text-white hover:bg-blue-700"
              >
                {t("getStarted")}
                <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-0.5" />
              </Button>
              <button
                onClick={() => scrollToSection(learnMoreRef)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-blue-800 underline-offset-4 hover:underline dark:text-blue-200 transition-colors"
              >
                {t("learnMore")}
              </button>
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="ml-2 text-blue-700 hover:text-blue-900 hover:bg-blue-100/50 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-white/5"
              >
                {i18n.language === "en"
                  ? t("toggleToHindi")
                  : t("toggleToEnglish")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        ref={learnMoreRef}
        id="features"
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center scroll-mt-24"
      >
        <h2 className="mb-8 text-center text-2xl font-bold text-blue-900 dark:text-blue-100">
          {t("whyJalRakshak")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: t("featureWeatherTitle"),
              text: t("featureWeatherText"),
              icon: CloudRain,
            },
            {
              title: t("featureFeasTitle"),
              text: t("featureFeasText"),
              icon: Gauge,
            },
            {
              title: t("featureCommunityTitle"),
              text: t("featureCommunityText"),
              icon: Users,
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-black bg-white/25 p-6 shadow-lg ring-1 ring-white/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/35 dark:border-white/10 dark:bg-white/10 dark:ring-white/10"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full  blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-60 group-hover:animate-shine" />
                <div className="relative mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700 bg-clip-text text-base font-semibold text-transparent drop-shadow-sm group-hover:drop-shadow-[0_0_14px_rgba(37,99,235,0.45)] dark:from-blue-300 dark:via-cyan-300 dark:to-indigo-300">
                  {f.title}
                </h3>
                <p className="relative mt-2 text-sm text-blue-900/70 dark:text-blue-100/70">
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* GET STARTED SECTION */}
      <section
        ref={getStartedRef}
        id="get-started"
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center scroll-mt-24 mt-10"
      >
        <h2 className="mb-8 text-center text-2xl font-bold text-blue-900 dark:text-blue-100">
          {t("sectionGetStarted")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              id: "analysis",
              title: t("cardAnalysisTitle"),
              href: "/analysis",
              desc: t("cardAnalysisDesc"),
              icon: Gauge,
            },
            {
              id: "weather",
              title: t("cardWeatherTitle"),
              href: "/weather",
              desc: t("cardWeatherDesc"),
              icon: CloudRain,
            },
            {
              id: "structure",
              title: t("cardStructureTitle"),
              href: "/structure",
              desc: t("cardStructureDesc"),
              icon: Hammer,
            },
            {
              id: "faqs",
              title: t("cardFaqsTitle"),
              href: "/faqs",
              desc: t("cardFaqsDesc"),
              icon: HelpCircle,
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <a
                key={f.id}
                id={f.id}
                href={f.href}
                className="group relative overflow-hidden rounded-2xl border border-black bg-white/25 p-8 shadow-xl ring-1 ring-white/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/35 dark:border-white/10 dark:bg-white/10 dark:ring-white/10"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/25 to-cyan-400/25 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-blue-900/70 dark:text-blue-100/70">
                  {f.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition group-hover:translate-x-0.5 dark:text-blue-300">
                  {t("open")} {f.title} <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* BACKGROUND GRID */}
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(75%_60%_at_50%_20%,black,transparent)]" />
    </main>
  );

}

