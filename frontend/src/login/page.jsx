import { useState } from "react";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import SocialAuth from "@/components/auth/SocialAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authPost, authRequest, saveAuth, setPendingToast, safeNextPath, withCurrentNext, updateAuthUser } from "@/lib/auth";
import { hasErrors, validateLogin } from "@/lib/validate";
import {
  INSTRUCTOR_STUDIO,
  clearTeachStart,
  fromTeachFlow,
  readTeachStartAnswers,
} from "@/lib/teachStart";

const Page = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (name) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const onBlur = (name) => () => {
    const next = validateLogin(values);
    setErrors((prev) => ({ ...prev, [name]: next[name] || "" }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = validateLogin(values);
    setErrors(next);
    if (hasErrors(next)) {
      return;
    }
    setLoading(true);
    try {
      const data = await authRequest("/api/auth/login", {
        email: values.email.trim(),
        password: values.password,
      });
      saveAuth(data);
      const onboarding = readTeachStartAnswers();
      if (onboarding) {
        await authPost("/api/instructor/onboarding", onboarding);
        updateAuthUser({ role: "INSTRUCTOR" });
        clearTeachStart();
      }
      setPendingToast("success", "Đăng nhập thành công");
      window.location.href = fromTeachFlow() || onboarding ? INSTRUCTOR_STUDIO : safeNextPath("/");
    } catch (err) {
      if (err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        setErrors({ form: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Chào mừng bạn quay lại LearnHub"
      switchText="Chưa có tài khoản?"
      switchHref={fromTeachFlow() ? "/dang-ky?role=INSTRUCTOR&from=teach" : withCurrentNext("/dang-ky")}
      switchLabel="Đăng ký"
    >
      <form noValidate onSubmit={onSubmit} className="mt-6 grid gap-4">
        <TextField
          id="login-email"
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Nhập vào email của bạn"
          value={values.email}
          onChange={setField("email")}
          onBlur={onBlur("email")}
          error={errors.email}
        />
        <PasswordField
          id="login-password"
          label="Mật khẩu"
          name="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          value={values.password}
          onChange={setField("password")}
          onBlur={onBlur("password")}
          error={errors.password}
        />
        {errors.form ? (
          <p className="text-[13px] text-destructive">{errors.form}</p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(value) => setRemember(value === true)}
            />
            <Label
              htmlFor="remember"
              className="text-[14px] font-normal tracking-[0.01em]"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
            >
              Ghi nhớ
            </Label>
          </div>
          <a
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: 1.3,
              letterSpacing: "0.01em",
            }}
            href="/quen-mat-khau"
            className="text-[14px] font-medium tracking-[0.01em] text-foreground transition-colors duration-200 hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>
        <Button
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            borderRadius: "5px",
          }}
          type="submit"
          disabled={loading}
          className="h-12 w-full text-[16px] font-medium tracking-[0.01em]"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
      <SocialAuth
        extraBody={readTeachStartAnswers() || {}}
        redirectTo={fromTeachFlow() || readTeachStartAnswers() ? INSTRUCTOR_STUDIO : safeNextPath("/")}
      />
    </AuthLayout>
  );
};

export default Page;
