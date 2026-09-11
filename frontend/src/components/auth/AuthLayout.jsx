const AuthLayout = ({
  title,
  description,
  children,
  switchText,
  switchHref,
  switchLabel,
}) => {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[420px]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <h1
            className="text-center text-[20px] font-medium tracking-[0.01em] text-foreground sm:text-[22px]"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "24px",
              fontWeight: "700",
              fontStyle: "normal",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </h1>
          <p className="mt-2 text-center text-[14px] leading-[1.4] tracking-[0.01em] text-muted-foreground"
          style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "17px",
              fontWeight: "400",
              fontStyle: "italic",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}>
            {description}
          </p>
          {children}
        </div>

        <p className="mt-6 text-center text-[14px] leading-[1.4] tracking-[0.01em] text-muted-foreground">
          {switchText}{" "}
          <a
            href={switchHref}
            className="font-medium text-foreground transition-colors duration-200 hover:underline"
          >
            {switchLabel}
          </a>
        </p>
      </div>
    </main>
  );
};

export default AuthLayout;
