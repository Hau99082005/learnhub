import { useState } from "react";
import { Mail, User } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import TextField from "@/components/auth/TextField";
import PasswordField from "@/components/auth/PasswordField";
import SocialAuth from "@/components/auth/SocialAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Page = () => {
  const [agree, setAgree] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <AuthLayout
      title="Đăng ký"
      description="Tạo tài khoản để bắt đầu học"
      switchText="Đã có tài khoản?"
      switchHref="/dang-nhap"
      switchLabel="Đăng nhập"
    >
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <TextField
          id="register-name"
          label="Họ và tên"
          icon={User}
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="Nhập vào họ tên"
        />
        <TextField
          id="register-email"
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="Nhập vào email của bạn"
        />
        <PasswordField
          id="register-password"
          label="Mật khẩu"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Tối thiểu 8 ký tự"
        />
        <PasswordField
          id="register-confirm"
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Nhập lại mật khẩu"
        />
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            className="mt-0.5"
            checked={agree}
            onCheckedChange={(value) => setAgree(value === true)}
            required
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
          className="h-11 w-full text-[16px] font-medium tracking-[0.01em]"
        >
          Tạo tài khoản
        </Button>
      </form>
      <SocialAuth />
    </AuthLayout>
  );
};

export default Page;
