import { useEffect, useState } from "react";
import { ArrowLeft, Award, LoaderCircle } from "lucide-react";
import { CertificateView } from "@/certificate/CertificateView";
import { buttonVariants } from "@/components/ui/button";
import { authGet } from "@/lib/auth";
import { cn } from "@/lib/utils";

const FONT = {
  fontFamily: "Roboto, sans-serif",
  fontStyle: "normal",
  letterSpacing: "0.01em",
};

const CertificatePage = ({ code }) => {
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authGet(`/api/learning/certificates/${encodeURIComponent(code)}`)
      .then((data) => {
        if (!cancelled) {
          setCert(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Không tìm thấy chứng chỉ");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-3 py-6 sm:px-6 sm:py-10">
        <div className="cert-actions mb-6 flex items-center justify-between gap-3">
          <a
            href="/hoc-tap?tab=certs"
            style={{ ...FONT, fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-10 rounded-none text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <ArrowLeft className="size-4" />
            Chứng chỉ của tôi
          </a>
          <span
            className="inline-flex items-center gap-1.5 text-violet-300 uppercase"
            style={{ ...FONT, fontSize: "12px", fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.08em" }}
          >
            <Award className="size-3.5" />
            Bằng cấp LearnHub
          </span>
        </div>
        {loading ? (
          <div
            className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-white/70"
            style={{ ...FONT, fontSize: "16px", fontWeight: 400, lineHeight: 1.6 }}
          >
            <LoaderCircle className="size-8 animate-spin text-violet-400" />
            Đang mở chứng chỉ...
          </div>
        ) : error || !cert ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <Award className="size-10 text-violet-400" />
            <p style={{ ...FONT, fontSize: "18px", fontWeight: 600, lineHeight: 1.4 }}>
              {error || "Không tìm thấy chứng chỉ"}
            </p>
            <a
              href="/hoc-tap?tab=certs"
              style={{ ...FONT, fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-none bg-violet-700 text-white hover:bg-violet-800",
              )}
            >
              Về danh sách chứng chỉ
            </a>
          </div>
        ) : (
          <CertificateView cert={cert} />
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
