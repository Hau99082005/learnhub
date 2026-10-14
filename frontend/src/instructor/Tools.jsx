import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  FileText,
  Landmark,
  Plus,
  Rocket,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authDelete, authGet, authPost, authPut } from "@/lib/auth";

const TABS = [
  { id: "publish", label: "Xuất bản", icon: Rocket },
  { id: "record", label: "Ghi hình", icon: Video },
  { id: "copy", label: "Mẫu mô tả", icon: FileText },
  { id: "bank", label: "Tài khoản", icon: Landmark },
];

const BANKS = [
  { id: "MBBank", label: "MB Bank" },
  { id: "Vietcombank", label: "Vietcombank" },
  { id: "VietinBank", label: "VietinBank" },
  { id: "BIDV", label: "BIDV" },
  { id: "Agribank", label: "Agribank" },
  { id: "Techcombank", label: "Techcombank" },
  { id: "ACB", label: "ACB" },
  { id: "VPBank", label: "VPBank" },
  { id: "TPBank", label: "TPBank" },
  { id: "Sacombank", label: "Sacombank" },
  { id: "HDBank", label: "HDBank" },
  { id: "VIB", label: "VIB" },
  { id: "SHB", label: "SHB" },
  { id: "MSB", label: "MSB" },
  { id: "OCB", label: "OCB" },
  { id: "SeABank", label: "SeABank" },
  { id: "Eximbank", label: "Eximbank" },
  { id: "LPBank", label: "LPBank" },
  { id: "NamABank", label: "Nam A Bank" },
  { id: "VietABank", label: "VietABank" },
  { id: "BacABank", label: "Bac A Bank" },
  { id: "PVcomBank", label: "PVcomBank" },
  { id: "NCB", label: "NCB" },
  { id: "BaoVietBank", label: "BaoViet Bank" },
  { id: "ABBank", label: "ABBank" },
  { id: "VietBank", label: "VietBank" },
  { id: "KienLongBank", label: "KienlongBank" },
  { id: "PGBank", label: "PGBank" },
  { id: "SaigonBank", label: "SaigonBank" },
  { id: "BVBank", label: "BVBank" },
  { id: "Cake", label: "CAKE" },
  { id: "Timo", label: "Timo" },
  { id: "Ubank", label: "Ubank" },
  { id: "ShinhanBank", label: "Shinhan Bank" },
  { id: "Woori", label: "Woori Bank" },
  { id: "CIMB", label: "CIMB" },
  { id: "HSBC", label: "HSBC" },
  { id: "PublicBank", label: "Public Bank" },
];

const KINDS = [
  { id: "SUBTITLE", label: "Phụ đề" },
  { id: "DESCRIPTION", label: "Mô tả" },
  { id: "LEARN", label: "Bạn sẽ học được gì" },
];

const STATUS = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground scheme-light dark:bg-card dark:text-card-foreground dark:scheme-dark";
const OPTION_CLASS = "bg-background text-foreground dark:bg-card dark:text-card-foreground";

function kindLabel(kind) {
  return KINDS.find((item) => item.id === kind)?.label || kind;
}

function applySnapshot(data, setRecording, setTemplates, setCourses, setBank) {
  setRecording(Array.isArray(data?.recording) ? data.recording : []);
  setTemplates(Array.isArray(data?.templates) ? data.templates : []);
  setCourses(Array.isArray(data?.courses) ? data.courses : []);
  setBank(data?.bank || null);
}

function fillBank(row) {
  return {
    bankCode: row?.bankCode || "MBBank",
    accountNumber: row?.accountNumber || "",
    accountName: row?.accountName || "",
  };
}

const Tools = () => {
  const [tab, setTab] = useState("publish");
  const [recording, setRecording] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [form, setForm] = useState({ kind: "DESCRIPTION", title: "", body: "" });
  const [bankForm, setBankForm] = useState(fillBank(null));

  const selected = useMemo(
    () => templates.find((item) => item.id === selectedId) || null,
    [templates, selectedId],
  );
  const recordingDone = recording.filter((item) => item.checked).length;
  const readyCount = courses.filter((item) => item.ready && item.status !== "PUBLISHED").length;

  useEffect(() => {
    let cancelled = false;
    authGet("/api/instructor/tools")
      .then((data) => {
        if (cancelled) {
          return;
        }
        applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
        setBankForm(fillBank(data?.bank));
        const copies = Array.isArray(data?.templates) ? data.templates : [];
        const list = Array.isArray(data?.courses) ? data.courses : [];
        if (copies[0]?.id) {
          setSelectedId(copies[0].id);
          setForm({
            kind: copies[0].kind || "DESCRIPTION",
            title: copies[0].title || "",
            body: copies[0].body || "",
          });
        }
        if (list[0]?.id) {
          setCourseId(String(list[0].id));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error.message);
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
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }
    setForm({
      kind: selected.kind || "DESCRIPTION",
      title: selected.title || "",
      body: selected.body || "",
    });
  }, [selectedId]);

  const toggleCheck = async (item) => {
    setBusy(`check-${item.key}`);
    try {
      const data = await authPost("/api/instructor/tools/checks", {
        key: item.key,
        checked: !item.checked,
      });
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const pickTemplate = (item) => {
    setSelectedId(item.id);
    setForm({
      kind: item.kind || "DESCRIPTION",
      title: item.title || "",
      body: item.body || "",
    });
  };

  const startNew = () => {
    setSelectedId(null);
    setForm({ kind: "DESCRIPTION", title: "", body: "" });
  };

  const saveTemplate = async () => {
    setBusy("save");
    try {
      const payload = {
        kind: form.kind,
        title: form.title.trim(),
        body: form.body.trim(),
      };
      const data = selectedId
        ? await authPut(`/api/instructor/tools/templates/${selectedId}`, payload)
        : await authPost("/api/instructor/tools/templates", payload);
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      const copies = Array.isArray(data?.templates) ? data.templates : [];
      if (!selectedId && copies[0]?.id) {
        setSelectedId(copies[0].id);
      }
      toast.success(selectedId ? "Đã lưu mẫu" : "Đã tạo mẫu mới");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const removeTemplate = async () => {
    if (!selectedId) {
      return;
    }
    setBusy("delete");
    try {
      const data = await authDelete(`/api/instructor/tools/templates/${selectedId}`);
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      const copies = Array.isArray(data?.templates) ? data.templates : [];
      if (copies[0]?.id) {
        setSelectedId(copies[0].id);
        setForm({
          kind: copies[0].kind || "DESCRIPTION",
          title: copies[0].title || "",
          body: copies[0].body || "",
        });
      } else {
        startNew();
      }
      toast.success("Đã xóa mẫu");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const applyTemplate = async () => {
    if (!selectedId) {
      toast.error("Hãy lưu mẫu trước khi áp dụng");
      return;
    }
    if (!courseId) {
      toast.error("Vui lòng chọn khóa học");
      return;
    }
    setBusy("apply");
    try {
      const data = await authPost(`/api/instructor/tools/templates/${selectedId}/apply`, {
        courseId: Number(courseId),
      });
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      toast.success(`Đã áp dụng ${kindLabel(form.kind).toLowerCase()} vào khóa học`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const publish = async (course) => {
    setBusy(`pub-${course.id}`);
    try {
      const data = await authPost("/api/instructor/tools/publish", { courseId: course.id });
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      toast.success(`Đã xuất bản “${course.title}”`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const unpublish = async (course) => {
    setBusy(`pub-${course.id}`);
    try {
      const data = await authPost("/api/instructor/tools/unpublish", { courseId: course.id });
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      toast.success(`Đã chuyển “${course.title}” về nháp`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const saveBank = async () => {
    setBusy("bank");
    try {
      const data = await authPost("/api/instructor/tools/bank", {
        bankCode: bankForm.bankCode,
        accountNumber: bankForm.accountNumber,
        accountName: bankForm.accountName,
      });
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      setBankForm(fillBank(data?.bank));
      toast.success(
        data?.bank?.sepayLinked
          ? "Đã lưu và kết nối SePay. Học viên trả về đúng STK này sẽ được xác nhận tự động."
          : "Đã lưu STK. Thêm đúng số này trên SePay (my.sepay.vn) để hệ thống tự xác nhận.",
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  const removeBank = async () => {
    setBusy("bank-del");
    try {
      const data = await authDelete("/api/instructor/tools/bank");
      applySnapshot(data, setRecording, setTemplates, setCourses, setBank);
      setBankForm(fillBank(null));
      toast.success("Đã xóa tài khoản nhận tiền");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Công cụ</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Checklist ghi hình, mẫu mô tả, xuất bản và tài khoản nhận tiền. Học viên thanh toán trên cổng SePay, hệ thống tự xác nhận đơn.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : null}

      {!loading && tab === "publish" ? (
        <section className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            {courses.length === 0
              ? "Chưa có khóa học. Tạo khóa học rồi quay lại đây để xuất bản."
              : `${readyCount} khóa đủ điều kiện xuất bản.`}
          </p>
          {courses.length === 0 ? (
            <a
              href="/giang-day/quan-tri"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              Tạo khóa học
            </a>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            {courses.map((course) => {
              const percent = course.total ? Math.round((course.done / course.total) * 100) : 0;
              const published = course.status === "PUBLISHED";
              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                  <div className="flex gap-3 p-4 sm:p-5">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-20">
                      {course.images ? (
                        <img src={course.images} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-[16px] font-semibold leading-snug">{course.title}</h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            published
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {STATUS[course.status] || course.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {course.done}/{course.total} mục hoàn thành
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${course.ready ? "bg-emerald-500" : "bg-primary"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-1.5 border-t border-border px-4 py-3 sm:px-5">
                    {course.items.map((item) => (
                      <li key={item.key} className="flex items-start gap-2 text-sm">
                        {item.done ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <a
                          href={item.href}
                          className={`min-w-0 flex-1 hover:underline ${
                            item.done ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.label}
                          {item.required ? null : (
                            <span className="ml-1 text-xs text-muted-foreground">(tuỳ chọn)</span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5">
                    {published ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy === `pub-${course.id}`}
                        onClick={() => unpublish(course)}
                      >
                        Gỡ xuất bản
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={!course.ready || busy === `pub-${course.id}`}
                        onClick={() => publish(course)}
                      >
                        Xuất bản
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/giang-day/quan-tri/${course.id}/phan-hoc`;
                      }}
                    >
                      Chương trình học
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {!loading && tab === "record" ? (
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Đánh dấu khi đã chuẩn bị xong. Tiến độ được lưu để bạn mở lại lần sau.
            </p>
            <p className="shrink-0 text-sm font-medium">
              {recordingDone}/{recording.length}
            </p>
          </div>
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{
                width: `${recording.length ? Math.round((recordingDone / recording.length) * 100) : 0}%`,
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recording.map((item) => (
              <button
                key={item.key}
                type="button"
                disabled={busy === `check-${item.key}`}
                onClick={() => toggleCheck(item)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  item.checked
                    ? "border-emerald-500/40 bg-emerald-500/8"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    item.checked
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-input bg-background"
                  }`}
                >
                  {item.checked ? <Check className="size-3.5" /> : null}
                </span>
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {item.hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <a
            href="/giang-day/quan-tri/ghi-hinh"
            className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            Mở studio ghi hình
          </a>
        </section>
      ) : null}

      {!loading && tab === "bank" ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-[16px] font-semibold">Tài khoản nhận học phí</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              SePay chỉ nhận tiền và tự xác nhận với số tài khoản đã kết nối trên SePay. Thêm đúng STK này tại my.sepay.vn (Tài khoản ngân hàng), rồi lưu lại trên LearnHub.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bank-code">Ngân hàng</Label>
                <select
                  id="bank-code"
                  className={SELECT_CLASS}
                  value={bankForm.bankCode}
                  onChange={(event) => setBankForm((prev) => ({ ...prev, bankCode: event.target.value }))}
                >
                  {BANKS.map((item) => (
                    <option key={item.id} value={item.id} className={OPTION_CLASS}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-number">Số tài khoản</Label>
                <Input
                  id="bank-number"
                  inputMode="numeric"
                  value={bankForm.accountNumber}
                  onChange={(event) =>
                    setBankForm((prev) => ({
                      ...prev,
                      accountNumber: event.target.value.replace(/[^\d\s]/g, ""),
                    }))
                  }
                  placeholder="Số tài khoản nhận tiền"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank-name">Tên chủ tài khoản</Label>
                <Input
                  id="bank-name"
                  value={bankForm.accountName}
                  onChange={(event) => setBankForm((prev) => ({ ...prev, accountName: event.target.value }))}
                  placeholder="NGUYEN VAN A"
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" disabled={busy === "bank"} onClick={saveBank}>
                Lưu tài khoản
              </Button>
              {bank ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy === "bank-del"}
                  onClick={removeBank}
                >
                  Xóa tài khoản
                </Button>
              ) : null}
            </div>
          </div>
          <aside className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <p className="text-sm font-medium">Tài khoản đã lưu</p>
            {bank ? (
              <>
                <p className="mt-3 text-sm font-semibold">{bank.accountName}</p>
                <p className="text-sm text-muted-foreground">{bank.bankName}</p>
                <p className="mt-1 font-mono text-sm tracking-wide">{bank.accountNumber}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {bank.sepayLinked
                    ? "Đã kết nối SePay. Học viên chuyển đúng STK này, đơn tự xác nhận."
                    : "STK chưa kết nối SePay nên cổng thanh toán không nhận được giao dịch. Thêm số này trên my.sepay.vn rồi bấm Lưu tài khoản."}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Lưu STK để gắn tài khoản nhận học phí với khóa học của bạn.
              </p>
            )}
          </aside>
        </section>
      ) : null}

      {!loading && tab === "copy" ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <p className="text-sm font-medium">Mẫu đã lưu</p>
              <Button type="button" size="sm" variant="ghost" onClick={startNew}>
                <Plus className="size-4" />
                Mới
              </Button>
            </div>
            <div className="space-y-1">
              {templates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickTemplate(item)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left ${
                    selectedId === item.id ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{kindLabel(item.kind)}</span>
                </button>
              ))}
            </div>
          </aside>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-kind">Loại</Label>
                <select
                  id="tpl-kind"
                  className={SELECT_CLASS}
                  value={form.kind}
                  onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
                >
                  {KINDS.map((item) => (
                    <option key={item.id} value={item.id} className={OPTION_CLASS}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-title">Tên mẫu</Label>
                <Input
                  id="tpl-title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ví dụ: Mô tả khóa lập trình"
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="tpl-body">
                Nội dung{form.kind === "LEARN" ? " (mỗi dòng một ý)" : ""}
              </Label>
              <Textarea
                id="tpl-body"
                rows={form.kind === "DESCRIPTION" ? 10 : 6}
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                className="min-h-32"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-course">Áp dụng vào khóa học</Label>
                <select
                  id="tpl-course"
                  className={SELECT_CLASS}
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                >
                  {courses.length === 0 ? (
                    <option value="" className={OPTION_CLASS}>
                      Chưa có khóa học
                    </option>
                  ) : null}
                  {courses.map((item) => (
                    <option key={item.id} value={item.id} className={OPTION_CLASS}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!selectedId || !courseId || busy === "apply"}
                  onClick={applyTemplate}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" disabled={busy === "save"} onClick={saveTemplate}>
                {selectedId ? "Lưu thay đổi" : "Tạo mẫu"}
              </Button>
              {selectedId ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy === "delete"}
                  onClick={removeTemplate}
                >
                  <Trash2 className="size-4" />
                  Xóa mẫu
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Tools;
