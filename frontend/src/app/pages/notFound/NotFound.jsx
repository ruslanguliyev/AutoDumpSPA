import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation(["sellers", "common"]);

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{t("common:common.pageNotFound")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("sellers:notFound.dealerPage")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          {t("sellers:notFound.goHomepage")}
        </button>
      </div>
    </div>
  );
}
