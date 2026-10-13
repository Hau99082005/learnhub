import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Settings,
  Shield,
  User,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authGet, authPut, getAuthUser, updateAuthUser } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

const TITLE = {
  fontFamily: "'Roboto', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

const SECTIONS = [
  { id: "profile", label: "Hồ sơ", icon: UserRound },
  { id: "password", label: "Mật khẩu", icon: KeyRound },
];

function loginHref() {
  return `/dang-nhap?next=${encodeURIComponent("/cai-dat-tai-khoan")}`;
}

function registerHref() {
  return `/dang-ky?next=${encodeURIComponent("/cai-dat-tai-khoan")}`;
}

function initials(name, email) {
  const source = String(name || email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatJoined(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const SettingsPage = () => {
  const [user] = useState(() => getAuthUser());
  const [section, setSection] = useState("profile");
  const [loading, setLoading] = useState(() => Boolean(getAuthUser()));
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    authGet("/api/auth/profile")
      .then((data) => {
        if (cancelled) {
          return;
        }
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
          address: data.address === "Chưa cập nhật" ? "" : data.address || "",
          bio: data.bio || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        toast.error(err.message || "Không tải được hồ sơ");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = profile?.fullName || user?.fullName || "";
  const joined = useMemo(() => formatJoined(profile?.createdAt), [profile]);

  const setProfileField = (name) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setPasswordField = (name) => (event) => {
    const value = event.target.value;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const next = await authPut("/api/auth/profile", {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        bio: form.bio.trim(),
      });
      setProfile(next);
      setForm({
        fullName: next.fullName || "",
        phone: next.phone || "",
        address: next.address === "Chưa cập nhật" ? "" : next.address || "",
        bio: next.bio || "",
      });
      updateAuthUser({ fullName: next.fullName || "" });
      setErrors({});
      toast.success("Đã lưu hồ sơ");
    } catch (err) {
      if (err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        toast.error(err.message || "Không thể lưu hồ sơ");
      }
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setChanging(true);
    try {
      await authPut("/api/auth/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      toast.success("Đã đổi mật khẩu");
    } catch (err) {
      if (err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        toast.error(err.message || "Không thể đổi mật khẩu");
      }
    } finally {
      setChanging(false);
    }
  };

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-6 sm:py-14">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ ...TITLE, fontSize: "24px", fontWeight: 700 }}
        >
          Cài đặt tài khoản
        </h1>
        <div className="mt-8 rounded-2xl border border-border px-4 py-12 text-center sm:px-8">
          <Settings className="mx-auto size-10 text-violet-700" />
          <p className="mt-4 text-base font-medium">Đăng nhập để quản lý tài khoản</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hồ sơ, mật khẩu và thông tin liên hệ được lưu theo tài khoản của bạn.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={loginHref()}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full sm:w-40")}
            >
              Đăng nhập
            </a>
            <a
              href={registerHref()}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-10 w-full bg-violet-700 text-white hover:bg-violet-800 sm:w-40",
              )}
            >
              Đăng ký
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full">
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-700 text-lg font-semibold sm:size-16">
              {initials(displayName, profile?.email || user.email)}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-white/60">Tài khoản</p>
              <h1
                className="truncate text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ ...TITLE, fontSize: "32px", fontWeight: 700 }}
              >
                Cài đặt tài khoản
              </h1>
              <p className="mt-1 truncate text-sm text-white/70">
                {displayName || profile?.email || user.email}
              </p>
            </div>
          </div>
          {joined ? (
            <p className="text-sm text-white/55">Tham gia {joined}</p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-3">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {SECTIONS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition",
                      active
                        ? "bg-violet-700 text-white"
                        : "border border-border bg-card text-foreground hover:border-violet-300 hover:text-violet-700",
                    )}
                    style={TITLE}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="hidden rounded-2xl border border-border/80 bg-card p-4 lg:block">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Liên kết nhanh
              </p>
              <div className="mt-3 grid gap-2">
                <a
                  href="/hoc-tap"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-violet-700"
                >
                  <BookOpen className="size-4" />
                  Học tập
                </a>
                <a
                  href="/lich-su-mua"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-violet-700"
                >
                  <Receipt className="size-4" />
                  Lịch sử mua
                </a>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {loading ? (
              <div className="space-y-4">
                <div className="h-40 animate-pulse rounded-2xl bg-muted" />
                <div className="h-56 animate-pulse rounded-2xl bg-muted" />
              </div>
            ) : section === "password" ? (
              <form
                onSubmit={savePassword}
                className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_12px_32px_-24px_oklch(0_0_0/0.45)] sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-violet-700" />
                  <h2
                    className="text-lg font-semibold"
                    style={{ ...TITLE, fontSize: "18px", fontWeight: 600 }}
                  >
                    Đổi mật khẩu
                  </h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mật khẩu mới cần tối thiểu 8 ký tự.
                </p>
                <div className="mt-5 grid gap-4">
                  <PasswordField
                    id="currentPassword"
                    label="Mật khẩu hiện tại"
                    value={passwords.currentPassword}
                    onChange={setPasswordField("currentPassword")}
                    error={errors.currentPassword}
                    autoComplete="current-password"
                  />
                  <PasswordField
                    id="newPassword"
                    label="Mật khẩu mới"
                    value={passwords.newPassword}
                    onChange={setPasswordField("newPassword")}
                    error={errors.newPassword}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    id="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    value={passwords.confirmPassword}
                    onChange={setPasswordField("confirmPassword")}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changing}
                  className="mt-6 h-11 bg-violet-700 text-white hover:bg-violet-800"
                >
                  {changing ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={saveProfile}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_12px_32px_-24px_oklch(0_0_0/0.45)] sm:p-6">
                  <div className="flex items-center gap-2">
                    <User className="size-5 text-violet-700" />
                    <h2
                      className="text-lg font-semibold"
                      style={{ ...TITLE, fontSize: "18px", fontWeight: 600 }}
                    >
                      Thông tin hồ sơ
                    </h2>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="fullName"
                      label="Họ và tên"
                      icon={User}
                      value={form.fullName}
                      onChange={setProfileField("fullName")}
                      error={errors.fullName}
                      autoComplete="name"
                    />
                    <TextField
                      id="phone"
                      label="Số điện thoại"
                      icon={Phone}
                      value={form.phone}
                      onChange={setProfileField("phone")}
                      error={errors.phone}
                      autoComplete="tel"
                    />
                    <div className="sm:col-span-2">
                      <TextField
                        id="address"
                        label="Địa chỉ"
                        icon={MapPin}
                        value={form.address}
                        onChange={setProfileField("address")}
                        error={errors.address}
                        autoComplete="street-address"
                      />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label
                        htmlFor="bio"
                        className="text-[14px] font-medium"
                        style={{ ...TITLE, fontWeight: 500 }}
                      >
                        Giới thiệu
                      </Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={setProfileField("bio")}
                        rows={4}
                        maxLength={500}
                        placeholder="Vài dòng về bạn"
                        className="min-h-24 resize-none text-[16px]"
                        style={TITLE}
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {errors.bio ? (
                          <p className="text-destructive">{errors.bio}</p>
                        ) : (
                          <span>Tối đa 500 ký tự</span>
                        )}
                        <span>{form.bio.length}/500</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="mt-6 h-11 bg-violet-700 text-white hover:bg-violet-800"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Mail className="size-5 text-violet-700" />
                    <h2
                      className="text-lg font-semibold"
                      style={{ ...TITLE, fontSize: "18px", fontWeight: 600 }}
                    >
                      Tài khoản
                    </h2>
                  </div>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">Email</dt>
                      <dd className="mt-0.5 text-sm font-medium break-all">
                        {profile?.email || user.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Tên đăng nhập</dt>
                      <dd className="mt-0.5 text-sm font-medium break-all">
                        {profile?.username || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Vai trò</dt>
                      <dd className="mt-0.5 text-sm font-medium">
                        {roleLabel(profile?.role || user.role)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Email xác minh</dt>
                      <dd className="mt-0.5 text-sm font-medium">
                        {profile?.emailVerified ? "Đã xác minh" : "Chưa xác minh"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
