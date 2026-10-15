import { useEffect, useState } from "react";
import { ArrowLeft, Award, LoaderCircle } from "lucide-react";
import { CertificateView } from "@/certificate/CertificateView";
import { buttonVariants } from "@/components/ui/button";
import { authGet } from "@/lib/auth";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#3b2d12_0%,#0b1020_48%,#070b14_100%)] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-3 py-6 sm:px-6 sm:py-10">
        <div className="cert-actions mb-6 flex items-center justify-between gap-3">
          <a
            href="/hoc-tap?tab=certs"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-10 text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <ArrowLeft className="size-4" />
            Chứng chỉ của tôi
          </a>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-amber-200/80 uppercase">
            <Award className="size-3.5" />
            Bằng cấp LearnHub
          </span>
        </div>
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-white/70">
            <LoaderCircle className="size-8 animate-spin" />
            Đang mở chứng chỉ...
          </div>
        ) : error || !cert ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <Award className="size-10 text-amber-300/70" />
            <p className="text-lg font-medium">{error || "Không tìm thấy chứng chỉ"}</p>
            <a
              href="/hoc-tap?tab=certs"
              className={cn(buttonVariants({ variant: "default" }), "bg-amber-400 text-amber-950 hover:bg-amber-300")}
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
