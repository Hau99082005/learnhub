import { useState } from "react";
import { Mail, User } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import SocialAuth from "@/components/auth/SocialAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authRequest, saveAuth, setPendingToast } from "@/lib/auth";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { hasErrors, validateRegister } from "@/lib/validate";
import {
  INSTRUCTOR_STUDIO,
  clearTeachStart,
  fromTeachFlow,
  readTeachStartAnswers,
} from "@/lib/teachStart";

const Page = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role:
      new URLSearchParams(window.location.search).get("role") === ROLES.INSTRUCTOR
        ? ROLES.INSTRUCTOR
        : ROLES.USER,
  });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (name) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onBlur = (name) => () => {
    const next = validateRegister({ ...values, agree });
    setErrors((prev) => ({ ...prev, [name]: next[name] || "" }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = validateRegister({ ...values, agree });
    setErrors(next);
    if (hasErrors(next)) {
      return;
    }
    setLoading(true);
    try {
      const onboarding = readTeachStartAnswers();
      const teach = fromTeachFlow();
      const data = await authRequest("/api/auth/register", {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: teach ? ROLES.INSTRUCTOR : values.role,
        ...(onboarding || {}),
      });
      saveAuth(data);
      clearTeachStart();
      setPendingToast("success", "Đăng ký thành công");
      window.location.href = fromTeachFlow() || onboarding ? INSTRUCTOR_STUDIO : "/";
    } catch (err) {
      if (err.field) {
        setErrors({ [err.field]: err.message });
      } else {
        setErrors({ email: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký"
      description="Tạo tài khoản để bắt đầu học"
      switchText="Đã có tài khoản?"
      switchHref={fromTeachFlow() ? "/dang-nhap?from=teach" : "/dang-nhap"}
      switchLabel="Đăng nhập"
    >
      <form noValidate onSubmit={onSubmit} className="mt-6 grid gap-4">
        <TextField
          id="register-name"
          label="Họ và tên"
          icon={User}
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Nhập vào họ tên"
          value={values.name}
          onChange={setField("name")}
          onBlur={onBlur("name")}
          error={errors.name}
        />
        <TextField
          id="register-email"
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
          id="register-password"
          label="Mật khẩu"
          name="password"
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          value={values.password}
          onChange={setField("password")}
          onBlur={onBlur("password")}
          error={errors.password}
        />
        <PasswordField
          id="register-confirm"
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={values.confirmPassword}
          onChange={setField("confirmPassword")}
          onBlur={onBlur("confirmPassword")}
          error={errors.confirmPassword}
        />
        {fromTeachFlow() ? null : (
        <div className="grid gap-2">
          <Label className="text-[14px] font-medium tracking-[0.01em]">
            Vai trò
          </Label>
          <RadioGroup
            value={values.role}
            onValueChange={(value) => {
              setValues((prev) => ({ ...prev, role: value }));
              setErrors((prev) => ({ ...prev, role: "" }));
            }}
            className="grid grid-cols-2 gap-2"
          >
            {[ROLES.USER, ROLES.INSTRUCTOR].map((role) => (
              <label
                key={role}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-input px-3 text-[14px] has-aria-checked:border-foreground"
              >
                <RadioGroupItem value={role} />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </RadioGroup>
          {errors.role ? (
            <p className="text-[13px] text-destructive">{errors.role}</p>
          ) : null}
        </div>
        )}
        <div className="grid gap-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              className="mt-0.5"
              checked={agree}
              aria-invalid={errors.agree ? true : undefined}
              onCheckedChange={(value) => {
                setAgree(value === true);
                setErrors((prev) => ({ ...prev, agree: "" }));
              }}
            />
            <Label
              htmlFor="terms"
              className="text-[14px] leading-[1.4] font-normal tracking-[0.01em]"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: "400",
                fontStyle: "normal",
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
            >
              Tôi đồng ý với{" "}
              <a
                href="/dieu-khoan"
                className="font-medium text-foreground hover:underline"
              >
                Điều khoản
              </a>{" "}
              và{" "}
              <a
                href="/bao-mat"
                className="font-medium text-foreground hover:underline"
              >
                Chính sách bảo mật
              </a>
            </Label>
          </div>
          {errors.agree ? (
            <p className="text-[13px] text-destructive">{errors.agree}</p>
          ) : null}
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
          className="h-11 w-full text-[16px] font-medium tracking-[0.01em]"
        >
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>
      <SocialAuth
        role={fromTeachFlow() ? ROLES.INSTRUCTOR : values.role}
        extraBody={readTeachStartAnswers() || {}}
        redirectTo={
          fromTeachFlow() || values.role === ROLES.INSTRUCTOR
            ? INSTRUCTOR_STUDIO
            : "/"
        }
        onBeforeGoogle={() => (agree ? "" : "Vui lòng đồng ý với điều khoản")}
      />
    </AuthLayout>
  );
};

export default Page;
