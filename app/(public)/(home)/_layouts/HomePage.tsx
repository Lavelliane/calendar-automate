"use client";
import { useTranslations } from "next-intl";

const HomePage = () => {
  const t = useTranslations("HomePage");

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 min-h-[86vh] items-center justify-center">
      <div className="text-8xl font-bold mx-auto">{t("title")}</div>
    </section>
  );
};

export default HomePage;
