import { useState } from "react";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import SocialAuth from "@/components/auth/SocialAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Page = () => {
  const [remember, setRemember] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Chào mừng bạn quay lại LearnHub"
      switchText="Chưa có tài khoản?"
      switchHref="/dang-ky"
      switchLabel="Đăng ký"
    >
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <TextField
          id="login-email"
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="Nhập vào email của bạn"
        />
        <PasswordField
          id="login-password"
          label="Mật khẩu"
          name="password"
          autoComplete="current-password"
          required
          placeholder="Nhập mật khẩu"
        />
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
          className="h-12 w-full text-[16px] font-medium tracking-[0.01em]"
        >
          Đăng nhập
        </Button>
      </form>
      <SocialAuth />
    </AuthLayout>
  );
};

export default Page;
